import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AccountLayout } from "@/components/AccountLayout";
import { useAddresses } from "@/lib/queries";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/account/addresses")({ component: AddressesPage });

function AddressesPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: addresses = [] } = useAddresses();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    mobile: "",
    line1: "",
    line2: "",
    pincode: "",
    city: "",
    state: "",
  });

  async function save() {
    if (!user) return;
    const { error } = await supabase.from("addresses").insert({ ...form, user_id: user.id });
    if (error) return toast.error(error.message);
    toast.success("Address saved");
    setAdding(false);
    setForm({ full_name: "", mobile: "", line1: "", line2: "", pincode: "", city: "", state: "" });
    qc.invalidateQueries({ queryKey: ["addresses"] });
  }

  async function del(id: string) {
    const { error } = await supabase.from("addresses").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["addresses"] });
  }

  return (
    <AccountLayout title="Addresses">
      <div className="space-y-4 mb-8">
        {addresses.length === 0 && (
          <div className="text-[13px] text-stone">No saved addresses yet.</div>
        )}
        {addresses.map((a) => (
          <div
            key={a.id}
            className="border-[0.5px] border-soft-border p-5 flex justify-between gap-6"
          >
            <div className="text-[12px] leading-[1.7]">
              <div className="font-medium">{a.full_name}</div>
              <div>
                {a.line1}
                {a.line2 ? `, ${a.line2}` : ""}
              </div>
              <div>
                {a.city}, {a.state} {a.pincode}
              </div>
              <div className="text-stone">{a.mobile}</div>
            </div>
            <button
              onClick={() => del(a.id)}
              className="text-[11px] text-stone hover:text-danger uppercase tracking-[0.18em]"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {!adding ? (
        <button onClick={() => setAdding(true)} className="btn-primary">
          Add new address
        </button>
      ) : (
        <div className="border-[0.5px] border-soft-border p-6">
          <h2 className="caps caps-ink mb-4">New address</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(
              [
                ["full_name", "Full name", false],
                ["mobile", "Mobile", false],
                ["line1", "Line 1", true],
                ["line2", "Line 2", true],
                ["pincode", "Pincode", false],
                ["city", "City", false],
                ["state", "State", false],
              ] as const
            ).map(([k, l, full]) => (
              <div key={k} className={full ? "sm:col-span-2" : ""}>
                <div className="caps caps-ink mb-2">{l}</div>
                <input
                  value={form[k] as string}
                  onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                  className="w-full bg-transparent border-b-[0.5px] border-soft-border focus:border-ink py-2 text-[14px] outline-none"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={save} className="btn-primary">
              Save address
            </button>
            <button onClick={() => setAdding(false)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      )}
    </AccountLayout>
  );
}
