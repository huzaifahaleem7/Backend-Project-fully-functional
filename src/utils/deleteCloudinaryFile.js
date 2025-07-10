import { v2 as cloudinary } from "cloudinary";
import ApiError from "./ApiError.js";

export const deleteCloudinaryFile = async (public_id, resource_type = "image") => {
  try {
    console.log("Deleting file from Cloudinary with public_id:", public_id);
    if (!public_id) {
      throw new ApiError(
        500,
        "Public ID is required to delete a file from Cloudinary"
      );
    }
    const result = await cloudinary.uploader.destroy(public_id, {
      resource_type,
    });
    console.log("Cloudinary destroy result:", result);

    return result;
  } catch (error) {
    console.error("Error deleting file from Cloudinary:", error);
    throw new ApiError(500, "Error deleting file from Cloudinary");
  }
};
