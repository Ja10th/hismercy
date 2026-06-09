import "server-only";

import nodemailer from "nodemailer";
import { joinAppUrl } from "./paystack";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

function formatNaira(amountInKobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amountInKobo / 100);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function customerEmailHtml({
  fullName,
  orderCode,
  orderUrl,
  total,
}: {
  fullName: string;
  orderCode: string;
  orderUrl: string;
  total: number;
}) {
  const name = escapeHtml(fullName);
  const code = escapeHtml(orderCode);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Order Confirmed — ${code}</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f2f0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f0f2f0;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <!-- Outer card -->
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #d1d5d1;">

          <!-- Header bar: dark green with left accent stripe -->
          <tr>
            <td style="background:#1a3d1f;padding:0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <!-- Left accent stripe -->
                  <td width="6" style="background:#4ade80;">&nbsp;</td>
                  <td style="padding:28px 32px 26px;">
                    <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#4ade80;">Mercy Agricultural Services</p>
                    <h1 style="margin:10px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:400;color:#ffffff;line-height:1.15;">Order Confirmed</h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Thin rule -->
          <tr>
            <td style="background:#4ade80;height:2px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Body -->
          <td style="padding:36px 32px 0;">
            <p style="margin:0 0 24px;font-family:Arial,sans-serif;font-size:15px;line-height:1.75;color:#1a1a1a;">
              Dear <strong>${name}</strong>,
            </p>
            <p style="margin:0 0 32px;font-family:Arial,sans-serif;font-size:15px;line-height:1.75;color:#3d3d3d;">
              Thank you for your purchase. Your payment has been received and your order is now being processed.
              Please keep your order code for your records.
            </p>

            <!-- Order summary box -->
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #d1d5d1;margin-bottom:32px;">
              <!-- Box header -->
              <tr>
                <td colspan="2" style="background:#f5f7f5;padding:12px 20px;border-bottom:1px solid #d1d5d1;">
                  <p style="margin:0;font-family:Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#6b7280;">Order Summary</p>
                </td>
              </tr>
              <!-- Order code -->
              <tr>
                <td style="padding:18px 20px 14px;border-bottom:1px solid #ebebeb;font-family:Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#6b7280;width:44%;vertical-align:top;">
                  Order Code
                </td>
                <td style="padding:18px 20px 14px;border-bottom:1px solid #ebebeb;font-family:'Courier New',Courier,monospace;font-size:17px;font-weight:700;color:#1a1a1a;vertical-align:top;">
                  ${code}
                </td>
              </tr>
              <!-- Total -->
              <tr>
                <td style="padding:14px 20px 18px;font-family:Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#6b7280;vertical-align:top;">
                  Total Paid
                </td>
                <td style="padding:14px 20px 18px;font-family:Arial,sans-serif;font-size:20px;font-weight:700;color:#1a3d1f;vertical-align:top;">
                  ${formatNaira(total)}
                </td>
              </tr>
            </table>

            <!-- CTA button -->
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:36px;">
              <tr>
                <td style="background:#1a3d1f;">
                  <a href="${orderUrl}"
                    style="display:inline-block;padding:14px 28px;font-family:Arial,sans-serif;font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#ffffff;text-decoration:none;background:#1a3d1f;">
                    View Your Order &rarr;
                  </a>
                </td>
              </tr>
            </table>

            <!-- Fallback link -->
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-top:1px solid #e5e7e5;margin-bottom:36px;">
              <tr>
                <td style="padding-top:20px;">
                  <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:12px;color:#6b7280;">If the button above does not work, copy and paste this link into your browser:</p>
                  <a href="${orderUrl}" style="font-family:'Courier New',Courier,monospace;font-size:12px;color:#1a3d1f;word-break:break-all;">${orderUrl}</a>
                </td>
              </tr>
            </table>
          </td>

          <!-- Footer -->
          <tr>
            <td style="background:#f5f7f5;border-top:1px solid #d1d5d1;padding:20px 32px;">
              <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;line-height:1.6;color:#9ca3af;">
                This is an automated confirmation. Please do not reply to this email.<br />
                &copy; Mercy Agricultural Services. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
        <!-- /Outer card -->

      </td>
    </tr>
  </table>
</body>
</html>`;
}

function adminEmailHtml({
  orderCode,
  customerName,
  customerEmail,
  phone,
  total,
}: {
  orderCode: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  total: number;
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>New Paid Order — ${escapeHtml(orderCode)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f2f4;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f0f2f4;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <!-- Outer card -->
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #cbd5e1;">

          <!-- Header -->
          <tr>
            <td style="background:#0f172a;padding:0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td width="6" style="background:#f59e0b;">&nbsp;</td>
                  <td style="padding:28px 32px 26px;">
                    <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#f59e0b;">Admin Notification</p>
                    <h1 style="margin:10px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:400;color:#ffffff;line-height:1.15;">New Paid Order</h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Thin rule -->
          <tr>
            <td style="background:#f59e0b;height:2px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 32px 0;">
              <p style="margin:0 0 28px;font-family:Arial,sans-serif;font-size:15px;line-height:1.75;color:#334155;">
                A customer has completed payment. Review the details below.
              </p>

              <!-- Details table -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #cbd5e1;margin-bottom:36px;">
                <tr>
                  <td colspan="2" style="background:#f8fafc;padding:12px 20px;border-bottom:1px solid #cbd5e1;">
                    <p style="margin:0;font-family:Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#64748b;">Customer &amp; Order Details</p>
                  </td>
                </tr>

                <!-- Order code -->
                <tr style="border-bottom:1px solid #e2e8f0;">
                  <td style="padding:14px 20px;width:40%;font-family:Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#64748b;vertical-align:top;border-bottom:1px solid #e2e8f0;">Order Code</td>
                  <td style="padding:14px 20px;font-family:'Courier New',Courier,monospace;font-size:15px;font-weight:700;color:#0f172a;vertical-align:top;border-bottom:1px solid #e2e8f0;">${escapeHtml(orderCode)}</td>
                </tr>

                <!-- Customer name -->
                <tr>
                  <td style="padding:14px 20px;font-family:Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#64748b;vertical-align:top;border-bottom:1px solid #e2e8f0;">Customer</td>
                  <td style="padding:14px 20px;font-family:Arial,sans-serif;font-size:15px;color:#0f172a;vertical-align:top;border-bottom:1px solid #e2e8f0;">${escapeHtml(customerName)}</td>
                </tr>

                <!-- Email -->
                <tr>
                  <td style="padding:14px 20px;font-family:Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#64748b;vertical-align:top;border-bottom:1px solid #e2e8f0;">Email</td>
                  <td style="padding:14px 20px;font-family:Arial,sans-serif;font-size:15px;color:#0f172a;vertical-align:top;border-bottom:1px solid #e2e8f0;">
                    <a href="mailto:${escapeHtml(customerEmail)}" style="color:#0f172a;text-decoration:underline;">${escapeHtml(customerEmail)}</a>
                  </td>
                </tr>

                <!-- Phone -->
                <tr>
                  <td style="padding:14px 20px;font-family:Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#64748b;vertical-align:top;border-bottom:1px solid #e2e8f0;">Phone</td>
                  <td style="padding:14px 20px;font-family:Arial,sans-serif;font-size:15px;color:#0f172a;vertical-align:top;border-bottom:1px solid #e2e8f0;">${escapeHtml(phone)}</td>
                </tr>

                <!-- Total — highlighted -->
                <tr>
                  <td style="padding:16px 20px;font-family:Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#64748b;vertical-align:middle;background:#f8fafc;">Total Paid</td>
                  <td style="padding:16px 20px;font-family:Arial,sans-serif;font-size:22px;font-weight:700;color:#1a3d1f;vertical-align:middle;background:#f8fafc;">${formatNaira(total)}</td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;border-top:1px solid #cbd5e1;padding:20px 32px;">
              <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;line-height:1.6;color:#94a3b8;">
                Sent automatically by Mercy Agricultural Services order system.<br />
                Do not forward or share this notification.
              </p>
            </td>
          </tr>

        </table>
        <!-- /Outer card -->

      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendCustomerOrderEmail(input: {
  email: string;
  fullName: string;
  orderCode: string;
  total: number;
}) {
  const from = process.env.MAIL_FROM || process.env.GMAIL_USER;
  if (!from) throw new Error("MAIL_FROM or GMAIL_USER is missing");

  const orderUrl = joinAppUrl(
    `/my-orders/search?email=${encodeURIComponent(input.email)}&orderCode=${encodeURIComponent(input.orderCode)}`,
  );

  console.log("[email] sending customer email", {
    to: input.email,
    from,
    orderUrl,
  });

  const info = await transporter.sendMail({
    from,
    to: input.email,
    subject: `Order confirmed — ${input.orderCode}`,
    html: customerEmailHtml({
      fullName: input.fullName,
      orderCode: input.orderCode,
      orderUrl,
      total: input.total,
    }),
  });

  console.log("[email] customer email sent", {
    messageId: info.messageId,
    accepted: info.accepted,
    rejected: info.rejected,
  });

  return info;
}

export async function sendAdminOrderEmail(input: {
  orderCode: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  total: number;
}) {
  const adminEmail = process.env.ADMIN_ORDER_EMAIL;
  if (!adminEmail) throw new Error("ADMIN_ORDER_EMAIL is missing");

  const from = process.env.MAIL_FROM || process.env.GMAIL_USER;
  if (!from) throw new Error("MAIL_FROM or GMAIL_USER is missing");

  console.log("[email] sending admin email", {
    to: adminEmail,
    from,
    orderCode: input.orderCode,
  });

  const info = await transporter.sendMail({
    from,
    to: adminEmail,
    subject: `New paid order — ${input.orderCode}`,
    html: adminEmailHtml(input),
  });

  console.log("[email] admin email sent", {
    messageId: info.messageId,
    accepted: info.accepted,
    rejected: info.rejected,
  });

  return info;
}