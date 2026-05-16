import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/SiteLayout";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/auth/register")({ component: RegisterPage });

function RegisterPage() {
  const navigate = useNavigate();
  const { signUpWithPassword } = useAuth();
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [terms, setTerms] = useState(false);
  const [busy, setBusy] = useState(false);

  return (
    <SiteLayout>
      <section className="max-w-[460px] mx-auto px-4 py-20">
        <div className="caps mb-3 text-center">ACCOUNT</div>
        <h1 className="display-page text-center mb-10">Create your account</h1>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (password !== confirm) return toast.error("Passwords don't match");
            if (!terms) return toast.error("Please accept the terms");
            setBusy(true);
            const { error } = await signUpWithPassword({
              email,
              password,
              firstName: first,
              lastName: last,
              phone: phone || undefined,
            });
            setBusy(false);
            if (error) return toast.error(error);
            toast.success("Account created. You're signed in.");
            navigate({ to: "/account" });
          }}
          className="space-y-5"
        >
          <div className="grid grid-cols-2 gap-4">
            <Field label="First name" value={first} onChange={setFirst} required />
            <Field label="Last name" value={last} onChange={setLast} required />
          </div>
          <Field label="Email" type="email" value={email} onChange={setEmail} required />
          <Field
            label="Mobile (10 digits)"
            type="tel"
            value={phone}
            onChange={(v) => setPhone(v.replace(/\D/g, "").slice(0, 10))}
            required
          />
          <Field
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            required
          />
          <Field
            label="Confirm password"
            type="password"
            value={confirm}
            onChange={setConfirm}
            required
          />

          <label className="flex items-start gap-3 pt-2 text-[12px] text-stone leading-[1.6]">
            <input
              type="checkbox"
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
              className="mt-1 accent-ink"
              required
            />
            <span>
              I agree to the{" "}
              <Link to="/policies/terms" className="text-ink border-b border-ink">
                Terms
              </Link>{" "}
              and{" "}
              <Link to="/policies/privacy" className="text-ink border-b border-ink">
                Privacy Policy
              </Link>
              .
            </span>
          </label>

          <button type="submit" className="btn-primary w-full mt-2" disabled={busy}>
            {busy ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-8 text-center text-[12px] text-stone">
          Already have an account?{" "}
          <a href="/auth/login" className="text-ink border-b border-ink">
            Sign in
          </a>
        </p>
      </section>
    </SiteLayout>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <div className="caps caps-ink mb-2">{props.label}</div>
      <input
        type={props.type ?? "text"}
        required={props.required}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        className="w-full bg-transparent border-b-[0.5px] border-soft-border focus:border-ink py-2 text-[14px] outline-none"
      />
    </div>
  );
}
