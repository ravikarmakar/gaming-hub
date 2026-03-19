
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const mongoUri = process.env.MONGO_URI;

async function checkIds() {
    try {
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB Atlas');

        const eventId = '69af27743299a0e30dfac014';
        
        const reg = await mongoose.connection.db.collection('eventregistrations').findOne({ status: 'approved' });
        console.log('Sample Registration:');
        console.log('eventId type:', typeof reg.eventId);
        console.log('eventId value:', reg.eventId);
        console.log('eventId is ObjectId:', reg.eventId instanceof mongoose.Types.ObjectId);

        const events = await mongoose.connection.db.collection('events').find({}).toArray();
        events.forEach(e => {
            console.log(`Event: ${e._id} - ${e.title}`);
        });

        const ongoingRounds = await mongoose.connection.db.collection('rounds').find({ status: 'ongoing' }).toArray();
        console.log('\nOngoing Rounds across ALL events:');
        ongoingRounds.forEach(r => {
            console.log(`- Round ID: ${r._id}, Event ID: ${r.eventId}, Name: ${r.roundName}`);
        });

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
}

checkIds();
