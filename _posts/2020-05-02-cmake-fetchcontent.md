---
layout:     post
title:      Bye-bye git submodules!
date:       2020-05-02 08:00:00
summary:    Using CMake's FetchContent for dependency management of C++ projects
categories: programming
---
In this post, we will talk about dependency management in C++. In particular, we will introduce `FetchContent`, a rather new CMake feature! 

We start with an overview of dependency management for C++ applications.

### Git submodules

In the past, my default was to add each dependency as a git submodule.
For dependencies with a modern CMake setup, this is enough to make it available to your project. 

But what I always disliked about this approach, is that it requires each user to run 
```
$ git submodule update --init
``` 
before building the code. I like to make things easy on people using my code. Thus I'm always on the lookout for a way to get rid of running any extra commands. Also, I have caught myself forgetting to run `git submodule update --init` many times already. 

### Copying the code into your repository
Of course one can also copy the whole source code of the dependency into the repository of the project. Yet, in my view, this is inferior to submodules. Updating dependencies becomes complicated. And, depending on how big your dependencies are, this will bloat your repository.  

### Conan (and other package managers)

Another option is using a package manager like [conan](https://conan.io/).
I found them an adequate solution for bigger projects. They're also nice when you have dependencies that take very long to build (I'm looking at you OpenCV! :sleeping::hourglass_flowing_sand:).  
But for your small side project that needs two or three libraries from Github, it's often too much effort.

My main critique point is that the package manager itself becomes a dependency. Everyone that wants to build your project has install the correct version. If you're using CI, you have to set up everything on the build server as well, which can be a pain sometimes.  

## Can CMake help us here? 
Younger languages like Rust and Go incorporated package management in the build system.
This makes for a nicer developer experience as one does not have to choose which package manager to use. Also, packages are by default set up for the languages built-in package manager. 

With this in mind, it's natural to look towards CMake for a solution. I was excited to hear that CMake introduced a module called [`ExternalProject`](https://cmake.org/cmake/help/latest/module/ExternalProject.html) in version 3.0. `ExternalProject` wraps dependencies into a CMake target and allows managing foreign code from your `CMakeLists.txt`.

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

All the above commands are configurable. 
`ExternalProject` also allows for custom steps.
For more information, have a look at the [documentation](https://cmake.org/cmake/help/latest/module/ExternalProject.html#module:ExternalProject).

### So, is this the solution?

After playing around with it for a little bit, I found that **`ExternalProject` is not what I was looking for.** :pensive:

The reason is that when using `ExternalProject`, all its steps will run at build time.
This means that CMake downloads and builds your dependencies after the generation step.
So your dependencies will not be available yet when CMake configures your project.


### Will we have to stick to submodules then?

No, we won't!

With version 3.11 CMake introduced a new module: [`FetchContent`](https://cmake.org/cmake/help/latest/module/FetchContent.html).
The module offers the same functionality as `ExternalProject` but will build and install dependencies at configure time. 
That means we can use it to manage our C++ project dependencies from the `CMakeLists.txt` file! :tada: :tada: :tada:


## How to use `FetchContent`?

In this [repository](https://github.com/bewagner/fetchContent_example), I prepared an example. It uses `FetchContent` to include the libraries' [doctest](https://github.com/onqtam/doctest) and [range-v3](https://github.com/ericniebler/range-v3).
CMake will download and build the dependencies.
Very convenient!
I will explain how everything works below. Make sure you get the [code](https://github.com/bewagner/fetchContent_example) to play around with it. 

We begin by creating a regular CMake project.
The `FetchContent` API got a makeover that makes usage easier in version 3.14.
Thus this is the least version we need.
Then we include the `FetchContent` module.
{% highlight CMake %}
{% include includelines filename='code/2020/05/FetchContent/CMakeLists.txt' start=1 count=4 %}
{% endhighlight %}


We register each dependency with a call to `FetchContent_Declare()`. 
When making this call, you can customize how your dependency is loaded.
`FetchContent` understands almost the same options as `ExternalProject`. 
But the options related to `CONFIGURE`, `BUILD`, `INSTALL`, and `TEST` are disabled. 

We declare two targets, one for `doctest` and one for `range-v3`.
CMake downloads both libraries via their git repository. 

The parameter `GIT_TAG` specifies the commit in the dependencies history we use. 
One can also use git branch names or tags here. 
Yet, new commits can change what the branch is pointing to. This might affect the reproducibility of your project.
So the CMake documentation discourages using branch names or tags.
{% highlight CMake %}
{% include includelines filename='code/2020/05/FetchContent/CMakeLists.txt' start=6 count=9 %}
{% endhighlight %}

Next, we call `FetchContent_MakeAvailable()`. 
This call makes sure CMake downloads our dependencies and adds their directories. 
{% highlight CMake %}
{% include includelines filename='code/2020/05/FetchContent/CMakeLists.txt' start=17 count=1 %}
{% endhighlight %}

Finally, we can add an executable and link to the included packages. 
CMake has taken over all the heavy lifting!

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


