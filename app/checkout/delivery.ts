// lib/delivery.ts
export const ORIGIN_STATE = "Ekiti";
export const ORIGIN_CITY = "Ado-Ekiti";

export const SAME_EKITI_FEE_PER_BAG = 30000; // ₦300 in kobo
export const OUTSIDE_EKITI_FEE_PER_BAG = 50000; // ₦500 in kobo

export type CheckoutDeliveryMethod = "pickup" | "delivery";
export type DeliveryZone = "pickup" | "same_city" | "same_state" | "outside_state";

type DeliveryZoneSettings = {
  feePerBag: number;
  minBags: number;
  recommendedMaxBags: number;
  quoteAfterReview?: boolean;
};

export type DeliverySettings = {
  originState: string;
  originCity: string;
  pickupEnabled: boolean;
  zones: {
    same_city: DeliveryZoneSettings;
    same_state: DeliveryZoneSettings;
    outside_state: DeliveryZoneSettings;
  };
};

export type DeliveryRate = {
  label: string;
  note: string;
  feePerBag: number;
  minBags: number;
  recommendedMaxBags: number;
  quoteAfterReview?: boolean;
};

export type DeliveryRates = Record<DeliveryZone, DeliveryRate>;

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function buildDeliveryRates(settings?: DeliverySettings): DeliveryRates {
  const originState = settings?.originState?.trim() || ORIGIN_STATE;
  const originCity = settings?.originCity?.trim() || ORIGIN_CITY;

  return {
    pickup: {
      label: "Pickup",
      note: "Pick up from store",
      feePerBag: 0,
      minBags: 0,
      recommendedMaxBags: 0,
    },
    same_city: {
      label: originCity,
      note: `Within ${originCity}`,
      feePerBag: settings?.zones.same_city.feePerBag ?? SAME_EKITI_FEE_PER_BAG,
      minBags: settings?.zones.same_city.minBags ?? 15,
      recommendedMaxBags: settings?.zones.same_city.recommendedMaxBags ?? 20,
    },
    same_state: {
      label: `Other ${originState} cities`,
      note: `Within ${originState}`,
      feePerBag: settings?.zones.same_state.feePerBag ?? SAME_EKITI_FEE_PER_BAG,
      minBags: settings?.zones.same_state.minBags ?? 200,
      recommendedMaxBags: settings?.zones.same_state.recommendedMaxBags ?? 500,
    },
    outside_state: {
      label: `Outside ${originState}`,
      note: settings?.zones.outside_state.quoteAfterReview
        ? "Quote after review"
        : "Quote may adjust after review",
      feePerBag:
        settings?.zones.outside_state.feePerBag ?? OUTSIDE_EKITI_FEE_PER_BAG,
      minBags: settings?.zones.outside_state.minBags ?? 300,
      recommendedMaxBags: settings?.zones.outside_state.recommendedMaxBags ?? 600,
      quoteAfterReview: settings?.zones.outside_state.quoteAfterReview ?? false,
    },
  };
}

export function getDeliveryZone(
  state: string,
  city: string,
  originState: string = ORIGIN_STATE,
  originCity: string = ORIGIN_CITY,
): Exclude<DeliveryZone, "pickup"> {
  const normalizedState = normalize(state);
  const normalizedCity = normalize(city);

  if (!normalizedState || !normalizedCity) {
    return "same_city";
  }

  if (normalizedState !== normalize(originState)) {
    return "outside_state";
  }

  if (normalizedCity === normalize(originCity)) {
    return "same_city";
  }

  return "same_state";
}

export function calculateDeliveryFee(
  method: CheckoutDeliveryMethod,
  state: string,
  city: string,
  bagCount: number,
  settings?: DeliverySettings,
) {
  if (method === "pickup") return 0;

  const rates = buildDeliveryRates(settings);
  const zone = getDeliveryZone(
    state,
    city,
    settings?.originState ?? ORIGIN_STATE,
    settings?.originCity ?? ORIGIN_CITY,
  );

  return rates[zone].feePerBag * bagCount;
}

export function getDeliveryRequirementMessage(
  method: CheckoutDeliveryMethod,
  state: string,
  city: string,
  bagCount: number,
  settings?: DeliverySettings,
) {
  if (method === "pickup") return null;

  const rates = buildDeliveryRates(settings);
  const zone = getDeliveryZone(
    state,
    city,
    settings?.originState ?? ORIGIN_STATE,
    settings?.originCity ?? ORIGIN_CITY,
  );

  const rule = rates[zone];

  if (bagCount < rule.minBags) {
    return `Minimum order for ${rule.label} is ${rule.minBags} bags. You currently have ${bagCount} bag${bagCount === 1 ? "" : "s"}.`;
  }

  return null;
}

export function getDeliverySummary(
  method: CheckoutDeliveryMethod,
  state: string,
  city: string,
  settings?: DeliverySettings,
) {
  const rates = buildDeliveryRates(settings);

  if (method === "pickup") {
    return rates.pickup;
  }

  const zone = getDeliveryZone(
    state,
    city,
    settings?.originState ?? ORIGIN_STATE,
    settings?.originCity ?? ORIGIN_CITY,
  );

  return rates[zone];
}

export function formatNaira(amountInKobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amountInKobo / 100);
}