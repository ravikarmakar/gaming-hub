import "dotenv/config";
import { connectDB } from "./src/shared/utils/db.js";
import { handleJoinRequestService } from "./src/modules/join-request/join-request.service.js";

let success = true;
try {
    await connectDB();
    const result = await handleJoinRequestService("69a87ae6fb0bf59714c9dd98", "accepted", "69a87a2afb0bf59714c9dd81");
    console.log("SUCCESS:", result);
} catch (error) {
    console.error("FATAL ERROR CAUGHT:", error);
    success = false;
} finally {
    process.exit(success ? 0 : 1);
}


run();
