
import mongoose from 'mongoose';

const mongoUri = 'mongodb://localhost:27017/test';

async function reproduce() {
    try {
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        const eventId = '69af27743299a0e30dfac014';
        
        // Use the existing models if possible, or define minimal ones
        const roundSchema = new mongoose.Schema({
            eventId: mongoose.Schema.Types.ObjectId,
            roundNumber: Number,
            roundName: String,
            status: { type: String, default: 'pending' },
            type: { type: String, default: 'tournament' }
        });
        roundSchema.index({ eventId: 1, roundNumber: 1 }, { unique: true });
        roundSchema.index({ eventId: 1, roundName: 1 }, { unique: true });
        
        const Round = mongoose.models.Round || mongoose.model('Round', roundSchema);

        const eventSchema = new mongoose.Schema({
            roundCount: Number,
            roadmaps: [mongoose.Schema.Types.Mixed]
        });
        const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);

        const event = await Event.findById(eventId);
        if (!event) {
            console.error('Event not found');
            return;
        }
        console.log('Event roundCount:', event.roundCount);

        const nextRoundNumber = event.roundCount + 1;
        const nextRoundName = `Round-${nextRoundNumber}`;

        console.log(`Attempting to create round ${nextRoundNumber} with name "${nextRoundName}"...`);

        const newRound = await Round.create({
            eventId: new mongoose.Types.ObjectId(eventId),
            roundNumber: nextRoundNumber,
            roundName: nextRoundName,
            status: 'pending',
            type: 'tournament'
        });

        console.log('Success! Created round:', newRound._id);
    } catch (error) {
        console.error('Error creating round:');
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
}

reproduce();
