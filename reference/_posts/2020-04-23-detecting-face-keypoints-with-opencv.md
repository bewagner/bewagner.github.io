---
layout:     post
title:      Using OpenCV to detect face key points with C++ 
date:       2020-04-23 08:13:00
summary:    After detecting faces in an image in the last post, we will now use one of OpenCV's built-in models to extract face key points.
categories: programming
---

This post is a follow-up on my [first post](https://bewagner.site/programming/2020/04/12/building-a-face-detector-with-opencv-in-cpp/) about building a face detector with OpenCV in C++. In this post we will build on the existing code and detect face key points. The result will look like this.

![Detected face keypoints](/images/2020-04/face_keypoints.png){:class="img-responsive"}
{: .center}

Since we will work with a relatively new version of OpenCV (4.2.0), you might want to go back to the [previous post](https://bewagner.site/programming/2020/04/12/building-a-face-detector-with-opencv-in-cpp/) to read more on how to install the necessary packages.

The [code](https://github.com/bewagner/visuals/tree/blog-post-2) is on my github. 

Let's get going!

## Detecting face key points
After detecting faces in the last post, we now want to detect face key points. We use the [`cv::face::FacemarkLBF`](https://docs.opencv.org/3.4/dc/d63/classcv_1_1face_1_1FacemarkLBF.html) model to find key points in the face rectangles we identified in the last tutorial. 

### Adding the key point detection model file 

As for the face detection model, we have to add a [model file](https://github.com/bewagner/visuals/blob/blog-post-2/assets/lbfmodel.yaml) for the LBF model. I put the model file in the `assets` folder of [this posts git repo](https://github.com/bewagner/visuals/tree/blog-post-2), so you can go there and download it. 

For passing the location of this model file to our code, we will use the same CMake `target_compile_definitions` trick we used in the first post. So make sure you have the model file in the right place and add the following lines to your `CMakeLists.txt`.
{% highlight CMake %}
# Introduce preprocessor variables to keep paths of asset files
...
set(KEY_POINT_DETECTION_MODEL
    "${PROJECT_SOURCE_DIR}/assets/lbfmodel.yaml")
...
target_compile_definitions(${PROJECT_NAME}
    PRIVATE KEY_POINT_DETECTION_MODEL="${KEY_POINT_DETECTION_MODEL}")
{% endhighlight %}

### A class for the key point detector

We start by adding a class for the key point detector.
This way we have the code for initializing and calling the model in one place. 

#### `KeyPointDetector.h`

In the `include` folder, we create a file `KeyPointDetector.h`.
This will be the header file for the key point detector. 

The `KeyPointDetector` will have two public methods.
The first is a constructor. 
We will use the constructor to initialize the underlying LBF model. 

The second method `detect_key_points` detects face key points within a given rectangle in an image. 
As the key points for each face are of type `std::vector<cv::Point2f>`, this function will return a vector of `std::vector<cv::Point2f>`.

The header file for the key point detector will look like this.

{% highlight C++ %}
{% include includelines filename='code/2020/04/faceKeypoints/include/KeyPointDetector.h' start=1 count=45 %}
{% endhighlight %}

#### `KeyPointDetector.cpp`

Next, we implement those methods in `src/KeyPointDetector.cpp`.

First, let's look at the constructor. 
We create a new `cv::face::FacemarkLBF` model.
Then we load the model configuration from the `KEY_POINT_DETECTION_MODEL` variable we passed in via CMake.
{% highlight C++ %}
{% include includelines filename='code/2020/04/faceKeypoints/src/KeyPointDetector.cpp' start=4 count=4 %}
{% endhighlight %}

Following, we implement `detect_key_points`. 

To adhere to the API of `cv::face::Facemark::fit()`, we transform our input to a `cv::InputArray`. 
Then we call the models `fit` function and return the detected points.
{% highlight C++ %}
{% include includelines filename='code/2020/04/faceKeypoints/src/KeyPointDetector.cpp' start=9 count=15 %}
{% endhighlight %}


### Using the key point detector 
Now we jump to our `main.cpp` to use the key point detector we defined.
We use the face detector from the [previous post](https://bewagner.site/programming/2020/04/12/building-a-face-detector-with-opencv-in-cpp/).
Then we feed the detected rectangles to our key point detector.
{% highlight C++ %}
{% include includelines filename='code/2020/04/faceKeypoints/src/main.cpp' start=1 count=23 %}
{% endhighlight %}

Instead of displaying the rectangles, we display the detected points.
{% highlight C++ %}
{% include includelines filename='code/2020/04/faceKeypoints/src/main.cpp' start=24 count=50 %}
{% endhighlight %}

You should see a result similar to the image below. 

![Detected face keypoints](/images/2020-04/face_keypoints.png){:class="img-responsive"}
{: .center}

### Conclusion

In this post we used a face detection model to find faces in an image.
Then we found key points in those images using OpenCV.

I hope this helps you to build interesting stuff!
Here is a link to the [code](https://github.com/bewagner/visuals/tree/blog-post-2). 
Let me know if you run into any errors! 

Follow me on twitter [(@bewagner_)](https://twitter.com/bewagner_) for more content on C++ and machine learning!


