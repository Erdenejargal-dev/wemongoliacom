"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Calendar,
  MapPin,
  MessageCircle,
  Search,
  User,
  UserPlus,
  Users,
} from "lucide-react";

type Category = "tours" | "stays" | "register";

type RegisterUserResult = {
  success: boolean;
  message: string;
  alreadySignedIn?: boolean;
  autoLogin?: {
    email: string;
    password: string;
  };
  user?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
  };
};

const CATEGORIES: { id: Category; label: string }[] = [
  { id: "tours", label: "Tours" },
  { id: "stays", label: "Stays" },
  { id: "register", label: "Register" },
];

const GUEST_OPTIONS = ["1", "2", "3", "4", "5", "6+"];

const INITIAL_REGISTER_MESSAGES: UIMessage[] = [
  {
    id: "assistant-intro",
    role: "assistant",
    parts: [
      {
        type: "text",
        text: "Hi, I’m the We Mongolia concierge. If you want to sign up, I can register your account right here.",
      },
    ],
  },
];

function isTextPart(part: UIMessage["parts"][number]): part is Extract<UIMessage["parts"][number], { type: "text" }> {
  return part.type === "text";
}

function isRegisterToolResult(value: unknown): value is RegisterUserResult {
  if (!value || typeof value !== "object") return false;

  const record = value as Record<string, unknown>;
  return typeof record.success === "boolean" && typeof record.message === "string";
}

function getRegisterToolResult(message: UIMessage): RegisterUserResult | null {
  for (const part of message.parts) {
    if (part.type !== "tool-registerUser" || part.state !== "output-available") continue;
    return isRegisterToolResult(part.output) ? part.output : null;
  }

  return null;
}

function getRegisterToolError(message: UIMessage): string | null {
  for (const part of message.parts) {
    if (part.type === "tool-registerUser" && part.state === "output-error") {
      return part.errorText;
    }
  }

  return null;
}

export default function HeroInteractive() {
  const router = useRouter();
  const { data: session, status: sessionStatus, update } = useSession();

  const [category, setCategory] = useState<Category>("tours");
  const [destination, setDestination] = useState("");
  const [tourDate, setTourDate] = useState("");
  const [tourGuests, setTourGuests] = useState("2");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [stayGuests, setStayGuests] = useState("2");
  const [registerInput, setRegisterInput] = useState("");
  const [autoLoginError, setAutoLoginError] = useState<string | null>(null);
  const [isAutoLoggingIn, setIsAutoLoggingIn] = useState(false);

  const messagesRef = useRef<HTMLDivElement | null>(null);
  const autoLoginAttemptKeyRef = useRef<string | null>(null);

  const { messages, sendMessage, status, error, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
    messages: INITIAL_REGISTER_MESSAGES,
  });

  useEffect(() => {
    if (!messagesRef.current) return;
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages, status]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (destination.trim()) params.set("destination", destination.trim());

    if (category === "tours") {
      if (tourDate) params.set("date", tourDate);
      if (tourGuests) params.set("guests", tourGuests);
      router.push(`/tours?${params.toString()}`);
      return;
    }

    if (category === "stays") {
      if (checkIn) params.set("checkIn", checkIn);
      if (checkOut) params.set("checkOut", checkOut);
      if (stayGuests) params.set("guests", stayGuests);
      router.push(`/stays?${params.toString()}`);
    }
  };

  const handleSearchKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const submitRegisterMessage = async () => {
    const trimmed = registerInput.trim();
    if (!trimmed || status !== "ready") {
      return;
    }

    setRegisterInput("");
    await sendMessage({ text: trimmed });
  };

  const handleRegisterKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    void submitRegisterMessage();
  };

  const latestRegisterResult = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const result = getRegisterToolResult(messages[i]);
      if (result) return result;
    }

    return null;
  }, [messages]);

  const latestRegisterError = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const result = getRegisterToolError(messages[i]);
      if (result) return result;
    }

    return null;
  }, [messages]);

  const registerSucceeded = latestRegisterResult?.success === true;
  const registerTabLabel =
    sessionStatus === "authenticated" ? "Profile" : "Register";

  const categories = useMemo(
    () =>
      CATEGORIES.map((cat) =>
        cat.id === "register" ? { ...cat, label: registerTabLabel } : cat,
      ),
    [registerTabLabel],
  );

  useEffect(() => {
    const autoLogin = latestRegisterResult?.autoLogin;
    const registeredEmail = latestRegisterResult?.user?.email;

    if (!latestRegisterResult?.success || !autoLogin || !registeredEmail) return;

    if (
      sessionStatus === "authenticated" &&
      session?.user?.email?.toLowerCase() === registeredEmail.toLowerCase()
    ) {
      setAutoLoginError(null);
      setIsAutoLoggingIn(false);
      return;
    }

    const attemptKey = `${registeredEmail}:${latestRegisterResult.message}`;
    if (autoLoginAttemptKeyRef.current === attemptKey) return;
    autoLoginAttemptKeyRef.current = attemptKey;

    let isCancelled = false;

    const autoLoginUser = async () => {
      setAutoLoginError(null);
      setIsAutoLoggingIn(true);

      try {
        if (sessionStatus === "authenticated") {
          await signOut({ redirect: false });
        }

        const result = await signIn("credentials", {
          email: autoLogin.email,
          password: autoLogin.password,
          redirect: false,
        });

        if (isCancelled) return;

        if (result?.error) {
          setAutoLoginError("Account created, but automatic sign-in failed.");
          return;
        }

        await update();
        router.refresh();
      } catch {
        if (!isCancelled) {
          setAutoLoginError("Account created, but automatic sign-in failed.");
        }
      } finally {
        if (!isCancelled) {
          setIsAutoLoggingIn(false);
        }
      }
    };

    void autoLoginUser();

    return () => {
      isCancelled = true;
    };
  }, [latestRegisterResult, router, session, sessionStatus, update]);

  const resetRegisterFlow = () => {
    setRegisterInput("");
    setAutoLoginError(null);
    setIsAutoLoggingIn(false);
    autoLoginAttemptKeyRef.current = null;
    setMessages(INITIAL_REGISTER_MESSAGES);
  };

  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden rounded-[28px] sm:rounded-[36px] lg:rounded-[44px]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://res.cloudinary.com/dyqvc31tb/image/upload/v1776868938/Omni_gobi_Irmuun_Agency_daplep.jpg')",
        }}
        aria-hidden="true"
      />

      <div
        className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/50 to-black/70"
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-3xl px-4 py-28 sm:px-6 sm:py-36">
        <p className="mb-5 text-center text-xs font-semibold uppercase tracking-[0.2em] text-orange-400 sm:text-sm">
          Mongolia Awaits
        </p>

        <h1 className="mb-4 text-center text-4xl font-extrabold leading-[1.15] tracking-tight text-white sm:text-5xl md:text-[3.5rem]">
          Discover the Last
          <br />
          <span className="text-orange-400">Wild Frontier</span>
        </h1>

        <p className="mx-auto mb-12 max-w-lg text-center text-base text-white/65 sm:text-lg">
          Book tours, stays, and create your We Mongolia account in one place.
        </p>

        <div className="rounded-2xl bg-white shadow-2xl">
          <div className="flex">
            {categories.map((cat, i) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={[
                  "relative flex-1 py-4 text-sm font-semibold transition-colors",
                  i === 0 ? "rounded-tl-2xl" : "",
                  i === CATEGORIES.length - 1 ? "rounded-tr-2xl" : "",
                  category === cat.id
                    ? "text-orange-500"
                    : "text-gray-500 hover:text-gray-800",
                ].join(" ")}
                aria-pressed={category === cat.id}
              >
                {cat.label}
                {category === cat.id && (
                  <span className="absolute bottom-0 left-1/2 h-[2px] w-8 -translate-x-1/2 rounded-full bg-orange-500" />
                )}
              </button>
            ))}
          </div>

          <div className="h-px bg-gray-100" />

          <div className="p-5 sm:p-6">
            {category === "tours" && (
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-[2]">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    onKeyDown={handleSearchKey}
                    placeholder="Where do you want to go?"
                    className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm placeholder-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                <div className="relative flex-1">
                  <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    value={tourDate}
                    onChange={(e) => setTourDate(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm text-gray-700 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                <div className="relative flex-1">
                  <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <select
                    value={tourGuests}
                    onChange={(e) => setTourGuests(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-gray-700 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  >
                    {GUEST_OPTIONS.map((g) => (
                      <option key={g} value={g}>
                        {g} {g === "1" ? "Guest" : "Guests"}
                      </option>
                    ))}
                  </select>
                </div>

                <SearchButton onClick={handleSearch} label="Search" />
              </div>
            )}

            {category === "stays" && (
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-[2]">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    onKeyDown={handleSearchKey}
                    placeholder="Destination"
                    className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm placeholder-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                <div className="relative flex-1">
                  <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm text-gray-700 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                <div className="relative flex-1">
                  <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm text-gray-700 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                <div className="relative flex-1">
                  <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <select
                    value={stayGuests}
                    onChange={(e) => setStayGuests(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-gray-700 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  >
                    {GUEST_OPTIONS.map((g) => (
                      <option key={g} value={g}>
                        {g} {g === "1" ? "Guest" : "Guests"}
                      </option>
                    ))}
                  </select>
                </div>

                <SearchButton onClick={handleSearch} label="Search" />
              </div>
            )}

            {category === "register" && (
              <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                <style jsx>{`
                  @keyframes typingDot {
                    0%, 60%, 100% { opacity: 0.2; transform: translateY(0px); }
                    30% { opacity: 1; transform: translateY(-4px); }
                  }
                `}</style>
                <div className="rounded-2xl border border-[#0033A0]/10 bg-gradient-to-br from-[#0033A0]/5 via-white to-[#F9BE02]/10 p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0033A0] text-white shadow-sm">
                      <MessageCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0033A0]">
                        AI Concierge
                      </p>
                      <h3 className="mt-1 text-lg font-bold text-gray-900">
                        {sessionStatus === "authenticated"
                          ? "Your We Mongolia profile"
                          : "Create your We Mongolia account in chat"}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-gray-600">
                        {sessionStatus === "authenticated"
                          ? "You're already signed in. Your current account is active across the site."
                          : "Tell the concierge you want to sign up. It will collect your full name, email, and password, then securely call the register tool for you."}
                      </p>
                    </div>
                  </div>

                  {sessionStatus === "authenticated" ? (
                    <div className="mt-5 rounded-2xl border border-[#0033A0]/15 bg-gradient-to-br from-[#0033A0]/5 to-white p-5 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0033A0] shadow-md">
                          <User className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-widest text-[#0033A0]/70">
                            We Mongolia Traveler
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            {session.user?.name ?? "Traveler"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {session.user?.email}
                          </p>
                        </div>
                      </div>
                      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                        <button
                          type="button"
                          onClick={() => router.push("/account")}
                          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#0033A0] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#002280] active:scale-[0.98]"
                        >
                          View Profile
                          <ArrowUpRight className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            void signOut({ redirect: false }).then(() => {
                              resetRegisterFlow();
                              router.refresh();
                            });
                          }}
                          className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div
                        ref={messagesRef}
                        className="mt-5 h-[320px] overflow-y-auto rounded-2xl border border-gray-100 bg-white p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
                      >
                        <div className="space-y-3">
                          {messages.map((message) => {
                            const textParts = message.parts.filter(isTextPart);
                            const toolResult = getRegisterToolResult(message);
                            const toolError = getRegisterToolError(message);

                            return (
                              <div key={message.id} className="space-y-2">
                                {textParts.map((part, index) => (
                                  <div
                                    key={`${message.id}-text-${index}`}
                                    className={
                                      message.role === "assistant"
                                        ? "flex items-end gap-2 justify-start"
                                        : "flex items-end gap-2 justify-end"
                                    }
                                  >
                                    {message.role === "assistant" && (
                                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0033A0] text-xs font-bold text-white">
                                        WM
                                      </div>
                                    )}
                                    <div
                                      className={[
                                        "max-w-[85%] px-4 py-3 text-sm leading-6 shadow-sm",
                                        message.role === "assistant"
                                          ? "rounded-2xl rounded-tl-sm border border-gray-200 bg-white text-gray-800"
                                          : "rounded-2xl rounded-tr-sm bg-[#0033A0] text-white",
                                      ].join(" ")}
                                    >
                                      {part.text}
                                    </div>
                                    {message.role === "user" && (
                                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                                        <User className="h-4 w-4 text-gray-500" />
                                      </div>
                                    )}
                                  </div>
                                ))}

                                {toolResult && (
                                  <div className="flex justify-start">
                                    <div
                                      className={[
                                        "max-w-[88%] rounded-2xl border px-4 py-3 text-sm shadow-sm",
                                        toolResult.success
                                          ? "border-[#F9BE02]/50 bg-[#F9BE02]/15 text-yellow-900"
                                          : "border-amber-200 bg-amber-50 text-amber-800",
                                      ].join(" ")}
                                    >
                                      {toolResult.message}
                                    </div>
                                  </div>
                                )}

                                {toolError && (
                                  <div className="flex justify-start">
                                    <div className="max-w-[88%] rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
                                      {toolError}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          {(status === "streaming" || isAutoLoggingIn) && (
                            <div className="flex items-end gap-2 justify-start">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0033A0] text-xs font-bold text-white">
                                WM
                              </div>
                              <div className="rounded-2xl rounded-tl-sm border border-gray-200 bg-white px-4 py-3 shadow-sm">
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className="h-1.5 w-1.5 rounded-full bg-[#0033A0]"
                                    style={{ animation: "typingDot 1.2s ease-in-out 0s infinite" }}
                                  />
                                  <span
                                    className="h-1.5 w-1.5 rounded-full bg-[#0033A0]"
                                    style={{ animation: "typingDot 1.2s ease-in-out 0.2s infinite" }}
                                  />
                                  <span
                                    className="h-1.5 w-1.5 rounded-full bg-[#0033A0]"
                                    style={{ animation: "typingDot 1.2s ease-in-out 0.4s infinite" }}
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {error && (
                            <div className="flex justify-start">
                              <div className="max-w-[88%] rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
                                {error.message}
                              </div>
                            </div>
                          )}

                          {autoLoginError && (
                            <div className="flex justify-start">
                              <div className="max-w-[88%] rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 shadow-sm">
                                {autoLoginError}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                        <div className="flex-1">
                          
                          <input
                            type="text"
                            value={registerInput}
                            onChange={(e) => setRegisterInput(e.target.value)}
                            onKeyDown={handleRegisterKey}
                            disabled={
                              isAutoLoggingIn ||
                              (status !== "ready" && status !== "error")
                            }
                            placeholder="I want to create an account"
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#0033A0] focus:ring-2 focus:ring-[#0033A0]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => void submitRegisterMessage()}
                          disabled={
                            isAutoLoggingIn ||
                            !registerInput.trim() ||
                            (status !== "ready" && status !== "error")
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0033A0] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#002280] disabled:cursor-not-allowed disabled:bg-gray-300"
                        >
                          <UserPlus className="h-4 w-4" />
                          Send
                        </button>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex flex-col justify-between rounded-2xl bg-gray-950 p-5 text-white shadow-xl">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F9BE02]">
                      What happens next
                    </p>
                    <div className="mt-4 space-y-3">
                      <FeaturePill
                        title={
                          sessionStatus === "authenticated"
                            ? "Live session"
                            : "AI-guided"
                        }
                        text={
                          sessionStatus === "authenticated"
                            ? "Your current We Mongolia session is active, so the site can show your profile and account actions right away."
                            : "The concierge naturally asks for the details it still needs."
                        }
                      />
                      <FeaturePill
                        title="Secure bridge"
                        text={
                          sessionStatus === "authenticated"
                            ? "The session is backed by your NextAuth cookie, which carries the backend access and refresh tokens after sign-in."
                            : "Registration is executed through your existing server proxy, and automatic sign-in stores the new session in the app cookie."
                        }
                      />
                      
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                    {sessionStatus === "authenticated" ? (
                      <>
                        <p className="text-sm font-semibold text-white">
                          Signed in
                        </p>
                        <p className="mt-1 text-sm leading-6 text-white/65">
                          {session.user?.email
                            ? `Your active session belongs to ${session.user.email}.`
                            : "Your We Mongolia session is active."}
                        </p>
                        <button
                          type="button"
                          onClick={() => router.push("/account")}
                          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#F9BE02] transition hover:text-[#F9BE02]/80"
                        >
                          Open profile
                          <ArrowUpRight className="h-4 w-4" />
                        </button>
                      </>
                    ) : registerSucceeded ? (
                      <>
                        <p className="text-sm font-semibold text-white">
                          {isAutoLoggingIn
                            ? "Account created, signing you in"
                            : "Account created successfully"}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-white/65">
                          {isAutoLoggingIn
                            ? "We are replacing the old session with your new traveler account now."
                            : latestRegisterResult?.user?.email
                              ? `You can now sign in with ${latestRegisterResult.user.email}.`
                              : "You can now sign in and start planning your trip."}
                        </p>
                        {!isAutoLoggingIn && (
                          <button
                            type="button"
                            onClick={() => router.push("/auth/login")}
                            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#F9BE02] transition hover:text-[#F9BE02]/80"
                          >
                            Go to login
                            <ArrowUpRight className="h-4 w-4" />
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-semibold text-white">
                          Already have an account?
                        </p>
                        <p className="mt-1 text-sm leading-6 text-white/65">
                          You can sign in and start planning your Mongolia trip right away.
                        </p>
                        <button
                          type="button"
                          onClick={() => router.push("/auth/login")}
                          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#F9BE02] transition hover:text-[#F9BE02]/80"
                        >
                          Go to login
                          <ArrowUpRight className="h-4 w-4" />
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={resetRegisterFlow}
                      className="mt-4 block text-sm text-white/55 transition hover:text-white"
                    >
                      Restart chat
                    </button>

                    {latestRegisterError && (
                      <p className="mt-3 text-sm leading-6 text-amber-300">
                        {latestRegisterError}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-gray-100 px-5 py-4 sm:px-6">
            <TrustItem text="Verified local providers" />
            <TrustItem text="Instant confirmation" />
            <TrustItem text="Free cancellation on most bookings" />
          </div>
        </div>
      </div>
    </section>
  );
}

function SearchButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className="whitespace-nowrap rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-orange-600 active:scale-[0.97]"
    >
      <span className="flex items-center justify-center gap-2">
        <Search className="h-4 w-4" />
        {label}
      </span>
    </button>
  );
}

function TrustItem({ text }: { text: string }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-gray-500">
      <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-400" />
      {text}
    </span>
  );
}

function FeaturePill({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-400">
        {title}
      </p>
      <p className="mt-1 text-sm leading-6 text-white/75">{text}</p>
    </div>
  );
}
