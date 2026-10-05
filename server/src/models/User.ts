import { Schema, model, Document, Types } from "mongoose";

export type UserStatus = "pending" | "approved" | "rejected" | "changes_requested";
export type UserRole = "user" | "admin";
export type GraduateStatus = "active" | "inactive" | "hidden";

export interface ISocialLinks {
  github?: string;
  linkedin?: string;
  behance?: string;
  dribbble?: string;
  website?: string;
  portfolio?: string;
  email?: string;
}

export interface IExperience {
  id: string;
  company: string;
  role: string;
  period: string;
}

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  fullName: string;
  headline?: string;
  about?: string;
  specialization?: string;
  university?: string;
  phone?: string;
  skills: string[];
  avatar?: string;
  cover?: string;
  cvUrl?: string;
  cvPublicId?: string;
  resumeName?: string;
  availableForWork: boolean;
  featured: boolean;
  experience: IExperience[];
  links: ISocialLinks;
  status: UserStatus;
  role: UserRole;
  graduateStatus: GraduateStatus;
  adminNote?: string;
  projectIds: Types.ObjectId[];
  approvedAt?: Date;
  approvedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    fullName: { type: String, required: true },
    headline: String,
    about: String,
    specialization: String,
    university: String,
    phone: String,
    skills: { type: [String], default: [] },
    avatar: String,
    cover: String,
    cvUrl: String,
    cvPublicId: String,
    resumeName: String,
    availableForWork: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    experience: {
      type: [
        {
          id: String,
          company: String,
          role: String,
          period: String,
        },
      ],
      default: [],
    },
    links: { type: Schema.Types.Mixed, default: {} },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "changes_requested"],
      default: "pending",
    },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    graduateStatus: {
      type: String,
      enum: ["active", "inactive", "hidden"],
      default: "active",
    },
    adminNote: String,
    projectIds: [{ type: Schema.Types.ObjectId, ref: "Project" }],
    approvedAt: Date,
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

userSchema.index({ status: 1 });
userSchema.index({ graduateStatus: 1 });
userSchema.index({ featured: 1 });
userSchema.index({ specialization: 1 });

export const User = model<IUser>("User", userSchema);
