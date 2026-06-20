"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { api } from "@/lib/api";

function CheckoutContent() {
  const t = useTranslations("checkout");
  const th = useTranslations("home");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  const planId = searchParams.get("plan") || "free";
  const price = Number(searchParams.get("price")) || 0;

  // Map simple planId → backend planId
  const simplePlanId = planId.replace(/_(monthly|yearly)$/, "");
  const backendPlanIds: Record<string, string> = { free: "free", pro: "pro_monthly", business: "business_monthly" };
  const backendPlanId = backendPlanIds[simplePlanId] || planId;

  const [email, setEmail] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [cardName, setCardName] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"details" | "payment">("details");
  const [error, setError] = useState("");

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const parsed = JSON.parse(user);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.name) setCardName(parsed.name);
      } catch {}
    }
  }, []);

  const planNames: Record<string, string> = { free: th("freePlan"), pro: th("proPlan"), business: th("businessPlan") };
  const planFeatures: Record<string, string[]> = {
    free: [th("freeFeature1"), th("freeFeature2"), th("freeFeature3"), th("freeFeature4")],
    pro: [th("proFeature1"), th("proFeature2"), th("proFeature3"), th("proFeature4")],
    business: [th("businessFeature1"), th("businessFeature2"), th("businessFeature3"), th("businessFeature4")],
  };

  const discount = simplePlanId === "pro" ? 5 : simplePlanId === "business" ? 10 : 0;
  const total = price - discount;

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits;
  };

  const handlePay = async () => {
    if (!cardNumber || !expiry || !cvc || !cardName) {
      setError(t("fillCard"));
      return;
    }
    setError("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await api.subscriptions.activate(backendPlanId, true);
      }
      await new Promise((r) => setTimeout(r, 1500));
      setLoading(false);
      if (token) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    } catch (e: any) {
      setLoading(false);
      setError(e.message || "Payment failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">

        {/* Left Panel - Plan Info */}
        <div className="w-full md:w-2/5 bg-blue-600 text-white p-8 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-8">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </div>

            <h1 className="text-3xl font-bold mb-2">{th("pricingTitle")}</h1>
            <p className="text-blue-200 text-sm mb-8">{th("pricingDesc")}</p>

            <div className="bg-white/10 rounded-xl p-4 mb-6">
              <p className="text-sm text-blue-200">{t("monthlyPlan")}</p>
              <p className="text-xl font-bold">${price} <span className="text-sm font-normal text-blue-200">/mo</span></p>
              <button onClick={() => router.push("/#pricing")} className="text-sm text-blue-200 hover:text-white mt-2 underline">{t("changePlan")}</button>
            </div>

            <ul className="space-y-3">
              {(planFeatures[simplePlanId] || []).map((f: string, i: number) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Panel - Payment Form */}
        <div className="w-full md:w-3/5 p-8">
          {/* Steps */}
          <div className="flex items-center gap-3 mb-8 text-sm">
            <span className={`font-semibold ${step === "details" ? "text-gray-900 dark:text-white" : "text-gray-400"}`}>{t("yourDetails")}</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <span className={`font-semibold ${step === "payment" ? "text-gray-900 dark:text-white" : "text-gray-400"}`}>{t("payment")}</span>
            <button onClick={() => router.back()} className="mr-auto text-blue-600 dark:text-blue-400 hover:underline font-medium">{t("back")}</button>
          </div>

          {step === "details" ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("email")}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <button
                onClick={() => email && setStep("payment")}
                disabled={!email}
                className="w-full mt-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t("payment")}
              </button>
            </div>
          ) : (
            <div>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t("processing")}</p>
                </div>
              ) : (
                <>
                  {/* Plan Summary */}
                  <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{planNames[simplePlanId]}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Card Form */}
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t("cardholderName")}</label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t("cardNumber")}</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 pr-12 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                          <svg className="w-8 h-5 text-gray-400" viewBox="0 0 32 20" fill="none"><rect width="32" height="20" rx="3" fill="#1A1F71"/><circle cx="12" cy="10" r="6" fill="#EB001B" fillOpacity="0.8"/><circle cx="20" cy="10" r="6" fill="#F79E1B" fillOpacity="0.8"/></svg>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t("expiry")}</label>
                        <input
                          type="text"
                          value={expiry}
                          onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                          placeholder="MM/YY"
                          maxLength={5}
                          className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t("cvc")}</label>
                        <input
                          type="text"
                          value={cvc}
                          onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                          placeholder="123"
                          maxLength={4}
                          className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {error && (
                    <p className="text-sm text-red-500 dark:text-red-400 mb-4">{error}</p>
                  )}

                  {/* Price Summary */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>{t("subtotal")}</span>
                      <span>${price}/mo</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                        <span>{t("discount")}</span>
                        <span>- ${discount}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 dark:border-slate-600 pt-3 flex justify-between font-bold text-gray-900 dark:text-white">
                      <span>{t("totalAmount")}</span>
                      <span>${total}/mo</span>
                    </div>
                  </div>

                  <button
                    onClick={handlePay}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    {t("payBtn")} ${total}
                  </button>

                  <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-400 dark:text-gray-500">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    {t("securePayment")}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-100 dark:bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
