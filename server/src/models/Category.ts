import { Schema, model, Document } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  icon: string;
  type: string;
  enabled: boolean;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    icon: { type: String, default: "tag" },
    type: { type: String, required: true },
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Category = model<ICategory>("Category", categorySchema);
