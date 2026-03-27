"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  MapPin,
  Shield,
  Compass,
} from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { sanitizeCallbackUrl, buildLoginUrl } from "@/lib/navigation";
import { WeMongoliaLogo } from "@/components/brand/WeMongoliaLogo";

/* ── Locale-aware copy ──────────────────────────────────────────────────── */

const COPY = {
  default: {
    heading: "Create your account",
    subtitle:
      "Join WeMongolia and start exploring authentic Mongolian experiences.",
    nameLabel: "Full name",
    namePlaceholder: "Your full name",
    emailLabel: "Email address",
    emailPlaceholder: "you@example.com",
    passwordLabel: "Password",
    passwordHint: "Must be at least 8 characters",
    confirmLabel: "Confirm password",
    submit: "Create account",
    submitting: "Creating account…",
    hasAccount: "Already have an account?",
    signInLink: "Sign in",
    errorMismatch: "Passwords do not match.",
    errorGeneric: "Failed to create account. Please try again.",
    panelBadge: "Your adventure starts here",
    panelHeading: "Experience the real Mongolia",
    panelSubtitle:
      "From the vast Gobi Desert to the Khuvsgul lakeshores \u2014 find experiences that connect you to this extraordinary land.",
    trustItems: [
      "Explore Mongolia\u2019s most unique destinations",
      "Book with confidence \u2014 secure payments",
      "Support local guides and communities",
    ],
  },
  host: {
    heading: "Бүртгүүлэх",
    subtitle:
      "WeMongolia-д нэгдэж, аялалын үйлчилгээгээ санал болгож эхлээрэй.",
    nameLabel: "Овог нэр",
    namePlaceholder: "Таны бүтэн нэр",
    emailLabel: "Имэйл хаяг",
    emailPlaceholder: "you@example.com",
    passwordLabel: "Нууц үг",
    passwordHint: "Хамгийн багадаа 8 тэмдэгт",
    confirmLabel: "Нууц үг давтах",
    submit: "Бүртгүүлэх",
    submitting: "Бүртгэж байна…",
    hasAccount: "Бүртгэлтэй юу?",
    signInLink: "Нэвтрэх",
    errorMismatch: "Нууц үг таарахгүй байна.",
    errorGeneric: "Бүртгэл амжилтгүй боллоо. Дахин оролдоно уу.",
    panelBadge: "Итгэлтэй түншлэл",
    panelHeading: "Монголоо дэлхийд нээ",
    panelSubtitle:
      "Аялагчдад өвөрмөц мэдрэмж бэлэглэж, орлогоо нэмэгдүүлээрэй.",
    trustItems: [
      "Аяллаа хялбар бүртгэж, удирдаарай",
      "Баталгаатай төлбөр, найдвартай систем",
      "Олон улсын аялагчидтай холбогдоорой",
    ],
  },
} as const;

const TRUST_ICONS = [Compass, Shield, MapPin];

/* ── Component ──────────────────────────────────────────────────────────── */

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = sanitizeCallbackUrl(searchParams.get("callbackUrl"));
  const isHostIntent = callbackUrl?.includes("/onboarding");
  const t = isHostIntent ? COPY.host : COPY.default;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError(t.errorMismatch);
      setIsLoading(false);
      return;
    }

    try {
      const fullName = formData.name.trim().replace(/\s+/g, " ");
      const [firstName, ...rest] = fullName.split(" ");
      const lastName = rest.join(" ").trim() || "User";

      await apiClient.post("/auth/register", {
        firstName,
        lastName,
        email: formData.email,
        password: formData.password,
        role: "traveler",
      });

      const loginResult = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (loginResult?.error) {
        const loginUrl = callbackUrl
          ? `${buildLoginUrl(callbackUrl)}&registered=true`
          : "/auth/login?registered=true";
        router.push(loginUrl);
      } else {
        router.push(callbackUrl || "/dashboard");
        router.refresh();
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : t.errorGeneric,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loginHref = callbackUrl ? buildLoginUrl(callbackUrl) : "/auth/login";

  const inputStyles =
    "h-11 rounded-xl border-gray-200 px-4 placeholder:text-gray-400 focus-visible:border-[#0285C9] focus-visible:ring-[#0285C9]/20";

  return (
    <div className={cn("grid min-h-svh lg:grid-cols-2", className)} {...props}>
      {/* ── Form Panel ─────────────────────────────────────────────── */}
      <div className="flex min-h-svh flex-col bg-white lg:relative">
        <div className="h-1 bg-gradient-to-r from-[#4466b0] to-[#0285C9] lg:hidden" />

     
        <div className="flex flex-1 flex-col justify-center px-6 py-10 sm:px-10 lg:px-16 xl:px-20">
          <div className="mx-auto w-full max-w-[420px]">
            <div className="mb-8">
              <Link href="/" className="mb-6 inline-block">
                <WeMongoliaLogo className="h-8 w-auto" />
              </Link>
              <h1 className="text-[26px] font-semibold tracking-tight text-gray-900 sm:text-[30px]">
                {t.heading}
              </h1>
              <p className="mt-2.5 text-[15px] leading-relaxed text-gray-500">
                {t.subtitle}
              </p>
            </div>

            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50/80 px-4 py-3.5">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                <p className="text-sm leading-snug text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="reg-name"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  {t.nameLabel}
                </label>
                <Input
                  id="reg-name"
                  name="name"
                  type="text"
                  placeholder={t.namePlaceholder}
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  autoComplete="name"
                  className={inputStyles}
                />
              </div>

              <div>
                <label
                  htmlFor="reg-email"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  {t.emailLabel}
                </label>
                <Input
                  id="reg-email"
                  name="email"
                  type="email"
                  placeholder={t.emailPlaceholder}
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  autoComplete="email"
                  className={inputStyles}
                />
              </div>

              <div>
                <label
                  htmlFor="reg-password"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  {t.passwordLabel}
                </label>
                <div className="relative">
                  <Input
                    id="reg-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    minLength={8}
                    autoComplete="new-password"
                    className={cn(inputStyles, "pr-11")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-[18px] w-[18px]" />
                    ) : (
                      <Eye className="h-[18px] w-[18px]" />
                    )}
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-gray-400">{t.passwordHint}</p>
              </div>

              <div>
                <label
                  htmlFor="reg-confirm"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  {t.confirmLabel}
                </label>
                <Input
                  id="reg-confirm"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  minLength={8}
                  autoComplete="new-password"
                  className={inputStyles}
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="h-11 w-full rounded-xl bg-[#0285C9] text-[15px] font-semibold text-white shadow-none transition-colors hover:bg-[#0269A3] disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t.submitting}
                  </>
                ) : (
                  t.submit
                )}
              </Button>
            </form>

            <p className="mt-8 text-center text-[15px] text-gray-500">
              {t.hasAccount}{" "}
              <Link
                href={loginHref}
                className="font-semibold text-[#0285C9] transition-colors hover:text-[#0269A3]"
              >
                {t.signInLink}
              </Link>
            </p>

            {isHostIntent ? (
              <p className="mt-8 text-center text-xs leading-relaxed text-gray-400">
                Бүртгүүлснээр та манай{" "}
                <a href="#" className="underline underline-offset-2 transition-colors hover:text-gray-600">
                  Үйлчилгээний нөхцөл
                </a>{" "}
                болон{" "}
                <a href="#" className="underline underline-offset-2 transition-colors hover:text-gray-600">
                  Нууцлалын бодлого
                </a>
                -ыг зөвшөөрч байна.
              </p>
            ) : (
              <p className="mt-8 text-center text-xs leading-relaxed text-gray-400">
                By creating an account, you agree to our{" "}
                <a href="#" className="underline underline-offset-2 transition-colors hover:text-gray-600">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="underline underline-offset-2 transition-colors hover:text-gray-600">
                  Privacy Policy
                </a>
                .
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Visual Panel ──────────────────────────────────────────── */}
      <div className="relative hidden overflow-hidden lg:flex lg:items-center lg:justify-center bg-gradient-to-br from-[#4466b0] via-[#2d5a9a] to-[#0285C9]">
        <svg
          className="pointer-events-none absolute -right-20 -top-20 h-[640px] w-[640px] opacity-[0.06]"
          viewBox="0 0 640 640"
          fill="none"
        >
          {[180, 230, 280, 330, 380, 430, 480].map((r) => (
            <circle key={r} cx="320" cy="320" r={r} stroke="white" strokeWidth="1" />
          ))}
        </svg>
        <svg
          className="pointer-events-none absolute -bottom-28 -left-28 h-[520px] w-[520px] opacity-[0.06]"
          viewBox="0 0 520 520"
          fill="none"
        >
          {[140, 190, 240, 290, 340].map((r) => (
            <circle key={r} cx="260" cy="260" r={r} stroke="white" strokeWidth="1" />
          ))}
        </svg>

        <div className="relative z-10 max-w-[420px] px-12 xl:px-16">
          <Link href="/" className="mb-10 inline-block">
            <WeMongoliaLogo variant="white" className="h-8 w-auto max-w-[220px]" />
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/[0.12] px-4 py-1.5 text-[13px] font-medium text-white backdrop-blur-sm">
            <Compass className="h-3.5 w-3.5" />
            {t.panelBadge}
          </div>

          <h2 className="mt-6 text-[32px] font-semibold leading-[1.15] tracking-tight text-white xl:text-[36px]">
            {t.panelHeading}
          </h2>
          <p className="mt-3.5 text-[15px] leading-relaxed text-white/70">
            {t.panelSubtitle}
          </p>

          <div className="mt-10 space-y-4">
            {t.trustItems.map((text, i) => {
              const Icon = TRUST_ICONS[i];
              return (
                <div key={i} className="flex items-center gap-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                    <Icon className="h-4 w-4 text-white/90" />
                  </div>
                  <span className="text-[15px] leading-snug text-white/80">
                    {text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/[0.06] to-transparent" />
      </div>
    </div>
  );
}
