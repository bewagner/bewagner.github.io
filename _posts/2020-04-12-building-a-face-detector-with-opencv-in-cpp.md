---
layout:     post
title:      Building a face detector with OpenCV in C++ 
date:       2020-04-12 08:13:00
summary:    We detect faces in the camera image using a SSD face detection network and OpenCV 
categories: programming
---
## Introduction
Hi everyone! In this blog post, I want to explain how I built a face detection algorithm using some of the machine learning components built into [OpenCV](https://opencv.org/).
We will use OpenCV to read an image from a camera and detect faces in it. The result will look like this. 

![Face detection algorithm drawing rectangles around faces](/images/2020-04/detectingFaces.gif){:class="img-responsive"}
{: .center}

All code for this blog post can be found [on my github](https://github.com/bewagner/visuals/tree/blog-post-1).

## Installing OpenCV
We will use some rather new parts of OpenCV and its OpenCV_contrib module. The most convenient way to make sure you have access to these modules is by building OpenCV from source. I used OpenCV version 4.2.0 on Ubuntu 16.04. For your convenience, I included a bash script that takes care of installing the correct OpenCV version with all its dependencies in the [accompanying GitHub repo](https://github.com/bewagner/visuals/tree/blog-post-1). 

The `cv::dnn::Net` class we will be using was added to OpenCV in version 3.4.10, so earlier versions might also work. However, I did not test this.

## CMake setup
We will build our code with CMake. For this, we create a CMake project with a single executable and set the C++ standard to 14.
{% highlight CMake %}
{% include includelines filename='code/buildingAnEyeTrackerWithOpenCV/CMakeLists1.txt' start=1 count=6 %}
{% endhighlight %}

Then we take care of the OpenCV dependency. We find the `OpenCV` package and link our executable against it.  
{% highlight CMake %}
{% include includelines filename='code/buildingAnEyeTrackerWithOpenCV/CMakeLists1.txt' start=8 count=10 %}
{% endhighlight %}

The whole `CMakeLists.txt` file should look like this.
{% highlight CMake %}
{% include code/buildingAnEyeTrackerWithOpenCV/CMakeLists1.txt %}
{% endhighlight %}

## Getting an image from the camera
The first thing we have to do is getting a camera image to work with. Luckily, the `cv::videocapture` class makes this relatively easy.

We include the OpenCV header to have access to OpenCV's functionality. Next, we create a `cv::videocapture` object and try to open the first camera we can find.
{% highlight C++ %}
{% include includelines filename='code/buildingAnEyeTrackerWithOpenCV/gettingAnImageFromTheCamera.cpp' start=1 count=8 %}
{% endhighlight %}

Afterwards, we create a `cv::Mat` to hold the frame and display it in an infinite loop. If the user presses 'Esc' we break the loop, destroy the display window and release the video capture. 
{% highlight C++ %}
{% include includelines filename='code/buildingAnEyeTrackerWithOpenCV/gettingAnImageFromTheCamera.cpp' start=10 count=24 %}
{% endhighlight %}

So far the `main.cpp` file will look like the following.
{% highlight C++ %}
{% include code/buildingAnEyeTrackerWithOpenCV/gettingAnImageFromTheCamera.cpp %}
{% endhighlight %}

We can now display images captured from the camera :-)

![Captured camera image](/images/2020-04/gettingAnImageFromTheCameraCut.gif){:class="img-responsive"}
{: .center}

## Using the `cv:dnn::Net` class to load a pretrained SSD face detection network 

Now we'll start building a face detector. We use the `cv::dnn::Net` class and load weights from a pretrained caffe model. 

Since it's nice to have all functionality in one place, we create a class `FaceDetector` for the model. So first, we create two new files `src/FaceDetector.cpp` and `include/FaceDetector.h`. To make sure our code still builds, we add the implementation file to our CMake target. That is, go to your `CMakeLists.txt` and change the line containing `add_executable(...)` to look like this
{% highlight CMake %}
add_executable(${PROJECT_NAME} src/main.cpp src/FaceDetector.cpp)
{% endhighlight %}


In `include/FaceDetector.h` we define this class. The model has a constructor in which we will load the model weights. Additionally it has a method 
{% highlight C++ %}
std::vector<cv::Rect> detect_face_rectangles(const cv::Mat &frame)
{% endhighlight %}
that takes an input image and gives us a vector of detected faces. 

{% highlight C++ %}
{% include includelines filename='code/buildingAnEyeTrackerWithOpenCV/FaceDetector.h' start=1 count=12 %}
{% endhighlight %}

The actual network will be saved in a private member variable. In addition to the model, we will also save
- `input_image_width/height_` dimensions of the input image
- `scale_factor_` scaling factor when converting the image to a data blob
- `mean_values_` the mean values for each channel the network was trained with. These values will be subtracted from the image when transforming the image to a data blob.
- `confidence_threshold_` the confidence threshold to use when detecting faces. The model will supply a confidence value for each detected face. Faces with a confidence value >= `confidence_threshold_` will be kept. All other faces will be discarded.

{% highlight C++ %}
{% include includelines filename='code/buildingAnEyeTrackerWithOpenCV/FaceDetector.h' start=14 count=99 %}
{% endhighlight %}

The full header file can be found [here](https://github.com/bewagner/visuals/blob/blog-post-1/include/FaceDetector.h).

Next, let's get to work with implementing the functions we defined above. We start with the constructor. For most of the member variables we just put in the correct values.

{% highlight C++ %}
{% include includelines filename='code/buildingAnEyeTrackerWithOpenCV/FaceDetector.cpp' start=1 count=12 %}
{% endhighlight %}

Inside of the constructor we will use `cv::dnn::readNetFromCaffe` to load the model into our `network_` variable. `cv::dnn::readNetFromCaffe` takes two files to construct the model: The first [(deploy.prototxt)](https://github.com/bewagner/visuals/blob/blog-post-1/assets/deploy.prototxt) is the model configuration which describes the model archtecture. The second [(res10_300x300_ssd_iter_140000_fp16.caffemodel)](https://github.com/bewagner/visuals/blob/blog-post-1/assets/res10_300x300_ssd_iter_140000_fp16.caffemodel) is the binary data for the model weights.

Depending on how we build our code, we could just move these files to the directory that contains our binary after building. But since this solution is rather fragile and breaks when the binary moves, we will pass in their location via CMake. 

### A quick jump back to our CMake configuration

A nice way to pass a file path to C++ I found in [this StackOverflow post](https://stackoverflow.com/questions/22259279/passing-a-cmake-variable-to-c-source-code), is to pass it as a `compile_definition` to the target. This way CMake can figure out the correct path of the file and pass it into a variable, which in turn will be usable in C++.

That is, we add the following lines to our CMakeLists.txt.
{% highlight CMake %}
{% include includelines filename='code/buildingAnEyeTrackerWithOpenCV/CMakeListswithFaceDetectorFiles.txt' start=12 count=17 %}
{% endhighlight %}

### Finishing the methods in `FaceDetector.cpp`

Now that we found a way to access the locations of the model configuration and weights file, we can construct the model.
{% highlight C++ %}
{% include includelines filename='code/buildingAnEyeTrackerWithOpenCV/FaceDetector.cpp' start=7 count=18 %}
{% endhighlight %}

The next step is to implement `detect_face_rectangles`. We start by transforming the input image into a data blob.
The function [`cv::dnn::blobFromImage`](https://www.pyimagesearch.com/2017/11/06/deep-learning-opencvs-blobfromimage-works/) takes care of rescaling the image to the correct input size for the network. It also subtracts the mean value in each color channel.
{% highlight C++ %}
{% include includelines filename='code/buildingAnEyeTrackerWithOpenCV/FaceDetector.cpp' start=27 count=7 %}
{% endhighlight %}
 
Following, we can forward our data through the network. We save the result in the variable `detection_matrix`.
{% highlight C++ %}
{% include includelines filename='code/buildingAnEyeTrackerWithOpenCV/FaceDetector.cpp' start=34 count=6 %}
{% endhighlight %}

We iterate through the rows of the matrix---as each row contains one detection---and check if the confidence value exceeds our threshold. If so, we construct a `cv::Rect` and save it in the result vector `faces`.
{% highlight C++ %}
{% include includelines filename='code/buildingAnEyeTrackerWithOpenCV/FaceDetector.cpp' start=41 count=29 %}
{% endhighlight %}

That concludes our implementation of `FaceDetector`.
Click [this](https://github.com/bewagner/visuals/blob/blog-post-1/src/FaceDetector.cpp) link for the full .cpp file.

### Visualizing detected faces

Since we implemented the face detector as an individual class, visualizing the detected rectangles is rather easy. We include the `FaceDetector.h` header file, create a `FaceDetector` object and call the `detect_face_rectangles` method. Then we use OpenCV's `rectangle` method to draw a rectangle over the detected faces.
{% highlight C++ %}
{% include includelines filename='code/buildingAnEyeTrackerWithOpenCV/mainFaceDetector.cpp' start=1 count=34 %}
{% endhighlight %}

If we run this, we see a rectangle around Beethoven's face!

![Face detection algorithm in action](/images/2020-04/detectingFaces.gif){:class="img-responsive"}
{: .center}

## Wrap-up
This concludes our post about face detection in OpenCV. We saw how we can grab the camera image and find faces in it using a pretrained SSD network in OpenCV.

In the next post, we will find out how we can extract face key points from the found faces. 
Furthermore, we will learn how we can use OpenCV to track detected points in an image to make the whole pipeline run even faster. See you soon!


