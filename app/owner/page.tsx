"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { apiErrorMessage, apiErrorStatus } from "@/lib/errors";
import type { Gym } from "@/types";

const daypassLabel = ({ available, price }: Gym["daypass"]) => {
  if (!available) return "No day pass";
  return price === 0 ? "Free day pass" : `Day pass $${price}`;
};

export default function OwnerDashboardPage() {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState("");

  useEffect(() => {
    axios
      .get("/api/owner/gyms")
      .then((response) => setGyms(response.data.data))
      .catch((error) => {
        if (apiErrorStatus(error) === 403) setBlocked(apiErrorMessage(error));
        else toast.error(apiErrorMessage(error));
      })
      .finally(() => setLoading(false));
  }, []);

  const onDelete = async (gym: Gym) => {
    if (!window.confirm(`Delete ${gym.name}?`)) return;
    try {
      await axios.delete(`/api/gyms/${gym._id}`);
      toast.success("Gym deleted.");
      setGyms(gyms.filter((g) => g._id !== gym._id));
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  };

  if (loading) return <p className="p-4">Loading...</p>;
  if (blocked) return <p className="p-4">{blocked}</p>;

  return (
    <div className="mx-auto max-w-3xl p-4">
      <div className="mb-4 flex items-center">
        <h1 className="text-2xl font-bold">My gyms</h1>
        <Link href="/owner/gyms/new" className="btn btn-primary ml-auto">
          Add a gym
        </Link>
      </div>

      {gyms.length === 0 ? (
        <p>You have not added a gym yet.</p>
      ) : (
        <ul className="grid gap-2">
          {gyms.map((gym) => (
            <li
              key={gym._id}
              className="flex items-center gap-2 rounded-lg border border-line p-3"
            >
              <div>
                <p className="font-medium">{gym.name}</p>
                <p className="text-sm">
                  {gym.address.city}, {gym.address.state} -{" "}
                  {daypassLabel(gym.daypass)}
                </p>
              </div>
              <Link
                href={`/owner/gyms/${gym._id}/edit`}
                className="btn ml-auto"
              >
                Edit
              </Link>
              <button className="btn" onClick={() => onDelete(gym)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
