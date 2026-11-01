"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { daypassLabel } from "@/components/GymCard";
import type { Gym } from "@/types";

export default function GymDetails({ gymId }: { gymId: string }) {
  const [gym, setGym] = useState<Gym | null>(null);
  const [notFound, setNotFound] = useState(false);

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
    </div>
  );
}
