+++
date = "2020-05-02"
title = "C++ Dependency Management with CMake's FetchContent"
description = "How to replace git submodules with a built-in CMake feature"
[taxonomies]
tags = ["cpp", "cmake"]
[extra]
image = "containership.webp"
+++

In this post, we talk about dependency management in C++.
In particular, we introduce `FetchContent`, a CMake feature that deserves more attention.

## Dependency management options in C++

### Git submodules

In the past, my default was adding each dependency as a git submodule.
For dependencies with a modern CMake setup, this is usually enough to make them available.

What I disliked about this approach is that users must run:

```bash
git submodule update --init
```

before building.
I like keeping setup friction low, and I have forgotten this command more than once.

### Copying dependency code into your repository

You can also copy dependency source code directly into your repository.
In my view this is usually worse than submodules:
- updating dependencies becomes harder
- repository size grows quickly

### Conan (and other package managers)

A package manager like [Conan](https://conan.io/) can be a strong choice for larger projects.
It is especially useful for dependencies that take a long time to build.

For small side projects with only a few libraries, though, it can feel heavy.
The package manager itself becomes another dependency every contributor and CI environment must install and maintain.

## Can CMake help here?

Languages like Rust and Go integrate dependency management into the build system, which creates a smoother developer experience.

CMake added [`ExternalProject`](https://cmake.org/cmake/help/latest/module/ExternalProject.html) in version 3.0.
It wraps dependencies as CMake targets and can manage foreign code from your `CMakeLists.txt`.

With `ExternalProject_Add()`, CMake can run these steps:
- `DOWNLOAD`
- `UPDATE`
- `CONFIGURE`
- `BUILD`
- `INSTALL`
- `TEST` (optional)

All steps are configurable, and custom steps are possible.

### Why `ExternalProject` was not enough

`ExternalProject` performs work at build time.
So dependencies are downloaded and built after generation, which means they are not available yet when CMake configures your project.

## Enter `FetchContent`

With CMake 3.11, a new module arrived: [`FetchContent`](https://cmake.org/cmake/help/latest/module/FetchContent.html).
It offers similar functionality but downloads dependencies before the configure step.

That means we can manage C++ dependencies directly from `CMakeLists.txt` while keeping them available during configuration.

## How to use `FetchContent`

In this example repository, we use `FetchContent` with [doctest](https://github.com/onqtam/doctest) and [range-v3](https://github.com/ericniebler/range-v3):
- [Example project](https://github.com/bewagner/fetchContent_example)

Start with a regular CMake project, require CMake 3.14 (for the improved API), and include the module:

```cmake
cmake_minimum_required(VERSION 3.14)
project(fetch_content_example)
include(FetchContent)
```

Declare each dependency with `FetchContent_Declare()`:

```cmake
FetchContent_Declare(
  doctest
  GIT_REPOSITORY https://github.com/doctest/doctest.git
  GIT_TAG 7b520e8c8f7f6e8f0ee6f4f1f592f7f4f0b31e3f
)

FetchContent_Declare(
  range-v3
  GIT_REPOSITORY https://github.com/ericniebler/range-v3.git
  GIT_TAG 9b0f9a4a2f7d99ebf93fce0bc4e0d8e2080c5f04
)
```

Then make dependencies available:

```cmake
FetchContent_MakeAvailable(doctest range-v3)
```

Finally, define and link your executable:

```cmake
add_executable(${PROJECT_NAME} main.cpp)
target_link_libraries(${PROJECT_NAME} PRIVATE doctest range-v3)
```

Using Git repositories is often the easiest path.
If your dependency source is elsewhere, many options from `ExternalProject` are still relevant.

## What to watch out for

### Downloading requires internet access

The first dependency download requires network access.
To control this behavior, useful options are:
- `FETCHCONTENT_FULLY_DISCONNECTED=ON` skips `DOWNLOAD` and `UPDATE`
- `FETCHCONTENT_UPDATES_DISCONNECTED=ON` skips `UPDATE`

### Output can get noisy

`FetchContent` logs its steps, which can be verbose.
Set `FETCHCONTENT_QUIET=ON` to reduce output.

### The dependency must be installable

A recurring issue is dependencies that are missing `install()` calls in their own `CMakeLists.txt`.
In such cases, `FetchContent` may fail when copying built artifacts into install locations.

`FetchContent` works best with CMake-based dependencies.
For non-CMake projects, additional configuration is often required.

## Conclusion

In this post, we covered `FetchContent` for C++ dependency management within CMake.
You now have a practical setup for small projects and a checklist of common pitfalls.

Use whichever dependency strategy fits your project best—or combine approaches when needed.

Please let me know if you think something important is missing.

