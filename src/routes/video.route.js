import { Router } from "express";
import { uploadVideo, deleteVideo } from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { getVideoId } from "../middlewares/video.middleware.js";

const router = Router()
//uploadVideo Route
router.route("/uploadVideo").post(verifyJWT, upload.fields([
    {name: "video", maxCount: 1},
    {name: "thumbnail", maxCount: 1}
]), uploadVideo)

//deleteVideo Route
router.route("/deleteVideo/:video_id").delete(verifyJWT, getVideoId, deleteVideo )


export default router