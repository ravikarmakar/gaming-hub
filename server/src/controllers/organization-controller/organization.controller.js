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
