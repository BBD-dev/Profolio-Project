export function cloudinaryResourceType(type: string): "image" | "video" | "raw" {
  if (type === "video") return "video";
  if (type === "document" || type === "cv") return "raw";
  return "image";
}
