
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const mongoUri = process.env.MONGO_URI;

async function verify() {
    try {
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB Atlas');

        const eventId = '69af27743299a0e30dfac014';
        
        // Models
        const Round = mongoose.models.Round || mongoose.model('Round', new mongoose.Schema({
            eventId: mongoose.Schema.Types.ObjectId,
            roundNumber: Number,
            roundName: String,
            status: String,
            type: String
        }));

        const Event = mongoose.models.Event || mongoose.model('Event', new mongoose.Schema({
            roundCount: Number
        }));

        const EventRegistration = mongoose.models.EventRegistration || mongoose.model('EventRegistration', new mongoose.Schema({
            eventId: mongoose.Schema.Types.ObjectId,
            status: String
        }));

        // 1. Check Event roundCount
        const event = await Event.findById(eventId);
        console.log('--- EVENT ---');
        console.log('ID:', eventId);
        console.log('roundCount:', event?.roundCount);

        // 2. Check Existing Rounds
        const rounds = await Round.find({ eventId });
        console.log('\n--- ROUNDS ---');
        console.log('Count:', rounds.length);
        rounds.sort((a, b) => a.roundNumber - b.roundNumber).forEach(r => {
            console.log(`- Round ${r.roundNumber}: "${r.roundName}" (ID: ${r._id}, Status: ${r.status})`);
        });

        // 3. Check Approved Registrations
        const approvedCount = await EventRegistration.countDocuments({ eventId, status: 'approved' });
        console.log('\n--- REGISTRATIONS ---');
        console.log('Approved Count:', approvedCount);

        // 4. Check for Ongoing Round
        const ongoingRound = await Round.findOne({ eventId, status: 'ongoing' });
        console.log('\n--- ONGOING ROUND ---');
        console.log('Found:', ongoingRound ? `Yes (ID: ${ongoingRound._id}, Name: "${ongoingRound.roundName}")` : 'No');

    } catch (error) {
        console.error('Error during verification:');
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
}

verify();
