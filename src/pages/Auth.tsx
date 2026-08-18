import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import { useAuth } from "@/hooks/use-auth";
import {
  ArrowRight,
  FlaskConical,
  HeartPulse,
  Loader2,
  Mail,
  Pill,
  Radio,
  Shield,
  Stethoscope,
  Syringe,
  UserX,
  Workflow,
} from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

interface AuthProps {
  redirectAfterAuth?: string;
}

function resolveRedirectAfterAuth(
  returnTo: string | null,
  fallback = "/dashboard",
) {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }
  return fallback;
}

const roleCards = [
  {
    icon: Stethoscope,
    title: "Doctors",
    desc: "Patient profiles, orders, vitals",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    icon: FlaskConical,
    title: "Laboratory",
    desc: "Test orders, results, samples",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
  },
  {
    icon: Pill,
    title: "Pharmacy",
    desc: "Prescriptions, inventory, dispensing",
    color: "text-violet-400",
    bg: "bg-violet-400/10",
  },
  {
    icon: Radio,
    title: "Radiology",
    desc: "Imaging orders, scans, reports",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
  {
    icon: Syringe,
    title: "Nursing",
    desc: "Care plans, vitals, observations",
    color: "text-rose-400",
    bg: "bg-rose-400/10",
  },
  {
    icon: Shield,
    title: "Administration",
    desc: "System management, analytics",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
  },
];

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirectAfterAuth(
    searchParams.get("returnTo"),
    redirectAfterAuth,
  );
  const [step, setStep] = useState<"signIn" | { email: string }>("signIn");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirect);
    }
  }, [authLoading, isAuthenticated, navigate, redirect]);

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      setStep({ email: formData.get("email") as string });
      setIsLoading(false);
    } catch (err) {
      console.error("Email sign-in error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to send verification code. Please try again.",
      );
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      navigate(redirect);
    } catch (err) {
      console.error("OTP verification error:", err);
      setError("The verification code you entered is incorrect.");
      setIsLoading(false);
      setOtp("");
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("anonymous");
      navigate(redirect);
    } catch (err) {
      console.error("Guest login error:", err);
      setError(
        `Failed to sign in as guest: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-mesh bg-dots overflow-hidden">
      {/* ─── Left Panel — Visual Branding ─────────────── */}
      <div className="hidden lg:flex lg:w-[55%] relative flex-col justify-between p-12 overflow-hidden">
        {/* Gradient orbs */}
        <div className="pointer-events-none absolute -left-40 -top-40 size-[600px] rounded-full bg-primary/8 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 right-0 size-[500px] rounded-full bg-[oklch(0.65_0.12_180)]/6 blur-[100px]" />

        {/* Top nav */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15">
            <Workflow className="size-5 text-primary" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground font-mono">
            rayan
          </span>
        </div>

        {/* Center content */}
        <div className="relative z-10 max-w-lg">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-foreground">
            Hospital operations,{" "}
            <span className="text-primary">controlled.</span>
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            Patient records, department orders, and vitals — all routed through
            a single typed interface. Built for the team that keeps the hospital
            running.
          </p>

          {/* Role cards grid */}
          <div className="mt-10 grid grid-cols-2 gap-3">
            {roleCards.map((card) => (
              <div
                key={card.title}
                className="glass glass-hover group flex items-center gap-3 rounded-xl px-4 py-3 transition-all"
              >
                <div
                  className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${card.bg} transition-transform group-hover:scale-110`}
                >
                  <card.icon className={`size-4.5 ${card.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {card.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {card.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="relative z-10 flex items-center gap-6 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Shield className="size-3.5 text-primary" />
            End-to-end typed
          </span>
          <span className="flex items-center gap-1.5">
            <HeartPulse className="size-3.5 text-primary" />
            Real-time vitals
          </span>
          <span className="flex items-center gap-1.5">
            <Workflow className="size-3.5 text-primary" />
            Full audit trail
          </span>
        </div>
      </div>

      {/* ─── Right Panel — Sign-in Form ───────────────── */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15">
              <Workflow className="size-5 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground font-mono">
              rayan
            </span>
          </div>

          {step === "signIn" ? (
            <div>
              <h2 className="text-2xl font-bold text-foreground tracking-tight">
                Welcome back
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Sign in to access the operations dashboard
              </p>

              <form onSubmit={handleEmailSubmit} className="mt-8 space-y-5">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      name="email"
                      placeholder="you@hospital.org"
                      type="email"
                      className="pl-10 h-12 glass rounded-xl border-white/8 bg-white/4 focus:border-primary/40 focus:ring-2 focus:ring-primary/10 focus:bg-white/6"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
                >
                  {isLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <span className="flex items-center gap-2">
                      Send verification code
                      <ArrowRight className="size-4" />
                    </span>
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/8" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="px-3 text-muted-foreground bg-transparent tracking-wider">
                      or
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 glass glass-hover rounded-xl border-white/8 font-medium text-sm"
                  onClick={handleGuestLogin}
                  disabled={isLoading}
                >
                  <UserX className="mr-2 size-4" />
                  Continue as Guest
                </Button>
              </form>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold text-foreground tracking-tight">
                Check your email
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                We sent a 6-digit code to{" "}
                <span className="font-medium text-foreground">
                  {step.email}
                </span>
              </p>

              <form onSubmit={handleOtpSubmit} className="mt-8 space-y-6">
                <input type="hidden" name="email" value={step.email} />
                <input type="hidden" name="code" value={otp} />

                <div className="flex justify-center">
                  <InputOTP
                    value={otp}
                    onChange={setOtp}
                    maxLength={6}
                    disabled={isLoading}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && otp.length === 6 && !isLoading) {
                        const form = (
                          e.target as HTMLElement
                        ).closest("form");
                        if (form) form.requestSubmit();
                      }
                    }}
                  >
                    <InputOTPGroup>
                      {Array.from({ length: 6 }).map((_, index) => (
                        <InputOTPSlot
                          key={index}
                          index={index}
                          className="glass h-14 w-12 rounded-xl text-lg font-mono"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                {error && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3">
                    <p className="text-sm text-destructive text-center">
                      {error}
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
                  disabled={isLoading || otp.length !== 6}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin" />
                      Verifying…
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Verify code
                      <ArrowRight className="size-4" />
                    </span>
                  )}
                </Button>

                <div className="flex flex-col items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("signIn");
                      setOtp("");
                      setError(null);
                    }}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Use a different email
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStep("signIn");
                      setOtp("");
                      setError(null);
                    }}
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    Didn't receive a code? Try again
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-white/5">
            <p className="text-xs text-center text-muted-foreground">
              Internal tool · Not for public distribution · Role-based access
              enforced
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}
