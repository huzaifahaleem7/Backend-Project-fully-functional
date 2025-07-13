import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Like } from "../models/like.model.js";

//toggled Video like
const toggleVideoLike = asyncHandler(async (req, res) => {
  const { likeVideo = "false" } = req.body;

  const filter = { likedBy: req.user._id, video: req.video._id };
  let result;

  if (likeVideo === "false") {
    // Check if already liked
    const alreadyLiked = await Like.findOne(filter);
    if (!alreadyLiked) {
      const newLike = await Like.create(filter);
      result = { liked: true, like: newLike };
    } else {
      result = { liked: true, message: "Already liked" }; // Avoid double like
    }
  } else if (likeVideo === "true") {
    // Unlike
    const deleteResult = await Like.deleteOne(filter);
    result = { liked: false, deleted: deleteResult.deletedCount > 0 };
  }

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Video like toggled successfully"));
});

//toggle comment like
const toggleCommentLike = asyncHandler(async (req, res) => {
  const { likeComment = "false" } = req.body;
  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError(400, "Id required");
  }
  let result;

  const filter = { likedBy: req.user._id, comment: commentId };
  if (likeComment === "false") {
    const alreadyLike = await Like.findOne(filter);
    if (!alreadyLike) {
      const newLike = await Like.create(filter);
      result = { liked: true, like: newLike };
    } else {
      result = { liked: true, message: "Already liked" }; // Avoid double like
    }
  } else if (likeComment === "true") {
    // Unlike
    const deleteResult = await Like.deleteOne(filter);
    result = { liked: false, deleted: deleteResult.deletedCount > 0 };
  }
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Comment like toggled successfully"));
});

//toggled tweet like
const toggleTweetLike = asyncHandler(async (req, res) => {
  const { likeTweet = "false" } = req.body;
  const { likeId } = req.params;
  if (!likeId) {
    throw new ApiError(400, "Id required");
  }
  let result;

  const filter = { likedBy: req.user._id, tweet: likeId };
  if (likeTweet === "false") {
    const alreadyLike = await Like.findOne(filter);
    if (!alreadyLike) {
      const newLike = await Like.create(filter);
      result = { liked: true, like: newLike };
    } else {
      result = { liked: true, message: "Already liked" }; // Avoid double like
    }
  } else if (likeTweet === "true") {
    // Unlike
    const deleteResult = await Like.deleteOne(filter);
    result = { liked: false, deleted: deleteResult.deletedCount > 0 };
  }
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Comment like toggled successfully"));
});


export { toggleVideoLike, toggleCommentLike, toggleTweetLike };
