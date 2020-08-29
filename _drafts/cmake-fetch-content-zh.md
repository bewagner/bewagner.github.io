---
layout:     post
title:      通過CMake的FetchContent進行C++依賴管理
date:       2020-05-02 08:00:00
summary:    如何使用內置的CMake功能替換git submodules
categories: programming
lang:       zh_TW
---
在這篇文章中，我們將討論C++依賴管理。
特別值得一提的是，我們推出了`FetchContent`這一CMake功能，應該會得到更多的喜愛!

我們首先概述C++應用程式的依賴管理。
### Git 子模組

以前，我通常會把每個依賴項為Git子模組添加。
對於現代CMake設置的依賴項，這就足以使它對你的專案可用。

但我一直不喜歡這種方法的地方是，它需要每個用戶都運行
```
$ git submodule update --init
``` 
在構建代碼之前。
而我喜歡人們有輕鬆的用戶體驗。
因此，我一直在尋找擺脫運行任何額外命令的方法。
另外，我發現自己已經多次忘記運行`git submodule update -init`了。

### 把代碼複製到Git倉庫

當然，也可以將依賴關係的整個源代碼複製到專案的存儲庫中。
但是，在我看來，這卻不如子模組.
這做法讓更新依賴項變得很複雜。
根據依賴關係的大小，會讓Git倉庫膨脹。


### 柯南(和其他包管理器)
另一個選擇是使用像[柯南](https://conan.io/)這樣的包管理器。

我發現對於處理更大型的專案時，他們是一個合適的解決方案。
當你有需要很長時間構建依賴項時，它們也很不錯的(我看著你呢OpenCV!:sleeping::hourglass_flowing_sand:)。

可是包管理器的最大缺點是它本身成為依賴項。
每個想要構建項目的人，都必須安裝包管理器的正確版本。
若使用CI，則必須在構建服務器上設置包管理器。
這有時會很麻煩。

## CMake能幫我們嗎？

像Rust和Go這樣較新的語言在構建系統中加入了包管理功能。
因為這樣不必選擇包管理器，所以可以提供更好的編程體驗。
而且所有依賴項都已設置為內置的包管理器。

考慮到這一點，很自然就會向CMake尋求解決方案。

我很高興聽到CMake在3.0版中引入了一個名為ExternalProject的模塊。
`ExternalProject`將依賴項包成CMake目標，並允許我們從`CMakeLists.txt`中管理外部代碼。
要使用它，必須通過`ExternalProject_Add()`添加一個目標。
CMake將為此目標運行以下步驟。

`DOWNLOAD` 

下載依賴。這裡可以使用版本控制系統或從URL下載。

`UPDATE` 

如果自上次運行CMake以來有任何更改，請更新下載的代碼。

`CONFIGURE` 

配置項目代碼。

`BUILD` 

建構依賴項代碼。

`INSTALL`

將可執行文件和頭文件安裝到指定目錄中。

`TEST` (可選)

運行測試。

以上所有命令都是可配置的。
`ExternalProject`也讓你自定義步驟。

如果你需要更多信息，請參閱`ExternalProject`的[文檔](https://cmake.org/cmake/help/latest/module/ExternalProject.html#module:ExternalProject)。

### 那麼，這是解決方案嗎？

用它一陣子之後，我發現了`ExternalProject`**不是我想要的。**:pensive:

原因是使用`ExternalProject`時，其所有步驟將在構建時運行。
這意味著CMake在生成步驟之後下載並構建依賴項。
因此，當CMake配置項目時，依賴項尚未存在。


### 我們是否必須繼續使用子模組？

不是！

在3.11版本中，CMake引入了一個新的模塊：[`FetchContent`](https://cmake.org/cmake/help/latest/module/FetchContent.html)。

`FetchContent`提供與`ExternalProject`相同的功能，可是會在配置步驟之前下載依賴項。
所以透過它可以從`CMakeLists.txt`管理項目的依賴項。:tada: :tada: :tada:


## 如何使用`FetchContent`

在此[倉庫](https://github.com/bewagner/fetchContent_example)我準備了一個示例。
它使用`FetchContent`來列入[doctest](https://github.com/onqtam/doctest)和[range-v3](https://github.com/ericniebler/range-v3)。
CMake會下載並構建所有依賴項。
很方便！


我們首先創建一個CMake項目。
因為`FetchContent`的API在3.14版本受到了改善，所以我們會用3.14版本。
之後，我們加入`FetchContent`模塊。
{% highlight CMake %}
{% include includelines filename='code/2020/05/FetchContent/CMakeLists.txt' start=1 count=4 %}
{% endhighlight %}


我們用`FetchContent_Declare()`來註冊所有依賴項。
這時候也可以定義CMake如何下載依賴項。
`FetchContent`的選項和`ExternalProject`幾乎相同，可是與配置(`CONFIGURE`)，構建(`BUILD`)，安裝(`INSTALL`)和測試(`TEST`)相關的選項被禁用。

我們定義兩個目標，一個給`doctest`，一個給`range-v3`。兩個都用Git倉庫下載。

`GIT_TAG`參數指定我們使用依賴項歷史記錄中的哪一個提交。
在這裡也可以使用Git分支或標籤，但是新提交可能會更改分支指向的內容。
這可能會影響項目的可重複性。
因此CMake文檔不鼓勵使用分支或標籤。

{% highlight CMake %}
{% include includelines filename='code/2020/05/FetchContent/CMakeLists.txt' start=6 count=9 %}
{% endhighlight %}

接下來，我們調用`FetchContent_MakeAvailable()`。
該調用可確保CMake下載我們的依賴項並添加其目錄。
{% highlight CMake %}
{% include includelines filename='code/2020/05/FetchContent/CMakeLists.txt' start=17 count=1 %}
{% endhighlight %}

最後，我們添加一個可執行文件並鏈接到所包含的軟件包。
CMake接管了所有繁重的工作！

{% highlight CMake %}
{% include includelines filename='code/2020/05/FetchContent/CMakeLists.txt' start=19 count=2 %}
{% endhighlight %}

使用Git倉庫是FetchContent的最方便包含依賴項方法。
但如果依賴項不是Git存儲庫，則可以設置`FetchContent`用其他代碼源。
請查看[ExternalProject的文檔](https://cmake.org/cmake/help/latest/module/ExternalProject.html#module:ExternalProject)。
它解釋所有參數。


整個`CMakeLists.txt`如下。

{% highlight CMake %}
{% include includelines filename='code/2020/05/FetchContent/CMakeLists.txt' start=1 count=20 %}
{% endhighlight %}

設置完CMake之後，我們可以在代碼中使用這些包。
下面有一個利用兩個附帶庫的測試程序。

{% highlight C++ %}
{% include includelines filename='code/2020/05/FetchContent/main.cpp' start=1 count=25 %}
{% endhighlight %}

請參閱[此鏈接](https://github.com/bewagner/fetchContent_example)以查看完整的項目。

##什麼需要注意的

Here are some things to keep in mind when using `FetchContent`.
TODO

#### 下載依賴項需要網路鏈接

你必須在線上才能下載依賴項。
但與子模組相比，此條件較隱藏。
構建代碼時，可能會忘記需要網路鏈接。
為了緩解此問題，有一組選項。
- `FETCHCONTENT_FULLY_DISCONNECTED=ON`將跳過`DOWNLOAD`和`UPDATE`步驟
- `FETCHCONTENT_UPDATES_DISCONNECTED=ON`將跳過`UPDATE`步驟

####輸出可能變得非常冗長

`FetchContent`會記錄所有步驟。
這就是為什麼控制台輸出變得難以閱讀的原因。
要使所有輸出靜音，請將`FETCHCONTENT_QUIET`設置為`ON`。

#### 庫必須是可安裝的
我經常遇到的一個問題是我要使用的依賴項無法安裝。
偶然，會遇到在其`CMakeLists.txt`缺`install()`調用的庫。
這種情況下，因為`FetchContent`不知道如何將構建好的代碼複製到安裝文件夾而失敗。
請考慮添加`install()`調用並創建一個PR。

`FetchContent`與基於CMake的依賴項最有效。
我還沒試過不是由CMake構建的庫，可是我估計會需要一些額外配置。

## 結論

在此文章我介紹了`FetchContent`。
你知道如何從CMake中管理依賴項了。
我們學到了如何使用`FetchContent`引入一個小示例項目的依賴項。
並且，我們了解了使用時需要注意的一些事項。

我非常喜歡這種管理依賴項的方式。
當然你總是可以混合不同的方法，並使用最適合你的方法！

歡迎留言分享你的看法！

如果你喜歡本文章，可以在[推特關注我](https://twitter.com/bewagner_)。

