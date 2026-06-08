"use client";

import Link from "next/link";
import Image from "next/image";
import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ArrowLeft,
  ChevronDown,
  Mail,
  Phone,
  ShoppingBag,
  User,
} from "lucide-react";
import { useCart } from "../components/cart/CartProvider";
import {
  formatNaira,
  getDeliveryZone,
  ORIGIN_STATE,
  deliveryRates,
} from "./delivery";
import { citiesByState, nigerianStates } from "./locations";
import { checkoutCustomerSchema, checkoutRequestSchema } from "./schema";

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  landmark: string;
  notes: string;
};

type CheckoutItem = {
  id: string;
  name: string;
  qty: number;
  price: number;
  imageUrl?: string;
  image?: string;
  images?: { url: string }[];
};

type FieldName = keyof FormState;
type ErrorState = Partial<Record<FieldName | "deliveryMethod" | "items", string>>;

const customerFieldKeys: FieldName[] = [
  "fullName",
  "email",
  "phone",
  "street",
  "city",
  "state",
  "landmark",
  "notes",
];

const STORAGE_KEY = "checkout_customer_details_v1";

function getItemImage(item: CheckoutItem) {
  return item.imageUrl || item.image || item.images?.[0]?.url || "/bags.png";
}

function shorten(text: string, max = 34) {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}...`;
}

function zoneLabel(state: string, city: string) {
  const zone = getDeliveryZone(state, city);

  switch (zone) {
    case "same_city":
      return `Ado-Ekiti, ${ORIGIN_STATE}`;
    case "same_state":
      return `Other city in ${ORIGIN_STATE}`;
    case "outside_state":
      return "Outside Ekiti";
    default:
      return `Ado-Ekiti, ${ORIGIN_STATE}`;
  }
}

function mapCustomerErrors(form: FormState) {
  const parsed = checkoutCustomerSchema.safeParse(form);

  if (parsed.success) return {};

  const nextErrors: Partial<Record<FieldName, string>> = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path[0] as FieldName | undefined;
    if (key) nextErrors[key] = issue.message;
  }

  return nextErrors;
}

function replaceCustomerErrors(
  current: ErrorState,
  nextCustomerErrors: Partial<Record<FieldName, string>>,
): ErrorState {
  const next: ErrorState = { ...current };

  for (const key of customerFieldKeys) {
    delete next[key];
  }

  return {
    ...next,
    ...nextCustomerErrors,
  };
}

function emptyForm(): FormState {
  return {
    fullName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    landmark: "",
    notes: "",
  };
}

export default function CheckoutPage() {
  const { items, subtotal } = useCart();
  const cartItems = items as CheckoutItem[];
  const bagCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

  const [loading, setLoading] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "delivery">(
    "delivery",
  );
  const [errors, setErrors] = useState<ErrorState>({});
  const [touched, setTouched] = useState<Record<FieldName, boolean>>({
    fullName: false,
    email: false,
    phone: false,
    street: false,
    city: false,
    state: false,
    landmark: false,
    notes: false,
  });

  const [form, setForm] = useState<FormState>(emptyForm);
  const [saveDetails, setSaveDetails] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [showDeliveryDetails, setShowDeliveryDetails] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<FormState>;
        setForm((current) => ({
          ...current,
          ...Object.fromEntries(
            Object.entries(parsed).filter(
              ([, value]) => typeof value === "string",
            ),
          ),
        }));
        setSaveDetails(true);
      }
    } catch (error) {
      console.error("Failed to load saved checkout details", error);
    } finally {
      setHydrated(true);
    }
  }, []);

  const deliveryZone = useMemo(() => {
    return getDeliveryZone(form.state, form.city);
  }, [form.state, form.city]);

  const deliveryFee = useMemo(() => {
    if (deliveryMethod === "pickup") return 0;
    return deliveryRates[deliveryZone].feePerBag * bagCount;
  }, [deliveryMethod, deliveryZone, bagCount]);

  const deliveryRuleMessage = useMemo(() => {
    if (deliveryMethod === "pickup") return null;
    const minimum = deliveryRates[deliveryZone].minBags;

    if (bagCount < minimum) {
      return `Minimum order for ${deliveryRates[deliveryZone].label} is ${minimum} bags. You currently have ${bagCount} bag${bagCount === 1 ? "" : "s"}.`;
    }

    return null;
  }, [deliveryMethod, deliveryZone, bagCount]);

  const total = subtotal + deliveryFee;

  const validateLive = (nextForm: FormState) => {
    const nextCustomerErrors = mapCustomerErrors(nextForm);
    setErrors((current) => replaceCustomerErrors(current, nextCustomerErrors));
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    const fieldName = name as FieldName;

    setForm((current) => {
      const next = { ...current, [name]: value } as FormState;
      validateLive(next);

      if (saveDetails && hydrated) {
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch (error) {
          console.error("Failed to save checkout details", error);
        }
      }

      return next;
    });

    if (fieldName in touched) {
      setTouched((current) => ({ ...current, [fieldName]: true }));
    }
  };

  const handleBlur = (name: FieldName) => {
    setTouched((current) => ({ ...current, [name]: true }));
    validateLive(form);
  };

  const handleSaveDetailsChange = (checked: boolean) => {
    setSaveDetails(checked);

    if (!checked) {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.error("Failed to clear saved checkout details", error);
      }
    } else {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
      } catch (error) {
        console.error("Failed to save checkout details", error);
      }
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (cartItems.length === 0 || loading) return;

    const payload = {
      customer: form,
      deliveryMethod,
      items: cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        qty: item.qty,
        price: item.price,
        imageUrl: getItemImage(item),
      })),
    };

    const parsed = checkoutRequestSchema.safeParse(payload);

    if (!parsed.success) {
      const nextErrors: ErrorState = {};

      for (const issue of parsed.error.issues) {
        const first = issue.path[0];

        if (first === "customer") {
          const field = issue.path[1] as FieldName | undefined;
          if (field) nextErrors[field] = issue.message;
        } else if (first === "deliveryMethod") {
          nextErrors.deliveryMethod = issue.message;
        } else if (first === "items") {
          nextErrors.items = issue.message;
        }
      }

      setErrors(nextErrors);
      setTouched({
        fullName: true,
        email: true,
        phone: true,
        street: true,
        city: true,
        state: true,
        landmark: true,
        notes: true,
      });
      return;
    }

    if (deliveryRuleMessage) {
      setErrors((current) => ({
        ...current,
        items: deliveryRuleMessage,
      }));
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const response = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsed.data),
      });

      const data = (await response.json()) as {
        ok: boolean;
        authorizationUrl?: string;
        orderCode?: string;
        error?: string;
      };

      if (!response.ok || !data.ok || !data.authorizationUrl) {
        throw new Error(data.error || "Could not initialize payment");
      }

      if (saveDetails) {
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
        } catch (error) {
          console.error("Failed to save checkout details", error);
        }
      }

      window.location.href = data.authorizationUrl;
    } catch (error) {
      console.error(error);
      alert("Something went wrong while starting payment.");
    } finally {
      setLoading(false);
    }
  };

  const showError = (field: FieldName) => touched[field] && errors[field];

  const cityOptions =
    form.state && citiesByState[form.state] ? citiesByState[form.state] : [];

  const submitDisabled =
    cartItems.length === 0 || loading || Boolean(deliveryRuleMessage);

  return (
    <main className="lg:h-screen lg:overflow-hidden">
      <section className="lg:h-screen lg:overflow-hidden">
        <div className="grid min-h-screen grid-cols-1 bg-[#171717] lg:h-screen lg:overflow-hidden lg:grid-cols-2">
          <aside className="relative px-5 py-6 text-white sm:px-7 lg:h-screen lg:overflow-y-auto lg:px-14 lg:py-10">
              <div className="absolute inset-0">
                    <Image
                      src="/footerbg.jpeg"
                      alt=""
                      fill
                      className="object-cover opacity-15"
                      priority={false}
                    />
                    <div className="absolute inset-0 bg-emerald-950/40" />
                  </div>
            
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 py-2 text-sm font-medium text-white backdrop-blur transition hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>

            <div className="mt-8 z-100">
              <p className="text-sm/6 text-white/85">Amount Due</p>
              <div className="mt-1 flex items-end gap-2">
                <h1 className="text-2xl font-semibold text-white tracking-tight sm:text-4xl">
                  {formatNaira(total)}
                </h1>
              </div>
            </div>

            <div className="mt-8">
              <div className="mt-4 space-y-3">
                {cartItems.length === 0 ? (
                  <div className="rounded-[22px] border border-white/15 bg-white/10 p-4 text-sm text-white/80">
                    Your cart is empty.
                  </div>
                ) : (
                  cartItems.map((item) => {
                    const imageUrl = getItemImage(item);

                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 border-b border-white/15 p-3 backdrop-blur"
                      >
                        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white">
                          <img
                            src={imageUrl}
                            alt={item.name}
                            className="h-16 w-full object-cover"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-white">
                            {shorten(item.name, 28)}
                          </p>
                          <p className="text-xs text-white/70">Qty {item.qty}</p>
                        </div>

                        <p className="shrink-0 text-sm font-medium text-white md:text-lg">
                          {formatNaira(item.price * item.qty)}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="mt-8 p-5 backdrop-blur">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/80">Subtotal</span>
                  <span className="font-medium">{formatNaira(subtotal)}</span>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-white/80">Delivery</span>
                  <span className="font-medium">
                    {deliveryFee === 0 ? "Free" : formatNaira(deliveryFee)}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="text-white/90">Total</span>
                  <span className="text-lg font-semibold">
                    {formatNaira(total)}
                  </span>
                </div>
              </div>
            </div>
          </aside>

          <div className="bg-white px-8 py-6 sm:px-7 lg:h-screen lg:overflow-y-auto lg:px-14 lg:py-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h2 className="mt-2 text-xl font-semibold tracking-tight">
                  Contact information
                </h2>
              </div>

              <div className="grid gap-6">
                <section className="rounded-3xl">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 sm:col-span-2">
                      <span className="flex items-center gap-2 text-sm font-medium text-neutral-700">
                        <User className="h-4 w-4" />
                        Full name
                      </span>
                      <input
                        name="fullName"
                        value={form.fullName}
                        onChange={handleChange}
                        onBlur={() => handleBlur("fullName")}
                        required
                        autoComplete="name"
                        placeholder="Your full name"
                        className="h-12 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-emerald-200"
                        aria-invalid={Boolean(showError("fullName"))}
                        spellCheck={false}
                      />
                      {showError("fullName") ? (
                        <p className="text-xs text-red-600">{errors.fullName}</p>
                      ) : null}
                    </label>

                    <label className="space-y-2">
                      <span className="flex items-center gap-2 text-sm font-medium text-neutral-700">
                        <Mail className="h-4 w-4" />
                        Email Address
                      </span>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        onBlur={() => handleBlur("email")}
                        required
                        autoComplete="email"
                        placeholder="you@example.com"
                        className="h-12 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-emerald-200"
                        aria-invalid={Boolean(showError("email"))}
                        spellCheck={false}
                        autoCapitalize="none"
                      />
                      {showError("email") ? (
                        <p className="text-xs text-red-600">{errors.email}</p>
                      ) : null}
                    </label>

                    <label className="space-y-2">
                      <span className="flex items-center gap-2 text-sm font-medium text-neutral-700">
                        <Phone className="h-4 w-4" />
                        Phone Number
                      </span>
                      <input
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        onBlur={() => handleBlur("phone")}
                        required
                        autoComplete="tel"
                        inputMode="tel"
                        placeholder="08012345678"
                        className="h-12 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-emerald-200"
                        aria-invalid={Boolean(showError("phone"))}
                        spellCheck={false}
                      />
                      {showError("phone") ? (
                        <p className="text-xs text-red-600">{errors.phone}</p>
                      ) : null}
                    </label>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 sm:col-span-2">
                      <span className="flex items-center gap-2 text-sm font-medium text-neutral-700">
                        Street address
                      </span>
                      <input
                        name="street"
                        value={form.street}
                        onChange={handleChange}
                        onBlur={() => handleBlur("street")}
                        required
                        autoComplete="address-line1"
                        placeholder="House number, street name"
                        className="h-12 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-emerald-200"
                        aria-invalid={Boolean(showError("street"))}
                      />
                      {showError("street") ? (
                        <p className="text-xs text-red-600">{errors.street}</p>
                      ) : null}
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-medium text-neutral-700">
                        State
                      </span>
                      <div className="relative">
                        <select
                          name="state"
                          value={form.state}
                          onChange={handleChange}
                          onBlur={() => handleBlur("state")}
                          required
                          autoComplete="address-level1"
                          className="h-12 w-full appearance-none rounded-xl border border-neutral-200 bg-white px-4 pr-10 text-sm outline-none transition focus:border-emerald-200"
                          aria-invalid={Boolean(showError("state"))}
                        >
                          <option value="">Select state</option>
                          {nigerianStates.map((state) => (
                            <option key={state} value={state}>
                              {state}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                      </div>
                      {showError("state") ? (
                        <p className="text-xs text-red-600">{errors.state}</p>
                      ) : null}
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-medium text-neutral-700">
                        City
                      </span>
                      <div className="relative">
                        <select
                          name="city"
                          value={form.city}
                          onChange={handleChange}
                          onBlur={() => handleBlur("city")}
                          required
                          autoComplete="address-level2"
                          className="h-12 w-full appearance-none rounded-xl border border-neutral-200 bg-white px-4 pr-10 text-sm outline-none transition focus:border-emerald-200"
                          aria-invalid={Boolean(showError("city"))}
                          disabled={!form.state}
                        >
                          <option value="">
                            {form.state ? "Select city" : "Select state first"}
                          </option>
                          {cityOptions.map((city) => (
                            <option key={city} value={city}>
                              {city}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                      </div>
                      {showError("city") ? (
                        <p className="text-xs text-red-600">{errors.city}</p>
                      ) : null}
                    </label>

                    <label className="space-y-2 sm:col-span-2">
                      <span className="text-sm font-medium text-neutral-700">
                        Nearest Landmark
                      </span>
                      <input
                        name="landmark"
                        value={form.landmark}
                        onChange={handleChange}
                        onBlur={() => handleBlur("landmark")}
                        autoComplete="off"
                        placeholder="Nearest bus stop or landmark"
                        className="h-12 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-emerald-200"
                      />
                      {showError("landmark") ? (
                        <p className="text-xs text-red-600">{errors.landmark}</p>
                      ) : null}
                    </label>

                    <label className="space-y-2 sm:col-span-2">
                      <span className="text-sm font-medium text-neutral-700">
                        Order note
                      </span>
                      <textarea
                        name="notes"
                        value={form.notes}
                        onChange={handleChange}
                        onBlur={() => handleBlur("notes")}
                        autoComplete="off"
                        placeholder="Anything we should know?"
                        className="min-h-[110px] w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-emerald-200"
                      />
                      {showError("notes") ? (
                        <p className="text-xs text-red-600">{errors.notes}</p>
                      ) : null}
                    </label>

                    <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-white p-1 sm:col-span-2">
                      <input
                        type="checkbox"
                        checked={saveDetails}
                        onChange={(e) =>
                          handleSaveDetailsChange(e.target.checked)
                        }
                        className="mt-1 h-4 w-4 accent-emerald-700"
                      />
                      <div>
                        <span className="text-sm font-medium text-neutral-900">
                          Save my details for next time
                        </span>
                      </div>
                    </label>
                  </div>
                </section>

                <section className="rounded-xl border border-neutral-200 bg-white p-5">
                  <button
                    type="button"
                    onClick={() => setShowDeliveryDetails((current) => !current)}
                    className="flex w-full items-center justify-between gap-3"
                    aria-expanded={showDeliveryDetails}
                  >
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-neutral-950">
                        Select delivery method
                      </h3>
                    </div>

                    <ChevronDown
                      className={[
                        "h-4 w-4 text-neutral-500 transition-transform",
                        showDeliveryDetails ? "rotate-180" : "rotate-0",
                      ].join(" ")}
                    />
                  </button>

                  {showDeliveryDetails ? (
                    <>
                      <div className="mt-4 grid gap-3">
                        <label
                          className={[
                            "flex cursor-pointer items-center justify-between rounded-xl border px-4 py-4 transition",
                            deliveryMethod === "pickup"
                              ? "border-emerald-300 bg-emerald-50"
                              : "border-neutral-200 bg-white hover:bg-neutral-50",
                          ].join(" ")}
                        >
                          <div>
                            <p className="text-sm font-medium text-neutral-950">
                              Pickup
                            </p>
                          </div>
                          <input
                            type="radio"
                            name="deliveryMethod"
                            value="pickup"
                            checked={deliveryMethod === "pickup"}
                            onChange={() => setDeliveryMethod("pickup")}
                            className="accent-neutral-950"
                          />
                        </label>

                        <label
                          className={[
                            "flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-4 transition",
                            deliveryMethod === "delivery"
                              ? "border-emerald-300 bg-emerald-50"
                              : "border-neutral-200 bg-white hover:bg-neutral-50",
                          ].join(" ")}
                        >
                          <div>
                            <p className="text-sm font-medium text-neutral-950">
                              Delivery
                            </p>
                          </div>
                          <input
                            type="radio"
                            name="deliveryMethod"
                            value="delivery"
                            checked={deliveryMethod === "delivery"}
                            onChange={() => setDeliveryMethod("delivery")}
                            className="accent-neutral-950"
                          />
                        </label>
                      </div>

                      {errors.deliveryMethod ? (
                        <p className="mt-3 text-xs text-red-600">
                          {errors.deliveryMethod}
                        </p>
                      ) : null}
                    </>
                  ) : null}
                </section>

                <button
                  type="submit"
                  disabled={submitDisabled}
                  className="inline-flex h-12 w-full items-center justify-center rounded-full bg-emerald-700 px-5 text-sm font-medium text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {loading
                    ? "Placing order..."
                    : submitDisabled && deliveryRuleMessage
                      ? "Minimum not met"
                      : "Place order"}
                </button>

                {deliveryRuleMessage ? (
                  <p className="text-center text-xs text-red-600">
                    {deliveryRuleMessage}
                  </p>
                ) : null}

                {errors.items ? (
                  <p className="text-center text-xs text-red-600">
                    {errors.items}
                  </p>
                ) : null}
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}