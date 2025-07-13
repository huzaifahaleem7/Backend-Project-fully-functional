import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getVideoId } from "../middlewares/video.middleware.js";
import {
  toggleVideoLike,
  toggleCommentLike,
  toggleTweetLike
} from "../controllers/like.controller.js";

const router = Router();

// Toggle Video Like
router.route("/toggleVideoLike/:video_id").post(verifyJWT, getVideoId, toggleVideoLike);

// Toggle Comment Like
router.route("/toggleCommentLike/:commentId").post(verifyJWT, toggleCommentLike);

// Toggle Tweet Like
router.route("/toggleTweetLike/:likeId").post(verifyJWT, toggleTweetLike);

export default router;
