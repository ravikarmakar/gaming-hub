import mongoose from "mongoose";
import Event from "../models/event-model/event.model.js";

import connectDB from "../config/db.js";

import { logger } from "../utils/logger.js";

const seedEvents = async () => {
  try {
    await connectDB(); // Ensure DB connection (now inside try block)

    await Event.deleteMany(); // Clear existing events

    const events = [
      {
        title: "Free Fire Battle Royale",
        game: "Free Fire",
        startDate: new Date("2025-03-10"),
        mode: "Solo",
        slots: 100, // Fixed: number instead of string
        time: "18:00",
        location: "Online",
        category: "Esports",
        venue: "Discord Server",
        prize: null, // Fixed: null instead of placeholder ObjectId
        image: "https://example.com/event1.jpg",
        description: "A competitive battle royale event.",
        attendees: 50,
        status: "registration-open",
        registrationEnds: new Date("2025-03-05"),
        teams: [],
        organizer: null, // Fixed: null instead of placeholder ObjectId
        rounds: [],
      },
      // Add more events as needed
    ];

    await Event.insertMany(events);
    logger.info(`✅ ${events.length} Event(s) Seeded Successfully!`); // Fixed: dynamic count
    mongoose.connection.close();
  } catch (error) {
    logger.error("❌ Error Seeding Events:", error);
    mongoose.connection.close();
  }
};

seedEvents();
