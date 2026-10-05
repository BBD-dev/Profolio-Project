import * as Linking from "expo-linking";
import { Platform, Share } from "react-native";

export function graduateShareUrl(id: string): string {
  return Linking.createURL(`/graduate/${id}`);
}

export function projectShareUrl(id: string): string {
  return Linking.createURL(`/project/${id}`);
}

type ShareResult = "shared" | "dismissed" | "copied";

type SharePayload = {
  title: string;
  message: string;
  url: string;
};

export async function shareLink(payload: SharePayload): Promise<ShareResult> {
  const { title, message, url } = payload;
  const withUrl = `${message}\n\n${url}`;

  if (Platform.OS === "web") {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text: message, url });
        return "shared";
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return "dismissed";
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(withUrl);
      return "copied";
    }
    throw new Error("Sharing is not supported in this browser.");
  }

  const result = await Share.share(
    Platform.OS === "ios"
      ? { title, message, url }
      : { title, message: withUrl },
  );

  return result.action === Share.sharedAction ? "shared" : "dismissed";
}

export async function shareGraduateProfile(grad: {
  id: string;
  name: string;
  headline?: string;
  specialization?: string;
}): Promise<ShareResult> {
  const url = graduateShareUrl(grad.id);
  const headline = grad.headline?.trim();
  const specialization = grad.specialization?.trim();
  const subtitle = headline || specialization || "BBD Select graduate";

  return shareLink({
    title: `${grad.name} · BBD PROFOLIO`,
    message: `Meet ${grad.name} — ${subtitle}. Verified BBD Select graduate portfolio on BBD PROFOLIO.`,
    url,
  });
}

export async function shareProject(project: {
  id: string;
  name: string;
  ownerName?: string;
  category?: string;
}): Promise<ShareResult> {
  const url = projectShareUrl(project.id);
  const byLine = project.ownerName ? ` by ${project.ownerName}` : "";

  return shareLink({
    title: `${project.name} · BBD PROFOLIO`,
    message: `Check out ${project.name}${byLine} on BBD PROFOLIO${project.category ? ` (${project.category})` : ""}.`,
    url,
  });
}
