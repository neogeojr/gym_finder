"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import GymForm, { toForm } from "@/components/GymForm";
import type { Gym, GymInput } from "@/types";

// Loads the gym, fills the form with it, and saves the changes.
export default function EditGym({ gymId }: { gymId: string }) {
  const router = useRouter();
  const [gym, setGym] = useState<Gym | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    axios
      .get("/api/owner/gyms")
      .then((response) => {
        const found = response.data.data.find((g: Gym) => g._id === gymId);
        if (found) setGym(found);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true));
  }, [gymId]);

  const onSubmit = async (payload: GymInput) => {
    await axios.patch(`/api/gyms/${gymId}`, payload);
    toast.success("Gym updated.");
    router.push("/owner");
  };

  if (notFound) return <p className="p-4">Gym not found.</p>;
  if (!gym) return <p className="p-4">Loading...</p>;

  return (
    <GymForm
      title="Edit gym"
      initial={toForm(gym)}
      submitLabel="Save changes"
      onSubmit={onSubmit}
    />
  );
}
