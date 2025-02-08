import Round from "../../models/event-model/round.model.js";
import Event from "../../models/event-model/event.model.js";
import mongoose from "mongoose";

// Create a new round and link to an event
export const createRound = async (req, res) => {
  const { eventId } = req.params;
  const { roundName, groups, status } = req.body;

  try {
    // Create a new round
    const newRound = new Round({ eventId, roundName, groups, status });
    const savedRound = await newRound.save();

    // Link the round to the event
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { $push: { rounds: savedRound._id } }, // Assuming event schema has 'rounds' field
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(201).json({
      message: "Round created and linked to event successfully",
      round: savedRound,
      // event: updatedEvent,
    });
  } catch (error) {
    console.error("Error creating round:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// Get all rounds
export const getRounds = async (req, res) => {
  try {
    const rounds = await Round.find({});
    res.status(200).json({
      success: true,
      data: rounds,
    });
  } catch (error) {
    console.error("Error fetching rounds:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const getOneRound = async (req, res) => {
  const { roundId } = req.params;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(roundId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Event ID" });
  }

  try {
    const round = await Round.findById(roundId);
    if (!round) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    res.status(200).json({ success: true, round });
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
