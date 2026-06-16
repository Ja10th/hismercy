// app/api/contact/route.ts
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { contactSchema } from "@/lib/contact-schema";

export const runtime = "nodejs";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function adminEmailHtml(data: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) {
  return `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:0;background:#f4f7f4;font-family:Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f4f7f4;padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background:#fff;border:1px solid #d7dfd7;border-radius:18px;overflow:hidden;">
            <tr>
              <td style="background:#1a3d1f;padding:28px 32px;color:#fff;">
                <div style="font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#86efac;font-weight:700;">Mercy Agricultural Services</div>
                <div style="font-size:28px;line-height:1.2;margin-top:8px;font-weight:700;">New Contact Message</div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <p style="margin:0 0 18px;color:#334155;font-size:15px;line-height:1.7;">
                  A visitor has sent a message from the website contact form.
                </p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;">
                  <tr><td style="padding:12px 16px;background:#f8fafc;color:#64748b;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;">Name</td><td style="padding:12px 16px;color:#0f172a;font-size:15px;">${escapeHtml(data.name)}</td></tr>
                  <tr><td style="padding:12px 16px;background:#f8fafc;color:#64748b;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;">Email</td><td style="padding:12px 16px;color:#0f172a;font-size:15px;">${escapeHtml(data.email)}</td></tr>
                  <tr><td style="padding:12px 16px;background:#f8fafc;color:#64748b;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;">Phone</td><td style="padding:12px 16px;color:#0f172a;font-size:15px;">${escapeHtml(data.phone || "-")}</td></tr>
                  <tr><td style="padding:12px 16px;background:#f8fafc;color:#64748b;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;">Subject</td><td style="padding:12px 16px;color:#0f172a;font-size:15px;">${escapeHtml(data.subject)}</td></tr>
                  <tr><td style="padding:12px 16px;background:#f8fafc;color:#64748b;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;">Message</td><td style="padding:12px 16px;color:#0f172a;font-size:15px;line-height:1.7;white-space:pre-wrap;">${escapeHtml(data.message)}</td></tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function autoReplyHtml(name: string, subject: string) {
  return `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:0;background:#f4f7f4;font-family:Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f4f7f4;padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background:#fff;border:1px solid #d7dfd7;border-radius:18px;overflow:hidden;">
            <tr>
              <td style="background:#1a3d1f;padding:28px 32px;color:#fff;">
                <div style="font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#86efac;font-weight:700;">Mercy Agricultural Services</div>
                <div style="font-size:28px;line-height:1.2;margin-top:8px;font-weight:700;">We received your message</div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;color:#334155;font-size:15px;line-height:1.8;">
                <p style="margin:0 0 16px;">Hi ${escapeHtml(name)},</p>
                <p style="margin:0 0 16px;">
                  Thanks for reaching out about <strong>${escapeHtml(subject)}</strong>. We have received your message and will get back to you as soon as possible.
                </p>
                <p style="margin:0;">— Mercy Agricultural Services</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      const flattened = parsed.error.flatten();
      return NextResponse.json(
        {
          error: "Please fix the highlighted fields.",
          fieldErrors: flattened.fieldErrors,
        },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const from = process.env.MAIL_FROM || process.env.GMAIL_USER;
    const adminEmail = process.env.SUPPORT_EMAIL || process.env.ADMIN_ORDER_EMAIL;

    if (!from) {
      return NextResponse.json(
        { error: "MAIL_FROM or GMAIL_USER is missing." },
        { status: 500 },
      );
    }

    if (!adminEmail) {
      return NextResponse.json(
        { error: "SUPPORT_EMAIL or ADMIN_ORDER_EMAIL is missing." },
        { status: 500 },
      );
    }

    await transporter.sendMail({
      from,
      to: adminEmail,
      replyTo: data.email,
      subject: `Contact form: ${data.subject}`,
      html: adminEmailHtml(data),
    });

    await transporter.sendMail({
      from,
      to: data.email,
      subject: "We received your message — Mercy Agricultural Services",
      html: autoReplyHtml(data.name, data.subject),
    });

    return NextResponse.json({
      ok: true,
      message: `Thanks ${data.name}. Your message has been sent.`,
    });
  } catch (error) {
    console.error("[contact] send failed", error);
    return NextResponse.json(
      { error: "Could not send your message right now." },
      { status: 500 },
    );
  }
}