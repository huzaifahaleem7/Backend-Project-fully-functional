import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadFileCloudinary = async (localFile) => {
  try {
    if (!localFile) return null;
    const response = await cloudinary.uploader.upload(localFile, {
      resource_type: "auto",
    });
    console.log("File upload Successfully", response.url);
    fs.unlinkSync(localFile);
    return response;
  } catch (error) {
    console.error("File is not upload on cloudinary", error);

    fs.unlinkSync(localFile);
  }
};

export default uploadFileCloudinary;
