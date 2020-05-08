---
layout:     post
title:      Using OpenCV to detect face keypoints with C++ 
date:       2020-04-13 08:13:00
summary:    After detecting faces in an image in the last post, we will now use one of OpenCV's built-in models to extract face keypoints.
categories: programming
---

This post is a follow-up on my [first post](https://bewagner.github.io/programming/2020/04/12/building-a-face-detector-with-opencv-in-cpp/) about building a face detector with OpenCV in C++. In this post we will build on the existing code and detect face keypoints. The result will look like this.

TODO Add result gif

Since we will work with a relatively new version of OpenCV (4.2.0), you might want to go back to the [previous post](https://bewagner.github.io/programming/2020/04/12/building-a-face-detector-with-opencv-in-cpp/) to read more on how to install the necessary packages.

Let's get going!

## Detecting face keypoints
After detecting faces in the last post, we now want to detect face keypoints. We use the [`cv::face::FacemarkLBF`](https://docs.opencv.org/3.4/dc/d63/classcv_1_1face_1_1FacemarkLBF.html) model to find keypoints in the face rectangles we identified in the last tutorial. 

### Adding the keypoint detection model file 

As for the face detection model, we have to add a [model file](https://github.com/bewagner/visuals/blob/blog-post-2/assets/lbfmodel.yaml) for the LBF model. I put the model file in the `assets` folder of [this blogs git repo](https://github.com/bewagner/visuals/tree/blog-post-2), so you can go there and download it. 

For passing the location of this model file to our code, we will use the same CMake `target_compile_definitions` trick we used in the first post. So make sure you have the model file in the right place and add the following lines to your `CMakeLists.txt`.
{% highlight CMake %}
# Introduce preprocessor variables to keep paths of asset files
...
set(KEYPOINT_DETECTION_MODEL
    "${PROJECT_SOURCE_DIR}/assets/lbfmodel.yaml")
...
target_compile_definitions(${PROJECT_NAME}
    PRIVATE KEYPOINT_DETECTION_MODEL="${KEYPOINT_DETECTION_MODEL}")
{% endhighlight %}

### A class for the keypoint detector


### (?) Adding a keypoint class

## It's too slow. What now?
