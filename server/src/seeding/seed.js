import mongoose from "mongoose";
import Event from "../models/event-model/event.model.js";

import connectDB from "../config/db.js";

const seedEvents = async () => {
  await connectDB(); // Ensure DB connection
  try {
    await Event.deleteMany(); // Clear existing events

    const events = [
      {
        title: "Free Fire Battle Royale",
        game: "Free Fire",
        startDate: new Date("2025-03-10"),
        mode: "Solo",
        slots: "100",
        time: "18:00",
        location: "Online",
        category: "Esports",
        venue: "Discord Server",
        prize: "65a12b3c45d67e8f9a0b1234", // Replace with valid ObjectId
        image: "https://example.com/event1.jpg",
        description: "A competitive battle royale event.",
        attendees: 50,
        status: "registration-open",
        registrationEnds: new Date("2025-03-05"),
        teams: [],
        organizer: "65a12b3c45d67e8f9a0b5678", // Replace with valid ObjectId
        rounds: [],
      },
      // Add 19 more event objects following the same structure
    ];

    await Event.insertMany(events);
    console.log("✅ 20 Events Seeded Successfully!");
    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error Seeding Events:", error);
    mongoose.connection.close();
  }
};

seedEvents();
