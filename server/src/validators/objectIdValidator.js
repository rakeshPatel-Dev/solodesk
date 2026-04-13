import mongoose from "mongoose";
import { sendBadRequestError } from "../utils/sendError.js";

export const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const isValidObjectIdArray = (ids) => ids.every((id) => isValidObjectId(id));

export const validateObjectIdOrRespond = (res, id, label = "ID") => {
  if (!isValidObjectId(id)) {
    sendBadRequestError(res, `Invalid ${label} format`);
    return false;
  }

  return true;
};

export const validateObjectIdArrayOrRespond = (res, ids, label = "IDs") => {
  if (!Array.isArray(ids) || ids.length === 0) {
    sendBadRequestError(res, `Please provide a non-empty array of ${label}`);
    return false;
  }

  const invalidIds = ids.filter((id) => !isValidObjectId(id));
  if (invalidIds.length > 0) {
    sendBadRequestError(res, `Invalid ${label} format`, { invalidIds });
    return false;
  }

  return true;
};