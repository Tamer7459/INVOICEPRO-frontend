"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast";

export default function NewCustomerPage() {
  const t = useTranslations("customers");
  const locale = useLocale();
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) window.location.href = "/login";
  }, []);

  const handleSave = async () => {
    if (!name) return;
    setSaving(true);
    try {
      await api.customers.create({ name, email, phone, address, city, country });
      toast(t("savedSuccess"));
      router.push("/customers");
    } catch (e: any) {
      toast(e.message || "Failed to create customer", "error");
    }
    setSaving(false);
  };

  return (
    <div className="px-4 sm:px-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("newCustomer")}</h1>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t("name")}</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t("email")}</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t("phone")}</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t("address")}</label>
            <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t("city")}</label>
            <input value={city} onChange={(e) => setCity(e.target.value)} className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t("country")}</label>
          <input value={country} onChange={(e) => setCountry(e.target.value)} className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white" />
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button onClick={() => router.back()} className="px-5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
          {t("cancel")}
        </button>
        <button onClick={handleSave} disabled={saving || !name} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
          {saving ? t("saving") : t("save")}
        </button>
      </div>
    </div>
  );
}
