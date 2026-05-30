import { v2 as cloudinary } from "cloudinary";

const required = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

const missing = required.filter(
  (key) => !process.env[key]
);

// If Cloudinary creds are missing, don't call cloudinary.config() at all.
// This prevents runtime crashes like: "Must supply api_key".
if (missing.length) {
  console.warn(
    `Cloudinary config warning: Missing env var(s): ${missing.join(
      ", "
    )}. Cloudinary upload will fail until you set them.`
  );
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  console.log("Cloudinary Config Loaded");
}

export default cloudinary;
