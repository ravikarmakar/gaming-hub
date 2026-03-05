import mongoose from "mongoose";
import dotenv from "dotenv";
import Chat from "./chat.model.js";

dotenv.config();

const migrate = async () => {
    try {
        const uri = process.env.MONGO_URI || "mongodb://localhost:27017/gaming-site";
        await mongoose.connect(uri);
        console.log("Connected to MongoDB for migration...");

        const messages = await Chat.find({ targetId: { $exists: false } });
        console.log(`Found ${messages.length} messages to migrate.`);

        let count = 0;
        for (const msg of messages) {
            const id = msg.team || msg.organizer;
            if (id) {
                msg.targetId = id;
                await msg.save();
                count++;
            }
        }

        console.log(`Successfully migrated ${count} messages.`);
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
};

migrate();
