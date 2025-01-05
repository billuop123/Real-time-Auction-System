import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";

export function cloudinarySetup() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // Multer Cloudinary Storage
  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "my-folder", // Specify the Cloudinary folder
      format: async () => "png", // Optional: specify format
    } as any, // Casting to 'any' to resolve the type error
  });
  const upload = multer({ storage });
  return upload;
}
