"use client";

import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import GymForm from "@/components/GymForm";
import type { GymInput } from "@/types";

export default function NewGymPage() {
  const router = useRouter();

  const onSubmit = async (payload: GymInput) => {
    await axios.post("/api/gyms", payload);
    toast.success("Gym saved.");
    router.push("/owner");
  };

  return (
    <GymForm title="Add a gym" submitLabel="Save gym" onSubmit={onSubmit} />
  );
}
