import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import uploadFileCloudinary from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
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
export default register;
