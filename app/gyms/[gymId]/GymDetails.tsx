"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import { daypassLabel } from "@/components/GymCard";
import { useAuth } from "@/context/AuthContext";
import { apiErrorMessage } from "@/lib/errors";
import type { Gym, Pass } from "@/types";

export default function GymDetails({ gymId }: { gymId: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const [gym, setGym] = useState<Gym | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [pass, setPass] = useState<Pass | null>(null);
  const [claiming, setClaiming] = useState(false);

  async function claim() {
    if (!user) {
      router.push("/login");
      return;
    }
    setClaiming(true);
    try {
      const response = await axios.post(`/api/gyms/${gymId}/passes`);
      setPass(response.data.data);
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setClaiming(false);
    }
  }

  useEffect(() => {
    axios
      .get(`/api/gyms/${gymId}`)
      .then((response) => setGym(response.data.data))
      .catch(() => setNotFound(true));
  }, [gymId]);

  if (notFound) return <p className="p-4">Gym not found.</p>;
  if (!gym) return <p className="p-4">Loading...</p>;

  const { street, city, state, zipCode } = gym.address;
  return (
    <div className="mx-auto my-6 grid w-full max-w-xl gap-2 rounded-lg border border-line p-6">
      <h1 className="text-2xl font-bold">{gym.name}</h1>
      <p>
        {street}, {city}, {state} {zipCode}
      </p>
      {gym.phone && <p>Phone: {gym.phone}</p>}
      <p className="font-medium">{daypassLabel(gym.daypass)}</p>
      {gym.daypass.available && !pass && (
        <button
          type="button"
          className="btn btn-primary"
          onClick={claim}
          disabled={claiming}
        >
          Get day pass
        </button>
      )}
      {pass && (
        <div className="rounded border border-line p-3">
          <p className="font-medium">Your day pass code: {pass.code}</p>
          <p>Good on {new Date(pass.validFrom).toLocaleDateString()}</p>
        </div>
      )}
    </div>
  );
}
