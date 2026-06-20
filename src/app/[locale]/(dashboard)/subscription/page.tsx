"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast";
import { useSubscription } from "@/lib/subscription-context";
import ConfirmDialog from "@/components/confirm-dialog";

const allPlans = [
  {
    id: "free",
    key: "freePlan",
    price: "$0",
    period: "/mo",
    allFeatures: [
      { key: "5 invoices/month", included: true },
      { key: "Basic templates", included: true },
      { key: "PDF export", included: true },
      { key: "Email support", included: true },
      { key: "Custom branding", included: false },
      { key: "WhatsApp sharing", included: false },
      { key: "Priority support", included: false },
      { key: "Team members", included: false },
      { key: "API access", included: false },
    ],
  },
  {
    id: "pro_monthly",
    key: "proPlan",
    price: "$19",
    period: "/mo",
    allFeatures: [
      { key: "5 invoices/month", included: false },
      { key: "Unlimited invoices", included: true },
      { key: "Basic templates", included: true },
      { key: "PDF export", included: true },
      { key: "Custom branding", included: true },
      { key: "WhatsApp sharing", included: true },
      { key: "Priority support", included: true },
      { key: "Team members", included: false },
      { key: "API access", included: false },
    ],
  },
  {
    id: "business_monthly",
    key: "businessPlan",
    price: "$49",
    period: "/mo",
    allFeatures: [
      { key: "5 invoices/month", included: false },
      { key: "Unlimited invoices", included: true },
      { key: "Basic templates", included: true },
      { key: "PDF export", included: true },
      { key: "Custom branding", included: true },
      { key: "WhatsApp sharing", included: true },
      { key: "Priority support", included: true },
      { key: "Team members (5)", included: true },
      { key: "API access", included: true },
    ],
  },
];

const featureLabels: Record<string, Record<string, string>> = {
  en: { "5 invoices/month": "5 invoices/month", "Unlimited invoices": "Unlimited invoices", "Basic templates": "Basic templates", "PDF export": "PDF export", "Custom branding": "Custom branding", "WhatsApp sharing": "WhatsApp sharing", "Priority support": "Priority support", "Team members": "Team members", "Team members (5)": "Team members (5)", "API access": "API access" },
  ar: { "5 invoices/month": "5 فواتير/شهرياً", "Unlimited invoices": "فواتير غير محدودة", "Basic templates": "قوالب أساسية", "PDF export": "تصدير PDF", "Custom branding": "علامة تجارية مخصصة", "WhatsApp sharing": "مشاركة عبر واتساب", "Priority support": "دعم ذو أولوية", "Team members": "أعضاء الفريق", "Team members (5)": "أعضاء الفريق (5)", "API access": "وصول API" },
  fr: { "5 invoices/month": "5 factures/mois", "Unlimited invoices": "Factures illimitées", "Basic templates": "Modèles de base", "PDF export": "Export PDF", "Custom branding": "Image de marque", "WhatsApp sharing": "Partage WhatsApp", "Priority support": "Support prioritaire", "Team members": "Membres d'équipe", "Team members (5)": "Membres d'équipe (5)", "API access": "Accès API" },
};

export default function SubscriptionPage() {
  const t = useTranslations("subscription");
  const tv = useTranslations("home");
  const locale = useLocale() as keyof typeof featureLabels;
  const router = useRouter();
  const { toast } = useToast();
  const { subscription, refresh } = useSubscription();
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState<string | null>(null);
  const [confirmPlan, setConfirmPlan] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { window.location.href = "/login"; return; }
    if (subscription) setLoading(false);
    else setLoading(false);
  }, [subscription]);

  const handleSwitch = async (planId: string) => {
    if (subscription?.planId === planId) return;
    setConfirmPlan(planId);
  };

  const confirmSwitch = async () => {
    if (!confirmPlan) return;
    const planId = confirmPlan;
    setConfirmPlan(null);
    setSwitching(planId);
    try {
      const res = await api.subscriptions.activate(planId);
      if ((res as any).requiresPayment) {
        const priceMap: Record<string, number> = { pro_monthly: 19, business_monthly: 49, pro_yearly: 190, business_yearly: 490 };
        router.push(`/checkout?plan=${planId}&price=${priceMap[planId] || 19}`);
        return;
      }
      await refresh();
      toast(t("switched"));
    } catch (e: any) {
      toast(e.message || "Failed", "error");
    }
    setSwitching(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const currentPlanId = subscription?.planId || "free";
  const currentPlan = allPlans.find((p) => p.id === currentPlanId) || allPlans[0];

  return (
    <div className="px-4 sm:px-6 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("title")}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t("managePlan")}</p>
      </div>

      {/* Current Plan Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-200 mb-1">{t("currentPlan")}</p>
            <h2 className="text-2xl font-bold">{tv(currentPlan.key)}</h2>
            <p className="text-blue-200 mt-1">{currentPlan.price}{currentPlan.period}</p>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
          </div>
        </div>
      </div>

      {/* Paid Plans History */}
      {subscription?.paidPlans && subscription.paidPlans.length > 0 && (
        <div className="mb-8 p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs font-semibold text-green-700 dark:text-green-300 uppercase tracking-wider">Paid Plans</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {subscription.paidPlans.map((p: string) => {
              const plan = allPlans.find((pl) => pl.id === p);
              return (
                <span key={p} className="px-2.5 py-1 bg-white dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg text-xs font-medium text-green-700 dark:text-green-300">
                  {tv(plan?.key || "freePlan")}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* All Plans */}
      <div className="grid md:grid-cols-3 gap-6">
        {allPlans.map((plan) => {
          const isCurrent = plan.id === currentPlanId;
          const isSwitching = switching === plan.id;
          return (
            <div key={plan.id} className={`relative bg-white dark:bg-slate-800 rounded-2xl border-2 transition-all duration-300 ${
              isCurrent ? "border-blue-600 shadow-lg shadow-blue-600/10" : "border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600"
            }`}>
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-semibold shadow-lg">
                  {t("currentBadge")}
                </div>
              )}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{tv(plan.key)}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                  <span className="text-gray-400">{plan.period}</span>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {plan.allFeatures.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      {f.included ? (
                        <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      ) : (
                        <svg className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      )}
                      <span className={f.included ? "text-gray-700 dark:text-gray-300" : "text-gray-400 dark:text-gray-600"}>
                        {featureLabels[locale]?.[f.key] || f.key}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleSwitch(plan.id)}
                  disabled={isCurrent || isSwitching}
                  className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    isCurrent
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 cursor-default"
                      : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20"
                  } disabled:opacity-50`}
                >
                  {isSwitching ? "..." : isCurrent ? t("currentBadge") : t("switchTo")}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        open={!!confirmPlan}
        title={t("confirmSwitch")}
        message={confirmPlan ? `${tv(allPlans.find((p) => p.id === confirmPlan)?.key || "proPlan")}` : ""}
        confirmLabel={t("switchTo")}
        onConfirm={confirmSwitch}
        onCancel={() => setConfirmPlan(null)}
      />
    </div>
  );
}
