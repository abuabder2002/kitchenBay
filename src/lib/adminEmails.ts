export function getAdminEmails(): string[] {
  const hardcoded = [
    "abdershaheen4@gmail.com",
    "yousufsuhaily@gmail.com",
    "kitchenbaythehomeneeds@gmail.com",
  ].map((e) => e.toLowerCase());

  const envVar =
    process.env.ADMIN_EMAIL ||
    process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
    "";

  const fromEnv = envVar
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return Array.from(new Set([...hardcoded, ...fromEnv]));
}
