import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Playlist } from "../models/playlist.model.js";
import mongoose from "mongoose";

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

//getUserPlaylists
const getUserPlaylists = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userPlaylist = await Playlist.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videoDetails",
      },
    },
    {
      $project: {
        name: 1,
        description: 1,
        videos: "$videoDetails",
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);
  if (!userPlaylist || userPlaylist.length === 0) {
    throw new ApiError(404, "No playlist found for this user");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, { userPlaylist }, "Fetch all user playlist"));
});

//getPlaylistById
const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!playlistId) {
    throw new ApiError(400, "Playlist Id Required");
  }
  const playlist = await Playlist.findById(playlistId).populate("videos");
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, { playlist }, "Playlist fetched successfully"));
});

//addVideoToPlaylist
const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!playlistId) {
    throw new ApiError(400, "Playlist id required");
  }
  const { videos } = req.body;
  if (!videos || !Array.isArray(videos) || videos.length === 0) {
    throw new ApiError(400, "Videos must be non-empty array of video id");
  }
  const playlist = await Playlist.findOne({
    _id: playlistId,
    owner: req.user._id,
  });

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }
  const existingVideos = playlist.videos.map((id) => id.toString());
  const newVideoIds = videos.filter((ids) => !existingVideos.includes(ids));
  if (newVideoIds.length === 0) {
    throw new ApiError(400, "All field are already in the playlist");
  }
  playlist.videos.push(...newVideoIds);
  await playlist.save();
  return res
    .status(200)
    .json(
      new ApiResponse(200, { playlist }, "All videos are added in playlisr")
    );
});

//removeVideoFromPlaylist
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!(playlistId && videoId)) {
    throw new ApiError(400, "All fields are required");
  }
  const removeVideo = await Playlist.findOneAndUpdate(
    {
      _id: playlistId,
      owner: req.user._id,
    },
    {
      $pull: {
        videos: videoId,
      },
    },
    {
      new: true,
    }
  );
  if (!removeVideo) {
    throw new ApiError(404, "Video Not Found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, { removeVideo }, "Video Remove from playlist"));
});

//deletePlaylist
const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!playlistId) {
    throw new ApiError(400, "Id required");
  }
  const del = await Playlist.findOneAndDelete({
    _id: playlistId,
    owner: req.user._id,
  });
  if (!del) {
    throw new ApiError(500, "Something went wrong");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Playlist deleted Successfully"));
});

//updatePlaylist
const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  if (
    [playlistId, name, description].some(
      (field) => !field || field.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }
  const updatePlaylist = await Playlist.findOneAndUpdate(
    {
      _id: playlistId,
      owner: req.user._id,
    },
    {
      $set: {
        name,
        description,
      },
    },
    {
      new: true,
    }
  );
  if (!updatePlaylist) {
    throw new ApiError(500, "Something went wrong");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, { updatePlaylist }, "Playlist update successfully")
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
