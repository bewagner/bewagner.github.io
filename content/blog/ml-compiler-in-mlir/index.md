+++
date = "2026-03-06"
title = "An ML Compiler in MLIR"
description = "Building a small end-to-end compiler for fully-connected neural networks with a custom MLIR dialect"
draft = true
[taxonomies]
tags = ["mlir", "compilers"]
+++

For the last three and a half years I have been working on machine learning compilers. 
The systems I worked on were all built on custom software stacks. Custom IRs, custom optimization and custom lowering passes. 

However, I noticed that MLIR seems to have become the de-facto standard tool for building ML compilers. 
That's why I wanted to give it a try as well and see why so many people like it. So I built a small neural network compiler using MLIR and in this post I will walk you through the code and talk about points I found interesting during the process. 
You can find all the code [on my GitHub](https://github.com/bewagner/ml-compiler).





I always wanted to try it, so I built a small example to see what the workflow actually feels like.

This post walks through the whole thing: a compiler that takes a traced PyTorch model of fully-connected layers and turns it into a native executable.


## What we are building

The input is a PyTorch `nn.Sequential` of `nn.Linear` layers, saved as a TorchScript `.pt` file.
The output is a compiled binary that runs inference and prints the result.

Between those two points, the code does the following:

1. Parse the TorchScript model into an in-memory representation
2. Emit MLIR using a custom `fc` dialect
3. Lower that MLIR to linalg, then to loops, then to LLVM IR
4. Compile the LLVM IR with Clang into a native executable

The frontend is Python.
The lowering from the custom dialect down to LLVM IR is C++.

## The data model

Before touching any MLIR, we need somewhere to put the extracted network.
I defined a small set of dataclasses in `torch_frontend.py`:

```python
@dataclass(frozen=True)
class TensorSpec:
    name: str
    shape: tuple[int, ...]

@dataclass(frozen=True)
class FullyConnectedLayer:
    name: str
    input_name: str
    output_name: str
    weight: np.ndarray
    bias: np.ndarray | None

@dataclass(frozen=True)
class NetworkIR:
    input_spec: TensorSpec
    output_spec: TensorSpec
    layers: list[FullyConnectedLayer]
```

`NetworkIR` is the interface between the frontend and everything that comes after it.
The rest of the code never looks at PyTorch objects directly.

## The frontend

The frontend loads the TorchScript file and fills a `NetworkIR`.

```python
def parse_fully_connected_torchscript(
    model_path: str | Path,
    input_shape: tuple[int, ...],
) -> NetworkIR:
    model = torch.jit.load(str(model_path))
    model.eval()

    children = list(model.named_children())
    ...
```

For each child module it extracts the weight and bias as numpy arrays.
One thing to watch out for: `nn.Linear` stores weights as `(out_features, in_features)`, but `linalg.matmul` later expects `(in_features, out_features)`.
So we transpose immediately after extraction and keep that convention throughout.

```python
# nn.Linear weight: (out_features, in_features)
weight: np.ndarray = child.weight.detach().numpy()

# Transpose to (in_features, out_features) for linalg.matmul
weight = weight.T
```

The output shape is derived from the last layer's weight after the transpose, so we never need to pass it explicitly.

## The custom dialect

Once we have a `NetworkIR`, we emit MLIR.
Rather than emitting linalg ops directly from Python, we use a custom `fc` dialect with a single op: `fc.fully_connected`.

A bias-free layer looks like this:

```
"fc.fully_connected"(%input, %wbuf0, %output)
    : (memref<2x4xf32>, memref<4x3xf32>, memref<2x3xf32>) -> ()
```

With a bias:

```
"fc.fully_connected"(%input, %wbuf0, %bbuf0, %output)
    : (memref<2x4xf32>, memref<4x3xf32>, memref<3xf32>, memref<2x3xf32>) -> ()
```

The Python side emits these ops using the generic assembly format.
It also emits `memref.global` constants for the weights and biases at module level.

A full two-layer module looks roughly like this:

```
module {
  memref.global constant @w0 : memref<4x3xf32> = dense<[[...], ...]>
  memref.global constant @b0 : memref<3xf32>   = dense<[...]>
  memref.global constant @w1 : memref<3x2xf32> = dense<[[...], ...]>
  memref.global constant @b1 : memref<2xf32>   = dense<[...]>

  func.func @inference(%input: memref<2x4xf32>, %output: memref<2x3xf32>) {
    %tmp0 = memref.alloca() : memref<2x3xf32>
    %wbuf0 = memref.get_global @w0 : memref<4x3xf32>
    %bbuf0 = memref.get_global @b0 : memref<3xf32>
    "fc.fully_connected"(%input, %wbuf0, %bbuf0, %tmp0)
        : (memref<2x4xf32>, memref<4x3xf32>, memref<3xf32>, memref<2x3xf32>) -> ()
    %wbuf1 = memref.get_global @w1 : memref<3x2xf32>
    %bbuf1 = memref.get_global @b1 : memref<2xf32>
    "fc.fully_connected"(%tmp0, %wbuf1, %bbuf1, %output)
        : (memref<2x3xf32>, memref<3x2xf32>, memref<2xf32>, memref<2x2xf32>) -> ()
    return
  }
}
```

The key point is that this MLIR knows nothing about linalg yet.
The C++ backend takes care of that.

## The C++ backend

### Defining the op

The `fc` dialect and its single op are defined in C++ without tablegen.

```cpp
class FullyConnectedOp
    : public Op<FullyConnectedOp,
                OpTrait::VariadicOperands,
                OpTrait::ZeroResults> {
public:
  using Op::Op;

  static StringRef getOperationName() { return "fc.fully_connected"; }
  static llvm::ArrayRef<llvm::StringRef> getAttributeNames() { return {}; }

  LogicalResult verify() {
    unsigned num_operands = getNumOperands();
    if (num_operands != 3 && num_operands != 4)
      return emitOpError("expected 3 or 4 operands, got ") << num_operands;
    for (Value operand : getOperands())
      if (!mlir::isa<MemRefType>(operand.getType()))
        return emitOpError("all operands must be memref types");
    return success();
  }

  bool hasBias() { return getNumOperands() == 4; }
  Value getInput()  { return getOperand(0); }
  Value getWeight() { return getOperand(1); }
  Value getBias()   { assert(hasBias()); return getOperand(2); }
  Value getOutput() { return getOperand(hasBias() ? 3 : 2); }
};
```

`getAttributeNames()` returning an empty array is required by MLIR 21 for op registration.
Without it, the compiler complains at registration time.

### The lowering pattern

A `RewritePattern` converts each `fc.fully_connected` to linalg ops.

The bias-free case is a `linalg.fill` followed by `linalg.matmul`:

```cpp
Value zero = rewriter.create<arith::ConstantOp>(
    loc, rewriter.getF32FloatAttr(0.0f));

rewriter.create<linalg::FillOp>(loc, ValueRange{zero},
                                ValueRange{matmul_destination});

rewriter.create<linalg::MatmulOp>(loc, TypeRange{},
                                  ValueRange{input, weight},
                                  ValueRange{matmul_destination});
```

When a bias is present, we matmul into a temporary buffer first, then add the bias using `linalg.generic`:

```cpp
Value matmul_destination = has_bias
    ? rewriter.create<memref::AllocaOp>(loc, output_type)
    : output;
```

The bias addition broadcasts `bias[j]` across all rows.
That requires two affine maps: one identity map for the 2-D output, and one that maps `(i, j) → (j)` for the 1-D bias vector.

```cpp
AffineMap identity_map_2d    = AffineMap::getMultiDimIdentityMap(2, mlir_context);
AffineMap bias_broadcast_map = AffineMap::get(2, 0,
    {rewriter.getAffineDimExpr(1)}, mlir_context);
```

### The pass pipeline

After the `fc → linalg` pass, we run the standard lowering chain:

```
ConvertFcToLinalg        – fc ops → linalg
ConvertLinalgToLoops     – linalg → affine/scf loop nests
LowerAffine              – affine maps/regions → scf + std
SCFToControlFlow         – structured control flow → cf
ArithToLLVM              – arith ops → llvm dialect ops
ConvertControlFlowToLLVM – cf branch ops → llvm dialect ops
ConvertFuncToLLVM        – func.func → llvm.func
FinalizeMemRefToLLVM     – memref types/ops → llvm dialect ops
ReconcileUnrealizedCasts – clean up type-cast bookkeeping ops
```

None of these passes are custom.
They all come from MLIR's standard conversion library.
Our only custom work is the first step.

## Calling the compiled function

MLIR's default calling convention expands each `memref<NxMxf32>` argument into seven flat values:

```
float* alloc_ptr, float* aligned_ptr, intptr_t offset,
intptr_t size_0, intptr_t size_1,
intptr_t stride_0, intptr_t stride_1
```

The Python side generates a small C runner that wires this up:

```c
extern void inference(
    float *alloc_in,  float *align_in,  intptr_t off_in,
    intptr_t size_in_0, intptr_t size_in_1,
    intptr_t stride_in_0, intptr_t stride_in_1,
    float *alloc_out, float *align_out, intptr_t off_out,
    intptr_t size_out_0, intptr_t size_out_1,
    intptr_t stride_out_0, intptr_t stride_out_1
);
```

For a plain contiguous heap buffer, the allocated and aligned pointers are the same address, the offset is zero, and the outer stride equals the inner dimension size.
That simplifies the call site considerably.

The runner is then compiled with Clang alongside the LLVM IR from the backend:

```python
subprocess.run([
    clang,
    str(llvm_ir_path),
    str(runner_c_path),
    "-O3",
    "-o",
    str(output_executable),
], check=True)
```

## Testing

The code has three layers of tests.

**Unit tests for the MLIR emission** check that the Python side produces structurally correct MLIR.
They verify things like the number of `fc.fully_connected` ops, the presence of weight globals, and that no linalg ops appear in the Python-emitted output.

```python
def test_no_linalg_in_python_mlir(self):
    """Linalg ops are emitted only by the C++ lowering pass, not Python."""
    mlir = emit_fc_mlir(_two_layer_ir())
    assert "linalg." not in mlir
```

**Unit tests for the frontend** verify that weight shapes, bias extraction, and dimension chaining all work correctly.

```python
def test_weight_shape_is_transposed(self, tmp_path):
    """IR stores weight as (in_features, out_features); nn.Linear is (out, in)."""
    ir = _parse(tmp_path / "m.pt", example)
    assert ir.layers[0].weight.shape == (4, 3)
```

**Integration tests** compile a model end-to-end and compare the binary output against PyTorch's own forward pass using `numpy.testing.assert_allclose`.

```python
def test_single_linear_with_bias(self, tmp_path):
    model = nn.Sequential(nn.Linear(4, 3, bias=True))
    x = torch.arange(1, 9, dtype=torch.float32).reshape(2, 4) * 0.1
    pt_out, mlir_out = self._compile_and_run(model, x, tmp_path)
    np.testing.assert_allclose(mlir_out, pt_out, rtol=1e-4, atol=1e-4)
```

The integration tests are skipped automatically if `clang` or the built backend binary is not available, so they do not break a plain `pytest` run in an environment that only has Python.

## What would a real product need?

This example is deliberately small.
Here is what I would add if I wanted to take it further.

### Activations

Right now the compiler only handles linear layers.
A real network almost always has activations between them — ReLU, GELU, SiLU, and so on.

The cleanest approach is to add them as ops in the `fc` dialect and lower each one to a `linalg.generic`.
ReLU is just `arith.maximumf(x, 0.0)` applied element-wise, so the lowering pattern is straightforward.
GELU is more involved, but still expressible in linalg.

Alternatively, the Python side could emit activations directly as linalg generics and leave them for the standard pipeline.
That skips the dialect entirely for activation ops, which is simpler but loses the clean single-dialect representation in the MLIR dump.

### Dynamic shapes

Every shape in this compiler is static.
The batch size is baked into the MLIR at emission time, so if you want a different batch size you have to recompile.

MLIR supports dynamic dimensions using `?` in memref types, and the lowering passes handle them.
But to actually use them you need to pass the runtime shape values as extra arguments, and the verifier and lowering patterns need to reason about symbolic sizes rather than concrete integers.
It is not a huge change, but it does add a layer of complexity throughout.

### Intermediate buffer allocation

The temporary buffers between layers are currently allocated with `memref.alloca()`, which puts them on the stack.
For small models this is fine.
For anything with large hidden dimensions it overflows.

A production system would use a buffer pool — allocate all intermediates upfront, reuse them across calls, and avoid repeated `malloc`/`free` cycles.
MLIR's buffer allocation passes (`--buffer-allocation`, `--buffer-deallocation`) can help here, but they need to be configured and tested carefully.

### Tablegen

The `fc` dialect is defined in plain C++ right now.
That works fine for a single op, but as the dialect grows, you would normally use MLIR's tablegen system instead.

Tablegen generates builder methods, pretty-printer routines, parser code, and verifier scaffolding automatically from a concise DSL.
Writing it by hand for every new op quickly becomes tedious, and tablegen's generated code is more consistent.
Switching to tablegen is one of the first things I would do before adding a second or third op.

### The model input format

The frontend reads TorchScript `.pt` files.
TorchScript has been in maintenance mode for a while; `torch.export` is the current recommended path.
For a compiler that is not PyTorch-specific, ONNX would be a better input format — most training frameworks can export it, and the op set is stable.

Replacing the frontend is cheap here because `NetworkIR` cleanly separates it from everything downstream.
The MLIR emission and C++ backend do not need to know where the weights came from.

### Operator fusion

At the moment each `fc.fully_connected` is lowered independently.
If you have two consecutive layers, the first writes to a temporary buffer and the second reads from it — a round trip through memory that good hardware hates.

The bias-add of layer N and the zero-initialization of layer N+1 could be fused so the zero-fill is skipped entirely and the bias is folded into the matmul accumulator.
MLIR's linalg fusion infrastructure can express this, but it takes deliberate pass design to make it happen.
For a compiler targeting throughput, this is probably the highest-value optimization.

## Wrap-up

MLIR's strength here is that once you lower to linalg, the rest of the pipeline is free.
You write one custom pass, and the standard passes handle everything from loop generation to LLVM IR.

In my custom-stack compilers, that lower half was always the most time-consuming part to get right.
Here it was not a concern at all.

The part I found most interesting is the dialect design.
There are many ways to represent a fully-connected layer as an op.
The version I landed on — output buffer as explicit operand, no return value — keeps the lowering pattern simple because there is never any SSA result to replace.

The full code is [on GitHub](https://github.com/bewagner/ml-compiler).
