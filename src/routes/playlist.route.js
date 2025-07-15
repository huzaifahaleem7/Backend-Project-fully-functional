import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist
} from "../controllers/playlist.controller.js";

const router = Router();

// Create a new playlist
router.route("/create").post(verifyJWT, createPlaylist);

// Get all playlists of logged-in user
router.route("/").get(verifyJWT, getUserPlaylists);

// Get a single playlist by ID
router.route("/:playlistId").get(verifyJWT, getPlaylistById);

// Add video(s) to a playlist
router.route("/addVideos/:playlistId").post(verifyJWT, addVideoToPlaylist);

// Remove a specific video from a playlist
router.route("/removeVideo/:playlistId/:videoId").delete(verifyJWT, removeVideoFromPlaylist);

// Delete a playlist
router.route("/delete/:playlistId").delete(verifyJWT, deletePlaylist);

// Update playlist name/description
router.route("/update/:playlistId").patch(verifyJWT, updatePlaylist);

export default router;
