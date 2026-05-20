import "server-only";

type InitPayload = {
  email: string;
  amount: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
};

type VerifyResponse = {
  status: boolean;
  message: string;
  data?: {
    reference: string;
    status: string;
    amount: number;
    currency: string;
    gateway_response?: string;
  };
};

function getSecretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is missing");
  return key;
}

export function getAppUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  );
}

export async function initializePaystackTransaction(payload: InitPayload) {
  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: payload.email,
      amount: payload.amount,
      reference: payload.reference,
      callback_url: payload.callbackUrl,
      metadata: payload.metadata || {},
    }),
  });

  const json = (await response.json()) as {
    status: boolean;
    message: string;
    data?: {
      authorization_url: string;
      access_code: string;
      reference: string;
    };
  };

  if (!response.ok || !json.status || !json.data?.authorization_url) {
    throw new Error(json.message || "Could not initialize Paystack transaction");
  }

  return json.data;
}

export async function verifyPaystackTransaction(reference: string) {
  const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
    },
  });

  const json = (await response.json()) as VerifyResponse;

  if (!response.ok || !json.status || !json.data) {
    throw new Error(json.message || "Could not verify Paystack transaction");
  }

  return json.data;
}