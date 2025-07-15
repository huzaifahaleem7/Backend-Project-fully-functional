import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Playlist } from "../models/playlist.model.js";

//createPlaylist
const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description, videos } = req.body;
  if ([name, description].some((field) => !field || field.trim() === "")) {
    throw new ApiError(400, "All field Required");
  }
  if (videos && !Array.isArray(videos)) {
    throw new ApiError(400, "Videos must be an array of video ids");
  }

  const playlist = await Playlist.create({
    name,
    description,
    videos: videos || [],
    owner: req.user._id,
  });
  if (!playlist) {
    throw new ApiError(500, "Something went wrong");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, { playlist }, "Playlist created"));
});


export { createPlaylist, getUserPlaylists };
