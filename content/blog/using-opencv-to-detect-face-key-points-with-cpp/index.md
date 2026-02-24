+++
date = "2020-04-23"
title = "Using OpenCV to Detect Face Key Points with C++"
description = "After detecting faces in an image in the last post, we now use one of OpenCV's built-in models to extract face key points."
[taxonomies]
tags = ["opencv", "cpp"]
[extra]
image = "face_keypoints.png"
+++

This post follows up on [Building a Face Detector with OpenCV in C++](/blog/building-a-face-detector-with-opencv-in-cpp/).
In this post we build on that code and detect face key points.


Since we work with a relatively new OpenCV version (4.2.0), you may want to revisit the first post for installation details.

The code is available on GitHub: [blog-post-2 branch](https://github.com/bewagner/visuals/tree/blog-post-2).

## Detecting face key points

After detecting faces, we now want to detect key points.
We use [`cv::face::FacemarkLBF`](https://docs.opencv.org/3.4/dc/d63/classcv_1_1face_1_1FacemarkLBF.html) to find key points inside face rectangles.

### Adding the key point detection model file

As with face detection, we need a model file for key points:
- [lbfmodel.yaml](https://github.com/bewagner/visuals/blob/blog-post-2/assets/lbfmodel.yaml)

To pass the model file location into C++, use the same CMake `target_compile_definitions` approach from the previous post.

```cmake
# Introduce preprocessor variables to keep paths of asset files
...
set(KEY_POINT_DETECTION_MODEL
    "${PROJECT_SOURCE_DIR}/assets/lbfmodel.yaml")
...
target_compile_definitions(${PROJECT_NAME}
    PRIVATE KEY_POINT_DETECTION_MODEL="${KEY_POINT_DETECTION_MODEL}")
```

### A class for the key point detector

To keep model initialization and inference in one place, create a `KeyPointDetector` class.

#### `KeyPointDetector.h`

Create `include/KeyPointDetector.h`.
It contains:
- a constructor for loading the model
- `detect_key_points` for extracting key points from image regions

The return type is a vector of point vectors (`std::vector<std::vector<cv::Point2f>>`).

Reference file:
- [KeyPointDetector.h](https://github.com/bewagner/visuals/blob/blog-post-2/include/KeyPointDetector.h)

#### `KeyPointDetector.cpp`

Implement the class in `src/KeyPointDetector.cpp`.

In the constructor:
- create `cv::face::FacemarkLBF`
- load the model from `KEY_POINT_DETECTION_MODEL`

In `detect_key_points`:
- transform input to `cv::InputArray` as required by the API
- call `fit()`
- return detected points

Reference file:
- [KeyPointDetector.cpp](https://github.com/bewagner/visuals/blob/blog-post-2/src/KeyPointDetector.cpp)

### Using the key point detector

In `main.cpp`:
- run the face detector from the previous post
- pass detected rectangles to `KeyPointDetector`
- draw detected points instead of face rectangles

Reference file:
- [main.cpp](https://github.com/bewagner/visuals/blob/blog-post-2/src/main.cpp)

You should see a result similar to this:

{{ image(src="face_keypoints.png", alt="Detected face keypoints", relative_width=50) }}

## Conclusion

In this post we used a face detection model to find faces in an image,
then extracted face key points using OpenCV.

I hope this helps you build interesting projects.
If you run into errors, feel free to reach out.