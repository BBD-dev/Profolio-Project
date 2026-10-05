import { Resend } from "resend";
import { env, emailEnabled } from "../config/env";
import { Settings } from "../models/Settings";

const resend = emailEnabled ? new Resend(env.email.resendApiKey) : null;

const BRAND = {
  navy: "#0A1330",
  lime: "#C8D62B",
  limeInk: "#3F4600",
  text: "#111827",
  muted: "#6B7280",
  border: "#E5E7EB",
  bg: "#F4F5F7",
};

type SendResult = { sent: boolean; id?: string; reason?: string };

async function platformName(): Promise<string> {
  try {
    const s = await Settings.findOne().select("platformName").lean();
    return (s as { platformName?: string } | null)?.platformName || "BBD PROFOLIO";
  } catch {
    return "BBD PROFOLIO";
  }
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function layout(opts: {
  preheader: string;
  title: string;
  intro: string;
  bodyHtml: string;
  cta?: { label: string; url: string };
  footerNote?: string;
  platform: string;
}): string {
  const { preheader, title, intro, bodyHtml, cta, footerNote, platform } = opts;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${BRAND.text};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.bg};padding:32px 12px;">
  <tr>
    <td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid ${BRAND.border};">
        <tr>
          <td style="background:${BRAND.navy};padding:28px 32px;">
            <p style="margin:0;color:#ffffff;font-weight:700;font-size:15px;letter-spacing:0.6px;">${escapeHtml(platform.toUpperCase())}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 32px 8px 32px;">
            <p style="margin:0 0 8px 0;font-size:12px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:${BRAND.limeInk};">BBD Select</p>
            <h1 style="margin:0 0 14px 0;font-size:24px;line-height:1.3;font-weight:800;color:${BRAND.navy};">${escapeHtml(title)}</h1>
            <p style="margin:0;font-size:16px;line-height:1.65;color:${BRAND.text};">${intro}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px 8px 32px;font-size:15px;line-height:1.65;color:${BRAND.text};">
            ${bodyHtml}
          </td>
        </tr>
        ${
          cta
            ? `<tr>
          <td style="padding:20px 32px 12px 32px;">
            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr>
                <td style="border-radius:12px;background:${BRAND.navy};">
                  <a href="${cta.url}" style="display:inline-block;padding:14px 26px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:12px;">${escapeHtml(cta.label)}</a>
                </td>
              </tr>
            </table>
            <p style="margin:14px 0 0 0;font-size:12px;color:${BRAND.muted};word-break:break-all;">Or copy this link: <a href="${cta.url}" style="color:${BRAND.navy};">${cta.url}</a></p>
          </td>
        </tr>`
            : ""
        }
        <tr>
          <td style="padding:24px 32px 32px 32px;">
            <hr style="border:none;border-top:1px solid ${BRAND.border};margin:0 0 18px 0;">
            <p style="margin:0 0 6px 0;font-size:13px;line-height:1.6;color:${BRAND.muted};">${footerNote ? escapeHtml(footerNote) : "You are receiving this email because you applied for a graduate profile on " + escapeHtml(platform) + "."}</p>
            <p style="margin:0;font-size:13px;color:${BRAND.muted};">&copy; ${new Date().getFullYear()} BBD Select &middot; A division of BBD Agency</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

async function send(to: string, subject: string, html: string, text: string): Promise<SendResult> {
  if (!resend) {
    console.info(`[email] skipped (not configured) → ${to}: ${subject}`);
    return { sent: false, reason: "not_configured" };
  }
  try {
    const { data, error } = await resend.emails.send({
      from: env.email.from,
      to,
      subject,
      html,
      text,
      ...(env.email.replyTo ? { replyTo: env.email.replyTo } : {}),
    });
    if (error) {
      console.error(`[email] failed → ${to}: ${error.message}`);
      return { sent: false, reason: error.message };
    }
    return { sent: true, id: data?.id };
  } catch (err) {
    console.error(`[email] error → ${to}:`, err);
    return { sent: false, reason: err instanceof Error ? err.message : "unknown" };
  }
}

function firstName(fullName: string): string {
  return (fullName || "").trim().split(/\s+/)[0] || "there";
}

export async function sendApprovalEmail(user: { email: string; fullName: string }): Promise<SendResult> {
  const platform = await platformName();
  const name = firstName(user.fullName);
  const subject = `You're approved — welcome to ${platform}`;

  const bodyHtml = `
    <p style="margin:0 0 14px 0;">Your graduate profile has been reviewed and <strong>approved</strong> by the BBD Select team. You now have a verified profile on ${escapeHtml(platform)}.</p>
    <p style="margin:0 0 14px 0;">Open the <strong>${escapeHtml(platform)}</strong> app on your phone and log in with the same email and password you used to register. There is no website to visit.</p>
    <p style="margin:0 0 10px 0;font-weight:700;color:${BRAND.navy};">What you can do now</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 6px 0;">
      ${[
        "Open the app and log in with your email and password",
        "Complete your profile: photo, headline, bio and skills",
        "Add your links and upload your CV",
        "Showcase the projects you built during your training",
      ]
        .map(
          (item) => `<tr>
        <td style="width:22px;vertical-align:top;padding:4px 0;"><span style="display:inline-block;width:8px;height:8px;border-radius:999px;background:${BRAND.lime};margin-top:7px;"></span></td>
        <td style="padding:4px 0;">${escapeHtml(item)}</td>
      </tr>`,
        )
        .join("")}
    </table>`;

  const html = layout({
    platform,
    preheader: `Hi ${name}, your account is approved. Open the app to log in.`,
    title: `Welcome aboard, ${escapeHtml(name)}!`,
    intro: `Great news — your account has been approved.`,
    bodyHtml,
  });

  const text = [
    `Hi ${name},`,
    ``,
    `Great news — your ${platform} account has been approved by the BBD Select team.`,
    ``,
    `Open the ${platform} app on your phone and log in with the same email and password you used to register. There is no website to visit.`,
    ``,
    `What you can do now:`,
    `- Open the app and log in with your email and password`,
    `- Complete your profile: photo, headline, bio and skills`,
    `- Add your links and upload your CV`,
    `- Showcase the projects you built during your training`,
    ``,
    `— BBD Select, a division of BBD Agency`,
  ].join("\n");

  return send(user.email, subject, html, text);
}

export async function sendChangesRequestedEmail(user: {
  email: string;
  fullName: string;
  adminNote?: string;
}): Promise<SendResult> {
  const platform = await platformName();
  const name = firstName(user.fullName);
  const subject = `Action needed on your ${platform} application`;
  const note = user.adminNote?.trim();

  const bodyHtml = `
    <p style="margin:0 0 14px 0;">We reviewed your application and need a few updates before we can approve your profile.</p>
    ${
      note
        ? `<div style="border-left:4px solid ${BRAND.lime};background:${BRAND.bg};padding:14px 16px;border-radius:0 10px 10px 0;margin:0 0 14px 0;">
      <p style="margin:0 0 4px 0;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${BRAND.muted};">Note from the team</p>
      <p style="margin:0;white-space:pre-wrap;">${escapeHtml(note)}</p>
    </div>`
        : ""
    }
    <p style="margin:0;">Reply to this email with the requested information or contact the BBD Select team, and we'll take another look.</p>`;

  const html = layout({
    platform,
    preheader: `Hi ${name}, we need a few updates on your application.`,
    title: "A few changes are needed",
    intro: `Thanks for applying to ${escapeHtml(platform)}, ${escapeHtml(name)}.`,
    bodyHtml,
  });

  const text = [
    `Hi ${name},`,
    ``,
    `We reviewed your ${platform} application and need a few updates before we can approve your profile.`,
    note ? `\nNote from the team:\n${note}\n` : ``,
    `Reply to this email with the requested information and we'll take another look.`,
    ``,
    `— BBD Select`,
  ].join("\n");

  return send(user.email, subject, html, text);
}

export async function sendRejectedEmail(user: {
  email: string;
  fullName: string;
  adminNote?: string;
}): Promise<SendResult> {
  const platform = await platformName();
  const name = firstName(user.fullName);
  const subject = `Update on your ${platform} application`;
  const note = user.adminNote?.trim();

  const bodyHtml = `
    <p style="margin:0 0 14px 0;">Thank you for your interest in joining ${escapeHtml(platform)}. After reviewing your application, we are unable to approve a graduate profile at this time.</p>
    ${
      note
        ? `<div style="border-left:4px solid ${BRAND.border};background:${BRAND.bg};padding:14px 16px;border-radius:0 10px 10px 0;margin:0 0 14px 0;">
      <p style="margin:0;white-space:pre-wrap;">${escapeHtml(note)}</p>
    </div>`
        : ""
    }
    <p style="margin:0;">If you believe this was a mistake or your situation changes, you're welcome to contact the BBD Select team.</p>`;

  const html = layout({
    platform,
    preheader: `An update on your ${platform} application.`,
    title: "Application update",
    intro: `Hi ${escapeHtml(name)},`,
    bodyHtml,
  });

  const text = [
    `Hi ${name},`,
    ``,
    `Thank you for your interest in ${platform}. After reviewing your application, we are unable to approve a graduate profile at this time.`,
    note ? `\n${note}\n` : ``,
    `If you believe this was a mistake, you're welcome to contact the BBD Select team.`,
    ``,
    `— BBD Select`,
  ].join("\n");

  return send(user.email, subject, html, text);
}
