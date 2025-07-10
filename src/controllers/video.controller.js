import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import uploadFileCloudinary from "../utils/cloudinary.js";
import { Video } from "../models/video.model.js";
import { deleteCloudinaryFile } from "../utils/deleteCloudinaryFile.js";

//upload Video
const uploadVideo = asyncHandler(async (req, res) => {
  //get all details from user
  // validation
  //upload thumbnail and video on multer
  //store all values in mongo db
  //res

  const { title, description, duration, isPublished } = req.body;
  if (!(title && description && duration)) {
    throw new ApiError(400, "All fields are necessary");
  }

  const thumbnailPath = req.files?.thumbnail?.[0]?.path;
  const videoFilePath = req.files?.video?.[0]?.path;

  if (!(thumbnailPath && videoFilePath)) {
    throw new ApiError(400, "Thumbnail and Video is required");
  }

  const thumbnail = await uploadFileCloudinary(thumbnailPath);
  const videoFile = await uploadFileCloudinary(videoFilePath);

  if (!(thumbnail && videoFile)) {
    throw new ApiError(500, "Video and Thumbnail uplaoding Failed");
  }

  const video = await Video.create({
    owner: req.user._id,
    video: {
      url: videoFile.url,
      public_id: videoFile.public_id,
    },
    thumbnail: {
      url: thumbnail.url,
      public_id: thumbnail.public_id,
    },
    title,
    description,
    duration,
    isPublished: isPublished !== undefined ? isPublished : true,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video Uploaded successfully"));
});

//delte video
const deleteVideo = asyncHandler(async (req, res) => {
    //user login
    //get Video
    //get Thumbnail
    //delte video
    //delte thumbnail
    //res
    const delVideoFromCloudinary = await deleteCloudinaryFile(req.video?.video?.public_id, "video")
    const delThumbnailFromCloudinary = await deleteCloudinaryFile(req.video?.thumbnail?.public_id)

    if (!(delVideoFromCloudinary && delThumbnailFromCloudinary)){
        throw new ApiError(500, "Thumbnail and Video not delted")
    }

    const delAlldescription = await Video.findByIdAndDelete(req.video._id)
    if (!delAlldescription){
        throw new ApiError(500, "Video not delete")
    }

    return res.status(200).json(new ApiResponse(200, {}, "Vidoe del successfully"))
});

export { uploadVideo, deleteVideo };
