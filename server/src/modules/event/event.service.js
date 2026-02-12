import Event from "./event.model.js";
import { CustomError } from "../../shared/utils/CustomError.js";

export const findEventById = async (id) => {
  const event = await Event.findById(id);
  if (!event) {
    throw new CustomError("Event not found", 404);
  }
  return event;
};
