"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { apiErrorMessage } from "@/lib/errors";
import { passDate } from "@/lib/passDate";
import type { Address, Pass } from "@/types";

type MyPass = Omit<Pass, "gymId"> & {
  gym: { _id: string; name: string; address: Address } | null;
};

export default function MyPassesPage() {
  const [passes, setPasses] = useState<MyPass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/passes")
      .then((response) => setPasses(response.data.data))
      .catch((error) => toast.error(apiErrorMessage(error)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="mx-auto max-w-3xl p-4">
      <h1 className="mb-4 text-2xl font-bold">My passes</h1>

      {passes.length === 0 ? (
        <p>You have no day passes yet.</p>
      ) : (
        <ul className="grid gap-2">
          {passes.map((pass) => (
            <li key={pass._id} className="rounded-lg border border-line p-3">
              {pass.gym ? (
                <Link href={`/gyms/${pass.gym._id}`} className="font-medium">
                  {pass.gym.name}
                </Link>
              ) : (
                <p className="font-medium">Removed gym</p>
              )}
              <p className="text-sm">Code: {pass.code}</p>
              <p className="text-sm">Good on {passDate(pass.validFrom)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
