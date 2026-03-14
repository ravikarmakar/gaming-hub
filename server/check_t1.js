
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

async function checkT1() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const eventId = '69af27743299a0e30dfac014';
        
        const event = await mongoose.connection.db.collection('events').findOne({ _id: new mongoose.Types.ObjectId(eventId) });
        const t1TeamIds = (event.t1SpecialTeams || []).map(id => id.toString());
        console.log('T1 Team IDs count:', t1TeamIds.length);

        if (t1TeamIds.length > 0) {
            const registrations = await mongoose.connection.db.collection('eventregistrations').find({
                eventId: new mongoose.Types.ObjectId(eventId),
                teamId: { $in: t1TeamIds.map(id => new mongoose.Types.ObjectId(id)) }
            }).toArray();
            console.log('Registrations found for T1 teams:', registrations.length);
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

checkT1();
