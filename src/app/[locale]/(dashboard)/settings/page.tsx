"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast";

export default function SettingsPage() {
  const t = useTranslations("settings");
  const locale = useLocale();
  const router = useRouter();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [lang, setLang] = useState(locale);
  const [currency, setCurrency] = useState("USD");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [companyName, setCompanyName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [thankYouMessage, setThankYouMessage] = useState("");
  const [invoicePrefix, setInvoicePrefix] = useState("INV");
  const [logo, setLogo] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { window.location.href = "/login"; return; }
    const saved = localStorage.getItem("currency");
    if (saved) setCurrency(saved);
    api.company.get().then((res) => {
      const d = res.data;
      setCompanyName(d.companyName || "");
      setAddress(d.address || "");
      setPhone(d.phone || "");
      setTaxNumber(d.taxNumber || "");
      setThankYouMessage(d.thankYouMessage || "");
      setInvoicePrefix(d.invoicePrefix || "INV");
      setCurrency(d.defaultCurrency || "USD");
      if (d.logo) setLogo(d.logo);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("companyName", companyName);
      fd.append("address", address);
      fd.append("phone", phone);
      fd.append("taxNumber", taxNumber);
      fd.append("thankYouMessage", thankYouMessage);
      fd.append("invoicePrefix", invoicePrefix);
      fd.append("defaultCurrency", currency);
      if (logoFile) fd.append("logo", logoFile);
      await api.company.update(fd);
      localStorage.setItem("currency", currency);
      toast(t("savedSuccess"));
      if (lang !== locale) {
        document.cookie = `NEXT_LOCALE=${lang};path=/;max-age=31536000`;
        window.location.href = `/${lang}/settings`;
      }
    } catch (e: any) {
      toast(e.message || "Failed to save", "error");
    }
    setSaving(false);
  };

  const languages = [
    { value: "en", label: "English" },
    { value: "fr", label: "Français" },
    { value: "ar", label: "العربية" },
  ];
  const currencies = [
    { value: "USD", label: "USD ($)" },
    { value: "EUR", label: "EUR (€)" },
    { value: "DZD", label: "DZD (د.ج)" },
  ];

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="px-4 sm:px-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t("title")}</h1>

      <div className="space-y-6">

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t("companyInfo")}</h2>

          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 dark:border-slate-600 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-slate-700/50 shrink-0">
              {logo ? (
                <img src={logo.startsWith("http") ? logo : `http://localhost:4000${logo}`} alt="Logo" className="w-full h-full object-contain p-1" />
              ) : (
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              )}
            </div>
            <div>
              <button onClick={() => fileRef.current?.click()} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                {t("uploadLogo")}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setLogoFile(f); setLogo(URL.createObjectURL(f)); } }} />
              {logo && <button onClick={() => { setLogo(null); setLogoFile(null); }} className="block mt-1.5 text-sm text-red-500 hover:underline">{t("removeLogo")}</button>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t("companyName")}</label>
            <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t("address")}</label>
            <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white resize-none" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t("phone")}</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t("taxNumber")}</label>
              <input value={taxNumber} onChange={(e) => setTaxNumber(e.target.value)} className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t("invoiceSettings")}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t("invoicePrefix")}</label>
              <input value={invoicePrefix} onChange={(e) => setInvoicePrefix(e.target.value)} className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t("currency")}</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white">
                {currencies.map((c) => (<option key={c.value} value={c.value}>{c.label}</option>))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t("thankYouMessage")}</label>
            <textarea value={thankYouMessage} onChange={(e) => setThankYouMessage(e.target.value)} rows={2} className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white resize-none" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t("preferences")}</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t("language")}</label>
            <select value={lang} onChange={(e) => setLang(e.target.value)} className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white">
              {languages.map((l) => (<option key={l.value} value={l.value}>{l.label}</option>))}
            </select>
          </div>
        </div>
      </div>

      <button onClick={handleSave} disabled={saving} className="mt-6 px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
        {saving ? t("saving") : t("save")}
      </button>
    </div>
  );
}
