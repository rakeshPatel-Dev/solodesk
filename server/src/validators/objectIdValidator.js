import mongoose from "mongoose";

export const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const isValidObjectIdArray = (ids) => ids.every((id) => isValidObjectId(id));