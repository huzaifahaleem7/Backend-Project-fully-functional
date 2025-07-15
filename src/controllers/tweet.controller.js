import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Tweet } from "../models/tweet.model.js";

//createTweet
const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (content.trim() === "") {
    throw new ApiError(400, "Content required");
  }
  const tweet = await Tweet.create({
    content,
    owner: req.user._id,
  });
  if (!tweet) {
    throw new ApiError(500, "Server Error");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, tweet, "Tweet created Successfully"));
});

//updateTweet
const updateTweet = asyncHandler(async (req, res) => {
  const { prevTweet } = req.params;
  if (!prevTweet) {
    throw new ApiError(400, "Id required");
  }
  const { content } = req.body;
  if (content.trim() === "") {
    throw new ApiError(400, "Content Required");
  }
  const updateTweet = await Tweet.findByIdAndUpdate(
    prevTweet,
    {
      $set: {
        content,
      },
    },
    {
      new: true,
    }
  );
  if (!updateTweet) {
    throw new ApiError(500, "Something went wrong");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, updateTweet, "Tweet update Successfully"));
});

//deleteTweet
const deleteTweet = asyncHandler(async(req, res) => {
  const {tweetId} = req.params
  if (!tweetId){
    throw new ApiError(400, "Id required to delete Tweet")
  }
  const tweet = await Tweet.findById(tweetId)
  if (!tweet){
    throw new ApiError(404, "Tweet Not Found")
  }
  if (tweet.owner.toString() !== req.user._id.toString()){
    throw new ApiError(403, "Only owner delete the tweet")
  }
  const deleteTweet = await tweet.deleteOne()
  if (!deleteTweet){
    throw new ApiError(500, "Something went wrong")
  }
  return res.status(200).json(new ApiResponse(200, {}, "Tweet delete Successfully"))
})

export { createTweet, updateTweet, deleteTweet };
