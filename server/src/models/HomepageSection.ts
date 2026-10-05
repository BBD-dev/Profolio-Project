import { Schema, model, Document } from "mongoose";

export interface IHomepageSection extends Document {
  key: string;
  title: string;
  description: string;
  visible: boolean;
  order: number;
}

const homepageSectionSchema = new Schema<IHomepageSection>(
  {
    key: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: String,
    visible: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const HomepageSection = model<IHomepageSection>("HomepageSection", homepageSectionSchema);
