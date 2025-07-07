import { register, login, logout, refreshAccessToken } from "../controllers/user.controller.js";
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

router.route("/login").post(login)


//secret route
//logout user
router.route("/logout").post(vrifyJWT, logout)
// refresh access token
router.route("/refresh").post(refreshAccessToken);

export default router;
