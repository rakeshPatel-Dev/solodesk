const parseDurationToMs = (value) => {
  if (!value || typeof value !== "string") return 7 * 24 * 60 * 60 * 1000;

  const match = value.trim().match(/^(\d+)([smhd])$/i);
  if (!match) return 7 * 24 * 60 * 60 * 1000;

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();

  const unitMap = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return amount * unitMap[unit];
};

export const setAuthCookie = (res, token) => {
  const cookieExpiry = process.env.JWT_COOKIE_EXPIRES_IN || process.env.JWT_EXPIRES_IN || "7d";

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: parseDurationToMs(cookieExpiry),
    path: "/",
  });
};