import Prize from "../../models/event-model/prize.model.js";
import Event from "../../models/event-model/event.model.js";

export const createPrizeForEvent = async (req, res) => {
  const { eventId } = req.params;
  const { total, distribution } = req.body;

  try {
    // Create a new prize
    const newPrize = new Prize({
      eventId,
      total,
      distribution,
    });

    // Save the prize
    const savedPrize = await newPrize.save();

    // Update the event with the prize ID
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { prize: savedPrize._id },
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(201).json({
      message: "Prize created successfully",
      prize: savedPrize,
    });
  } catch (error) {
    console.error("Error creating prize:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
