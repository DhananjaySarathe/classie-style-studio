import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/SiteLayout";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/auth/login")({
  component: LoginPage,
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
  }),
});

function LoginPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const { signInWithPassword } = useAuth();
  const [tab, setTab] = useState<"email" | "phone">("email");

  return (
    <SiteLayout>
      <section className="max-w-[460px] mx-auto px-4 py-20">
        <div className="caps mb-3 text-center">ACCOUNT</div>
        <h1 className="display-page text-center mb-10">Welcome back</h1>

        <div className="flex border-b border-soft-border mb-8">
          {(["email", "phone"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={
                "flex-1 py-3 text-[11px] uppercase tracking-[0.18em] transition-colors " +
                (tab === t
                  ? "text-ink border-b-[1.5px] border-burgundy -mb-px"
                  : "text-stone hover:text-ink")
              }
            >
              {t === "email" ? "Email" : "Phone OTP"}
            </button>
          ))}
        </div>

        {tab === "email" ? (
          <EmailLoginForm
            onSuccess={() => navigate({ to: redirect ?? "/account" })}
            signIn={signInWithPassword}
          />
        ) : (
          <PhoneLoginForm onSuccess={() => navigate({ to: redirect ?? "/account" })} />
        )}

        <p className="mt-8 text-center text-[12px] text-stone">
          New to Classie?{" "}
          <Link to="/auth/register" className="text-ink border-b border-ink">
            Create an account
          </Link>
        </p>
      </section>
    </SiteLayout>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div className="caps caps-ink mb-2">{children}</div>;
}

function UnderlineInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={
        "w-full bg-transparent border-b-[0.5px] border-soft-border focus:border-ink focus:border-b py-2 text-[14px] outline-none transition-colors " +
        (props.className ?? "")
      }
    />
  );
}

function EmailLoginForm({
  onSuccess,
  signIn,
}: {
  onSuccess: () => void;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        const { error } = await signIn(email, password);
        setBusy(false);
        if (error) toast.error(error);
        else {
          toast.success("Signed in");
          onSuccess();
        }
      }}
      className="space-y-6"
    >
      <div>
        <FieldLabel>Email</FieldLabel>
        <UnderlineInput
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </div>
      <div>
        <FieldLabel>Password</FieldLabel>
        <UnderlineInput
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
      </div>
      <button type="submit" className="btn-primary w-full" disabled={busy}>
        {busy ? "Signing in…" : "Sign in"}
      </button>
      <div className="text-center">
        <button
          type="button"
          onClick={async () => {
            if (!email) return toast.error("Enter your email first");
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
              redirectTo: window.location.origin + "/auth/login",
            });
            if (error) toast.error(error.message);
            else toast.success("Reset link sent to your email");
          }}
          className="text-[11px] text-stone hover:text-ink"
        >
          Forgot password?
        </button>
      </div>
    </form>
  );
}

function PhoneLoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  // Uses Supabase native phone OTP. Requires a phone provider configured in
  // Supabase Auth (MSG91, Twilio, etc.). If unconfigured, returns an error.
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
          const fullPhone = `+91${normalize(phone)}`;
          if (!sent) {
            const { error } = await supabase.auth.signInWithOtp({ phone: fullPhone });
            if (error) throw new Error(error.message);
            toast.success("OTP sent to your phone");
            setSent(true);
          } else {
            const { error } = await supabase.auth.verifyOtp({
              phone: fullPhone,
              token: otp,
              type: "sms",
            });
            if (error) throw new Error(error.message);
            toast.success("Signed in");
            onSuccess();
          }
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Something went wrong");
        } finally {
          setBusy(false);
        }
      }}
      className="space-y-6"
    >
      <div>
        <FieldLabel>Phone (10 digits)</FieldLabel>
        <UnderlineInput
          type="tel"
          required
          maxLength={10}
          pattern="[0-9]{10}"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
          disabled={sent}
        />
      </div>
      {sent && (
        <div>
          <FieldLabel>6-digit OTP</FieldLabel>
          <UnderlineInput
            type="text"
            required
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            autoComplete="one-time-code"
          />
        </div>
      )}
      <button type="submit" className="btn-primary w-full" disabled={busy}>
        {busy ? "Working…" : sent ? "Verify & sign in" : "Send OTP"}
      </button>
      {sent && (
        <button
          type="button"
          onClick={() => {
            setSent(false);
            setOtp("");
          }}
          className="text-[11px] text-stone w-full text-center"
        >
          Use a different number
        </button>
      )}
      <div className="text-[10px] text-stone text-center">
        Requires a phone provider configured in Supabase Auth.
      </div>
    </form>
  );
}

function normalize(phone: string) {
  return phone.replace(/\D/g, "").slice(-10);
}

type EdgeResult = { ok: boolean; error?: string; [k: string]: unknown };

export async function callEdge(name: string, body: unknown): Promise<EdgeResult> {
  try {
    const { data, error } = await supabase.functions.invoke(name, {
      body: body as Record<string, unknown>,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true, ...((data as Record<string, unknown>) ?? {}) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Network error" };
  }
}
