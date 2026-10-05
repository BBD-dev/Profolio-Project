import { Types } from "mongoose";
import { Project } from "../models/Project";
import { User } from "../models/User";

/**
 * Keep graduate.projectIds in sync for the given graduates.
 * Runs a single aggregation + bulkWrite instead of one query per graduate.
 */
export async function syncGraduateProjectIds(graduateIds?: Types.ObjectId[]): Promise<void> {
  const ids = graduateIds ?? [];
  if (ids.length === 0) return;

  const unique = [...new Map(ids.map((id) => [id.toString(), id])).values()];

  const grouped = await Project.aggregate<{ _id: Types.ObjectId; projectIds: Types.ObjectId[] }>([
    { $match: { graduateIds: { $in: unique } } },
    { $unwind: "$graduateIds" },
    { $match: { graduateIds: { $in: unique } } },
    { $group: { _id: "$graduateIds", projectIds: { $push: "$_id" } } },
  ]);

  const found = new Map(grouped.map((g) => [g._id.toString(), g.projectIds]));

  await User.bulkWrite(
    unique.map((id) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { projectIds: found.get(id.toString()) ?? [] } },
      },
    })),
    { ordered: false },
  );
}

/** Rebuild projectIds for every approved graduate (used by seed / maintenance). */
export async function syncAllGraduateProjectIds(): Promise<void> {
  const grads = await User.find({ role: "user" }, "_id").lean();
  await syncGraduateProjectIds(grads.map((g) => g._id as Types.ObjectId));
}
