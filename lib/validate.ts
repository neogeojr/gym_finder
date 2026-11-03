export function cleanEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function validateEmail(email: string) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  return emailRegex.test(email) && email.length <= 254
    ? null
    : "Enter a valid email address.";
}

export function validatePassword(password: string) {
  if (password.length < 8 || password.length > 50)
    return "Password must be 8 to 50 characters long.";
  return null;
}
