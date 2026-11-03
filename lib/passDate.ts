// A pass is good from the start of a day to the start of the next, as the
// server counts days (UTC on the host). Show that same day, not the day the
// visitor's own time zone falls on, or a pass can look a day early.
export const passDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { timeZone: "UTC" });
