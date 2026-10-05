import { Schema, model, Document } from "mongoose";

export type ActivityKind = "request" | "project" | "graduate" | "system";

export interface IActivity extends Document {
  kind: ActivityKind;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

const activitySchema = new Schema<IActivity>(
  {
    kind: { type: String, enum: ["request", "project", "graduate", "system"], required: true },
    message: { type: String, required: true },
  },
  { timestamps: true },
);

activitySchema.index({ createdAt: -1 });

export const Activity = model<IActivity>("Activity", activitySchema);

const MAX_ACTIVITY = 200;

export async function logActivity(kind: ActivityKind, message: string): Promise<void> {
  try {
    await Activity.create({ kind, message: message.slice(0, 300) });
    // Prune occasionally rather than on every write.
    if (Math.random() < 0.1) {
      const cutoff = await Activity.findOne().sort({ createdAt: -1 }).skip(MAX_ACTIVITY).select("createdAt");
      if (cutoff) await Activity.deleteMany({ createdAt: { $lt: cutoff.createdAt } });
    }
  } catch (err) {
    console.error("[activity] failed to log:", err);
  }
}
