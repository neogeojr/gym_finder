"use client";

import { useState, type SubmitEvent } from "react";
import { toast } from "react-hot-toast";
import { apiErrorMessage } from "@/lib/errors";
import type { GymInput } from "@/types";

export interface GymFormValues {
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  daypassAvailable: boolean;
  daypassPrice: string;
}

type TextField = Exclude<keyof GymFormValues, "daypassAvailable">;

export const emptyForm: GymFormValues = {
  name: "",
  street: "",
  city: "",
  state: "",
  zipCode: "",
  phone: "",
  daypassAvailable: false,
  daypassPrice: "",
};

export const toForm = (gym: GymInput): GymFormValues => ({
  name: gym.name ?? "",
  street: gym.address?.street ?? "",
  city: gym.address?.city ?? "",
  state: gym.address?.state ?? "",
  zipCode: gym.address?.zipCode ?? "",
  phone: gym.phone ?? "",
  daypassAvailable: !!gym.daypass?.available,
  daypassPrice: gym.daypass?.price ? String(gym.daypass.price) : "",
});

export const toPayload = (form: GymFormValues): GymInput => ({
  name: form.name,
  address: {
    street: form.street,
    city: form.city,
    state: form.state,
    zipCode: form.zipCode,
  },
  phone: form.phone,
  daypass: {
    available: form.daypassAvailable,
    price: form.daypassPrice === "" ? 0 : Number(form.daypassPrice),
  },
});

interface GymFormProps {
  title: string;
  initial?: GymFormValues;
  submitLabel: string;
  // Throw to keep the form open; the form shows the server's message.
  onSubmit: (payload: GymInput) => Promise<void>;
}

export default function GymForm({
  title,
  initial = emptyForm,
  submitLabel,
  onSubmit,
}: GymFormProps) {
  const [gym, setGym] = useState<GymFormValues>(initial);
  const [loading, setLoading] = useState(false);

  const onSave = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      await onSubmit(toPayload(gym));
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const textBox = (id: TextField, label: string, type = "text") => (
    <>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        className="input"
        value={gym[id]}
        onChange={(e) => setGym({ ...gym, [id]: e.target.value })}
      />
    </>
  );

  return (
    <form
      onSubmit={onSave}
      className="mx-auto flex w-full max-w-md flex-col gap-2 p-4 py-6"
    >
      <h1 className="text-2xl font-bold">{title}</h1>
      {textBox("name", "Gym name")}
      {textBox("street", "Street")}
      {textBox("city", "City")}
      {textBox("state", "State")}
      {textBox("zipCode", "Zip code")}
      {textBox("phone", "Phone")}

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={gym.daypassAvailable}
          onChange={(e) =>
            setGym({ ...gym, daypassAvailable: e.target.checked })
          }
        />
        Offers a day pass
      </label>
      {gym.daypassAvailable && textBox("daypassPrice", "Price (USD)", "number")}

      <button disabled={loading} className="btn btn-primary mt-2">
        {loading ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
