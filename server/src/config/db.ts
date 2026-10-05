import mongoose from "mongoose";
import { env } from "./env";

export async function connectDb(): Promise<void> {
  await mongoose.connect(env.mongoUrl, { dbName: env.dbName });
  console.log(`MongoDB connected (${env.dbName})`);
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
}
