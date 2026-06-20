"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useTheme } from "@/lib/theme-provider";
import { api } from "@/lib/api";

const langMap: Record<string, { label: string; flag: string }> = {
  en: { label: "English", flag: "🇬🇧" },
  fr: { label: "Français", flag: "🇫🇷" },
  ar: { label: "العربية", flag: "🇸🇦" },
};

const navItems = [
  { key: "navCreateInvoice", href: "/invoices/new" },
  { key: "navTemplates", href: "/#features" },
  { key: "navPricing", href: "/#pricing" },
];

const dashboardNavItems = [
  { key: "dashboard", href: "/dashboard", useNav: true },
  { key: "navTemplates", href: "/invoices/templates", useNav: false },
  { key: "navPricing", href: "/subscription", useNav: false },
];

function setCookie(name: string, value: string, days: number) {
  const d = new Date();
  d.setTime(d.getTime() + days * 86400000);
  document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/;SameSite=Lax`;
}

export default function Header() {
  const t = useTranslations("home");
  const tn = useTranslations("nav");
  const { theme, toggle: toggleTheme } = useTheme();
  const router = useRouter();
  const locale = useLocale();
  const [langOpen, setLangOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setLoggedIn(true);
      const cached = localStorage.getItem("user");
      if (cached) {
        try { setUser(JSON.parse(cached)); } catch {}
      }
      api.auth.me().then((r) => {
        setUser(r.data);
        localStorage.setItem("user", JSON.stringify(r.data));
      }).catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setLoggedIn(false);
      });
    }
  }, []);

  const goToLogin = () => router.push("/login");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setLoggedIn(false);
    setUser(null);
    router.push("/");
  };

  const switchLang = (code: string) => {
    setCookie("NEXT_LOCALE", code, 365);
    setLangOpen(false);
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-[60] bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 items-center h-16">
          {/* Left: Logo */}
          <div className="flex justify-start">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-600/20">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="leading-tight">
                <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">INVOICE</span>
                <span className="text-lg font-bold text-blue-600 tracking-tight">PRO</span>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 tracking-widest uppercase font-medium">Generator</p>
              </div>
            </Link>
          </div>

          {/* Center: Nav */}
          <nav className="hidden md:flex justify-center items-center gap-6">
            {(loggedIn ? dashboardNavItems : navItems).map((item) => {
              const di = item as any;
              return (
                <Link key={di.key} href={di.href}
                  className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {di.useNav ? tn(di.key) : t(di.key)}
                </Link>
              );
            })}
          </nav>

          {/* Right: Actions */}
          <div className="flex justify-end items-center gap-2">
            {/* Dark Mode Toggle */}
            <button onClick={toggleTheme} className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 dark:border-slate-600 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
              {theme === "dark" ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>

            {/* Language Switcher */}
            <div className="relative" ref={langRef}>
              <button onClick={() => setLangOpen(!langOpen)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                <span className="text-base leading-none">{langMap[locale]?.flag || "🌐"}</span>
                <span className="text-xs font-medium hidden sm:inline">{locale.toUpperCase()}</span>
                <svg className={`w-3 h-3 transition-transform ${langOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg shadow-lg z-50 py-1">
                  {Object.entries(langMap).map(([code, { label, flag }]) => (
                    <button key={code} onClick={() => switchLang(code)}
                      className={`w-full px-3 py-2 text-sm flex items-center gap-2 transition-colors ${code === locale ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20" : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700"} ${locale === "ar" ? "text-right flex-row-reverse" : "text-left"}`}>
                      <span className="text-base">{flag}</span>
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Profile / Get Started */}
            {loggedIn && user ? (
              <div className="relative" ref={profileRef}>
                <button onClick={() => setProfileOpen(!profileOpen)} className="w-9 h-9 rounded-full overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all">
                  <img src={user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.email || "U")}&background=4F46E5&color=fff&size=128&bold=true`} alt={user.name || "User"} className="w-full h-full object-cover" />
                </button>
                {profileOpen && (
                  <div className={`absolute mt-2 w-64 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl shadow-xl z-[70] overflow-hidden ${locale === "ar" ? "left-0" : "right-0"}`}>
                    <div className={`px-4 py-3 border-b border-gray-100 dark:border-slate-700 ${locale === "ar" ? "text-right" : "text-left"}`}>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <button onClick={(e) => { e.stopPropagation(); router.push("/dashboard"); setProfileOpen(false); }}
                        className={`w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors ${locale === "ar" ? "text-right flex-row-reverse" : "text-left"}`}>
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                        {tn("profileDashboard")}
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleLogout(); }}
                        className={`w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition-colors ${locale === "ar" ? "text-right flex-row-reverse" : "text-left"}`}>
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        {tn("profileLogout")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={goToLogin} className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20">
                {t("heroCta")}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
