import Event from "../../models/event-model/event.model.js";
import Organizer from "../../models/organizer.model.js";

export const createOrganization = async (req, res) => {
  try {
    const loggedInUser = req.user;
    const { name } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Organization name is required." });
    }

    if (loggedInUser.activeOrganization) {
      return res.status(400).json({
        success: false,
        message: "You have already created an organization.",
      });
    }

    const existingOrganization = await Organizer.findOne({ name });
    if (existingOrganization) {
      return res
        .status(400)
        .json({ success: false, message: "Organization name already exists." });
    }

    // Creating New Organization
    const newOrganization = new Organizer({
      name,
      ownerId: loggedInUser._id,
    });

    // Save the organization
    await newOrganization.save();

    // Update the user's activeOrganization field
    loggedInUser.activeOrganization = newOrganization._id;
    await loggedInUser.save();

    res.status(201).json({
      success: false,
      message: "Organization created successfully.",
      organization: newOrganization,
    });
  } catch (error) {
    console.log("Error in createOrganization:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const organizationProfile = async (req, res) => {
  try {
    const loggedInUser = req.user;

    const organization = await Organizer.findById(loggedInUser.activeOrganizer)
      .populate("members.userId")
      .populate("ownerId", "name email");

    if (!organization) {
      return res
        .status(404)
        .json({ success: false, message: "Organization not found" });
    }

    res.status(200).json({ success: true, organization });
  } catch (error) {
    console.log("Error in organizationProfile:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * @desc    Get all events created by a specific organizer
 * @route   GET /api/events/organizer/:organizerId
 * @access  Private (Only Organizer)
 */
export const allEventsOfOrganizer = async (req, res) => {
  try {
    const { organizerId } = req.params;

    // ✅ 1. Check if organizerId is provided
    if (!organizerId) {
      return res.status(400).json({ message: "Organizer ID is required!" });
    }

    // ✅ 2. Fetch all events of the given organizer
    const events = await Event.find({ organizerId }).sort({ createdAt: -1 });

    // ✅ 3. Check if events exist
    if (events.length === 0) {
      return res
        .status(404)
        .json({ message: "No events found for this organizer!" });
    }

    // ✅ 4. Return the events
    return res.status(200).json({
      message: "Events fetched successfully!",
      totalEvents: events.length,
      events,
    });
  } catch (error) {
    console.error("Error in allEventsOfOrganizer:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
