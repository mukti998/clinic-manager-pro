import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useAuth } from "@/hooks/use-auth";
import { ROLE_TEMPLATES, type DemoRole, setDemoRole, enableDemoMode, isConvexConfigured } from "@/lib/demo-data";
import {
  ArrowLeft, ArrowRight, HeartPulse, Loader2, Lock, Mail, Shield,
  Stethoscope, User, UserCheck, Workflow,
} from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

interface AuthProps { redirectAfterAuth?: string; }

function resolveRedirectAfterAuth(returnTo: string | null, fallback = "/dashboard") {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) return returnTo;
  return fallback;
}

const roleHighlights = [
  { icon: Stethoscope, label: "Clinical staff", desc: "Patient care and consultations" },
  { icon: Workflow, label: "Operations", desc: "Registration and routing" },
  { icon: Shield, label: "Administration", desc: "System and staff management" },
];

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirectAfterAuth(searchParams.get("returnTo"), redirectAfterAuth);

  const [step, setStep] = useState<"pickRole" | "signIn" | { email: string }>(
    isConvexConfigured() ? "signIn" : "pickRole",
  );
  const [selectedRole, setSelectedRole] = useState<DemoRole>("doctor");
  const [staffName, setStaffName] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) navigate(redirect);
  }, [authLoading, isAuthenticated, navigate, redirect]);

  // ─── Demo: Sign in with selected role ─────────────────
  const handleRoleSignIn = () => {
    if (!staffName.trim()) { setError("Please enter your name."); return; }
    const template = ROLE_TEMPLATES.find((t) => t.role === selectedRole) || ROLE_TEMPLATES[0];
    enableDemoMode();
    setDemoRole(selectedRole, staffName.trim());
    navigate(redirect);
  };

  // ─── Real: Email OTP ──────────────────────────────────
  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setIsLoading(true); setError(null);
    try {
      const formData = new FormData(e.currentTarget);
      await signIn("email-otp", formData);
      setStep({ email: formData.get("email") as string });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send verification code.");
    } finally { setIsLoading(false); }
  };

  const handleOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setIsLoading(true); setError(null);
    try {
      const formData = new FormData(e.currentTarget);
      await signIn("email-otp", formData);
      navigate(redirect);
    } catch {
      setError("The verification code is incorrect.");
      setIsLoading(false); setOtp("");
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true); setError(null);
    try {
      await signIn("anonymous");
      navigate(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in.");
      setIsLoading(false);
    }
  };

  const selectedTemplate = ROLE_TEMPLATES.find((t) => t.role === selectedRole) || ROLE_TEMPLATES[0];

  return (
    <div className="min-h-screen flex bg-gradient-mesh bg-dots overflow-hidden">
      {/* ─── Left Panel — Branding ─────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-12 overflow-hidden">
        <div className="pointer-events-none absolute -left-40 -top-40 size-[500px] rounded-full bg-primary/6 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 right-0 size-[400px] rounded-full bg-[oklch(0.62_0.14_170)]/5 blur-[100px]" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15">
            <Stethoscope className="size-5 text-primary" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-foreground">Rayan</span>
            <p className="text-[10px] text-muted-foreground -mt-0.5">Hospital System</p>
          </div>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-foreground">
            Hospital operations, <span className="text-primary">under control.</span>
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            Patient records, department routing, and clinical workflows — all
            managed through a single secure platform.
          </p>
          <div className="mt-10 space-y-3">
            {roleHighlights.map((card) => (
              <div key={card.label} className="glass glass-hover group flex items-center gap-3.5 rounded-xl px-4 py-3 transition-all">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 transition-transform group-hover:scale-105">
                  <card.icon className="size-4.5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{card.label}</p>
                  <p className="text-xs text-muted-foreground">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-6 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><Shield className="size-3.5 text-primary" /> End-to-end encryption</span>
          <span className="flex items-center gap-1.5"><Lock className="size-3.5 text-primary" /> Role-based access</span>
          <span className="flex items-center gap-1.5"><HeartPulse className="size-3.5 text-primary" /> Real-time vitals</span>
        </div>
      </div>

      {/* ─── Right Panel ────────────────────────────── */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15">
              <Stethoscope className="size-5 text-primary" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-foreground">Rayan</span>
              <p className="text-[10px] text-muted-foreground -mt-0.5">Hospital System</p>
            </div>
          </div>

          {/* ─── Step 1: Role Selection (Demo Mode) ── */}
          {step === "pickRole" && (
            <div>
              <h2 className="text-2xl font-bold text-foreground tracking-tight">Sign in to Rayan</h2>
              <p className="mt-2 text-sm text-muted-foreground">Select your role and enter your name to continue</p>

              {/* Role Grid */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                {ROLE_TEMPLATES.map((t) => {
                  const Icon = t.role === "doctor" ? Stethoscope : t.role === "nurse" ? HeartPulse : t.role === "pharmacist" ? UserCheck : t.role === "lab_technician" ? FlaskIcon : t.role === "receptionist" ? User : Shield;
                  const isActive = selectedRole === t.role;
                  return (
                    <button key={t.role} onClick={() => { setSelectedRole(t.role); setStaffName(t.defaultName); setError(null); }}
                      className={`glass-card p-4 text-left transition-all hover:ring-1 hover:ring-primary/20 ${isActive ? "ring-1 ring-primary/40 bg-primary/[0.04]" : ""}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`flex size-8 items-center justify-center rounded-lg ${isActive ? "bg-primary/20" : "bg-white/5"}`}>
                          <Icon className={`size-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                        </div>
                        <span className={`badge ${t.badge} text-[10px]`}>{t.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{t.specialization}</p>
                    </button>
                  );
                })}
              </div>

              {/* Name Input */}
              <div className="mt-5">
                <label className="text-sm font-medium text-foreground mb-1.5 block flex items-center gap-1.5">
                  <User className="size-3.5" /> Your Name
                </label>
                <div className="relative">
                  <Input value={staffName} onChange={(e) => { setStaffName(e.target.value); setError(null); }}
                    placeholder={selectedTemplate.defaultName}
                    className="input-field h-12" />
                </div>
                <p className="text-[11px] text-muted-foreground mt-1.5">
                  Signing in as <span className={`badge ${selectedTemplate.badge} text-[10px] ml-1`}>{selectedTemplate.label}</span> — {selectedTemplate.specialization}
                </p>
              </div>

              {error && (
                <div className="mt-3 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <Button onClick={handleRoleSignIn}
                className="mt-6 w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
                <span className="flex items-center gap-2">
                  Continue as {selectedTemplate.label} <ArrowRight className="size-4" />
                </span>
              </Button>

              {isConvexConfigured() && (
                <button onClick={() => setStep("signIn")}
                  className="mt-4 w-full text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Use team email instead
                </button>
              )}

              <div className="mt-10 pt-6 border-t border-white/5">
                <p className="text-xs text-center text-muted-foreground">
                  Internal tool · Role-based access enforced
                </p>
              </div>
            </div>
          )}

          {/* ─── Step 2: Email OTP (Real Auth) ──────── */}
          {step === "signIn" && (
            <div>
              <h2 className="text-2xl font-bold text-foreground tracking-tight">Welcome back</h2>
              <p className="mt-2 text-sm text-muted-foreground">Sign in with your team credentials</p>

              <form onSubmit={handleEmailSubmit} className="mt-8 space-y-5">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input name="email" placeholder="you@hospital.org" type="email" className="input-field pl-10 h-12" disabled={isLoading} required />
                  </div>
                </div>
                {error && <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3"><p className="text-sm text-destructive">{error}</p></div>}
                <Button type="submit" disabled={isLoading}
                  className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
                  {isLoading ? <Loader2 className="size-4 animate-spin" /> : <span className="flex items-center gap-2">Send verification code <ArrowRight className="size-4" /></span>}
                </Button>
                <div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/6" /></div><div className="relative flex justify-center text-xs uppercase"><span className="px-3 text-muted-foreground bg-transparent tracking-wider">or</span></div></div>
                <Button type="button" variant="outline" className="w-full h-12 glass glass-hover rounded-xl border-white/6 font-medium text-sm" onClick={handleGuestLogin} disabled={isLoading}>
                  Continue as Guest
                </Button>
              </form>

              <div className="flex flex-col items-center gap-2 mt-6">
                <button onClick={() => { setStep("signIn"); setOtp(""); setError(null); }} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Use a different email</button>
                <button onClick={() => setStep("pickRole")} className="text-sm text-primary hover:text-primary/80 transition-colors">Back to role selection</button>
              </div>
            </div>
          )}

          {/* ─── Step 3: OTP Verification ───────────── */}
          {typeof step === "object" && (
            <div>
              <button onClick={() => setStep("signIn")} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors mb-4">
                <ArrowLeft className="size-4" /> Back
              </button>
              <h2 className="text-2xl font-bold text-foreground tracking-tight">Check your email</h2>
              <p className="mt-2 text-sm text-muted-foreground">We sent a 6-digit code to <span className="font-medium text-foreground">{step.email}</span></p>
              <form onSubmit={handleOtpSubmit} className="mt-8 space-y-6">
                <input type="hidden" name="email" value={step.email} />
                <input type="hidden" name="code" value={otp} />
                <div className="flex justify-center">
                  <InputOTP value={otp} onChange={setOtp} maxLength={6} disabled={isLoading}
                    onKeyDown={(e) => { if (e.key === "Enter" && otp.length === 6 && !isLoading) { const form = (e.target as HTMLElement).closest("form"); if (form) form.requestSubmit(); } }}>
                    <InputOTPGroup>
                      {Array.from({ length: 6 }).map((_, i) => <InputOTPSlot key={i} index={i} className="glass h-14 w-12 rounded-xl text-lg font-mono" />)}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                {error && <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3"><p className="text-sm text-destructive text-center">{error}</p></div>}
                <Button type="submit" className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all" disabled={isLoading || otp.length !== 6}>
                  {isLoading ? <span className="flex items-center gap-2"><Loader2 className="size-4 animate-spin" /> Verifying...</span> : <span className="flex items-center gap-2">Verify code <ArrowRight className="size-4" /></span>}
                </Button>
                <div className="flex flex-col items-center gap-3">
                  <button type="button" onClick={() => { setStep("signIn"); setOtp(""); setError(null); }} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Use a different email</button>
                  <button type="button" onClick={() => { setStep("signIn"); setOtp(""); setError(null); }} className="text-sm text-primary hover:text-primary/80 transition-colors">Didn't receive a code? Try again</button>
                </div>
              </form>
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-white/5">
            <p className="text-xs text-center text-muted-foreground">Internal tool · Not for public distribution · Role-based access enforced</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple Flask icon for lab technicians (since we can't import FlaskConical from lucide in this context)
function FlaskIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3h6" /><path d="M10 9V3" /><path d="M14 9V3" />
      <path d="M5.2 21h13.6c1.1 0 1.8-1.2 1.2-2.1L14 9H10L4 18.9c-.6.9.1 2.1 1.2 2.1z" />
    </svg>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}
