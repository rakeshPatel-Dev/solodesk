
const sendError = (res, statusCode, message, extra = {}) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...extra,
  });
};

export const sendBadRequestError = (res, message, extra = {}) => {
  return sendError(res, 400, message, extra);
};

export const sendUnauthorizedError = (res, message, extra = {}) => {
  return sendError(res, 401, message, extra);
};

export const sendForbiddenError = (res, message, extra = {}) => {
  return sendError(res, 403, message, extra);
};

export const sendNotFoundError = (res, message, extra = {}) => {
  return sendError(res, 404, message, extra);
};

export const sendConflictError = (res, message, extra = {}) => {
  return sendError(res, 409, message, extra);
};

// @desc    Send server error response and log error to console if not in production
export const sendServerError = (res, logLabel, error, message) => {
  console.warn(`${logLabel}:`, error);
  const isProduction = process.env.NODE_ENV === "production";

  return sendError(res, 500, message, isProduction ? {} : { error: error.message });
};