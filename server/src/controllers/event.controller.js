import Event from "../models/event-model/event.model.js";

// Get All Events
export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find({}).populate("prize");
    res.status(200).json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create Event
export const createEvent = async (req, res) => {
  try {
    const newEvent = new Event(req.body);
    await newEvent.save();
    res.status(201).json({ success: true, event: newEvent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Single Event by ID
export const getSingleEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("prize")
      .populate("rounds");

    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    res.status(200).json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Event
export const updateEvent = async (req, res) => {
  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.eventId,
      req.body,
      { new: true }
    );

    if (!updatedEvent) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    res.status(200).json({ success: true, event: updatedEvent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Event
export const deleteEvent = async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.eventId);

    if (!deletedEvent) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
