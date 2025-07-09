import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import uploadFileCloudinary from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { deleteCloudinaryFile } from "../utils/deleteCloudinaryFile.js";
import mongoose from "mongoose";

// Function to generate access and refresh tokens for a user
const generateAccessAndRefreshTokens = async (user_id) => {
  try {
    const user = await User.findById(user_id);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    throw new ApiError(500, "Error generating tokens");
  }
};

//register user
const register = asyncHandler(async (req, res) => {
  //get data from frontend
  //validate data
  //check if user already exists
  //upload avatar and cover image
  //validate avtar
  //upload to cloudinary
  //again validate avatar and cover image
  //create user
  //send response
  //remove password and refresh token from respons
  const { username, email, fullName, password } = req.body;
  // console.log("Registering user:", { username, email, fullName, password });

  //vlidate data
  if (
    [fullName, username, email, password].some(
      (field) => !field || field.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }
  // if (username.trim() === "" || email.trim() === "" || fullName.trim() === "" || password.trim() === "") {
  //     throw new ApiError(400, "All fields are required");
  // }

  //Check if User Already exist
  const existingUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existingUser) {
    throw new ApiError(400, "User already exists");
  }
  //upload avatar and cover image with multer middleware
  const avatarFilePath = req.files?.avatar?.[0]?.path;
  const coverImageFilePath = req.files?.coverImage?.[0]?.path;
  //validate avtar
  if (!avatarFilePath) {
    throw new ApiError(400, "Avatar is required");
  }
  //upload to cloudinary
  const avatar = await uploadFileCloudinary(avatarFilePath);
  const coverImage = await uploadFileCloudinary(coverImageFilePath);
  //again validate avatar and cover image
  if (!avatar) {
    throw new ApiError(500, "Avatar upload failed");
  }
  //create user
  const user = await User.create({
    username: username.toLowerCase(),
    email,
    fullName,
    password,
    avatar: {
      url: avatar.url,
      public_id: avatar.public_id,
    },
    coverImage: {
      url: coverImage?.url || "",
      public_id: coverImage?.public_id || "",
    },
  });
  //send response
  const createdUser = await User.findById(user._id).select(
    " -password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "User registeration failed");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

//login user
const login = asyncHandler(async (req, res) => {
  //get data from user
  //validation of data
  //check if user exists
  //check password
  //create access token and refresh token
  //cookie
  //send response

  const { email, username, password } = req.body;
  console.log(email, username, password);
  // const email = req.body.email
  // const username = req.body.username
  // const password = req.body.password
  // console.log(email);

  if (!(email || username) || !password) {
    throw new ApiError(400, "Email or Username and Password are required");
  }
  //check if user exists
  const user = await User.findOne({ $or: [{ email }, { username }] });
  if (!user) {
    throw new ApiError(400, "User does not exist");
  }
  //check password
  const validPassword = await user.isPasswordCorrect(password);
  if (!validPassword) {
    throw new ApiError(400, "Invalid password");
  }
  //create access token and refresh token
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select("-refreshToken");

  //set cookie

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

//logout user
const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user_id,
    {
      $unset: { refreshToken: 1 },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secret: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

//refresh access token
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized access, no refresh token provided");
  }
  const decodedRefreshToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );
  if (!decodedRefreshToken) {
    throw new ApiError(401, "Invalid refresh token");
  }
  const user = await User.findById(decodedRefreshToken._id);
  if (!user) {
    throw new ApiError(401, "User not found");
  }

  if (incomingRefreshToken !== user.refreshToken) {
    throw new ApiError(401, "Invalid refresh token");
  }

  const { accessToken, newrefreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newrefreshToken, options)
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken: newrefreshToken },
        "Access token refreshed successfully"
      )
    );
});

//Cahange Current Password
const UpdatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!(currentPassword && newPassword)) {
    throw new ApiError(400, "Current password and new password are required");
  }
  const user = await User.findById(req.user._id);
  const isOldPasswordCorrect = await user.isPasswordCorrect(currentPassword);

  if (!isOldPasswordCorrect) {
    throw new ApiError(400, "Your Current password is incorrect");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  const userData = user.toObject();
  delete userData.password;
  delete userData.refreshToken;

  return res
    .status(200)
    .json(new ApiResponse(200, userData, "Password Update Successfully"));
});

//Change profile detils
const updateProfileDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;
  if (!(fullName && email)) {
    throw new ApiError(400, "Full name and email are required");
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        fullName: fullName,
        email: email,
      },
    },
    {
      new: true,
    }
  ).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Profile details updated successfully"));
});

//change avatar
const changeAvatar = asyncHandler(async (req, res) => {
  const avatarPath = req.file?.path;
  if (!avatarPath) throw new ApiError(400, "Avatar file is required");

  // Upload new avatar
  const avatar = await uploadFileCloudinary(avatarPath);
  if (!avatar) throw new ApiError(500, "Avatar upload failed");

  // Update user document
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: {
          url: avatar.url,
          public_id: avatar.public_id,
        },
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  // Attempt to delete old avatar (don't fail if it doesn't exist)
  try {
    if (req.user.avatar?.public_id) {
      await deleteCloudinaryFile(req.user.avatar.public_id);
    }
  } catch (error) {
    console.log("Old avatar cleanup warning:", error.message);
    // Continue even if deletion fails
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated successfully"));
});

//change coverImage
const updateCoverImage = asyncHandler(async (req, res) => {
  const coverImagePath = await req.file?.path;
  if (!coverImagePath) {
    throw new ApiError(400, "Avatar is required");
  }
  const coverImage = await uploadFileCloudinary(coverImagePath);
  if (!coverImage) {
    throw new ApiError(500, "Avatar upload failed");
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        coverImage: {
          url: coverImage.url,
          public_id: coverImagePath.public_id,
        },
      },
    },
    {
      new: true,
    }
  ).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (req.user.coverImage?.public_id) {
    try {
      await deleteCloudinaryFile(req.user.coverImage.public_id);
    } catch (error) {
      throw new ApiError(500, "Error deleting old cover image");
    }
  } else {
    console.log("No old cover image to delete");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover image updated successfully"));
});

//getUser
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    "-password -refreshToken"
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User fetched successfully"));
});

//get user channel
const getUserChannel = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username) {
    throw new ApiError(400, "Username is required");
  }

  const channel = await User.aggregate([
    {
      $match: { username: username?.toLowerCase() },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "channelSubscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedToChannels",
      },
    },
    {
      $addFields: {
        channelSubscribersCount: {
          $size: "$channelSubscribers",
        },
        subscribedToChannelsCount: {
          $size: "$subscribedToChannels",
        },
        isSubscribed: {
          $cond: {
            if: {
              $in: [req.user._id, "$subscribedToChannels.subscriber"],
            },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        username: 1,
        fullName: 1,
        avatar: 1,
        coverImage: 1,
        channelSubscribersCount: 1,
        subscribedToChannelsCount: 1,
        isSubscribed: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(404, "Channel not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, channel[0], "Channel fetched successfully"));
});

//get user watch history
const getUserWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    username: 1,
                    fullName: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "User watch history fetched successfully"
      )
    );
});

export {
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
};
