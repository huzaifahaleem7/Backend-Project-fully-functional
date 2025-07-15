import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Subscription } from "../models/subscription.model.js";

//toggleSubscription
const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!channelId) {
    throw new ApiError(400, "Channel Id Required");
  }
  const subscriberId = req.user._id;
  if (channelId.toString() === subscriberId.toString()) {
    throw new ApiError(400, "User not subscribe there own channel");
  }

  const existing = await Subscription.findOne({
    subscriber: subscriberId,
    channel: channelId,
  });
  if (existing) {
    const deleteSub = await existing.deleteOne();
    if (!deleteSub) {
      throw new ApiError(500, "Something went wrong");
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, { subscribed: false }, "Unsubscribe successfully")
      );
  }

  const sub = await Subscription.create({
    subscriber: subscriberId,
    channel: channelId,
  });
  if (!sub) {
    throw new ApiError(500, "Something went wrong");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, { subscribed: true }, "Subscribe successfully"));
});

//getUserChannelSubscribers
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!channelId) {
    throw new ApiError(400, "Channel Id required");
  }

  const totalSubscribers = await Subscription.countDocuments({
    channel: channelId,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { totalSubscribers },
        "Total subscribers fetch successfully"
      )
    );
});

//getSubscribedChannels
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const subscriberId = req.user._id;
  const subscription = await Subscription.find({
    subscriber: subscriberId,
  }).populate("channel");
  return res.status(200).json(
    new ApiResponse(200, {
      totalSubscribedChannels: subscription.length,
      channels: subscription.map((sub) => sub.channel),
    })
  );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
