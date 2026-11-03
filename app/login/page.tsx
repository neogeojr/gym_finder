"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type SubmitEvent } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { apiErrorMessage } from "@/lib/errors";

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const canSubmit = form.email.trim() !== "" && form.password !== "";

  const onLogin = async (e: SubmitEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post("/api/users/login", form);
      await refresh();
      toast.success("You are logged in.");
      router.push(response.data.role === "owner" ? "/owner" : "/search");
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={onLogin}
      className="mx-auto flex w-full max-w-sm flex-col gap-3 p-4 py-10"
    >
      <h1 className="text-2xl font-bold">Log in</h1>

      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        autoComplete="email"
        className="input"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      <label htmlFor="password">Password</label>
      <input
        id="password"
        type="password"
        autoComplete="current-password"
        className="input"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />

      <button disabled={!canSubmit || loading} className="btn btn-primary mt-2">
        {loading ? "Logging in..." : "Log in"}
      </button>

      <p className="text-sm">
        No account yet?{" "}
        <Link href="/signup" className="underline">
          Sign up
        </Link>
      </p>
    </form>
  );
}
