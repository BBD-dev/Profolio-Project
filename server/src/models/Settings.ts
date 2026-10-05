import { Schema, model, Document } from "mongoose";

export interface ISettings extends Document {
  platformName: string;
  logo: string;
  primaryColor: string;
  accentColor: string;
  social: Record<string, string>;
  contactEmail: string;
  contactPhone: string;
  address: string;
  privacyPolicy: string;
  terms: string;
}

const settingsSchema = new Schema<ISettings>(
  {
    platformName: { type: String, default: "BBD PROFOLIO" },
    logo: String,
    primaryColor: { type: String, default: "#0A1330" },
    accentColor: { type: String, default: "#C8D62B" },
    social: { type: Schema.Types.Mixed, default: {} },
    contactEmail: String,
    contactPhone: String,
    address: String,
    privacyPolicy: String,
    terms: String,
  },
  { timestamps: true },
);

export const Settings = model<ISettings>("Settings", settingsSchema);
