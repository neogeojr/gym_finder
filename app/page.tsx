"use client";

import { useRouter } from "next/navigation";
import { useState, type SubmitEvent } from "react";

export default function Home() {
  const router = useRouter();
  const [q, setQ] = useState("");

  const onSearch = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <div className="flex flex-col items-center gap-4 px-4 py-20 text-center">
      <h1 className="text-3xl font-bold">Find a gym near you</h1>
      <p>Search by gym name, city, state or zip code, then claim a day pass.</p>
      <form onSubmit={onSearch} className="flex w-full max-w-lg gap-2">
        <input
          className="input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Gym name or location"
          aria-label="Search gyms"
        />
        <button className="btn btn-primary">Search</button>
      </form>
    </div>
  );
}
