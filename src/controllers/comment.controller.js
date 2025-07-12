import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from "../models/comment.model.js";
// import { getVideoId } from "../middlewares/video.middleware.js";

//add Comments
const addComment = asyncHandler(async (req, res) => {
  const { commentDescription } = req.body;
  if (!commentDescription) {
    throw new ApiError(400, "Empty Field");
  }

  const comment = await Comment.create({
    content: commentDescription,
    video: req.video._id,
    owner: req.user._id,
  });

  if (!comment) {
    throw new ApiError(500, "Something went wrong");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment upload Successfully"));
});

//updateComment
const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError(400, "Comment Id is required");
  }
  const { updateComment } = req.body;
  if (!updateComment) {
    throw new ApiError(200, "Update Comment required");
  }
  const comment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content: updateComment,
      },
    },
    {
      new: true,
    }
  );
  if (!comment) {
    throw new ApiError(400, "Comment not exist");
  }

  return res
    .status(200)
    .json(new ApiResponse(400, comment, "Comment Update Successfully"));
});

//deleteComment
const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError(400, "CommentId Required");
  }
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment Not Found");
  }

  if (comment.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized Access");
  }

  await comment.deleteOne();
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment Delete Sucessfully"));
});

//getVideoComments
const getVideoComments = asyncHandler(async(req, res) => {
    const {page = 1, limit = 10} = req.query
    const option = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { createdAt: -1}
    }
    const filter = {video: req.video._id}
    const result = await Comment.paginate(filter, option)
    if (!result || result.docs.length === 0){
        throw new ApiError(404, "No comment Found")
    }

    return res.status(200).json(200, result, "Comment Fetched Successfully")
})

export { addComment, updateComment, deleteComment, getVideoComments };
