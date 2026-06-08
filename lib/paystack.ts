import "server-only";

import { z } from "zod";

type InitPayload = {
  email: string;
  amount: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
};

const initializeResponseSchema = z.object({
  status: z.boolean(),
  message: z.string(),
  data: z
    .object({
      authorization_url: z.string().url(),
      access_code: z.string(),
      reference: z.string(),
    })
    .optional(),
});

const verifyResponseSchema = z.object({
  status: z.boolean(),
  message: z.string(),
  data: z
    .object({
      reference: z.string(),
      status: z.string(),
      amount: z.number(),
      currency: z.string(),
      gateway_response: z.string().optional(),
    })
    .optional(),
});

function getSecretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is missing");
  return key;
}

export function getAppUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000")
  );
}

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit,
  timeoutMs = 15000,
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
      cache: "no-store",
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function initializePaystackTransaction(payload: InitPayload) {
  const safePayload = {
    email: payload.email.trim().toLowerCase(),
    amount: Math.trunc(payload.amount),
    reference: payload.reference.trim(),
    callback_url: payload.callbackUrl,
    metadata: payload.metadata || {},
  };

  const response = await fetchWithTimeout(
    "https://api.paystack.co/transaction/initialize",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getSecretKey()}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(safePayload),
    },
  );

  const json = initializeResponseSchema.safeParse(await response.json());

  if (!response.ok || !json.success || !json.data.status || !json.data.data?.authorization_url) {
    throw new Error(
      json.success ? json.data.message : "Could not initialize Paystack transaction",
    );
  }

  return json.data.data;
}

export async function verifyPaystackTransaction(reference: string) {
  const cleanReference = reference.trim();

  if (!cleanReference) {
    throw new Error("Missing transaction reference");
  }

  const response = await fetchWithTimeout(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(cleanReference)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getSecretKey()}`,
        Accept: "application/json",
      },
    },
  );

  const json = verifyResponseSchema.safeParse(await response.json());

  if (!response.ok || !json.success || !json.data.status || !json.data.data) {
    throw new Error(
      json.success ? json.data.message : "Could not verify Paystack transaction",
    );
  }

  return json.data.data;
}