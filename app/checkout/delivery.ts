import { z } from "zod";

// ─── Static defaults ──────────────────────────────────────────────────────────
// These are used as fallbacks in the checkout UI and anywhere that doesn't
// have access to DB settings at render time. The API route always overrides
// these with the live values from getAppSettings().
export const ORIGIN_STATE = "Ekiti";
export const ORIGIN_CITY = "Ado-Ekiti";

export const SAME_EKITI_FEE_PER_BAG = 30000;  // ₦300 in kobo
export const OUTSIDE_EKITI_FEE_PER_BAG = 50000; // ₦500 in kobo

export const deliveryRates = {
  pickup: {
    label: "Pickup",
    note: "Pick up from store",
    feePerBag: 0,
    minBags: 0,
    recommendedMaxBags: 0,
  },
  same_city: {
    label: "Ado-Ekiti",
    note: `Within ${ORIGIN_CITY}`,
    feePerBag: SAME_EKITI_FEE_PER_BAG,
    minBags: 15,
    recommendedMaxBags: 20,
  },
  same_state: {
    label: "other city in Ekiti",
    note: `Within ${ORIGIN_STATE}`,
    feePerBag: SAME_EKITI_FEE_PER_BAG,
    minBags: 200,
    recommendedMaxBags: 500,
  },
  outside_state: {
    label: "outside Ekiti",
    note: "Quote may adjust after review",
    feePerBag: OUTSIDE_EKITI_FEE_PER_BAG,
    minBags: 300,
    recommendedMaxBags: 600,
  },
} as const;

export type CheckoutDeliveryMethod = "pickup" | "delivery";
export type DeliveryZone = Exclude<keyof typeof deliveryRates, "pickup">;

function normalize(value: string) {
  return value.trim().toLowerCase();
}

// ─── getDeliveryZone ──────────────────────────────────────────────────────────
// originState and originCity default to the hardcoded constants so every
// existing call site (checkout form, display helpers, tests) keeps working
// with no changes.
//
// The API route passes the live DB values:
//   getDeliveryZone(state, city, settings.delivery.originState, settings.delivery.originCity)
//
// This means a rate/origin change in the admin panel is reflected immediately
// in server-side fee calculations without a redeployment.
export function getDeliveryZone(
  state: string,
  city: string,
  originState: string = ORIGIN_STATE,
  originCity: string = ORIGIN_CITY,
): DeliveryZone {
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
  originState: string = ORIGIN_STATE,
  originCity: string = ORIGIN_CITY,
) {
  if (method === "pickup") return 0;

  const zone = getDeliveryZone(state, city, originState, originCity);
  return deliveryRates[zone].feePerBag * bagCount;
}

export function getDeliveryRequirementMessage(
  method: CheckoutDeliveryMethod,
  state: string,
  city: string,
  bagCount: number,
  originState: string = ORIGIN_STATE,
  originCity: string = ORIGIN_CITY,
) {
  if (method === "pickup") return null;

  const zone = getDeliveryZone(state, city, originState, originCity);
  const rule = deliveryRates[zone];

  if (bagCount < rule.minBags) {
    return `Minimum order for ${rule.label} is ${rule.minBags} bags. You currently have ${bagCount} bag${bagCount === 1 ? "" : "s"}.`;
  }

  return null;
}

export function getDeliverySummary(
  method: CheckoutDeliveryMethod,
  state: string,
  city: string,
  originState: string = ORIGIN_STATE,
  originCity: string = ORIGIN_CITY,
) {
  if (method === "pickup") {
    return deliveryRates.pickup;
  }

  const zone = getDeliveryZone(state, city, originState, originCity);
  return deliveryRates[zone];
}

export function formatNaira(amountInKobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amountInKobo / 100);
}