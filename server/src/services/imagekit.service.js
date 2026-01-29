import ImageKit from "@imagekit/nodejs";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

export const uploadOnImageKit = async (localFilePath, fileName, folder = "/gaming-hub") => {
    try {
        if (!localFilePath) return null;

        const auth = imagekit.getAuthenticationParameters();
        console.log("IK AUTH OK:", auth);

        console.log(">>> [uploadOnImageKit] Path:", localFilePath);
        // Read file as Buffer
        const fileBuffer = fs.readFileSync(localFilePath);

        // Upload to ImageKit using the correct method for v7+ SDK
        console.log(">>> [uploadOnImageKit] Calling imagekit.files.upload...");
        const response = await imagekit.files.upload({
            file: fileBuffer,
            fileName: fileName || `file-${Date.now()}`,
            folder: folder,
        });
        console.log(">>> [uploadOnImageKit] SDK response received.");

        // Remove the local temporary file
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        return response;
    } catch (error) {
        console.error("ImageKit Upload Error:", error);

        // Always remove the local temporary file
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        return null;
    }
};
