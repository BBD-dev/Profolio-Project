import { v2 as cloudinary } from "cloudinary";
import { env, cloudinaryEnabled } from "./env";

if (cloudinaryEnabled) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
  });
}

export { cloudinary, cloudinaryEnabled };

export type UploadFolder =
  | "avatars"
  | "covers"
  | "projects"
  | "logos"
  | "gallery"
  | "documents"
  | "media";

export async function uploadBuffer(
  buffer: Buffer,
  folder: UploadFolder,
  options: { resourceType?: "image" | "raw" | "video"; filename?: string } = {},
): Promise<{ url: string; publicId: string; bytes: number }> {
  if (!cloudinaryEnabled) {
    throw new Error("Cloudinary is not configured. Set CLOUDINARY_* env vars.");
  }

  const resourceType = options.resourceType || "image";

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `bbd-profolio/${folder}`,
        resource_type: resourceType,
        // Let Cloudinary generate a unique id; a caller-supplied name is only a sanitized prefix.
        ...(options.filename
          ? { public_id: `${options.filename.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 40)}-${Date.now()}` }
          : {}),
        unique_filename: true,
        overwrite: false,
      },
      (err, result) => {
        if (err || !result) return reject(err || new Error("Upload failed"));
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          bytes: result.bytes,
        });
      },
    );
    stream.end(buffer);
  });
}

export async function deleteByPublicId(
  publicId: string,
  resourceType: "image" | "video" | "raw" = "image",
): Promise<void> {
  if (!cloudinaryEnabled) return;
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}
