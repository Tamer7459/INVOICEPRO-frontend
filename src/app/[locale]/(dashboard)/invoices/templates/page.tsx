"use client";

import { useTranslations, useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast";

const templates = [
  { id: "modern", nameEn: "Modern", nameAr: "عصري", nameFr: "Moderne", color: "from-blue-500 to-indigo-600", descEn: "Clean blue design", descAr: "تصميم أزرق نظيف", descFr: "Design bleu épuré" },
  { id: "classic", nameEn: "Classic", nameAr: "كلاسيكي", nameFr: "Classique", color: "from-gray-600 to-gray-800", descEn: "Traditional formal", descAr: "رسمي تقليدي", descFr: "Formel traditionnel" },
  { id: "minimal", nameEn: "Minimal", nameAr: "بسيط", nameFr: "Minimal", color: "from-slate-400 to-slate-600", descEn: "Simple & elegant", descAr: "بسيط وأنيق", descFr: "Simple et élégant" },
  { id: "bold", nameEn: "Bold", nameAr: "جريء", nameFr: "Audacieux", color: "from-orange-500 to-red-600", descEn: "Vibrant orange header", descAr: "رأس برتقالي نابض", descFr: "En-tête orange vibrant" },
  { id: "professional", nameEn: "Professional", nameAr: "احترافي", nameFr: "Professionnel", color: "from-emerald-500 to-teal-600", descEn: "Green accent", descAr: "لمسة خضراء", descFr: "Accent vert" },
  { id: "creative", nameEn: "Creative", nameAr: "إبداعي", nameFr: "Créatif", color: "from-purple-500 to-pink-600", descEn: "Purple & pink", descAr: "بنفسجي ووردي", descFr: "Violet et rose" },
];

export default function TemplatesPage() {
  const t = useTranslations("invoices");
  const locale = useLocale();
  const { toast } = useToast();
  const [selected, setSelected] = useState<string>("modern");

  useEffect(() => {
    const saved = localStorage.getItem("invoiceTemplate");
    if (saved) setSelected(saved);
  }, []);

  const handleSelect = (id: string) => {
    setSelected(id);
    localStorage.setItem("invoiceTemplate", id);
    toast(locale === "ar" ? "تم تطبيق القالب!" : locale === "fr" ? "Modèle appliqué !" : "Template applied!");
  };

  const handlePreview = async (tplId: string) => {
    try {
      await api.invoices.downloadPdf(`preview/${tplId}`, `preview-${tplId}.pdf`);
    } catch {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}/invoices/preview/${tplId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { toast("Preview failed", "error"); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `preview-${tplId}.pdf`; a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="px-4 sm:px-6 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{locale === "ar" ? "قوالب الفواتير" : locale === "fr" ? "Modèles de factures" : "Invoice Templates"}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{locale === "ar" ? "اختر قالب فاتورتك - سيتم تطبيقه تلقائياً عند تنزيل PDF" : locale === "fr" ? "Choisissez le modèle - appliqué automatiquement lors de l'export PDF" : "Choose your template - auto-applied when downloading PDF"}</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((tpl) => {
          const isActive = selected === tpl.id;
          return (
            <div key={tpl.id} className={`relative rounded-2xl border-2 transition-all duration-200 overflow-hidden ${
              isActive
                ? "border-blue-600 shadow-lg shadow-blue-600/10 ring-2 ring-blue-600/20"
                : "border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600"
            }`}>
              {isActive && (
                <div className="absolute top-3 right-3 z-10 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  {locale === "ar" ? "مفعّل" : locale === "fr" ? "Activé" : "Active"}
                </div>
              )}
              <div className={`h-36 bg-gradient-to-br ${tpl.color} flex items-center justify-center`}>
                <div className="bg-white/90 rounded-lg shadow-xl w-28 h-20 p-2">
                  <div className="h-1.5 w-10 bg-gray-300 rounded mb-1.5" />
                  <div className="h-1 w-16 bg-gray-200 rounded mb-1" />
                  <div className="h-1 w-14 bg-gray-200 rounded mb-2" />
                  <div className="h-0.5 w-full bg-gray-200 rounded mb-0.5" />
                  <div className="h-0.5 w-full bg-gray-200 rounded mb-0.5" />
                  <div className="h-0.5 w-3/4 bg-gray-200 rounded" />
                </div>
              </div>
              <div className="p-4 bg-white dark:bg-slate-800">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {locale === "ar" ? tpl.nameAr : locale === "fr" ? tpl.nameFr : tpl.nameEn}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {locale === "ar" ? tpl.descAr : locale === "fr" ? tpl.descFr : tpl.descEn}
                </p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => handleSelect(tpl.id)} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                      : "bg-blue-600 text-white hover:bg-blue-700 shadow"
                  }`}>
                    {isActive ? (locale === "ar" ? "مفعّل" : locale === "fr" ? "Activé" : "Active") : (locale === "ar" ? "تطبيق" : locale === "fr" ? "Appliquer" : "Apply")}
                  </button>
                  <button onClick={() => handlePreview(tpl.id)} className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors" title="Preview PDF">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
