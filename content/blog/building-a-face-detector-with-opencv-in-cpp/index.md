+++
date = "2020-04-12"
title = "Building a Face Detector with OpenCV in C++"
description = "How to detect faces in an image with OpenCV"
[taxonomies]
tags = ["opencv", "cpp"]
[extra]
image = "detectingFaces.gif"
+++

Hi everyone! In this blog post, I explain how to build a face detection algorithm with the machine learning components in [OpenCV](https://opencv.org/).
We will use OpenCV to read an image from a camera and detect faces in it.


You can find all code for this blog post [on GitHub](https://github.com/bewagner/visuals/tree/blog-post-1).

## Installing OpenCV

We use parts of OpenCV and the OpenCV_contrib module.
The most convenient way to make sure you have access to these modules is building OpenCV from source.
I used OpenCV version 4.2.0 on Ubuntu 16.04.
For convenience, I included a bash script that installs the correct OpenCV version and all necessary dependencies in the [accompanying repository](https://github.com/bewagner/visuals/tree/blog-post-1).

The `cv::dnn::Net` class we use was added to OpenCV in version 3.4.10, so earlier versions might also work, but I did not test this.

## CMake setup

We build the code with CMake.
Create a CMake project with a single executable and set the C++ standard to 14.
Then find the `OpenCV` package and link the executable against it.

The full CMake setup is available in the repository:
- [Initial CMakeLists.txt](https://github.com/bewagner/visuals/blob/blog-post-1/CMakeLists.txt)
- [CMake version with FaceDetector files](https://github.com/bewagner/visuals/blob/blog-post-1/CMakeLists.txt)

## Getting an image from the camera

The first thing we need is a camera image.
Luckily, the `cv::VideoCapture` class makes this straightforward.

The flow is:
- create and open a `cv::VideoCapture` for the first camera
- grab frames into a `cv::Mat`
- display frames in a loop
- exit on `Esc`, then close window and release capture

See the full implementation here:
- [gettingAnImageFromTheCamera.cpp](https://github.com/bewagner/visuals/blob/blog-post-1/src/main.cpp)

We can now display images captured from the camera.

{{ image(src="gettingAnImageFromTheCameraCut.gif", alt="Captured camera image", relative_width=50) }}

## Using `cv::dnn::Net` to load a pre-trained SSD face detection network

Now we start building the face detector.
We use `cv::dnn::Net` and load weights from a pre-trained Caffe model.

To keep functionality in one place, we create a `FaceDetector` class with:

```cpp
std::vector<cv::Rect> detect_face_rectangles(const cv::Mat& frame)
```

This method takes an input image and returns detected face rectangles.

Header and implementation:
- [FaceDetector.h](https://github.com/bewagner/visuals/blob/blog-post-1/include/FaceDetector.h)
- [FaceDetector.cpp](https://github.com/bewagner/visuals/blob/blog-post-1/src/FaceDetector.cpp)

### Model files

Inside the constructor we use `cv::dnn::readNetFromCaffe`.
It needs two files:
- [deploy.prototxt](https://github.com/bewagner/visuals/blob/blog-post-1/assets/deploy.prototxt)
- [res10_300x300_ssd_iter_140000_fp16.caffemodel](https://github.com/bewagner/visuals/blob/blog-post-1/assets/res10_300x300_ssd_iter_140000_fp16.caffemodel)

A practical way to pass these file paths from CMake to C++ is through compile definitions.
I originally found this approach in [this StackOverflow answer](https://stackoverflow.com/questions/22259279/passing-a-cmake-variable-to-c-source-code).

### Detection pipeline

The detection pipeline in `detect_face_rectangles` is:
- convert frame to blob with `cv::dnn::blobFromImage`
- set blob as network input
- run forward pass
- iterate detections
- keep detections above confidence threshold
- convert box coordinates to `cv::Rect`

For a good explanation of `blobFromImage`, see [this article](https://www.pyimagesearch.com/2017/11/06/deep-learning-opencvs-blobfromimage-works/).

## Visualizing detected faces

Because the detector is implemented as a class, visualization is simple:
- create `FaceDetector`
- call `detect_face_rectangles`
- draw each rectangle using OpenCV's `rectangle` function

See the complete example:
- [mainFaceDetector.cpp](https://github.com/bewagner/visuals/blob/blog-post-1/src/main.cpp)

If we run this, we get a rectangle around Beethoven's face.

{{ image(src="detectingFaces.gif", alt="Face detection algorithm in action", relative_width=50) }}

## Wrap-up

This concludes the post about face detection in OpenCV.
We saw how to grab a camera image and detect faces with a pre-trained SSD network.