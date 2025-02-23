import Event from "../models/event-model/event.model.js";

// Get All Events
export const getAllEvents = async (req, res) => {
  try {
    let { cursor, limit = 10, search } = req.query;

    limit = parseInt(limit);

    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (cursor) {
      query._id = { $lt: cursor };
    }

    const events = await Event.find(query)
      .sort({ _id: -1 })
      .limit(limit + 1);

    let nextCursor = null;
    if (events.length > limit) {
      const lastEvent = events.pop();
      nextCursor = lastEvent._id;
    }
    const hasMore = nextCursor !== null;

    // 🔹 Response
    res.status(200).json({ success: true, events, nextCursor, hasMore });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create Event
export const createEvent = async (req, res) => {
  try {
    // Required fields check
    const {
      title,
      game,
      startDate,
      mode,
      slots,
      time,
      location,
      category,
      venue,
      image,
      description,
      registrationEnds,
    } = req.body;

    if (
      !title ||
      !game ||
      !startDate ||
      !mode ||
      !slots ||
      !time ||
      !location ||
      !category ||
      !venue ||
      !image ||
      !description ||
      !registrationEnds
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided.",
      });
    }

    // Image validation (Only URLs allowed)
    const urlRegex = /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))$/i;
    if (!urlRegex.test(image)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid image URL format." });
    }

    // Date Validation
    if (new Date(registrationEnds) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Registration end date must be in the future.",
      });
    }

    // Creating Event
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
