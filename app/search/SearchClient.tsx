"use client";

import { useEffect, useState, type SubmitEvent } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import GymCard from "@/components/GymCard";
import { apiErrorMessage } from "@/lib/errors";
import type { Gym } from "@/types";

export default function SearchClient({ initialQ }: { initialQ: string }) {
  const [q, setQ] = useState(initialQ);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);

  const search = async (text: string) => {
    try {
      setLoading(true);
      const response = await axios.get("/api/gyms", { params: { q: text } });
      setGyms(response.data.data);
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    search(initialQ);
  }, [initialQ]);

  const onSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    search(q);
  };

  return (
    <div className="mx-auto max-w-3xl p-4">
      <h1 className="mb-4 text-2xl font-bold">Find a gym</h1>
      <form onSubmit={onSubmit} className="mb-4 flex gap-2">
        <input
          className="input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Gym name, city, state or zip code"
          aria-label="Search gyms"
        />
        <button className="btn btn-primary">Search</button>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : gyms.length === 0 ? (
        <p>No gyms found.</p>
      ) : (
        <div className="grid gap-3">
          {gyms.map((gym) => (
            <GymCard key={gym._id} gym={gym} />
          ))}
        </div>
      )}
    </div>
  );
}
