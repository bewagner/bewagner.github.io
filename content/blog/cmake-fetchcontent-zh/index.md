+++
date = "2020-05-02"
title = "用 CMake 的 FetchContent 來管理 C++ 依賴項"
description = "如何使用內建的 CMake 功能替換 Git 子模組"
[taxonomies]
tags = ["cpp", "cmake"]
[extra]
image = "containership-zh.webp"
+++

在這篇文章中，我們討論 C++ 依賴管理。
特別是 `FetchContent` 這個 CMake 功能，值得更多關注。

## C++ 依賴管理常見做法

### Git 子模組

過去我通常把每個依賴都加成 Git 子模組。
對於有現代 CMake 設定的套件，這通常已經夠用。

但這種方式有個痛點：每位使用者在建置前都要先執行：

```bash
git submodule update --init
```

這會增加上手成本，而且我自己也常忘記跑這個指令。

### 直接把依賴程式碼複製進 repo

這當然可行，但通常比子模組更難維護：
- 更新依賴麻煩
- repository 容易膨脹

### Conan（與其他套件管理器）

像 [Conan](https://conan.io/) 這類工具，對大型專案很有幫助。
當依賴非常耗時（例如 OpenCV）時也特別實用。

但在小型 side project 裡，常常又顯得太重。
而且套件管理器本身也會變成另一個依賴：
每個協作者和 CI 都得安裝並維護正確版本。

## CMake 能不能直接處理？

較新的語言（如 Rust、Go）把依賴管理整合在建置系統中，開發體驗更一致。

CMake 在 3.0 引入了 [`ExternalProject`](https://cmake.org/cmake/help/latest/module/ExternalProject.html)。
它可以透過 `ExternalProject_Add()` 管理外部程式碼，支援這些步驟：
- `DOWNLOAD`
- `UPDATE`
- `CONFIGURE`
- `BUILD`
- `INSTALL`
- `TEST`（可選）

但問題在於：`ExternalProject` 在 **build 階段**才執行。
也就是說，當 CMake 在 configure 專案時，依賴通常還不可用。

## 這時候就該用 `FetchContent`

CMake 3.11 引入 [`FetchContent`](https://cmake.org/cmake/help/latest/module/FetchContent.html)。
它和 `ExternalProject` 類似，但會在 configure 前先把依賴抓下來。

因此我們可以直接在 `CMakeLists.txt` 裡管理依賴，且在 configure 階段就能使用。

## `FetchContent` 基本用法

範例專案：
- [bewagner/fetchContent_example](https://github.com/bewagner/fetchContent_example)

先建立一般 CMake 專案，需求版本至少 3.14（API 較完整）：

```cmake
cmake_minimum_required(VERSION 3.14)
project(fetch_content_example)
include(FetchContent)
```

接著宣告依賴：

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

再呼叫：

```cmake
FetchContent_MakeAvailable(doctest range-v3)
```

最後建立 target 並連結：

```cmake
add_executable(${PROJECT_NAME} main.cpp)
target_link_libraries(${PROJECT_NAME} PRIVATE doctest range-v3)
```

> `GIT_TAG` 建議用 commit hash，避免分支/標籤移動造成不可重現的建置結果。

## 使用 `FetchContent` 時要注意

### 1) 首次下載需要網路

可用這些選項控制下載/更新：
- `FETCHCONTENT_FULLY_DISCONNECTED=ON`：跳過 `DOWNLOAD` 與 `UPDATE`
- `FETCHCONTENT_UPDATES_DISCONNECTED=ON`：只跳過 `UPDATE`

### 2) 輸出可能很冗長

`FetchContent` 會輸出很多步驟日誌。
若想安靜些可設：

- `FETCHCONTENT_QUIET=ON`

### 3) 依賴本身要可安裝

若第三方套件的 `CMakeLists.txt` 缺少 `install()`，
`FetchContent` 在安裝階段可能失敗。
這時通常要到上游補上 `install()`（或提 PR）。

## 結論

`FetchContent` 讓我們能直接在 CMake 中管理 C++ 依賴，
特別適合小型專案與快速原型。

當然也可以混合使用不同策略，選擇最適合你專案的組合。

如果你有其他經驗，歡迎交流。


Photo by <a href="https://unsplash.com/@ventiviews?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Venti Views</a> on <a href="https://unsplash.com/photos/aerial-view-of-boat-on-water-1cqIcrWFQBI?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
      