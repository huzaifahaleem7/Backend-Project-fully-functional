import { Router } from "express";
import {
  createTweet,
  updateTweet,
  deleteTweet,
} from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Create a tweet
router.route("/create").post(verifyJWT, createTweet);

// Update a tweet
router.route("/update/:tweetId").patch(verifyJWT, updateTweet);

// Delete a tweet
router.route("/delete/:tweetId").delete(verifyJWT, deleteTweet);

export default router;
