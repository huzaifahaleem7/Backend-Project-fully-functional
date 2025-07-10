import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { Video } from "../models/video.model.js";

export const getVideoId = asyncHandler( async(req, _, next) => {
    const {video_id} = req.params
    if (!video_id){
        throw new ApiError(400, "Video ID is required")
    }
    const video = await Video.findById(video_id)
    if (!video){
        throw new ApiError(400, "Video not found")
    }
    req.video = video
    next()
})