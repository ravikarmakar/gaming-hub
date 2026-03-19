
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Round from './src/modules/event/models/round.model.js';
import Event from './src/modules/event/event.model.js';

dotenv.config();

async function repro() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to Atlas');

        const eventId = '69af27743299a0e30dfac014';
        const event = await Event.findById(eventId);
        console.log('Current roundCount:', event.roundCount);

        const nextNum = event.roundCount + 1;
        console.log(`Attempting to create Round ${nextNum}...`);

        const newRound = await Round.create({
            eventId,
            roundNumber: nextNum,
            roundName: `Test Round ${nextNum}`,
            type: 'tournament',
            status: 'pending'
        });

        console.log('Created successfully:', newRound._id);
        
        // Clean up
        await Round.findByIdAndDelete(newRound._id);
        console.log('Cleaned up test round');

    } catch (err) {
        console.error('FAILED with error:');
        console.error(err);
        if (err.code === 11000) {
            console.error('Duplicate Key Error Detail:', JSON.stringify(err.keyPattern));
            console.error('Duplicate values:', JSON.stringify(err.keyValue));
        }
    } finally {
        await mongoose.disconnect();
    }
}

repro();
