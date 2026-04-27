  "use client";

  import Link from "next/link";
  import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
  import { useRouter } from "next/navigation";
  import {
    ArrowLeft,
    CreditCard,
    MapPin,
    Mail,
    Phone,
    User,
    Truck,
    ShieldCheck,
    RotateCcw,
    CheckCircle2,
    ShoppingBag,
  } from "lucide-react";
  import { useCart } from "../components/cart/CartProvider";

  function formatNaira(amountInKobo: number) {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(amountInKobo / 100);
  }

  const deliveryOptions = [
    {
      id: "standard",
      label: "Standard delivery",
      price: 2500,
      note: "3 to 7 days",
    },
    {
      id: "express",
      label: "Express delivery",
      price: 5000,
      note: "1 to 2 days",
    },
    { id: "pickup", label: "Pickup", price: 0, note: "Pick up from store" },
  ] as const;

  type DeliveryId = (typeof deliveryOptions)[number]["id"];

  type FormState = {
    fullName: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    landmark: string;
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

  function getItemImage(item: CheckoutItem) {
    return item.imageUrl || item.image || item.images?.[0]?.url || "/bags.png";
  }

  function shorten(text: string, max = 34) {
    if (text.length <= max) return text;
    return `${text.slice(0, max).trim()}...`;
  }

  export default function CheckoutPage() {
    const router = useRouter();
    const { items, subtotal, clearCart } = useCart();

    const cartItems = items as CheckoutItem[];

    const [loading, setLoading] = useState(false);
    const [delivery, setDelivery] = useState<DeliveryId>("standard");
    const [form, setForm] = useState<FormState>({
      fullName: "",
      email: "",
      phone: "",
      street: "",
      city: "",
      state: "",
      landmark: "",
    });

    const deliveryFee = useMemo(() => {
      return deliveryOptions.find((item) => item.id === delivery)?.price ?? 0;
    }, [delivery]);

    const total = subtotal + deliveryFee;

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      setForm((current) => ({ ...current, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (cartItems.length === 0 || loading) return;

      setLoading(true);

      try {
        const response = await fetch("/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customer: form,
            deliveryMethod: delivery,
            deliveryFee,
            subtotal,
            total,
            items: cartItems,
          }),
        });

        const data = (await response.json()) as {
          ok: boolean;
          orderCode?: string;
          error?: string;
        };

        if (!response.ok || !data.ok || !data.orderCode) {
          throw new Error(data.error || "Could not create order");
        }

        clearCart();
        router.push(`/order-success/${data.orderCode}`);
      } catch (error) {
        console.error(error);
        alert("Something went wrong while placing the order.");
      } finally {
        setLoading(false);
      }
    };

    return (
      <main>
        <section className="">
          <div className=" bg-[#171717] grid min-h-screen grid-cols-1 lg:grid-cols-2">
            <aside className="px-5 py-6 text-white sm:px-7 lg:px-14 lg:py-10 ">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white backdrop-blur transition hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to shop
              </Link>

              <div className="mt-8">
                <p className="text-sm/6 text-white/85">Order total</p>
                <div className="mt-1 flex items-end gap-2">
                  <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">
                    {formatNaira(total)}
                  </h1>
                  <span className="pb-2 text-sm text-white/80">due today</span>
                </div>
              </div>

              <div className="mt-8 rounded-[24px] bg-white/10 p-4 backdrop-blur">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/80">Subtotal</span>
                  <span className="font-medium">{formatNaira(subtotal)}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-white/80">Delivery</span>
                  <span className="font-medium">
                    {deliveryFee === 0 ? "Free" : formatNaira(deliveryFee)}
                  </span>
                </div>
                <div className="mt-4 border-t border-white/15 pt-4 flex items-center justify-between">
                  <span className="text-white/90">Total</span>
                  <span className="text-lg font-semibold">
                    {formatNaira(total)}
                  </span>
                </div>
              </div>

              <div className="mt-8">
                <p className="text-sm font-medium text-white/90">Items in cart</p>

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
                          className="flex items-center gap-4 rounded-[22px] border border-white/10 bg-white/10 p-3 backdrop-blur"
                        >
                          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-white/20">
                            <img
                              src={imageUrl}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-white">
                              {shorten(item.name, 28)}
                            </p>
                            <p className="text-xs text-white/70">
                              Qty {item.qty}
                            </p>
                          </div>

                          <p className="shrink-0 text-sm font-medium text-white">
                            {formatNaira(item.price * item.qty)}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </aside>

            <div className="bg-white px-5 py-6 sm:px-7 lg:px-14 lg:py-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                    Secure checkout
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">
                    Delivery details
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-neutral-500">
                    Enter your details, choose a delivery method, and place your
                    order.
                  </p>
                </div>

                <div className="grid gap-6">
                  <section className="rounded-[24px] border border-neutral-200 bg-neutral-50 p-5">
                    <h3 className="text-sm font-semibold text-neutral-950">
                      Contact information
                    </h3>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <label className="space-y-2 sm:col-span-2">
                        <span className="flex items-center gap-2 text-sm font-medium text-neutral-700">
                          <User className="h-4 w-4" />
                          Full name
                        </span>
                        <input
                          name="fullName"
                          value={form.fullName}
                          onChange={handleChange}
                          required
                          placeholder="Your full name"
                          className="h-12 w-full rounded-2xl border border-neutral-200 bg-white px-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-950"
                        />
                      </label>

                      <label className="space-y-2">
                        <span className="flex items-center gap-2 text-sm font-medium text-neutral-700">
                          <Mail className="h-4 w-4" />
                          Email
                        </span>
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          required
                          placeholder="you@example.com"
                          className="h-12 w-full rounded-2xl border border-neutral-200 bg-white px-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-950"
                        />
                      </label>

                      <label className="space-y-2">
                        <span className="flex items-center gap-2 text-sm font-medium text-neutral-700">
                          <Phone className="h-4 w-4" />
                          Phone
                        </span>
                        <input
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          required
                          placeholder="080..."
                          className="h-12 w-full rounded-2xl border border-neutral-200 bg-white px-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-950"
                        />
                      </label>
                    </div>
                  </section>

                  <section className="rounded-[24px] border border-neutral-200 bg-neutral-50 p-5">
                    <h3 className="text-sm font-semibold text-neutral-950">
                      Delivery address
                    </h3>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <label className="space-y-2 sm:col-span-2">
                        <span className="flex items-center gap-2 text-sm font-medium text-neutral-700">
                          <MapPin className="h-4 w-4" />
                          Street address
                        </span>
                        <input
                          name="street"
                          value={form.street}
                          onChange={handleChange}
                          required
                          placeholder="House number, street name"
                          className="h-12 w-full rounded-2xl border border-neutral-200 bg-white px-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-950"
                        />
                      </label>

                      <label className="space-y-2">
                        <span className="text-sm font-medium text-neutral-700">
                          City
                        </span>
                        <input
                          name="city"
                          value={form.city}
                          onChange={handleChange}
                          required
                          placeholder="City"
                          className="h-12 w-full rounded-2xl border border-neutral-200 bg-white px-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-950"
                        />
                      </label>

                      <label className="space-y-2">
                        <span className="text-sm font-medium text-neutral-700">
                          State
                        </span>
                        <input
                          name="state"
                          value={form.state}
                          onChange={handleChange}
                          required
                          placeholder="State"
                          className="h-12 w-full rounded-2xl border border-neutral-200 bg-white px-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-950"
                        />
                      </label>

                      <label className="space-y-2 sm:col-span-2">
                        <span className="text-sm font-medium text-neutral-700">
                          Landmark
                        </span>
                        <input
                          name="landmark"
                          value={form.landmark}
                          onChange={handleChange}
                          placeholder="Nearest bus stop or landmark"
                          className="h-12 w-full rounded-2xl border border-neutral-200 bg-white px-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-950"
                        />
                      </label>
                    </div>
                  </section>

                  <section className="rounded-[24px] border border-neutral-200 bg-neutral-50 p-5">
                    <h3 className="text-sm font-semibold text-neutral-950">
                      Delivery method
                    </h3>

                    <div className="mt-4 grid gap-3">
                      {deliveryOptions.map((option) => {
                        const selected = delivery === option.id;

                        return (
                          <label
                            key={option.id}
                            className={[
                              "flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-4 transition",
                              selected
                                ? "border-neutral-950 bg-white"
                                : "border-neutral-200 bg-white hover:bg-neutral-50",
                            ].join(" ")}
                          >
                            <div>
                              <p className="text-sm font-medium text-neutral-950">
                                {option.label}
                              </p>
                              <p className="text-xs text-neutral-500">
                                {option.note}
                              </p>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-neutral-950">
                                {option.price === 0
                                  ? "Free"
                                  : formatNaira(option.price)}
                              </span>
                              <input
                                type="radio"
                                name="delivery"
                                value={option.id}
                                checked={selected}
                                onChange={() => setDelivery(option.id)}
                                className="accent-neutral-950"
                              />
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </section>

                  <button
                    type="submit"
                    disabled={cartItems.length === 0 || loading}
                    className="inline-flex h-12 w-full items-center justify-center rounded-full bg-neutral-950 px-5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {loading ? "Placing order..." : "Place order"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>
    );
  }
