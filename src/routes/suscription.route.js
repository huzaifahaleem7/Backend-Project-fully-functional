import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels
} from "../controllers/subscription.controller.js";

const router = Router();

// Toggle Subscription (Subscribe/Unsubscribe)
router.route("/toggleSubscription/:channelId").post(verifyJWT, toggleSubscription);

// Get Total Subscribers of a Channel
router.route("/channel-subscribers/:channelId").get(verifyJWT, getUserChannelSubscribers);

// Get Channels Subscribed by the Logged-In User
router.route("/my-subscriptions").get(verifyJWT, getSubscribedChannels);

export default router;
