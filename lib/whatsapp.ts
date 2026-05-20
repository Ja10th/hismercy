type NewOrderNotification = {
  orderCode: string;
  fullName: string;
  email: string;
  phone: string;
  total: number;
  deliveryMethod: string;
  items: {
    name: string;
    qty: number;
  }[];
};

function formatNaira(amountInKobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amountInKobo / 100);
}

export async function sendWhatsAppNewOrderNotification(
  order: NewOrderNotification,
) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const notifyTo = process.env.WHATSAPP_NOTIFY_TO;

  if (!phoneNumberId || !accessToken || !notifyTo) {
    return;
  }

  const body =
    `New paid order received\n` +
    `Order: ${order.orderCode}\n` +
    `Name: ${order.fullName}\n` +
    `Email: ${order.email}\n` +
    `Phone: ${order.phone}\n` +
    `Delivery: ${order.deliveryMethod}\n` +
    `Total: ${formatNaira(order.total)}\n` +
    `Items: ${order.items
      .map((item) => `${item.name} x${item.qty}`)
      .join(", ")}`;

  await fetch(
    `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: notifyTo,
        type: "text",
        text: {
          preview_url: false,
          body,
        },
      }),
    },
  );
}