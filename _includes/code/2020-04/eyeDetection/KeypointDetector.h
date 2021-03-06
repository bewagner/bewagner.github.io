#ifndef VISUALS_KEYPOINTDETECTOR_H
#define VISUALS_KEYPOINTDETECTOR_H

#include <opencv4/opencv2/face.hpp>
#include "FaceKeypoints.h"


class KeypointDetector {
public:
    explicit KeypointDetector();

    std::vector<FaceKeypoints>
    detect_keypoints(const std::vector<cv::Rect> &face_rectangles, const cv::Mat &image) const;

private:
    cv::Ptr<cv::face::Facemark> facemark_;

};


#endif //VISUALS_KEYPOINTDETECTOR_H
