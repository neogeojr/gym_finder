import Link from "next/link";
import type { Gym } from "@/types";

export const daypassLabel = ({ available, price }: Gym["daypass"]) => {
  if (!available) return "No day pass";
  return price === 0 ? "Free day pass" : `Day pass $${price}`;
};

export default function GymCard({ gym }: { gym: Gym }) {
  const { street, city, state, zipCode } = gym.address;
  return (
    <Link
      href={`/gyms/${gym._id}`}
      className="block rounded-lg border border-line p-4 hover:bg-hover"
    >
      <h2 className="font-semibold">{gym.name}</h2>
      <p className="text-sm">
        {street}, {city}, {state} {zipCode}
      </p>
      <p className="mt-1 text-sm">{daypassLabel(gym.daypass)}</p>
    </Link>
  );
}
