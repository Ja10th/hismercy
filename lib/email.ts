import "server-only";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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
    .replace(/'/g, "&#039;");
}

function customerEmailHtml({
  fullName,
  orderCode,
  trackUrl,
  total,
}: {
  fullName: string;
  orderCode: string;
  trackUrl: string;
  total: number;
}) {
  const name = escapeHtml(fullName);
  const code = escapeHtml(orderCode);

  return `
    <div style="margin:0;padding:0;background:#f6f7fb;font-family:Arial,Helvetica,sans-serif;">
      <div style="max-width:680px;margin:0 auto;padding:32px 16px;">
        <div style="background:#0f172a;border-radius:24px 24px 0 0;padding:28px 32px;">
          <div style="font-size:14px;letter-spacing:.14em;text-transform:uppercase;color:#94a3b8;font-weight:700;">
            Mercy Agricultural Services
          </div>
          <h1 style="margin:14px 0 0;font-size:30px;line-height:1.2;color:#ffffff;">
            Order confirmed
          </h1>
          <p style="margin:10px 0 0;font-size:15px;line-height:1.7;color:#cbd5e1;">
            Your payment was successful and your order is now being prepared.
          </p>
        </div>

        <div style="background:#ffffff;padding:32px;border-radius:0 0 24px 24px;border:1px solid #e2e8f0;border-top:none;">
          <p style="margin:0 0 18px;font-size:16px;line-height:1.8;color:#334155;">
            Hello <strong>${name}</strong>,
          </p>

          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:20px;padding:20px 22px;margin:0 0 24px;">
            <div style="display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;">
              <div>
                <div style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.12em;margin-bottom:6px;">
                  Order code
                </div>
                <div style="font-size:18px;font-weight:700;color:#0f172a;">
                  ${code}
                </div>
              </div>

              <div style="text-align:right;">
                <div style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.12em;margin-bottom:6px;">
                  Total paid
                </div>
                <div style="font-size:18px;font-weight:700;color:#0f172a;">
                  ${formatNaira(total)}
                </div>
              </div>
            </div>
          </div>

          <p style="margin:0 0 18px;font-size:15px;line-height:1.8;color:#475569;">
            You can track your order using the button below.
          </p>

          <div style="text-align:center;margin:28px 0 28px;">
            <a
              href="${trackUrl}"
              style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;font-weight:700;padding:14px 24px;border-radius:999px;font-size:15px;"
            >
              Track your order
            </a>
          </div>

          <div style="border-top:1px solid #e2e8f0;padding-top:18px;font-size:13px;line-height:1.7;color:#64748b;">
            If the button does not work, copy this link:
            <br />
            <a href="${trackUrl}" style="color:#16a34a;word-break:break-all;">${trackUrl}</a>
          </div>
        </div>
      </div>
    </div>
  `;
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
  return `
    <div style="margin:0;padding:0;background:#f6f7fb;font-family:Arial,Helvetica,sans-serif;">
      <div style="max-width:680px;margin:0 auto;padding:32px 16px;">
        <div style="background:#111827;border-radius:24px 24px 0 0;padding:28px 32px;">
          <div style="font-size:14px;letter-spacing:.14em;text-transform:uppercase;color:#9ca3af;font-weight:700;">
            New paid order
          </div>
          <h1 style="margin:14px 0 0;font-size:28px;line-height:1.2;color:#ffffff;">
            A customer just paid
          </h1>
        </div>

        <div style="background:#ffffff;padding:32px;border-radius:0 0 24px 24px;border:1px solid #e2e8f0;border-top:none;">
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:20px;padding:20px 22px;">
            <p style="margin:0 0 10px;color:#0f172a;font-size:15px;">
              <strong>Order code:</strong> ${escapeHtml(orderCode)}
            </p>
            <p style="margin:0 0 10px;color:#0f172a;font-size:15px;">
              <strong>Customer:</strong> ${escapeHtml(customerName)}
            </p>
            <p style="margin:0 0 10px;color:#0f172a;font-size:15px;">
              <strong>Email:</strong> ${escapeHtml(customerEmail)}
            </p>
            <p style="margin:0 0 10px;color:#0f172a;font-size:15px;">
              <strong>Phone:</strong> ${escapeHtml(phone)}
            </p>
            <p style="margin:0;color:#0f172a;font-size:15px;">
              <strong>Total:</strong> ${formatNaira(total)}
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
}

export async function sendCustomerOrderEmail(input: {
  email: string;
  fullName: string;
  orderCode: string;
  total: number;
}) {
  const from = process.env.MAIL_FROM || "Mercy Agric <orders@yourdomain.com>";
  const trackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/track-order/${input.orderCode}`;

  return resend.emails.send({
    from,
    to: input.email,
    subject: `Order confirmed - ${input.orderCode}`,
    html: customerEmailHtml({
      fullName: input.fullName,
      orderCode: input.orderCode,
      trackUrl,
      total: input.total,
    }),
  });
}

export async function sendAdminOrderEmail(input: {
  orderCode: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  total: number;
}) {
  const adminEmail = process.env.ADMIN_ORDER_EMAIL;
  if (!adminEmail) {
    throw new Error("ADMIN_ORDER_EMAIL is missing");
  }

  const from = process.env.MAIL_FROM || "Ayokf100@gmail.com";

  return resend.emails.send({
    from,
    to: adminEmail,
    subject: `New paid order - ${input.orderCode}`,
    html: adminEmailHtml(input),
  });
}