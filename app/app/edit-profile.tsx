import { Image } from "expo-image";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText, Avatar, BusyOverlay, Button, Input } from "@/src/components";
import { EditProfileSection } from "@/src/components/edit/EditProfileSection";
import { SocialLinkField } from "@/src/components/edit/SocialLinkField";
import { useToast } from "@/src/hooks/useToast";
import { useAuth } from "@/src/providers/AuthContext";
import { authService } from "@/src/services/authService";
import { getErrorMessage, resolveMediaUrl } from "@/src/services/apiClient";
import { uploadService } from "@/src/services/uploadService";
import { useTheme } from "@/src/theme/ThemeContext";
import { LIMITS, normalizeUrl } from "@/src/utils/validation";

type BusyKind = "avatar" | "cover" | "cv" | "save" | null;

const LINK_META = {
  linkedin: {
    icon: "logo-linkedin" as const,
    accent: "#0A66C2",
    hint: "Show recruiters your experience",
    placeholder: "https://linkedin.com/in/you",
  },
  github: {
    icon: "logo-github" as const,
    accent: "#24292F",
    hint: "Share repos and contributions",
    placeholder: "https://github.com/you",
  },
  website: {
    icon: "globe-outline" as const,
    accent: "#0A1330",
    hint: "Personal site or landing page",
    placeholder: "https://yoursite.com",
  },
  portfolio: {
    icon: "briefcase-outline" as const,
    accent: "#C8D62B",
    hint: "Behance, Dribbble, or case studies",
    placeholder: "https://…",
  },
};

function isStoredUri(uri?: string) {
  if (!uri) return false;
  return uri.startsWith("http://") || uri.startsWith("https://") || uri.startsWith("/api/");
}

function guessMime(uri: string, fallback: string) {
  const ext = uri.split(/[?#]/)[0].split(".").pop()?.toLowerCase();
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "gif") return "image/gif";
  if (ext === "heic") return "image/heic";
  if (ext === "heif") return "image/heif";
  if (ext === "pdf") return "application/pdf";
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  return fallback;
}

export default function EditProfile() {
  const { colors, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, setUser } = useAuth();
  const toast = useToast();

  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [headline, setHeadline] = useState(user?.headline ?? "");
  const [about, setAbout] = useState(user?.about ?? "");
  const [skills, setSkills] = useState<string[]>(user?.skills ?? []);
  const [skillInput, setSkillInput] = useState("");
  const [avatar, setAvatar] = useState<string | undefined>(user?.avatar ?? undefined);
  const [cover, setCover] = useState<string | undefined>(user?.cover ?? undefined);
  const [available, setAvailable] = useState(user?.available_for_work ?? true);
  const [resumeName, setResumeName] = useState(user?.resume_name ?? "");
  const [cvUrl, setCvUrl] = useState(user?.cv_url ?? "");
  const [cvPublicId, setCvPublicId] = useState<string | undefined>();
  const [clearCv, setClearCv] = useState(false);
  const [links, setLinks] = useState({
    linkedin: user?.links?.linkedin ?? "",
    github: user?.links?.github ?? "",
    website: user?.links?.website ?? "",
    portfolio: user?.links?.portfolio ?? "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<BusyKind>(null);
  const [busyMessage, setBusyMessage] = useState("");

  const isBusy = busy !== null;

  useEffect(() => {
    if (!user) return;
    setFullName(user.full_name ?? "");
    setHeadline(user.headline ?? "");
    setAbout(user.about ?? "");
    setSkills(user.skills ?? []);
    setAvatar(user.avatar ?? undefined);
    setCover(user.cover ?? undefined);
    setAvailable(user.available_for_work ?? true);
    setResumeName(user.resume_name ?? "");
    setCvUrl(user.cv_url ?? "");
    setClearCv(false);
    setLinks({
      linkedin: user.links?.linkedin ?? "",
      github: user.links?.github ?? "",
      website: user.links?.website ?? "",
      portfolio: user.links?.portfolio ?? "",
    });
  }, [user?.id]);

  const uploadLocal = async (
    uri: string,
    field: "avatar" | "cover" | "cv",
    fileName: string,
    mime: string,
  ) => {
    const uploaded = await uploadService.uploadFile(uri, fileName, guessMime(uri, mime), field);
    return { url: uploaded.url, publicId: uploaded.publicId };
  };

  const pickImage = async (target: "avatar" | "cover") => {
    if (isBusy) return;
    const perm = await ImagePicker.getMediaLibraryPermissionsAsync();
    let status = perm.status;
    if (status !== "granted") {
      if (!perm.canAskAgain) {
        toast.error("Enable photo access in Settings");
        Linking.openSettings();
        return;
      }
      const req = await ImagePicker.requestMediaLibraryPermissionsAsync();
      status = req.status;
      if (status !== "granted") {
        toast.error("Photo access is needed to update images");
        return;
      }
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: target === "avatar" ? [1, 1] : [16, 9],
      quality: 0.85,
    });
    if (result.canceled || !result.assets[0]?.uri) return;

    const uri = result.assets[0].uri;
    if (target === "avatar") setAvatar(uri);
    else setCover(uri);

    setBusy(target);
    setBusyMessage(target === "avatar" ? "Uploading photo…" : "Uploading cover…");
    try {
      const uploaded = await uploadLocal(
        uri,
        target,
        target === "avatar" ? "avatar.jpg" : "cover.jpg",
        "image/jpeg",
      );
      if (target === "avatar") setAvatar(uploaded.url);
      else setCover(uploaded.url);
      toast.success(target === "avatar" ? "Photo uploaded" : "Cover uploaded");
    } catch (err) {
      toast.error(getErrorMessage(err) || "Upload failed. Try again or save later.");
    } finally {
      setBusy(null);
      setBusyMessage("");
    }
  };

  const pickResume = async () => {
    if (isBusy) return;
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    if (asset.size && asset.size > 10 * 1024 * 1024) {
      toast.error("Resume must be a PDF under 10MB");
      return;
    }

    setBusy("cv");
    setBusyMessage("Uploading resume…");
    try {
      const uploaded = await uploadLocal(asset.uri, "cv", asset.name || "resume.pdf", "application/pdf");
      setCvUrl(uploaded.url);
      setCvPublicId(uploaded.publicId);
      setResumeName(asset.name || "resume.pdf");
      setClearCv(false);
      toast.success("Resume uploaded");
    } catch (err) {
      toast.error(getErrorMessage(err) || "Could not upload resume");
    } finally {
      setBusy(null);
      setBusyMessage("");
    }
  };

  const addSkill = () => {
    const v = skillInput.trim().slice(0, LIMITS.skill);
    if (!v) return;
    if (skills.length >= LIMITS.skills) {
      toast.error(`You can add up to ${LIMITS.skills} skills`);
      return;
    }
    if (skills.some((s) => s.toLowerCase() === v.toLowerCase())) {
      setSkillInput("");
      return;
    }
    setSkills([...skills, v]);
    setSkillInput("");
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!fullName.trim() || fullName.trim().length < 2) next.fullName = "Full name is required";
    if (fullName.trim().length > LIMITS.name) next.fullName = `Keep this under ${LIMITS.name} characters`;
    if (headline.trim().length > LIMITS.headline) next.headline = `Keep this under ${LIMITS.headline} characters`;
    if (about.trim().length > LIMITS.about) next.about = `Keep this under ${LIMITS.about} characters`;

    (["linkedin", "github", "website", "portfolio"] as const).forEach((key) => {
      if (!links[key].trim()) return;
      if (normalizeUrl(links[key]) === null) next[key] = "Enter a valid URL";
    });

    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const dirty = useMemo(() => {
    const sameArr = (a: string[], b: string[]) => a.length === b.length && a.every((x, i) => x === b[i]);
    const cvChanged = clearCv || cvUrl !== (user?.cv_url ?? "");
    return (
      fullName.trim() !== (user?.full_name ?? "") ||
      headline.trim() !== (user?.headline ?? "") ||
      about.trim() !== (user?.about ?? "") ||
      !sameArr(skills, user?.skills ?? []) ||
      (avatar || "") !== (user?.avatar || "") ||
      (cover || "") !== (user?.cover || "") ||
      available !== (user?.available_for_work ?? true) ||
      cvChanged ||
      links.linkedin !== (user?.links?.linkedin ?? "") ||
      links.github !== (user?.links?.github ?? "") ||
      links.website !== (user?.links?.website ?? "") ||
      links.portfolio !== (user?.links?.portfolio ?? "")
    );
  }, [fullName, headline, about, skills, avatar, cover, available, clearCv, cvUrl, links, user]);

  const goBack = () => {
    if (isBusy) return;
    if (!dirty) {
      router.back();
      return;
    }
    const discard = () => router.back();
    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.confirm("Discard unsaved changes?")) discard();
      return;
    }
    Alert.alert("Unsaved changes", "Discard your edits? This cannot be undone.", [
      { text: "Keep editing", style: "cancel" },
      { text: "Discard", style: "destructive", onPress: discard },
    ]);
  };

  const save = async () => {
    if (isBusy) return;
    if (!validate()) {
      toast.error("Please fix the highlighted fields");
      return;
    }
    setBusy("save");
    setBusyMessage("Saving profile…");
    try {
      let avatarUrl = avatar ?? "";
      let coverUrl = cover ?? "";

      if (avatar && !isStoredUri(avatar)) {
        setBusyMessage("Uploading photo…");
        const uploaded = await uploadLocal(avatar, "avatar", "avatar.jpg", "image/jpeg");
        avatarUrl = uploaded.url;
        setAvatar(uploaded.url);
      }
      if (cover && !isStoredUri(cover)) {
        setBusyMessage("Uploading cover…");
        const uploaded = await uploadLocal(cover, "cover", "cover.jpg", "image/jpeg");
        coverUrl = uploaded.url;
        setCover(uploaded.url);
      }

      setBusyMessage("Saving profile…");
      const updated = await authService.updateProfile({
        full_name: fullName.trim(),
        headline: headline.trim(),
        about: about.trim(),
        skills,
        avatar: avatarUrl,
        cover: coverUrl,
        available_for_work: available,
        resume_name: clearCv ? "" : resumeName.trim() || undefined,
        cv_url: clearCv ? "" : cvUrl || undefined,
        cv_public_id: cvPublicId,
        links: {
          linkedin: normalizeUrl(links.linkedin) || undefined,
          github: normalizeUrl(links.github) || undefined,
          website: normalizeUrl(links.website) || undefined,
          portfolio: normalizeUrl(links.portfolio) || undefined,
        },
      });
      setUser(updated);
      toast.success("Profile updated");
      router.back();
    } catch (err) {
      toast.error(getErrorMessage(err) || "Could not save. Please try again.");
    } finally {
      setBusy(null);
      setBusyMessage("");
    }
  };

  const coverSrc = useMemo(() => resolveMediaUrl(cover), [cover]);
  const avatarSrc = useMemo(() => resolveMediaUrl(avatar), [avatar]);
  const hasResume = !clearCv && !!(resumeName || cvUrl);
  const linkCount = (["linkedin", "github", "website", "portfolio"] as const).filter((k) => links[k].trim()).length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.surfaceSecondary }}>
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 6,
            backgroundColor: colors.surface,
            borderColor: colors.divider,
          },
        ]}
      >
        <Pressable onPress={goBack} hitSlop={10} testID="edit-cancel" disabled={isBusy} style={styles.headerSide}>
          <Ionicons name="chevron-back" size={22} color={colors.onSurface} />
        </Pressable>
        <AppText variant="heading" style={{ fontSize: 18 }}>
          Edit profile
        </AppText>
        <Pressable
          onPress={save}
          hitSlop={10}
          disabled={isBusy || !dirty}
          testID="edit-save"
          style={[
            styles.savePill,
            {
              backgroundColor: dirty && !isBusy ? colors.brandPrimary : colors.surfaceTertiary,
              borderRadius: radius.pill,
            },
          ]}
        >
          {busy === "save" ? (
            <ActivityIndicator size="small" color={colors.onBrandPrimary} />
          ) : (
            <AppText
              variant="label"
              weight="semibold"
              color={dirty && !isBusy ? colors.onBrandPrimary : colors.onSurfaceSecondary}
            >
              Save
            </AppText>
          )}
        </Pressable>
      </View>

      <KeyboardAwareScrollView
        bottomOffset={24}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
        pointerEvents={isBusy ? "none" : "auto"}
      >
        <Pressable onPress={() => pickImage("cover")} style={styles.cover} testID="edit-cover-picker">
          {coverSrc ? (
            <Image source={{ uri: coverSrc }} style={StyleSheet.absoluteFill} contentFit="cover" />
          ) : (
            <LinearGradient colors={[colors.brandTertiary, colors.brand]} style={StyleSheet.absoluteFill} />
          )}
          <View style={styles.coverScrim} />
          <View style={styles.editBadge}>
            <Ionicons name="camera-outline" size={16} color="#FFFFFF" />
            <AppText variant="caption" weight="medium" color="#FFFFFF">
              {busy === "cover" ? "Uploading…" : "Change cover"}
            </AppText>
          </View>
          {busy === "cover" ? (
            <View style={styles.mediaLoader}>
              <ActivityIndicator color="#FFFFFF" size="large" />
            </View>
          ) : null}
        </Pressable>

        <View style={styles.body}>
          <View style={styles.heroRow}>
            <Pressable onPress={() => pickImage("avatar")} style={styles.avatarWrap} testID="edit-avatar-picker">
              <Avatar
                uri={avatarSrc}
                name={fullName || "?"}
                size={88}
                style={{ borderWidth: 4, borderColor: colors.surface }}
              />
              <View style={[styles.avatarCam, { backgroundColor: colors.brandPrimary, borderColor: colors.surface }]}>
                {busy === "avatar" ? (
                  <ActivityIndicator size="small" color={colors.onBrandPrimary} />
                ) : (
                  <Ionicons name="camera" size={14} color={colors.onBrandPrimary} />
                )}
              </View>
            </Pressable>
            <View style={{ flex: 1, gap: 6, paddingTop: 8 }}>
              <AppText variant="title" numberOfLines={2}>
                {fullName.trim() || "Your name"}
              </AppText>
              <AppText variant="body" muted numberOfLines={2}>
                {headline.trim() || "Add a headline graduates will recognize"}
              </AppText>
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 16, marginTop: 8 }}>
            {cover ? (
              <Pressable onPress={() => setCover(undefined)} testID="edit-remove-cover">
                <AppText variant="caption" weight="medium" color={colors.error}>
                  Remove cover
                </AppText>
              </Pressable>
            ) : null}
            {avatar ? (
              <Pressable onPress={() => setAvatar(undefined)} testID="edit-remove-avatar">
                <AppText variant="caption" weight="medium" color={colors.error}>
                  Remove photo
                </AppText>
              </Pressable>
            ) : null}
          </View>

          <EditProfileSection title="Basics" subtitle="How you appear on your public graduate profile." style={{ marginTop: 20 }}>
            <Input
              label="Full name"
              required
              value={fullName}
              onChangeText={setFullName}
              placeholder="Your name"
              error={fieldErrors.fullName}
              testID="edit-name"
            />
            <Input
              label="Professional headline"
              value={headline}
              onChangeText={setHeadline}
              placeholder="e.g. Mobile Developer"
              error={fieldErrors.headline}
              testID="edit-headline"
            />
            <Input
              label="About"
              value={about}
              onChangeText={setAbout}
              placeholder="Tell people about your work and goals"
              multiline
              style={{ height: 112, textAlignVertical: "top", paddingTop: 12 }}
              error={fieldErrors.about}
              hint={`${about.length}/${LIMITS.about}`}
              testID="edit-about"
            />
          </EditProfileSection>

          <EditProfileSection title="Skills" subtitle="Add tools and strengths — tap a chip to remove.">
            <View style={{ flexDirection: "row", gap: 8, alignItems: "flex-start" }}>
              <View style={{ flex: 1 }}>
                <Input
                  value={skillInput}
                  onChangeText={setSkillInput}
                  placeholder="e.g. React Native"
                  onSubmitEditing={addSkill}
                  returnKeyType="done"
                  testID="edit-skill-input"
                />
              </View>
              <Button title="Add" variant="secondary" onPress={addSkill} testID="edit-add-skill" />
            </View>
            {skills.length > 0 ? (
              <View style={styles.tags}>
                {skills.map((s) => (
                  <Pressable key={s} onPress={() => setSkills(skills.filter((x) => x !== s))} testID={`remove-skill-${s}`}>
                    <View
                      style={[
                        styles.chip,
                        { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, borderRadius: radius.pill },
                      ]}
                    >
                      <AppText variant="caption" weight="medium">
                        {s}
                      </AppText>
                      <Ionicons name="close" size={12} color={colors.onSurfaceSecondary} />
                    </View>
                  </Pressable>
                ))}
              </View>
            ) : (
              <AppText variant="caption" muted>
                No skills yet — add at least three to stand out.
              </AppText>
            )}
          </EditProfileSection>

          <EditProfileSection title="Availability">
            <View style={styles.availRow}>
              <View style={{ flex: 1 }}>
                <AppText variant="body" weight="medium">
                  Open to work
                </AppText>
                <AppText variant="caption" muted style={{ marginTop: 2 }}>
                  Shows a badge on your profile card
                </AppText>
              </View>
              <Switch
                value={available}
                onValueChange={setAvailable}
                trackColor={{ true: colors.brandPrimary, false: colors.surfaceTertiary }}
                thumbColor="#FFFFFF"
                testID="edit-availability"
              />
            </View>
          </EditProfileSection>

          <EditProfileSection
            title="Online presence"
            subtitle={
              linkCount > 0
                ? `${linkCount} link${linkCount === 1 ? "" : "s"} added — paste full URLs, we’ll format them on save.`
                : "Add the profiles you want employers to open in one tap."
            }
            style={{ marginTop: 4 }}
          >
            {(Object.keys(LINK_META) as (keyof typeof LINK_META)[]).map((key) => {
              const meta = LINK_META[key];
              return (
                <SocialLinkField
                  key={key}
                  icon={meta.icon}
                  accent={meta.accent}
                  label={key.charAt(0).toUpperCase() + key.slice(1)}
                  hint={meta.hint}
                  placeholder={meta.placeholder}
                  value={links[key]}
                  onChangeText={(t) => setLinks({ ...links, [key]: t })}
                  error={fieldErrors[key]}
                  testID={`edit-${key}`}
                />
              );
            })}
          </EditProfileSection>

          <EditProfileSection title="Resume" subtitle="PDF only, max 10MB. Uploads immediately — no need to wait for Save.">
            <Pressable
              onPress={pickResume}
              disabled={isBusy}
              style={[
                styles.resume,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.surfaceSecondary,
                  borderRadius: radius.md,
                },
              ]}
              testID="edit-resume-picker"
            >
              <View style={[styles.resumeIcon, { backgroundColor: colors.brandPrimary + "22" }]}>
                {busy === "cv" ? (
                  <ActivityIndicator size="small" color={colors.brandPrimary} />
                ) : (
                  <Ionicons name="document-text-outline" size={22} color={colors.brandPrimary} />
                )}
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <AppText variant="label" weight="semibold" numberOfLines={1}>
                  {busy === "cv" ? "Uploading resume…" : hasResume ? resumeName || "Resume.pdf" : "Upload PDF resume"}
                </AppText>
                <AppText variant="caption" muted numberOfLines={1}>
                  {hasResume ? "Tap to replace" : "Recruiters can download from your profile"}
                </AppText>
              </View>
              <Ionicons name="cloud-upload-outline" size={20} color={colors.onSurfaceSecondary} />
            </Pressable>
            {hasResume ? (
              <Pressable
                onPress={() => {
                  setResumeName("");
                  setCvUrl("");
                  setCvPublicId(undefined);
                  setClearCv(true);
                }}
                testID="edit-remove-resume"
              >
                <AppText variant="caption" weight="medium" color={colors.error}>
                  Remove resume
                </AppText>
              </Pressable>
            ) : null}
          </EditProfileSection>

          <Button
            title={busy === "save" ? busyMessage || "Saving…" : "Save changes"}
            onPress={save}
            loading={busy === "save"}
            disabled={isBusy || !dirty}
            fullWidth
            style={{ marginTop: 8 }}
            testID="edit-save-button"
          />
        </View>
      </KeyboardAwareScrollView>

      <BusyOverlay visible={isBusy} message={busyMessage || "Please wait…"} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerSide: { width: 72, alignItems: "flex-start", justifyContent: "center" },
  savePill: {
    minWidth: 72,
    height: 36,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  cover: { height: 168, backgroundColor: "#0A1330" },
  coverScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.12)",
  },
  editBadge: {
    position: "absolute",
    right: 14,
    bottom: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  mediaLoader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(10, 19, 48, 0.35)",
  },
  body: { paddingHorizontal: 16, marginTop: -40, gap: 16 },
  heroRow: { flexDirection: "row", gap: 14, alignItems: "flex-start" },
  avatarWrap: { alignSelf: "flex-start" },
  avatarCam: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
  },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  availRow: { flexDirection: "row", alignItems: "center" },
  resume: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  resumeIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
