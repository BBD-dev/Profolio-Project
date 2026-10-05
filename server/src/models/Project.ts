import { Schema, model, Document, Types } from "mongoose";

export type ProjectStatus = "published" | "hidden" | "draft";

export interface ITeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

export interface IProject extends Document {
  title: string;
  subtitle?: string;
  name: string;
  shortDescription?: string;
  description?: string;
  category: Types.ObjectId | string;
  type: string;
  cover?: string;
  logo?: string;
  gallery: string[];
  video?: string;
  technologies: string[];
  demoUrl?: string;
  websiteUrl?: string;
  downloadUrl?: string;
  githubUrl?: string;
  team: ITeamMember[];
  ownerId: Types.ObjectId;
  ownerName?: string;
  graduateIds: Types.ObjectId[];
  completionDate?: string;
  status: ProjectStatus;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true },
    subtitle: String,
    name: { type: String, required: true },
    shortDescription: String,
    description: String,
    category: { type: Schema.Types.Mixed, required: true },
    type: { type: String, required: true },
    cover: String,
    logo: String,
    gallery: { type: [String], default: [] },
    video: String,
    technologies: { type: [String], default: [] },
    demoUrl: String,
    websiteUrl: String,
    downloadUrl: String,
    githubUrl: String,
    team: {
      type: [
        { id: String, name: String, role: String, avatar: String },
      ],
      default: [],
    },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    ownerName: String,
    graduateIds: [{ type: Schema.Types.ObjectId, ref: "User" }],
    completionDate: String,
    status: { type: String, enum: ["published", "hidden", "draft"], default: "draft" },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true },
);

projectSchema.index({ status: 1, featured: 1 });
projectSchema.index({ category: 1 });
projectSchema.index({ ownerId: 1 });
projectSchema.index({ title: "text", description: "text", technologies: "text" });

export const Project = model<IProject>("Project", projectSchema);
