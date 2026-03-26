"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
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
  Users,
} from "lucide-react";
import {
  sanitizeCallbackUrl,
  getDefaultRedirect,
  buildRegisterUrl,
} from "@/lib/navigation";

/* ── Locale-aware copy ──────────────────────────────────────────────────── */

const COPY = {
  default: {
    heading: "Welcome back",
    subtitle: "Sign in to explore and book authentic Mongolian experiences.",
    emailLabel: "Email address",
    emailPlaceholder: "you@example.com",
    passwordLabel: "Password",
    forgotPassword: "Forgot password?",
    submit: "Sign in",
    submitting: "Signing in…",
    noAccount: "Don\u2019t have an account?",
    createAccount: "Create one",
    errorInvalid: "Invalid email or password. Please try again.",
    errorGeneric: "Something went wrong. Please try again.",
    panelBadge: "Trusted by travelers worldwide",
    panelHeading: "Discover authentic Mongolia",
    panelSubtitle:
      "Connect with local guides, book unique experiences, and explore one of the world\u2019s last great frontiers.",
    trustItems: [
      "Curated tours by local Mongolian providers",
      "Verified experiences with secure booking",
      "Join a community of adventurous travelers",
    ],
  },
  host: {
    heading: "Тавтай морил",
    subtitle:
      "Нэвтэрч, аялалын үйлчилгээгээ WeMongolia-р дамжуулан санал болгоорой.",
    emailLabel: "Имэйл хаяг",
    emailPlaceholder: "you@example.com",
    passwordLabel: "Нууц үг",
    forgotPassword: "Нууц үг мартсан?",
    submit: "Нэвтрэх",
    submitting: "Нэвтэрч байна…",
    noAccount: "Бүртгэл үүсгээгүй юу?",
    createAccount: "Бүртгүүлэх",
    errorInvalid: "Имэйл эсвэл нууц үг буруу байна. Дахин оролдоно уу.",
    errorGeneric: "Алдаа гарлаа. Дахин оролдоно уу.",
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

const TRUST_ICONS = [MapPin, Shield, Users];

/* ── Component ──────────────────────────────────────────────────────────── */

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = sanitizeCallbackUrl(searchParams.get("callbackUrl"));
  const isHostIntent = callbackUrl?.includes("/onboarding");
  const t = isHostIntent ? COPY.host : COPY.default;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(t.errorInvalid);
      } else {
        if (callbackUrl) {
          router.push(callbackUrl);
        } else {
          const fresh = await getSession();
          router.push(getDefaultRedirect(fresh?.user?.role));
        }
        router.refresh();
      }
    } catch {
      setError(t.errorGeneric);
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyles =
    "h-11 rounded-xl border-gray-200 px-4 placeholder:text-gray-400 focus-visible:border-[#1db681] focus-visible:ring-[#1db681]/20";

  return (
    <div className={cn("grid min-h-svh lg:grid-cols-2", className)} {...props}>
      {/* ── Form Panel ─────────────────────────────────────────────── */}
      <div className="flex min-h-svh flex-col bg-white lg:relative">
        <div className="h-1 bg-gradient-to-r from-[#1db681] to-[#4466b0] lg:hidden" />

       

        {/* Form — vertically centered in the full panel */}
        <div className="flex flex-1 flex-col justify-center px-6 py-10 sm:px-10 lg:px-16 xl:px-20">
          <div className="mx-auto w-full max-w-[420px]">
            <div className="mb-8">
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
                  htmlFor="login-email"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  {t.emailLabel}
                </label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder={t.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="email"
                  className={inputStyles}
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="login-password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {t.passwordLabel}
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-[13px] font-medium text-gray-400 transition-colors hover:text-gray-600"
                  >
                    {t.forgotPassword}
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete="current-password"
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
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="h-11 w-full rounded-xl bg-[#1db681] text-[15px] font-semibold text-white shadow-none transition-colors hover:bg-[#19a573] disabled:opacity-50"
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
              {t.noAccount}{" "}
              <Link
                href={buildRegisterUrl(callbackUrl)}
                className="font-semibold text-[#1db681] transition-colors hover:text-[#19a573]"
              >
                {t.createAccount}
              </Link>
            </p>

            {isHostIntent ? (
              <p className="mt-8 text-center text-xs leading-relaxed text-gray-400">
                Үргэлжлүүлснээр та манай{" "}
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
                By continuing, you agree to our{" "}
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
      <div className="relative hidden overflow-hidden lg:flex lg:items-center lg:justify-center bg-gradient-to-br from-[#1db681] via-[#1a9e6e] to-[#4466b0]">
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
          <div className="inline-flex items-center gap-2 rounded-full bg-white/[0.12] px-4 py-1.5 text-[13px] font-medium text-white backdrop-blur-sm">
            <MapPin className="h-3.5 w-3.5" />
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
