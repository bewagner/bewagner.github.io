---
layout:     post
title:      TODO Approval tests
date:       2020-08-08 08:13:00
summary:    
categories: programming
---


# What are approval tests

In a unit test you define the outcome of a function in the code. 
Then the testing framework checks whether the functions actual output matches the expected result you defined in the code.

Let's say you have an object `human` that has a member `numberOfLegs()`.
If your expected result is two, you would write code similar to the line below.
{%highlight C++%}
assertEqual(2, human.numberOfLegs());
{% endhighlight %}


Approval tests work differently. 

# What are approval tests good for

## Refactoring legacy code



## Make your test more agile
Unit tests always come with a maintenance burden. 
Once you change your code's API, you also have to change its tests. 
Not only does this demotivate software engineers, but it also slows down development.


Approval tests will only depend on the output of your code. 
They are not influenced by API changes. 
This is why they fit very well into agile software development. 

## Remote collaboration
Approval tests can make remote collaboration easier. 

One of the biggest hurdles for remote teams is communication. 
The more agile a team work, the higher need for communication between the teams will be. 
Every API change has to be coordinated between the teams. 

While it's possible to formulate requirements in the form of unit tests

Formulating requirements in the form of unit tests is often impractical.  
For many components, unit tests are too fine-grained.


Transforming requirements into unit tests can be hard. 
It is often easier to define which output a software component should give for a certain input. 

Approval tests 





# How to do approval tests in C++

- Dependencies:
  - CMake >= 3.14

- Approval tests for c++
    - More agile way of testing
    - Good for legacy code
    - Of course, good for refactoring
    - Good for remote work (Define outputs. Give work to remote team. Check if it fulfills output.)





{% highlight C++ %}
{% include includelines filename='submodules/approval_tests_example/src/main.cpp' start=0 count=240 %}
{% endhighlight %}


