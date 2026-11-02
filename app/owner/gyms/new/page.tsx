"use client";

import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import GymForm from "@/components/GymForm";
import { useAuth } from "@/context/AuthContext";
import type { GymInput } from "@/types";

export default function NewGymPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const onSubmit = async (payload: GymInput) => {
    await axios.post("/api/gyms", payload);
    toast.success("Gym saved.");
    router.push("/owner");
  };

  if (loading) return <p className="p-4">Loading...</p>;
  if (user?.role !== "owner") return <p className="p-4">Not allowed.</p>;

  return (
    <GymForm title="Add a gym" submitLabel="Save gym" onSubmit={onSubmit} />
  );
}
