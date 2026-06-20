"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function AdminPage() {
  const t = useTranslations("admin");
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { window.location.href = "/login"; return; }
    api.admin.stats().then((res) => {
      setStats(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: t("totalUsers"), value: stats?.totalUsers ?? 0, icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z", color: "blue" },
    { label: t("totalInvoices"), value: stats?.totalInvoices ?? 0, icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", color: "green" },
    { label: t("totalCustomers"), value: stats?.totalCustomers ?? 0, icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", color: "purple" },
    { label: t("totalRevenue"), value: `$${(stats?.totalRevenue ?? 0).toFixed(2)}`, icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "emerald" },
  ];

  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    green: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
    purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
    emerald: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
  };

  const totalSubs = (stats?.freeSubscriptions || 0) + (stats?.proSubscriptions || 0) + (stats?.businessSubscriptions || 0);
  const freePercent = totalSubs > 0 ? Math.round(((stats?.freeSubscriptions || 0) / totalSubs) * 100) : 0;
  const proPercent = totalSubs > 0 ? Math.round(((stats?.proSubscriptions || 0) / totalSubs) * 100) : 0;
  const businessPercent = totalSubs > 0 ? 100 - freePercent - proPercent : 0;

  return (
    <div className="px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("title")}</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[card.color]}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} /></svg>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Subscription Distribution */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t("subscriptionDistribution")}</h2>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{t("freeSubscriptions")}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats?.freeSubscriptions || 0}</p>
            <p className="text-xs text-gray-400 mt-1">{freePercent}%</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">{t("proSubscriptions")}</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats?.proSubscriptions || 0}</p>
            <p className="text-xs text-blue-400 mt-1">{proPercent}%</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
            <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">{t("businessSubscriptions")}</p>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1">{stats?.businessSubscriptions || 0}</p>
            <p className="text-xs text-purple-400 mt-1">{businessPercent}%</p>
          </div>
        </div>
        <div className="w-full h-3 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden flex">
          <div className="bg-gray-400 h-full transition-all duration-500" style={{ width: `${freePercent}%` }} />
          <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${proPercent}%` }} />
          <div className="bg-purple-500 h-full transition-all duration-500" style={{ width: `${businessPercent}%` }} />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
          <div className="p-5 border-b border-gray-100 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t("recentUsers")}</h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {(!stats?.recentUsers || stats.recentUsers.length === 0) ? (
              <p className="p-5 text-sm text-gray-500 dark:text-gray-400">{t("noUsers")}</p>
            ) : (
              stats.recentUsers.map((u: any) => (
                <div key={u._id} className="flex items-center gap-3 p-4">
                  <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">{(u.name || "U").charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{u.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{u.email}</p>
                  </div>
                  {u.role === "admin" && (
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full">ADMIN</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
          <div className="p-5 border-b border-gray-100 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t("recentInvoices")}</h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {(!stats?.recentInvoices || stats.recentInvoices.length === 0) ? (
              <p className="p-5 text-sm text-gray-500 dark:text-gray-400">{t("noInvoices")}</p>
            ) : (
              stats.recentInvoices.map((inv: any) => (
                <div key={inv._id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">#{inv.invoiceNumber}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{inv.customerId?.name || "-"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">${(inv.total || 0).toFixed(2)}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                      inv.status === "paid" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
                      inv.status === "overdue" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" :
                      "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                    }`}>{inv.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
