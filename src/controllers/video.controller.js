import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import uploadFileCloudinary from "../utils/cloudinary.js";
import { Video } from "../models/video.model.js";
import { deleteCloudinaryFile } from "../utils/deleteCloudinaryFile.js";

//get all publish Videos
const getAllPublishVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortId, userId } = req.query;

  const option = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { [sortBy]: sortId == "desc" ? -1 : 1 },
  };

  let filter = {};
  if (query) {
    filter.title = { $regex: query, $options: "i" };
  }

  if (userId) {
    filter.user = userId;
  }

  const result = await Video.paginate(filter, option);

  if (!result || result.docs.length === 0){
    throw new ApiError(404, "Video Not Found")
  }

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Videos fetcehd Successfully"));
});

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
  const delVideoFromCloudinary = await deleteCloudinaryFile(
    req.video?.video?.public_id,
    "video"
  );
  const delThumbnailFromCloudinary = await deleteCloudinaryFile(
    req.video?.thumbnail?.public_id
  );

  if (!(delVideoFromCloudinary && delThumbnailFromCloudinary)) {
    throw new ApiError(500, "Thumbnail and Video not delted");
  }

  const delAlldescription = await Video.findByIdAndDelete(req.video._id);
  if (!delAlldescription) {
    throw new ApiError(500, "Video not delete");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Vidoe del successfully"));
});

//update title description
const updateTitleDescription = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  if (!(title || description)) {
    throw new ApiError(400, "Title and description must");
  }
  const videoTitleDescription = await Video.findByIdAndUpdate(
    req.video._id,
    {
      $set: {
        title,
        description,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        videoTitleDescription,
        "Title and description update successfully"
      )
    );
});

//get video by id
const getVideoById = asyncHandler(async (req, res) => {
  const video = req.video;
  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video Fetched Through id"));
});

//getviews on video
const views = asyncHandler(async (req, res) => {
  const video = await Video.findByIdAndUpdate(
    req.video._id,
    {
      $inc: {
        views: 1,
      },
    },
    {
      new: true,
    }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, video.views, "Views Update Sucessfully"));
});

//isToggledPublishesStatus
const isToggledPublish = asyncHandler(async (req, res) => {
  // const video = req.video
  const isPublished = req.video?.isPublished;
  let video;
  if (isPublished === "true") {
    video = await Video.findByIdAndUpdate(
      req.video._id,
      {
        $set: {
          isPublished: false,
        },
      },
      {
        new: true,
      }
    );
  } else {
    video = await Video.findByIdAndUpdate(
      req.video._id,
      {
        $set: {
          isPublished: true,
        },
      },
      {
        new: true,
      }
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "IstoggledpublishSuccessfully"));
});

export {
  uploadVideo,
  deleteVideo,
  updateTitleDescription,
  views,
  getVideoById,
  isToggledPublish,
  getAllPublishVideos
};
