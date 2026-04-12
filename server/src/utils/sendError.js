
export const sendServerError = (res, logLabel, error, message) => {
  console.error(`${logLabel}:`, error);
  const isProduction = process.env.NODE_ENV === "production";

  return res.status(500).json({
    success: false,
    message,
    ...(isProduction ? {} : { error: error.message }),
  });
};