import ImageKit from "@imagekit/nodejs";
import fs from "fs";
import dotenv from "dotenv";
import { logger } from "../utils/logger.js";

dotenv.config();

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

export const uploadOnImageKit = async (localFilePath, fileName, folder = "/gaming-hub") => {
    let fileStream;
    try {
        if (!localFilePath) return null;

        // Create a ReadStream for the file
        fileStream = fs.createReadStream(localFilePath);

        // Upload to ImageKit using the correct method for v7+ SDK
        const response = await imagekit.files.upload({
            file: fileStream,
            fileName: fileName || `file-${Date.now()}`,
            folder: folder,
        });

        if (fileStream) fileStream.destroy();

        // Remove the local temporary file
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        return response;
    } catch (error) {
        logger.error("ImageKit Upload Error:", error);

        if (fileStream) fileStream.destroy();

        // Always remove the local temporary file
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        return null;
    }
};

export const deleteFromImageKit = async (fileId) => {
    try {
        if (!fileId) return null;
        const response = await imagekit.files.delete(fileId);
        return response;
    } catch (error) {
        logger.error("ImageKit Deletion Error:", error);
        return null;
    }
};
