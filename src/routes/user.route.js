import {
  register,
  login,
  logout,
  refreshAccessToken,
  UpdatePassword,
  updateProfileDetails,
  changeAvatar,
  updateCoverImage,
  getUser,
  getUserChannel,
  getUserWatchHistory,
} from "../controllers/user.controller.js";
import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  register
);

router.route("/login").post(login);

//secret route
//logout user
router.route("/logout").post(verifyJWT, logout);
// refresh access token
router.route("/refresh").post(refreshAccessToken);
//update password
router.route("/changeCurrentPassword").patch(verifyJWT, UpdatePassword);
//update profile details
router.route("/updateProfileDetails").patch(verifyJWT, updateProfileDetails);
//change avatar
router
  .route("/changeAvatar")
  .patch(verifyJWT, upload.single("avatar"), changeAvatar);
//change coverImage
router
  .route("/changeCoverImage")
  .patch(verifyJWT, upload.single("coverImage"), updateCoverImage);
//get user
router.route("/getUser").get(verifyJWT, getUser);
//get user channel
router.route("/getUserChannel/:username").get(verifyJWT, getUserChannel);
//get user watch history
router.route("/getUserWatchHistory").get(verifyJWT, getUserWatchHistory);

export default router;
