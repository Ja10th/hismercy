import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import MyOrdersSearchForm from "./MyOrdersSearchForm";
import { prisma } from "@/lib/prisma";

const trackingFaqs = [
  {
    question: "Where can I find my order code?",
    answer:
      "Your order code was sent to your email in your order confirmation message right after checkout. It usually starts with a prefix followed by a series of numbers and letters.",
  },
  {
    question: "Why does my tracking status say 'Processing'?",
    answer:
      "This means we've received your order and it's being prepared for shipment. Once it ships, the status will update and you'll receive a tracking number.",
  },
  {
    question: "How long does shipping usually take?",
    answer:
      "Standard delivery typically takes 3-7 business days depending on your location. Expedited options, if selected at checkout, usually arrive within 1-3 business days.",
  },
  {
    question: "My tracking hasn't updated in a few days. Should I worry?",
    answer:
      "Tracking updates can occasionally lag behind the package's actual movement, especially over weekends or holidays. If there's been no update after 5 business days, reach out to our support team.",
  },
  {
    question: "Can I change my shipping address after placing an order?",
    answer:
      "If your order hasn't shipped yet, contact our support team as soon as possible with your order code and they'll do their best to update it before dispatch.",
  },
  {
    question: "What if I can't find my order using my email and order code?",
    answer:
      "Double check for typos in your email and order code. If you still can't locate it, your order confirmation email will have the exact details, or you can contact support for help.",
  },
];

export default async function MyOrdersPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen max-w-7xl mx-auto px-4 pb-12 pt-32 md:pt-40 mt:pb-16 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-xl">
          <h1 className="text-3xl text-left font-semibold tracking-tight text-neutral-950 sm:text-4xl">
            Track & Trace
          </h1>
          <p className="mt-3 text-left max-w-xl text-[16px] md:text-base lg:text-[20px] leading-6 text-neutral-500 ">
            Enter your email and order code to view your order 
          </p>
          <div className="rounded-[28px] my-5 ">
            <MyOrdersSearchForm />
          </div>
        </div>

        <div className="mx-auto max-w-7xl">
          <section className="mt-12 max-w-4xl">
            <div className="mb-5">
              <h2 className="mt-1 text-2xl font-bold text-neutral-950 sm:text-3xl">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="divide-y divide-neutral-200 ">
              {trackingFaqs.map((faq) => (
                <details key={faq.question} className="group py-3">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4  text-[16px] md:text-base lg:text-[20px] font-medium text-neutral-950 sm:text-base">
                    {faq.question}
                    <span className="shrink-0 text-neutral-400 transition-transform duration-200 group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-[16px] md:text-base lg:text-[20px] leading-6 text-neutral-500 sm:text-base">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}