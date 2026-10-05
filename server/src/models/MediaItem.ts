import { Schema, model, Document } from "mongoose";

export type MediaType = "image" | "logo" | "video" | "document" | "cv";

export interface IMediaItem extends Document {
  name: string;
  type: MediaType;
  url: string;
  publicId?: string;
  size: string;
  uploadedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const mediaSchema = new Schema<IMediaItem>(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ["image", "logo", "video", "document", "cv"], default: "image" },
    url: { type: String, required: true },
    publicId: String,
    size: { type: String, default: "0 KB" },
    uploadedBy: String,
  },
  { timestamps: true },
);

export const MediaItem = model<IMediaItem>("MediaItem", mediaSchema);
