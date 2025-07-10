import { Router } from "express";
import {
  uploadVideo,
  deleteVideo,
  updateTitleDescription,
  views,
  getVideoById,
  isToggledPublish
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { getVideoId } from "../middlewares/video.middleware.js";

const router = Router();
//uploadVideo Route
router.route("/uploadVideo").post(
  verifyJWT,
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  uploadVideo
);

//deleteVideo Route
router
  .route("/deleteVideo/:video_id")
  .delete(verifyJWT, getVideoId, deleteVideo);

//update videoTitle and description
router
  .route("/updateTitleDescription")
  .patch(verifyJWT, getVideoId, updateTitleDescription);

//get Video By Id
router.route("/getVideoById/::video_id").get(getVideoId, getVideoById);

//views
router.route("/views/:video_id").patch(getVideoId, views);

//isTogglePublish
router.route("/togglePublish/:video_id").patch(verifyJWT, getVideoId, isToggledPublish)

export default router;
