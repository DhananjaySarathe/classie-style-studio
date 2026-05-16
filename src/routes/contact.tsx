import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/SiteLayout";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/contact")({ component: ContactPage });

function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    // Use newsletter_subscribers as a simple intake — extend with a contact_messages table later.
    await supabase.from("newsletter_subscribers").insert({ email, source: "contact" });
    setBusy(false);
    setName("");
    setEmail("");
    setMsg("");
    toast.success("Thank you — we'll be in touch.");
  }

  return (
    <SiteLayout>
      <section className="max-w-[560px] mx-auto px-4 py-20">
        <div className="caps mb-4 text-center">CONTACT</div>
        <h1 className="display-page text-center mb-10">Say hello.</h1>
        <p className="text-[13px] text-stone text-center mb-8">
          Email: hello@classie.co.in · WhatsApp concierge: tap the chat bubble.
        </p>
        <form onSubmit={send} className="space-y-5">
          <Input label="Name" value={name} onChange={setName} />
          <Input label="Email" type="email" value={email} onChange={setEmail} />
          <div>
            <div className="caps caps-ink mb-2">Message</div>
            <textarea
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              required
              rows={5}
              className="w-full bg-transparent border-[0.5px] border-soft-border focus:border-ink p-3 text-[14px] outline-none"
            />
          </div>
          <button className="btn-primary w-full" disabled={busy}>
            {busy ? "Sending…" : "Send message"}
          </button>
        </form>
      </section>
    </SiteLayout>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <div className="caps caps-ink mb-2">{label}</div>
      <input
        type={type}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent border-b-[0.5px] border-soft-border focus:border-ink py-2 text-[14px] outline-none"
      />
    </div>
  );
}
