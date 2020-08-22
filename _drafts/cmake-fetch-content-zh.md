---
layout:     post
title:      通過CMake的FetchContent進行C++依賴管理
date:       2020-05-02 08:00:00
summary:    如何使用內置的CMake功能替換git submodules
categories: programming
lang:       zh_TW
---
In this post, we will talk about dependency management in C++. 
在這篇文章中，我們將討論C++依賴管理。

In particular, we introduce `FetchContent`, a CMake feature that should get more love! 
特別是`FetchContent`，一個值得嘗試的CMake功能．

We start with an overview of dependency management for C++ applications.
我們首先概述C++依賴管理。

### Git submodules

In the past, my default was to add each dependency as a git submodule.
以前，我通常會把每個依賴項添加爲git submodule.

For dependencies with a modern CMake setup, this is enough to make it available to your project. 
對於具有現代CMake設置的依賴項來說，這足以使依賴項提供給你的項目．

But what I always disliked about this approach, is that it requires each user to run 
但我一直不喜歡這個方法是因爲它要求每個用戶都必須先運行
```
$ git submodule update --init
``` 
before building the code. 
才可以開始構建代碼．

I like to make things easy on people using my code. 
而我喜歡人們有輕鬆的用戶體驗．

Thus I'm always on the lookout for a way to get rid of running any extra commands. 
因此，我一直在尋找擺脫運行任何額外命令的方法。

Also, I have caught myself forgetting to run `git submodule update --init` many times already. 
另外，我自己也會忘記運行`git submodule update --init`．

### Copying the code into your repository
### 把代碼複製到git倉庫

Of course one can also copy the whole source code of the dependency into the repository of the project. 
你當然也可以將依賴項的整個源代碼複製到項目的倉庫。

Yet, in my view, this is inferior to submodules. 
但是，在我看來，這卻不如submodules.

Updating dependencies becomes complicated. 
這做法讓更新依賴項變得很複雜．

And, depending on how big your dependencies are, this will bloat your repository.  
而且，取決於依賴項的大小，會讓你的git倉庫膨脹．


### 柯南(和其他包管理器)

Another option is using a package manager like [conan](https://conan.io/).
另外一種選擇是使用軟體包管理器，例如[柯南](https://conan.io/).


I found them an adequate solution for bigger projects. 
They're also nice when you have dependencies that take very long to build (I'm looking at you OpenCV! :sleeping::hourglass_flowing_sand:).  
But for your small side project that needs two or three libraries from Github, it's often too much effort.
我認爲包管理器適合用於解決大型項目,尤其當你有建構較費時的依賴項時(就是你，OpenCV! :sleeping::hourglass_flowing_sand:),是很不錯的,但對於只有兩三個依賴項的小項目來說，包管理器往往是殺雞用牛刀．

My main critique point is that the package manager itself becomes a dependency. 
最大的缺點是，包管理器本身成為依賴項．

Everyone that wants to build your project has install the correct version.
If you're using CI, you have to set up everything on the build server as well, which can be a pain sometimes.  
每個想要構建項目的人，都必須安裝包管理器的正確版本,若你使用CI，則必須在構建服務器上設置包管理器，但這有時會很麻煩．

## Can CMake help us here? 
## CMake 能幫我們嗎？

Younger languages like Rust and Go incorporated package management in the build system.
Rust和Go等較年輕的程式語言在構建系統中加入了包管理功能。

This makes for a nicer developer experience as one does not have to choose which package manager to use. Also, packages are by default set up for the languages built-in package manager. 
因爲這樣不必選擇包管理器，所以可以提供跟好的編程體驗，而且所有依賴項都已設置爲內置的包管理器。

With this in mind, it's natural to look towards CMake for a solution. 
如果我們考慮到這一點，就很自然地會向CMake尋求解決方案．

I was excited to hear that CMake introduced a module called [`ExternalProject`](https://cmake.org/cmake/help/latest/module/ExternalProject.html) in version 3.0. 
我很高興聽到CMake在3.0版中引入了一個名為ExternalProject的模塊。

`ExternalProject` wraps dependencies into a CMake target and allows managing foreign code from your `CMakeLists.txt`.
`ExternalProject`把依賴項包成CMake target，並使我們能夠從`CMakeLists.txt`中管理外來代碼。

To use it, one must add a target via `ExternalProject_Add()`. 
CMake will then run the following steps for this target. 
要使用它，必須通過`ExternalProject_Add()`添加一個 CMake target，然後CMake會接着運行接以下的步驟．

`DOWNLOAD` 

Download the dependency. Here one can use a version control system or download from an URL.
下載依賴項。 在這裡，您可以使用版本控制系統或從URL下載。

`UPDATE` 

Update the downloaded code if anything changed since the last CMake run.
如果自上次CMake運行以來發生更改，更新下載的代碼。

`CONFIGURE` 

Configure the project code.
配置項目代碼。

`BUILD` 

Build the dependencies code.
建構依賴項代碼。

`INSTALL`

Install the built code into a specified directory.
將可執行文件和頭文件安裝到指定目錄中。

`TEST` (可選)

Run tests. 
運行測試。

All the above commands are configurable. 
`ExternalProject` also allows for custom steps.
以上所有命令都是可配置的，而且`ExternalProject`也讓你自定義步驟。

For more information, have a look at the [documentation](https://cmake.org/cmake/help/latest/module/ExternalProject.html#module:ExternalProject).
如果你需要更多信息，請參閱`ExternalProject`的[documentation](https://cmake.org/cmake/help/latest/module/ExternalProject.html#module:ExternalProject)。

### So, is this the solution?
### 那麼，這是解決方案嗎？

After playing around with it for a little bit, I found that **`ExternalProject` is not what I was looking for.** :pensive:
玩了一陣子之後，我發現**`ExternalProject`不是我想要的。**:pensive:

The reason is that when using `ExternalProject`, all its steps will run at build time.
原因是使用`ExternalProject`時，其所有步驟將在構建時運行。

This means that CMake downloads and builds your dependencies after the generation step.
So your dependencies will not be available yet when CMake configures your project.
這意味著CMake在生成步驟之後下載並構建你的依賴項，因此，當CMake配置項目時，你的依賴項尚未存在。


### Will we have to stick to submodules then?
### 我們是否必須繼續使用submodules？

No, we won't!
不是！

With version 3.11 CMake introduced a new module: [`FetchContent`](https://cmake.org/cmake/help/latest/module/FetchContent.html).
在3.11版本中，CMake引入了一個新的模塊：[`FetchContent`](https://cmake.org/cmake/help/latest/module/FetchContent.html)。

The module offers the same functionality as `ExternalProject` but will download dependencies before the configure step. 
That means we can use it to manage our C++ project dependencies from the `CMakeLists.txt` file! :tada: :tada: :tada:
`FetchContent`提供與`ExternalProject`相同的功能，可是會在配置步驟之前下載依賴項，所以我們透過它可以從`CMakeLists.txt`管理項目的依賴項。:tada: :tada: :tada:


## How to use `FetchContent`
## 如何使用`FetchContent`

In this [repository](https://github.com/bewagner/fetchContent_example), I prepared an example. 
在此[倉庫](https://github.com/bewagner/fetchContent_example)我準備了一個示例。

It uses `FetchContent` to include the libraries' [doctest](https://github.com/onqtam/doctest) and [range-v3](https://github.com/ericniebler/range-v3).
它使用`FetchContent`來列入[doctest](https://github.com/onqtam/doctest)和[range-v3](https://github.com/ericniebler/range-v3)軟件庫。

CMake will download and build the dependencies.
Very convenient!
CMake會下載並構建所有依賴項，很方便！


I will explain how everything works below. Make sure you get the [code](https://github.com/bewagner/fetchContent_example) to play around with it. 
我會在下面解釋一切，代碼在[這裡](https://github.com/bewagner/fetchContent_example)。

We begin by creating a regular CMake project.
我們首先創建一個CMake項目。
The `FetchContent` API got a makeover that makes usage easier in version 3.14.
Thus this is the least version we need.
因為`FetchContent`的API在3.14版本受到了改善，所以我們會用3.14版本。

Then we include the `FetchContent` module.
之後，加入`FetchContent`模塊。
{% highlight CMake %}
{% include includelines filename='code/2020/05/FetchContent/CMakeLists.txt' start=1 count=4 %}
{% endhighlight %}


We register each dependency with a call to `FetchContent_Declare()`. 
When making this call, you can customize how your dependency is loaded.
我們用`FetchContent_Declare()`來註冊每個依賴項，這時候你也可以定義CMake如何下載依賴項。

`FetchContent` understands almost the same options as `ExternalProject`. 
But the options related to `CONFIGURE`, `BUILD`, `INSTALL`, and `TEST` are disabled. 
`FetchContent`的選項和`ExternalProject`幾乎相同，可是與`配置(CONFIGURE)`，`構建(BUILD)`，`安裝(INSTALL)`和`測試(TEST)`相關的選項被禁用。

We declare two targets, one for `doctest` and one for `range-v3`.
CMake downloads both libraries via their git repository. 
我們定義兩個targets，一個給`doctest`，一個給`range-v3`，兩個都被從git倉庫下載。

The parameter `GIT_TAG` specifies the commit in the dependencies history we use. 
`GIT_TAG`參數指定我們使用依賴項歷史記錄中的哪一個commit。
One can also use git branch names or tags here. 
Yet, new commits can change what the branch is pointing to. 
在這裡也可以使用git branch名稱或tag，但是新提交可能會更改branch指向的內容。

This might affect the reproducibility of your project.
So the CMake documentation discourages using branch names or tags.
這可能會影響項目的可重複性，因此CMake documentation不鼓勵使用branch名稱或tag。

{% highlight CMake %}
{% include includelines filename='code/2020/05/FetchContent/CMakeLists.txt' start=6 count=9 %}
{% endhighlight %}

Next, we call `FetchContent_MakeAvailable()`. 
This call makes sure CMake downloads our dependencies and adds their directories. 
接下來，我們調用`FetchContent_MakeAvailable()`,該調用可確保CMake下載我們的依賴項並添加其目錄。
{% highlight CMake %}
{% include includelines filename='code/2020/05/FetchContent/CMakeLists.txt' start=17 count=1 %}
{% endhighlight %}

Finally, we can add an executable and link to the included packages. 
CMake has taken over all the heavy lifting!
最後，我們添加一個可執行文件並鏈接到所包含的軟件包，CMake接管了所有繁重的工作！

{% highlight CMake %}
{% include includelines filename='code/2020/05/FetchContent/CMakeLists.txt' start=19 count=2 %}
{% endhighlight %}

Using git repositories is the most convenient way of including dependencies with `FetchContent`. 
But, if the code you depend on is not a git repository, you can customize `FetchContent` to work with other sources. 
Have a look at the [documentation of `ExternalProject`](https://cmake.org/cmake/help/latest/module/ExternalProject.html#module:ExternalProject).
It explains all parameters.


The whole `CMakeLists.txt` file will look like this.

{% highlight CMake %}
{% include includelines filename='code/2020/05/FetchContent/CMakeLists.txt' start=1 count=20 %}
{% endhighlight %}

After setting everything up in CMake, we can use the packages in our source code. 
Below is a small test program that makes use of both included libraries.

{% highlight C++ %}
{% include includelines filename='code/2020/05/FetchContent/main.cpp' start=1 count=25 %}
{% endhighlight %}
The full example project is [here](https://github.com/bewagner/fetchContent_example).

## What to watch out for
Here are some things to keep in mind when using `FetchContent`.

#### Downloading requires an internet connection
Of course, you have to be online for first downloading your dependencies. Compared to using submodules, this requirement is now hidden. So you might forget about it when building your code. 
To mitigate this problem, there is a set of options.
- `FETCHCONTENT_FULLY_DISCONNECTED=ON` will skip the `DOWNLOAD` and `UPDATE` steps 
- `FETCHCONTENT_UPDATES_DISCONNECTED=ON` will skip the `UPDATE` step

#### Output can become pretty verbose
`FetchContent` will log all its steps.
That's why console output can become hard to read. 
To mute all output set `FETCHCONTENT_QUIET` to `ON`.

#### The library has to be installable
A problem that I ran into quite often is that the dependency I wanted to use was not installable. Every once in a while you will come across libraries that are missing the call to `install()` in their `CMakeLists.txt`. In this case, `FetchContent` does not know how to copy the built code into the install folder and will fail. In this case, consider adding the `install()` calls and creating a PR.

`FetchContent` works best with CMake based dependencies. I haven't had a chance to test it with libraries that are not built with CMake. But I would expect that some extra configuration is necessary to make it work. 

## Conclusion

In this blog post, we learned about `FetchContent`.
Now you know how to manage your dependencies from within your CMake setup. 
We saw how to use `FetchContent` to pull in dependencies for a small example project. 
And we read about some things to watch out for when using it. 

I like this way of managing dependencies very much.
But of course, you can always mix different approaches and use what's best for you!

Please let me know if you think I missed anything in this article!

Follow me on twitter [(@bewagner_)](https://twitter.com/bewagner_) for more of my thoughts on C++!



