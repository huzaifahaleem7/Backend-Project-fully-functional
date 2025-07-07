import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import uploadFileCloudinary from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt, { decode } from "jsonwebtoken";

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
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
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
  

  if (!(email || username) || !password) {
    throw new ApiError(400, "Email or Username and Password are required");
  }
  //check if user exists
  const user = await User.findOne({ $or: [{ email }, { username }] });
  if (!user) {
    throw new ApiError(400, "User does not exist");
  }
  //check password
  const validPassword = user.isPasswordCorrect(password);
  if (!validPassword) {
    throw new ApiError(400, "Invalid password");
  }
  //create access token and refresh token
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

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
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken){
    throw new ApiError(401, "Unauthorized access, no refresh token provided");
  }
  const decodedRefreshToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
  if (!decodedRefreshToken) {
    throw new ApiError(401, "Invalid refresh token");
  }
  const user = await User.findById(decodedRefreshToken._id)
  if (!user) {
    throw new ApiError(401, "User not found");
  } 

  if (incomingRefreshToken !== user.refreshToken) {
    throw new ApiError(401, "Invalid refresh token");
  }

  const { accessToken, newrefreshToken } = await generateAccessAndRefreshTokens(user._id);

  const options = {
    httpOnly: true,
    secure: true,
  }

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newrefreshToken, options)
    .json(new ApiResponse(200, { accessToken, refreshToken: newrefreshToken }, "Access token refreshed successfully"));
})

export { register, login, logout, refreshAccessToken };
