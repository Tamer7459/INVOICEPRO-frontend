"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations("home");
  const router = useRouter();

  const plans = [
    { id: "free", name: t("freePlan"), price: "$0", period: t("perMonth"), desc: t("freePlanDesc"), features: [t("freeFeature1"), t("freeFeature2"), t("freeFeature3"), t("freeFeature4")], priceNum: 0 },
    { id: "pro", name: t("proPlan"), price: "$19", period: t("perMonth"), desc: t("proPlanDesc"), features: [t("proFeature1"), t("proFeature2"), t("proFeature3"), t("proFeature4")], popular: true, priceNum: 19 },
    { id: "business", name: t("businessPlan"), price: "$49", period: t("perMonth"), desc: t("businessPlanDesc"), features: [t("businessFeature1"), t("businessFeature2"), t("businessFeature3"), t("businessFeature4")], priceNum: 49 },
  ];

  const features = [
    { title: t("feat1Title"), desc: t("feat1Desc"), icon: "📄" },
    { title: t("feat2Title"), desc: t("feat2Desc"), icon: "👥" },
    { title: t("feat3Title"), desc: t("feat3Desc"), icon: "📊" },
    { title: t("feat4Title"), desc: t("feat4Desc"), icon: "💱" },
    { title: t("feat5Title"), desc: t("feat5Desc"), icon: "📥" },
    { title: t("feat6Title"), desc: t("feat6Desc"), icon: "🔒" },
  ];

  const heroBadges = [
    t("badge1"),
    t("badge2"),
    t("badge3"),
    t("badge4"),
  ];

  const goToLogin = () => router.push("/login");

  const handlePlanClick = (planId: string, priceNum: number) => {
    if (planId === "free") {
      const token = localStorage.getItem("token");
      if (token) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    } else {
      router.push(`/checkout?plan=${planId}&price=${priceNum}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-900">
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden hero-grid">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
            <div className="text-center max-w-4xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 mb-8 shadow-sm">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{t("heroBadge")}</span>
              </div>

              {/* Heading */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
                <span className="text-gray-900 dark:text-white">{t("heroTitleLine1")}</span>
                <br />
                <span className="text-blue-600 dark:text-blue-400">{t("heroTitleLine2")}</span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                {t("heroDesc")}
              </p>

              {/* Feature Badges */}
              <div className="flex flex-wrap justify-center gap-3 mb-10">
                {heroBadges.map((badge, i) => (
                  <div key={i} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-gray-600 dark:text-gray-300">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {badge}
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={() => { const token = localStorage.getItem("token"); router.push(token ? "/dashboard" : "/login"); }} className="inline-flex items-center justify-center px-8 py-3.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
                  {t("heroCta")}
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </button>
                <a href="#features" className="inline-flex items-center justify-center px-8 py-3.5 border border-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                  {t("heroLearn")}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20 lg:py-28 bg-gray-50/50 dark:bg-slate-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">{t("featuresTitle")}</h2>
              <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">{t("featuresDesc")}</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <div key={i} className="group p-6 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 hover:shadow-xl hover:border-blue-100 dark:hover:border-blue-800 transition-all duration-300">
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">{f.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">{t("pricingTitle")}</h2>
              <p className="text-lg text-gray-500 dark:text-gray-400">{t("pricingDesc")}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {plans.map((plan, i) => (
                <div key={i} className={`relative p-8 bg-white dark:bg-slate-800 rounded-2xl border-2 transition-all duration-300 hover:shadow-xl ${plan.popular ? 'border-blue-600 shadow-lg shadow-blue-600/10' : 'border-gray-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-700'}`}>
                  {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-semibold shadow-lg">{t("popular")}</div>}
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{plan.desc}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                    <span className="text-gray-400">{plan.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => handlePlanClick(plan.id, plan.priceNum)} className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all ${plan.popular ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20' : 'border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>
                    {plan.id === "free" ? t("startFree") : t("choosePlan")}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10"><div className="absolute inset-0 hero-grid-light" /></div>
          <div className="relative max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{t("ctaTitle")}</h2>
            <p className="text-lg text-blue-100 mb-8">{t("ctaDesc")}</p>
            <button onClick={() => { const token = localStorage.getItem("token"); router.push(token ? "/dashboard" : "/login"); }} className="inline-flex items-center px-8 py-3.5 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-all shadow-xl">
              {t("ctaBtn")}
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-slate-700 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-400 dark:text-gray-500">
          <p>&copy; 2026 InvoicePro. All rights reserved.</p>
        </div>
      </footer>

      {/* WhatsApp FAB */}
      <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 hover:bg-green-600 transition-all hover:scale-110">
        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </div>
  );
}
