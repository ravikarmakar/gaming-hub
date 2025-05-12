import Group from "../../models/event-model/group.model.js";
import Round from "../../models/event-model/round.model.js";
import Event from "../../models/event-model/event.model.js";

export const getGroups = async (req, res) => {
  try {
    const groups = await Group.find({});
    // console.log(groups);

    res.status(200).json(groups);
  } catch (error) {
    console.error("Error fetching groups:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// export const createGroups = async (req, res) => {
//   try {
//     const { roundId } = req.body;

//     if (!roundId) {
//       return res.status(400).json({ message: "Round ID is required!" });
//     }

//     // Round aur event verify karo
//     const round = await Round.findById(roundId).populate("eventId");
//     if (!round) {
//       return res.status(404).json({ message: "Round not found!" });
//     }

//     const event = await Event.findById(round.eventId._id);
//     if (!event) {
//       return res.status(404).json({ message: "Event not found!" });
//     }

//     // Total groups ka calculation
//     const teamsPerGroup = 2;
//     const totalGroups = Math.ceil((event.teams?.length || 0) / teamsPerGroup);

//     // Groups create karo (without teams)
//     const createdGroups = await Promise.all(
//       Array.from({ length: totalGroups }, async (_, i) => {
//         return await Group.create({
//           roundId,
//           groupName: `Group-${String.fromCharCode(65 + i)}`,
//           status: "pending",
//         });
//       })
//     );

//     return res.status(201).json({
//       message: "Groups created successfully!",
//       totalGroups: createdGroups.length,
//       groups: createdGroups,
//     });
//   } catch (error) {
//     console.error("Error in createGroups:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

export const groupDetails = async (req, res) => {
  try {
    const { groupId } = req.params;

    // Check if Group ID is valid
    if (!groupId || groupId.length !== 24) {
      return res.status(400).json({ message: "Invalid Group ID!" });
    }

    // Fetch Group with Teams Populated
    const group = await Group.findById(groupId);

    //Check if group exists
    if (!group) {
      return res.status(404).json({ message: "Group not found!" });
    }

    return res.status(200).json({
      message: "Group details fetched successfully!",
      group,
    });
  } catch (error) {
    console.error("Error in groupDetails:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const createGroups = async (req, res) => {
  try {
    const { roundId, totalMatch = 1, matchTime } = req.body;

    if (!roundId) {
      return res.status(400).json({ message: "Round ID is required!" });
    }

    // ✅ Check if round exists
    const round = await Round.findById(roundId).populate("eventId");
    if (!round) {
      return res.status(404).json({ message: "Round not found!" });
    }

    // ✅ Fetch Event & Teams
    const event = await Event.findById(round.eventId._id).populate("teams");
    if (!event || event.teams.length === 0) {
      return res
        .status(404)
        .json({ message: "No teams found for this event!" });
    }

    // ✅ Extract team IDs & Shuffle for fairness
    const allTeams = event.teams.map((team) => team._id);
    allTeams.sort(() => Math.random() - 0.5); // Random shuffle

    const teamsPerGroup = 2;
    const totalGroups = Math.ceil(allTeams.length / teamsPerGroup);

    // ✅ Create Groups in Parallel
    const createdGroups = await Promise.all(
      Array.from({ length: totalGroups }, async (_, i) => {
        const groupTeams = allTeams.slice(
          i * teamsPerGroup,
          (i + 1) * teamsPerGroup
        );
        return Group.create({
          roundId,
          groupName: `Group-${String.fromCharCode(65 + i)}`,
          totalMatch,
          matchTime: matchTime || new Date(Date.now() + 24 * 60 * 60 * 1000), // Default time
        });
      })
    );

    return res.status(201).json({
      message: "Groups created successfully!",
      totalGroups: createdGroups.length,
      groups: createdGroups,
    });
  } catch (error) {
    console.error("Error in createGroups:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
