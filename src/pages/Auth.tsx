import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useAuth } from "@/hooks/use-auth";
import { ROLE_TEMPLATES, type DemoRole, setDemoRole, enableDemoMode, isConvexConfigured } from "@/lib/demo-data";
import {
  Activity, ArrowLeft, ArrowRight, ClipboardList, CreditCard, Eye,
  FlaskConical, Heart, HeartPulse, Loader2, Lock, Mail, Pill,
  Shield, Stethoscope, TestTube, User, UserPlus, Users, Workflow,
} from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

interface AuthProps { redirectAfterAuth?: string; }
function resolveRedirectAfterAuth(returnTo: string | null, fallback = "/dashboard") {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) return returnTo;
  return fallback;
}

// ─── Role-specific configuration ───────────────────────────
const ROLE_CONFIG: Record<DemoRole, {
  icon: React.FC<{ className?: string }>;
  gradient: string;
  accentColor: string;
  accentBg: string;
  title: string;
  subtitle: string;
  features: string[];
  workflow: string;
  defaultRedirect: string;
}> = {
  doctor: {
    icon: Stethoscope, gradient: "from-blue-600/20 via-cyan-600/10 to-indigo-600/20",
    accentColor: "text-blue-400", accentBg: "bg-blue-400/10",
    title: "Doctor Portal", subtitle: "Clinical workspace for patient consultations",
    features: ["View patient queue", "Write consultations", "Order lab tests", "Create prescriptions"],
    workflow: "Patient Queue → Consultation → Lab/Rx Orders → Complete",
    defaultRedirect: "/dashboard",
  },
  nurse: {
    icon: HeartPulse, gradient: "from-emerald-600/20 via-teal-600/10 to-green-600/20",
    accentColor: "text-emerald-400", accentBg: "bg-emerald-400/10",
    title: "Nursing Portal", subtitle: "Patient care, vitals, and observations",
    features: ["View assigned patients", "Record vital signs", "Track patient status", "Care coordination"],
    workflow: "Assigned Patients → Vitals → Observations → Updates",
    defaultRedirect: "/dashboard",
  },
  pharmacist: {
    icon: Pill, gradient: "from-violet-600/20 via-purple-600/10 to-fuchsia-600/20",
    accentColor: "text-violet-400", accentBg: "bg-violet-400/10",
    title: "Pharmacy Portal", subtitle: "Prescription management and dispensing",
    features: ["Review prescriptions", "Approve medications", "Dispense drugs", "Track inventory"],
    workflow: "Prescription Queue → Review → Approve → Dispense",
    defaultRedirect: "/dashboard",
  },
  lab_technician: {
    icon: FlaskConical, gradient: "from-amber-600/20 via-orange-600/10 to-yellow-600/20",
    accentColor: "text-amber-400", accentBg: "bg-amber-400/10",
    title: "Laboratory Portal", subtitle: "Lab orders, samples, and diagnostic results",
    features: ["Process lab orders", "Collect samples", "Enter test results", "Verify diagnostics"],
    workflow: "Lab Orders → Sample Collection → Testing → Results → Verify",
    defaultRedirect: "/dashboard",
  },
  receptionist: {
    icon: UserPlus, gradient: "from-rose-600/20 via-pink-600/10 to-red-600/20",
    accentColor: "text-rose-400", accentBg: "bg-rose-400/10",
    title: "Front Desk Portal", subtitle: "Patient registration, payments, and checkout",
    features: ["Register patients", "Manage payments", "Process checkout", "Track queue"],
    workflow: "Register → Assign Doctor → Payment → Send to Doctor → Checkout",
    defaultRedirect: "/dashboard",
  },
  admin: {
    icon: Shield, gradient: "from-red-600/20 via-orange-600/10 to-red-600/20",
    accentColor: "text-red-400", accentBg: "bg-red-400/10",
    title: "Administration Portal", subtitle: "System management, staff, and financial reports",
    features: ["Manage staff accounts", "View financial reports", "System configuration", "Audit logs"],
    workflow: "Dashboard → Staff → Reports → Settings → Audit",
    defaultRedirect: "/dashboard",
  },
};

// ─── Role Selection Screen ──────────────────────────────
function RoleSelectionScreen({ onSelect }: { onSelect: (role: DemoRole) => void }) {
  return (
    <div className="w-full max-w-2xl">
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/15">
            <Stethoscope className="size-6 text-primary" />
          </div>
          <div className="text-left">
            <span className="text-xl font-bold tracking-tight text-foreground">Rayan</span>
            <p className="text-xs text-muted-foreground -mt-0.5">Hospital System</p>
          </div>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Welcome to Rayan</h1>
        <p className="mt-3 text-base text-muted-foreground">Select your role to access the appropriate workspace</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ROLE_TEMPLATES.map((t) => {
          const config = ROLE_CONFIG[t.role];
          const Icon = config.icon;
          return (
            <button key={t.role} onClick={() => onSelect(t.role)}
              className="glass-card p-5 text-left transition-all hover:ring-1 hover:ring-primary/20 hover:scale-[1.02] group">
              <div className={`flex size-11 items-center justify-center rounded-xl ${config.accentBg} mb-3 transition-transform group-hover:scale-105`}>
                <Icon className={`size-5 ${config.accentColor}`} />
              </div>
              <p className="text-sm font-semibold text-foreground">{config.title}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{config.subtitle}</p>
              <div className="mt-3 flex items-center gap-1 text-xs text-primary font-medium">
                Sign in <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
              </div>
            </button>
          );
        })}
      </div>

      {isConvexConfigured() && (
        <div className="text-center mt-8">
          <p className="text-xs text-muted-foreground">Or sign in with your team email credentials</p>
        </div>
      )}
    </div>
  );
}

// ─── Role-Specific Sign-In Screen ───────────────────────
function RoleSignInScreen({ role, onBack }: { role: DemoRole; onBack: () => void }) {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirectAfterAuth(searchParams.get("returnTo"), "/dashboard");
  const config = ROLE_CONFIG[role];
  const template = ROLE_TEMPLATES.find((t) => t.role === role)!;
  const Icon = config.icon;

  const [staffName, setStaffName] = useState(template.defaultName);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailMode, setEmailMode] = useState(false);
  const [otp, setOtp] = useState("");
  const [emailStep, setEmailStep] = useState<{ email: string } | null>(null);

  const handleRoleSignIn = () => {
    if (!staffName.trim()) { setError("Please enter your name."); return; }
    enableDemoMode();
    setDemoRole(role, staffName.trim());
    navigate(config.defaultRedirect);
  };

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setIsLoading(true); setError(null);
    try {
      const formData = new FormData(e.currentTarget);
      await signIn("email-otp", formData);
      setEmailStep({ email: formData.get("email") as string });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send verification code.");
    } finally { setIsLoading(false); }
  };

  const handleOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setIsLoading(true); setError(null);
    try {
      const formData = new FormData(e.currentTarget);
      await signIn("email-otp", formData);
      navigate(config.defaultRedirect);
    } catch {
      setError("The verification code is incorrect.");
      setIsLoading(false); setOtp("");
    }
  };

  // ─── Email OTP flow ────────────────────────────────
  if (emailMode && emailStep) {
    return (
      <div className="w-full max-w-md">
        <button onClick={() => { setEmailStep(null); setOtp(""); setError(null); }}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors mb-6">
          <ArrowLeft className="size-4" /> Back
        </button>
        <div className={`flex size-12 items-center justify-center rounded-xl ${config.accentBg} mb-4`}>
          <Icon className={`size-6 ${config.accentColor}`} />
        </div>
        <h2 className="text-2xl font-bold text-foreground tracking-tight">Check your email</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          We sent a 6-digit code to <span className="font-medium text-foreground">{emailStep.email}</span>
        </p>
        <form onSubmit={handleOtpSubmit} className="mt-8 space-y-6">
          <input type="hidden" name="email" value={emailStep.email} />
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
          <Button type="submit" className={`w-full h-12 rounded-xl font-semibold text-sm shadow-lg transition-all`} disabled={isLoading || otp.length !== 6}
            style={{ background: config.accentColor.includes("blue") ? "#3b82f6" : config.accentColor.includes("emerald") ? "#10b981" : config.accentColor.includes("violet") ? "#8b5cf6" : config.accentColor.includes("amber") ? "#f59e0b" : config.accentColor.includes("rose") ? "#f43f5e" : "#ef4444" }}>
            {isLoading ? <span className="flex items-center gap-2 text-white"><Loader2 className="size-4 animate-spin" /> Verifying...</span> : <span className="flex items-center gap-2 text-white">Verify code <ArrowRight className="size-4" /></span>}
          </Button>
        </form>
      </div>
    );
  }

  // ─── Email sign-in form ────────────────────────────
  if (emailMode) {
    return (
      <div className="w-full max-w-md">
        <button onClick={() => setEmailMode(false)}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors mb-6">
          <ArrowLeft className="size-4" /> Back to role sign-in
        </button>
        <div className={`flex size-12 items-center justify-center rounded-xl ${config.accentBg} mb-4`}>
          <Icon className={`size-6 ${config.accentColor}`} />
        </div>
        <h2 className="text-2xl font-bold text-foreground tracking-tight">{config.title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">Sign in with your team email</p>
        <form onSubmit={handleEmailSubmit} className="mt-8 space-y-5">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Email address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input name="email" placeholder={template.email} type="email" className="input-field pl-10 h-12" disabled={isLoading} required />
            </div>
          </div>
          {error && <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3"><p className="text-sm text-destructive">{error}</p></div>}
          <Button type="submit" disabled={isLoading}
            className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : <span className="flex items-center gap-2">Send verification code <ArrowRight className="size-4" /></span>}
          </Button>
        </form>
      </div>
    );
  }

  // ─── Main role sign-in screen ──────────────────────
  return (
    <div className="w-full max-w-md">
      <button onClick={onBack}
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors mb-6">
        <ArrowLeft className="size-4" /> Choose a different role
      </button>

      {/* Role Identity */}
      <div className="flex items-center gap-4 mb-6">
        <div className={`flex size-14 items-center justify-center rounded-2xl ${config.accentBg}`}>
          <Icon className={`size-7 ${config.accentColor}`} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{config.title}</h1>
          <p className="text-sm text-muted-foreground">{config.subtitle}</p>
        </div>
      </div>

      {/* Workflow */}
      <div className={`glass rounded-xl p-4 mb-6 border border-white/[0.04]`}>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Your Workflow</p>
        <p className={`text-sm ${config.accentColor} font-medium`}>{config.workflow}</p>
      </div>

      {/* Features */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">What You Can Do</p>
        <div className="space-y-2">
          {config.features.map((f) => (
            <div key={f} className="flex items-center gap-2.5">
              <div className={`size-1.5 rounded-full ${config.accentBg} ${config.accentColor}`} style={{ background: "currentColor", opacity: 0.5 }} />
              <span className="text-sm text-foreground">{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Name Input */}
      <div className="mb-2">
        <label className="text-sm font-medium text-foreground mb-1.5 block flex items-center gap-1.5">
          <User className="size-3.5" /> Your Name
        </label>
        <Input value={staffName} onChange={(e) => { setStaffName(e.target.value); setError(null); }}
          placeholder={template.defaultName} className="input-field h-12" />
        <p className="text-[11px] text-muted-foreground mt-1.5">
          Signing in as <span className={`badge ${template.badge} text-[10px] ml-1`}>{template.label}</span> — {template.specialization}
        </p>
      </div>

      {error && (
        <div className="mt-3 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <Button onClick={handleRoleSignIn}
        className="mt-5 w-full h-12 rounded-xl font-semibold text-sm shadow-lg transition-all text-white"
        style={{ background: config.accentColor.includes("blue") ? "#3b82f6" : config.accentColor.includes("emerald") ? "#10b981" : config.accentColor.includes("violet") ? "#8b5cf6" : config.accentColor.includes("amber") ? "#f59e0b" : config.accentColor.includes("rose") ? "#f43f5e" : "#ef4444" }}>
        <span className="flex items-center gap-2">
          Sign in as {template.label} <ArrowRight className="size-4" />
        </span>
      </Button>

      {isConvexConfigured() && (
        <button onClick={() => setEmailMode(true)}
          className="mt-4 w-full text-sm text-muted-foreground hover:text-foreground transition-colors">
          Use team email instead
        </button>
      )}

      <div className="mt-8 pt-5 border-t border-white/5">
        <p className="text-xs text-center text-muted-foreground">
          Internal tool · Role-based access enforced
        </p>
      </div>
    </div>
  );
}

// ─── Main Auth Component ────────────────────────────────
function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirectAfterAuth(searchParams.get("returnTo"), redirectAfterAuth);
  const [selectedRole, setSelectedRole] = useState<DemoRole | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) navigate(redirect);
  }, [authLoading, isAuthenticated, navigate, redirect]);

  return (
    <div className="min-h-screen flex bg-gradient-mesh bg-dots overflow-hidden">
      {/* ─── Left Panel — Branding (hidden on role screens) ── */}
      {!selectedRole && (
        <div className="hidden lg:flex lg:w-[45%] relative flex-col justify-between p-12 overflow-hidden">
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
              managed through a single secure platform. Built for the team that
              keeps the hospital running.
            </p>
            <div className="mt-10 space-y-3">
              {[
                { icon: Stethoscope, label: "Clinical staff", desc: "Patient care and consultations" },
                { icon: Workflow, label: "Operations", desc: "Registration and routing" },
                { icon: Shield, label: "Administration", desc: "System and staff management" },
              ].map((card) => (
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
      )}

      {/* When a role is selected, left panel shows role branding */}
      {selectedRole && (
        <div className="hidden lg:flex lg:w-[45%] relative flex-col items-center justify-center p-12 overflow-hidden">
          <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${ROLE_CONFIG[selectedRole].gradient}`} />
          <div className="pointer-events-none absolute -left-40 -top-40 size-[500px] rounded-full bg-primary/6 blur-[120px]" />
          <div className="relative z-10 text-center">
            {(() => { const Icon = ROLE_CONFIG[selectedRole].icon; return <Icon className={`size-20 ${ROLE_CONFIG[selectedRole].accentColor} mb-6 mx-auto`} />; })()}
            <h2 className="text-3xl font-extrabold text-foreground">{ROLE_CONFIG[selectedRole].title}</h2>
            <p className="mt-3 text-base text-muted-foreground max-w-sm">{ROLE_CONFIG[selectedRole].subtitle}</p>
            <div className="mt-8 space-y-2 text-left max-w-xs mx-auto">
              {ROLE_CONFIG[selectedRole].features.map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <div className={`size-1.5 rounded-full ${ROLE_CONFIG[selectedRole].accentColor}`} style={{ background: "currentColor", opacity: 0.6 }} />
                  <span className="text-sm text-foreground">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── Right Panel ────────────────────────────── */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        {!selectedRole ? (
          <RoleSelectionScreen onSelect={setSelectedRole} />
        ) : (
          <RoleSignInScreen role={selectedRole} onBack={() => setSelectedRole(null)} />
        )}
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
