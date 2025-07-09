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
import { vrifyJWT } from "../middlewares/auth.middleware.js";

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
router.route("/logout").post(vrifyJWT, logout);
// refresh access token
router.route("/refresh").post(refreshAccessToken);
//update password
router.route("/changeCurrentPassword").patch(vrifyJWT, UpdatePassword);
//update profile details
router.route("/updateProfileDetails").patch(vrifyJWT, updateProfileDetails);
//change avatar
router
  .route("/changeAvatar")
  .patch(vrifyJWT, upload.single("avatar"), changeAvatar);
//change coverImage
router
  .route("/changeCoverImage")
  .patch(vrifyJWT, upload.single("coverImage"), updateCoverImage);
//get user
router.route("/getUser").get(vrifyJWT, getUser);
//get user channel
router.route("/getUserChannel/:username").get(vrifyJWT, getUserChannel);
//get user watch history
router.route("/getUserWatchHistory").get(vrifyJWT, getUserWatchHistory);

export default router;
