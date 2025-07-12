import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Router } from "express";
import {
  addComment,
  updateComment,
  deleteComment,
  getVideoComments
} from "../controllers/comment.controller.js";
import { getVideoId } from "../middlewares/video.middleware";

const router = Router();
//addComment
router.route("/addComment").post(verifyJWT, getVideoId, addComment);

//updateComment
router.route("/updateComment/:commentId").patch(verifyJWT, updateComment);

//deleteComment
router.route("/deleteComment/:commentId").delete(verifyJWT, deleteComment);

//getAllVideoComment
router.route("/comments/:video_id").get(verifyJWT, getVideoId, getVideoComments);


export default router;
