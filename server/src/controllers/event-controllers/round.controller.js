import Round from "../../models/event-model/round.model.js";
import Event from "../../models/event.model.js";
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

export const createRound = async (req, res) => {
  try {
    const { eventId, roundName } = req.body;

    // Event ID check karo
    if (!eventId) {
      return res.status(400).json({ message: "Event ID is required!" });
    }

    // Event exist karta hai ya nahi?
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found!" });
    }

    // Check if Event has Teams
    if (!event.teams || event.teams.length === 0) {
      return res.status(400).json({
        message:
          "Cannot create a round. No teams have registered in this event!",
      });
    }

    // Check if Teams are at least 50% of Total Slots
    // const totalSlots = event.slots || 0;
    // const totalTeams = event.teams.length;

    // if (totalTeams < totalSlots * 0.5) {
    //   return res.status(400).json({
    //     message: `At least 50% (${Math.ceil(
    //       totalSlots * 0.5
    //     )}) teams should be registered to create a round!`,
    //   });
    // }

    // Kya koi "ongoing" round hai?
    const existingOngoingRound = await Round.findOne({
      eventId,
      status: "ongoing",
    });
    if (existingOngoingRound) {
      return res
        .status(400)
        .json({ message: "An ongoing round already exists!" });
    }

    // Total rounds count (Auto-generate round name)
    const roundCount = await Round.countDocuments({ eventId });
    const newRoundName = `Round-${roundCount + 1}`;

    // Naya round create karna
    const newRound = await Round.create({
      eventId,
      roundName: roundName || newRoundName,
      status: "pending",
    });

    // Update Event's rounds Array
    event.rounds.push(newRound._id);
    await event.save();

    return res.status(201).json({
      message: "New round created successfully!",
      rounds: newRound,
    });
  } catch (error) {
    console.error("Error in createRound:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getRoundDetails = async (req, res) => {
  try {
    const { roundId } = req.params;

    // ✅ 1. Check if Round ID is provided
    if (!roundId) {
      return res.status(400).json({ message: "Round ID is required!" });
    }

    // ✅ 2. Fetch Round Details with Event & Groups
    const round = await Round.findById(roundId).populate(
      "eventId",
      "eventName slots teams"
    ); // Event ke sirf necessary fields
    // .populate({
    //   path: "groups",
    //   populate: {
    //     path: "teams",
    //     select: "teamName players",
    //   },
    // });

    // ✅ 3. Check if Round Exists
    if (!round) {
      return res.status(404).json({ message: "Round not found!" });
    }

    return res.status(200).json({
      message: "Round details fetched successfully!",
      round,
    });
  } catch (error) {
    console.error("Error in getRoundDetails:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
