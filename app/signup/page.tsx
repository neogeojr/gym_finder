"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type SubmitEvent } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { apiErrorMessage } from "@/lib/errors";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "regular",
  });
  const [loading, setLoading] = useState(false);

  const canSubmit = form.email.trim() !== "" && form.password !== "";

  const onSignup = async (e: SubmitEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post("/api/users/signup", form);
      toast.success("Account created. You can log in now.");
      router.push("/login");
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={onSignup}
      className="mx-auto flex w-full max-w-sm flex-col gap-3 p-4 py-10"
    >
      <h1 className="text-2xl font-bold">Sign up</h1>

      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        autoComplete="email"
        className="input"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      <label htmlFor="password">Password (8 to 50 characters)</label>
      <input
        id="password"
        type="password"
        autoComplete="new-password"
        className="input"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />

      <label htmlFor="role">I am a</label>
      <select
        id="role"
        className="input"
        value={form.role}
        onChange={(e) => setForm({ ...form, role: e.target.value })}
      >
        <option value="regular">gym member</option>
        <option value="owner">gym owner</option>
      </select>

      <button disabled={!canSubmit || loading} className="btn btn-primary mt-2">
        {loading ? "Creating account..." : "Sign up"}
      </button>

      <p className="text-sm">
        Already have an account?{" "}
        <Link href="/login" className="underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
