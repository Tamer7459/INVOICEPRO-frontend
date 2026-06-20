"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ToastProvider } from "@/lib/toast";
import { SubscriptionProvider, useSubscription } from "@/lib/subscription-context";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { subscription } = useSubscription();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    api.auth.me().then((r) => { setUser(r.data); setLoading(false); }).catch(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/login");
    });
  }, [router]);

  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  const sections = [
    {
      items: [
        { href: "/dashboard", label: t("dashboard"), icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
      ],
    },
    {
      label: "ADMINISTRATION",
      items: [
        ...(user?.role === "admin" ? [{ href: "/admin", label: t("allUsers"), icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" }] : []),
        { href: "/subscription", label: t("pricingPlans"), icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
        { href: "/subscription", label: t("subscription"), icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" },
      ],
    },
    {
      label: "INVOICES",
      items: [
        { href: "/invoices", label: t("invoices"), icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
        { href: "/invoices/templates", label: t("templates"), icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" },
        { href: "/customers", label: t("clients"), icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" },
      ],
    },
    {
      label: "BILLING",
      items: [
        { href: "/invoices", label: t("billing"), icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" },
      ],
    },
    {
      label: "SETTINGS",
      items: [
        { href: "/settings", label: t("settings"), icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
      ],
    },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-20 left-4 z-40 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-shadow"
      >
        <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`fixed top-16 left-0 z-50 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 transform transition-transform duration-150 ease-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 shadow-xl lg:shadow-none`}>
        <div className="flex flex-col h-full">
          {user && (
            <div className="p-5 border-b border-gray-100 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                  {user.image ? (
                    <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{(user.name || "U").charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
            {sections.map((section, si) => (
              <div key={si}>
                {section.label && (
                  <p className="px-4 mb-1.5 text-[10px] font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase">
                    {section.label}
                  </p>
                )}
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.href + item.label}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ease-out ${
                          active
                            ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700/50 hover:text-gray-900 dark:hover:text-white active:scale-[0.98]"
                        }`}
                      >
                        <svg className={`w-5 h-5 shrink-0 ${active ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                        </svg>
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {subscription && (
            <div className="px-3 pb-3">
              <div className={`rounded-xl p-4 border ${
                subscription.planId === "free"
                  ? "bg-gray-50 dark:bg-slate-700/50 border-gray-200 dark:border-slate-600"
                  : "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800"
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    subscription.planId === "free"
                      ? "bg-gray-200 dark:bg-slate-600"
                      : "bg-blue-100 dark:bg-blue-900/40"
                  }`}>
                    <svg className={`w-4 h-4 ${
                      subscription.planId === "free"
                        ? "text-gray-500 dark:text-gray-400"
                        : "text-blue-600 dark:text-blue-400"
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                      {subscription.planId === "free" ? t("freePlan") : subscription.planId.includes("business") ? t("businessPlan") : t("proPlan")}
                    </p>
                    <p className={`text-[10px] font-medium ${
                      subscription.status === "active" ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"
                    }`}>
                      {subscription.status === "active" ? t("active") : t("expired")}
                    </p>
                  </div>
                </div>
                <button onClick={() => router.push("/subscription")} className="w-full py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                  {subscription.planId === "free" ? t("upgrade") : t("changePlan")}
                </button>
              </div>
            </div>
          )}

          <div className="p-3 border-t border-gray-100 dark:border-slate-700">
            <button
              onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("user"); router.push("/"); }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-150 ease-out active:scale-[0.98] w-full"
            >
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {t("logout")}
            </button>
          </div>
        </div>
      </aside>

      <main className="lg:pl-64 pt-16 min-h-screen transition-all duration-300">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto text-gray-900 dark:text-gray-100">
          <ToastProvider>{children}</ToastProvider>
        </div>
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SubscriptionProvider>
      <DashboardContent>{children}</DashboardContent>
    </SubscriptionProvider>
  );
}
