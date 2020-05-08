---
layout:     post
title:      Cinder visualization series
date:       2020-04-10 08:13:00
summary:    How I build an interactive particle visualization with OpenCV and Cinder in C++
categories: programming
---
Hello! In the following series of blog posts, I would like to explain to you how I used [Cinder](https://libcinder.org/) and [OpenCV](https://opencv.org/) to build an interactive particle visualization in C++. 

I started playing around with Cinder about a month ago after seeing [this](https://www.youtube.com/watch?v=ndUtK5IZslc) talk by Andrew Bell. I really liked how it builds an easy to work with abstraction over OpenGL. Therefore I decided to build something with it. While looking at the samples that come with Cinder, I found a very nice particle visualization and decided to make it interactive.

In the following weeks I built an eye tracker in C++ and connected it to the visualization such that one can attract particles with his eyes. The result can be seen below.
<p align="center">
   <img src="/images/2020-04/particles.gif" width="80%" />
</p>

From there on, I will write a series of blog posts to describe the individual parts that make up the visualization. 

### Blog posts

1. [Building a face detector with OpenCV](https://bewagner.github.io/programming/2020/04/12/building-a-face-detector-with-opencv-in-cpp/) 
2. Detection and tracking of face keypoints (Coming soon ...)
