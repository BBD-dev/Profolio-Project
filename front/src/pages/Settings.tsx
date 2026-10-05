import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Save, Palette, Share2, Phone, FileText, Building2, Upload, Loader2 } from "lucide-react";
import { settingsApi, mediaApi, mediaUploadField } from "@/services/api";
import { getErrorMessage } from "@/services/apiClient";
import { Settings as SettingsType } from "@/types";
import { PageHeader } from "@/components/shared/PageHeader";
import { QueryError } from "@/components/shared/QueryError";
import { UploadOverlay } from "@/components/shared/UploadOverlay";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/layout/BrandLogo";

const EMPTY_SETTINGS: SettingsType = {
  platformName: "BBD PROFOLIO",
  logo: "",
  primaryColor: "#0A1330",
  accentColor: "#C8D62B",
  social: { instagram: "", twitter: "", linkedin: "", youtube: "" },
  contactEmail: "",
  contactPhone: "",
  address: "",
  privacyPolicy: "",
  terms: "",
};

function normalizeSettings(data: Partial<SettingsType>): SettingsType {
  return {
    platformName: data.platformName ?? EMPTY_SETTINGS.platformName,
    logo: data.logo ?? "",
    primaryColor: data.primaryColor ?? EMPTY_SETTINGS.primaryColor,
    accentColor: data.accentColor ?? EMPTY_SETTINGS.accentColor,
    social: {
      instagram: data.social?.instagram ?? "",
      twitter: data.social?.twitter ?? "",
      linkedin: data.social?.linkedin ?? "",
      youtube: data.social?.youtube ?? "",
    },
    contactEmail: data.contactEmail ?? "",
    contactPhone: data.contactPhone ?? "",
    address: data.address ?? "",
    privacyPolicy: data.privacyPolicy ?? "",
    terms: data.terms ?? "",
  };
}

function colorInputValue(value: string, fallback: string): string {
  return /^#[0-9A-Fa-f]{6}$/.test(value) ? value : fallback;
}

export default function Settings() {
  const qc = useQueryClient();
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["settings"],
    queryFn: settingsApi.get,
  });
  const [form, setForm] = useState<SettingsType | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);

  useEffect(() => {
    if (data) setForm(normalizeSettings(data));
  }, [data]);

  const baseline = useMemo(() => (data ? normalizeSettings(data) : null), [data]);
  const isDirty = useMemo(() => {
    if (!form || !baseline) return false;
    return JSON.stringify(form) !== JSON.stringify(baseline);
  }, [form, baseline]);

  const save = useMutation({
    mutationFn: (patch: SettingsType) => settingsApi.update(patch),
    onSuccess: (saved) => {
      const normalized = normalizeSettings(saved);
      setForm(normalized);
      qc.setQueryData(["settings"], normalized);
      qc.invalidateQueries({ queryKey: ["activity"] });
      toast.success("Settings saved");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const uploadLogo = async (file: File) => {
    setLogoUploading(true);
    try {
      const result = await mediaApi.upload(file, mediaUploadField("logo"));
      setForm((f) => (f ? { ...f, logo: result.url } : f));
      toast.success("Logo uploaded — click Save to apply");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLogoUploading(false);
    }
  };

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-10 w-64" /><Skeleton className="h-96 rounded-2xl" /></div>;
  if (isError || !form) {
    return <QueryError message={getErrorMessage(error) || "Could not load settings."} onRetry={() => refetch()} />;
  }

  const set = <K extends keyof SettingsType>(k: K, v: SettingsType[K]) =>
    setForm((f) => (f ? { ...f, [k]: v } : f));
  const setSocial = (k: keyof SettingsType["social"], v: string) =>
    setForm((f) => (f ? { ...f, social: { ...f.social, [k]: v } } : f));

  return (
    <div>
      <PageHeader
        eyebrow="Configuration"
        title="Settings"
        subtitle="Manage platform identity, branding, contacts and legal content."
        actions={
          <Button
            onClick={() => save.mutate(form)}
            disabled={save.isPending || !isDirty}
            data-testid="settings-save"
          >
            {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {save.isPending ? "Saving…" : isDirty ? "Save changes" : "Saved"}
          </Button>
        }
      />

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-6 flex h-auto flex-wrap justify-start gap-1 bg-secondary/60 p-1">
          <TabsTrigger value="general" data-testid="tab-general" className="gap-2"><Building2 className="h-4 w-4" /> General</TabsTrigger>
          <TabsTrigger value="branding" data-testid="tab-branding" className="gap-2"><Palette className="h-4 w-4" /> Branding</TabsTrigger>
          <TabsTrigger value="social" data-testid="tab-social" className="gap-2"><Share2 className="h-4 w-4" /> Social</TabsTrigger>
          <TabsTrigger value="contact" data-testid="tab-contact" className="gap-2"><Phone className="h-4 w-4" /> Contact</TabsTrigger>
          <TabsTrigger value="legal" data-testid="tab-legal" className="gap-2"><FileText className="h-4 w-4" /> Legal</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card title="Platform identity" desc="Basic information shown across the platform and mobile app.">
            <Field label="Platform name">
              <Input value={form.platformName} onChange={(e) => set("platformName", e.target.value)} data-testid="setting-name" />
            </Field>
            <Field label="Logo">
              <p className="text-xs text-muted-foreground">Used in the admin sidebar, login, and loading screens. Leave empty to keep the BBD logo.</p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <div
                  className={cn(
                    "relative flex h-20 w-20 shrink-0 items-center justify-center bg-transparent",
                    logoUploading && "opacity-60",
                  )}
                >
                  <BrandLogo src={form.logo || undefined} size={80} radius={12} alt="Platform logo" />
                  {logoUploading ? <UploadOverlay label="Uploading…" /> : null}
                </div>
                <div className="flex flex-1 flex-col gap-2">
                  <Input value={form.logo} onChange={(e) => set("logo", e.target.value)} placeholder="https://… or upload below" data-testid="setting-logo" disabled={logoUploading} />
                  <label className={cn(
                    "inline-flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary",
                    logoUploading && "pointer-events-none opacity-70",
                  )}>
                    {logoUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {logoUploading ? "Uploading logo…" : "Upload logo"}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      disabled={logoUploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadLogo(file);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
              </div>
            </Field>
          </Card>
        </TabsContent>

        <TabsContent value="branding">
          <Card title="Brand colors" desc="Colors used across the mobile app and dashboard.">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <ColorField label="Primary color" value={form.primaryColor} onChange={(v) => set("primaryColor", v)} testid="setting-primary" fallback="#0A1330" />
              <ColorField label="Accent color" value={form.accentColor} onChange={(v) => set("accentColor", v)} testid="setting-accent" fallback="#C8D62B" />
            </div>
            <div className="mt-2 flex items-center gap-3 rounded-xl border border-border p-4">
              <div className="h-12 w-12 rounded-xl border border-border" style={{ background: form.primaryColor }} />
              <div className="h-12 w-12 rounded-xl border border-border" style={{ background: form.accentColor }} />
              <div>
                <p className="text-sm font-medium">{form.platformName}</p>
                <p className="text-xs text-muted-foreground">Live color preview</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="social">
          <Card title="Social media links" desc="Links shown in the mobile app footer.">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Instagram"><Input value={form.social.instagram || ""} onChange={(e) => setSocial("instagram", e.target.value)} data-testid="setting-instagram" placeholder="https://instagram.com/…" /></Field>
              <Field label="Twitter / X"><Input value={form.social.twitter || ""} onChange={(e) => setSocial("twitter", e.target.value)} data-testid="setting-twitter" placeholder="https://x.com/…" /></Field>
              <Field label="LinkedIn"><Input value={form.social.linkedin || ""} onChange={(e) => setSocial("linkedin", e.target.value)} data-testid="setting-linkedin" placeholder="https://linkedin.com/…" /></Field>
              <Field label="YouTube"><Input value={form.social.youtube || ""} onChange={(e) => setSocial("youtube", e.target.value)} data-testid="setting-youtube" placeholder="https://youtube.com/…" /></Field>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="contact">
          <Card title="Contact information" desc="How people can reach BBD Select.">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Contact email"><Input type="email" value={form.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} data-testid="setting-email" /></Field>
              <Field label="Contact phone"><Input value={form.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} data-testid="setting-phone" /></Field>
            </div>
            <Field label="Address"><Input value={form.address} onChange={(e) => set("address", e.target.value)} data-testid="setting-address" /></Field>
          </Card>
        </TabsContent>

        <TabsContent value="legal">
          <Card title="Legal content" desc="Displayed inside the mobile app.">
            <Field label="Privacy Policy"><Textarea rows={5} value={form.privacyPolicy} onChange={(e) => set("privacyPolicy", e.target.value)} data-testid="setting-privacy" /></Field>
            <Field label="Terms & Conditions"><Textarea rows={5} value={form.terms} onChange={(e) => set("terms", e.target.value)} data-testid="setting-terms" /></Field>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Card({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="max-w-3xl rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-8">
      <h3 className="font-heading text-lg font-semibold">{title}</h3>
      <p className="mb-6 text-sm text-muted-foreground">{desc}</p>
      <div className="space-y-5">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium leading-none">{label}</label>
      {children}
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
  testid,
  fallback,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  testid: string;
  fallback: string;
}) {
  const pickerValue = colorInputValue(value, fallback);
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium leading-none">{label}</label>
      <div className="flex items-center gap-3">
        <label className="relative h-11 w-14 shrink-0 cursor-pointer overflow-hidden rounded-xl border border-border" style={{ background: pickerValue }}>
          <input
            type="color"
            value={pickerValue}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
        </label>
        <Input value={value} onChange={(e) => onChange(e.target.value)} data-testid={testid} className="font-mono uppercase" placeholder={fallback} />
      </div>
    </div>
  );
}
