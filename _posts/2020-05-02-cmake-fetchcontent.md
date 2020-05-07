---
layout:     post
title:      Bye-bye git submodules!
date:       2020-05-02 08:00:00
summary:    Using CMake's FetchContent for dependency management of C++ projects
categories: programming
---
In this post I would like to talk about dependency management in C++ and in particular about `FetchContent`, a rather new CMake feature I found some time ago!

## Dependency management in C++
We will start with an overview of the different ways of managing dependencies when building C++ applications.

### Git submodules

In the past, my default way of managing dependencies was by adding them as git submodules into my repository. Then I added each dependencies directory via a call to `add_subdirectory()`. Depending on how sophisticated the dependencies CMake setup was, this, for the most part, was enough to make it available to my project. 

What I always disliked about this approach, however, is that it requires each user to run 
```
$ git submodule update --init
``` 
before building the code. I like to make things easy on people using my code. Therefore I'm always on the lookout for a way to get rid of running any additional commands. Also, I have caught myself forgetting to run `git submodule update --init` multiple times already. 

### Copying the code into your repository
Of course one can also just copy the whole source code of the dependency into the repository of the project. Yet, in my view, this is inferior to submodules. Updating dependencies becomes complicated. And, depending on how big your dependencies are, this might increase the size of your repository significantly.  

### Conan (and other package managers)

Another option is using a package manager like [conan](https://conan.io/).
I found them an adequate solution for bigger projects or when you have dependencies that take very long to build (I'm looking at you OpenCV! :sleeping::hourglass_flowing_sand:).  
But for your small side project that needs two or three libraries from Github, it's often too much effort.

My main critique point is that the package manager itself becomes a dependency. You and everyone that wants to build your project have to make sure that the correct version is installed. Additionally, if you're using CI, you have to set up everything on the build server as well, which can be a pain sometimes.  

## Can CMake help us here? 
In younger languages like Rust and Go, package management is tightly integrated with the configuration/build system. This makes for a nicer developer experience as one does not have to choose which package manager to use and packages are by default set up for the languages built-in package manager. 

With this in mind, it's natural to look towards CMake for a solution. I was excited to hear that CMake introduced a module called [ExternalProject](https://cmake.org/cmake/help/latest/module/ExternalProject.html) in version 3.0. `ExternalProject` wraps dependencies into a CMake target and allows managing foreign code from your `CMakeLists.txt`.

To use it, one must add a target via `ExternalProject_Add()`. CMake will then run the following steps for this target. 

`DOWNLOAD` 

Download the dependency. Here one can use a version control system or download from an URL.

`UPDATE` 

Update the downloaded code if anything changed since the last CMake run.

`CONFIGURE` 

Configure the project code.

`BUILD` 

Build the dependencies code.

`INSTALL`

Install the built code into a specified directory.

`TEST` (optional)

Run tests. 

All of the above commands are highly configurable and `ExternalProject` also allows for custom steps.
For more information, have a look at the [documentation](https://cmake.org/cmake/help/latest/module/ExternalProject.html#module:ExternalProject).

### So, is this the solution?

After playing around with it for a little bit, I found that **`ExternalProject` is not what I was looking for.** :pensive:

 The reason is that when using `ExternalProject`, all of its steps will be run at build time. This means, that the dependencies code will not be downloaded and built yet when CMake tries to configure your project.  

### Will we have to stick to submodules then?

No, we won't!

With version 3.11 CMake introduced a new module: [`FetchContent`](https://cmake.org/cmake/help/latest/module/FetchContent.html).
The module offers the same functionality as `ExternalProject` but will build and install dependencies at configure time. 
That means we can use it to manage our C++ project dependencies directly from the `CMakeLists.txt` file! :tada: :tada: :tada:


## How to use `FetchContent`?

In this [repository](https://github.com/bewagner/fetchContent_example), I prepared an example that uses `FetchContent` to include the libraries' [doctest](https://github.com/onqtam/doctest) and [range-v3](https://github.com/ericniebler/range-v3). When running CMake, the dependencies will be downloaded and build automatically. Very convenient!
I will explain how everything works below. But makes sure you get the [code](https://github.com/bewagner/fetchContent_example) to play around with it. 

We begin by creating a regular CMake project. As the `FetchContent` API got a makeover that makes usage easier in version 3.14, this is the minimum version we will require. Then we include the `FetchContent` module.
{% highlight CMake %}
{% include includelines filename='code/2020/05/FetchContent/CMakeLists.txt' start=1 count=4 %}
{% endhighlight %}


Each dependency has to be registered with `FetchContent_Declare()`. 
When making this call, you can customize how your dependency is loaded.
`FetchContent` understands almost the same options as `ExternalProject`. But contrary to `ExternalProject`, the options related to `CONFIGURE`, `BUILD`, `INSTALL`, and `TEST` are disabled. 

We declare two targets, one for `doctest` and one for `range-v3`.
Both libraries will be downloaded via their git repository. 

The parameter `GIT_TAG` specifies the commit in the dependencies history we want to use. One can also use git branch names or tags here. However, this is discouraged, as new commits can change what the branch is pointing to and this might affect the reproducibility of your project.
{% highlight CMake %}
{% include includelines filename='code/2020/05/FetchContent/CMakeLists.txt' start=6 count=9 %}
{% endhighlight %}

Following the call to `FetchContent_Declare()`, we use `FetchContent_MakeAvailable()` to make sure CMake downloads our dependencies and adds their directories.

{% highlight CMake %}
{% include includelines filename='code/2020/05/FetchContent/CMakeLists.txt' start=17 count=1 %}
{% endhighlight %}

Finally, we can add an executable and link to the included packages. All the heavy lifting has been taken over by CMake.

{% highlight CMake %}
{% include includelines filename='code/2020/05/FetchContent/CMakeLists.txt' start=19 count=2 %}
{% endhighlight %}

Using git repositories is probably the most convenient way of including dependencies with `FetchContent`. However, if the code you depend on is not a git repository, you can customize `FetchContent` to work with other sources. Have a look at the [documentation of `ExternalProject`](https://cmake.org/cmake/help/latest/module/ExternalProject.html#module:ExternalProject) as all parameters are explained there. 

The whole `CMakeLists.txt` file will look like this.

{% highlight CMake %}
{% include includelines filename='code/2020/05/FetchContent/CMakeLists.txt' start=1 count=20 %}
{% endhighlight %}

After setting everything up in CMake, we can just use the packages in our source code. 
Below is a small test program that makes use of both included libraries.

{% highlight C++ %}
{% include includelines filename='code/2020/05/FetchContent/main.cpp' start=1 count=25 %}
{% endhighlight %}
The full example project can be found [here](https://github.com/bewagner/fetchContent_example).

## What to watch out for
Here are some things to keep in mind when using `FetchContent`.

#### Downloading requires an internet connection
Of course, you have to be online for first downloading your dependencies. Yet, compared to when using submodules, this requirement is now hidden, so that you might forget about it when building your code. 
To mitigate this problem, there is a set of options.
- Setting `FETCHCONTENT_FULLY_DISCONNECTED` will lead to the `DOWNLOAD` and `UPDATE` steps being skipped
- Setting `FETCHCONTENT_UPDATES_DISCONNECTED` will skip the `UPDATE` step

#### Output can become pretty verbose
With the downloading, updating, configuring, and everything that's going on when using `FetchContent`, console output can become a bit crowded. To mute all output set `FETCHCONTENT_QUIET` to `ON`.

#### The library has to be installable
A problem that I ran into quite often is that the dependency I wanted to use was not installable. Every once in a while you will come across libraries that are missing the call to `install()` in their `CMakeLists.txt`. In this case, `FetchContent` does not know how to copy the built code into the install folder and will fail. In this case, consider adding the `install()` calls and creating a PR.

Naturally, `FetchContent` works best with CMake based dependencies. I haven't had a chance to test it with libraries that are not built with CMake, but I would expect that some additional configuration is necessary to make it work. 

## Conclusion

In this blog post, we learned about `FetchContent` and how to manage your dependencies from within your CMake setup. 
We saw how to use `FetchContent` to pull in dependencies for a small example project and read about some things to watch out for when using it. 

I like this way of managing dependencies very much.
But of course, you can always mix different approaches and use what's best for you!

Please let me know if you think I missed anything in this article!


