import mongoose from "mongoose";
import { logger } from "./logger.js";

/**
 * Cached flag: does the current MongoDB connection support transactions?
 * null = not yet detected, true/false = detected.
 */
let _supportsTransactions = null;

/**
 * Detect whether the MongoDB connection supports transactions (replica set / mongos).
 * Result is cached after the first successful check.
 */
const detectTransactionSupport = async () => {
    if (_supportsTransactions !== null) return _supportsTransactions;

    try {
        const admin = mongoose.connection.db.admin();
        const info = await admin.serverStatus();
        const isReplicaSet = !!info.repl;
        const isMongos = info.process === "mongos";
        _supportsTransactions = isReplicaSet || isMongos;
    } catch {
        // If we can't detect, try starting a session as a probe
        try {
            const session = await mongoose.startSession();
            session.startTransaction();
            await session.abortTransaction();
            session.endSession();
            _supportsTransactions = true;
        } catch {
            _supportsTransactions = false;
        }
    }

    logger.info(`[Transactions] MongoDB transaction support: ${_supportsTransactions ? "enabled (replica set)" : "disabled (standalone)"}`);
    return _supportsTransactions;
};

/**
 * Run a callback with an optional MongoDB transaction.
 * 
 * If the database supports transactions (replica set / mongos):
 *   - Creates a session, starts a transaction, passes `session` to callback
 *   - Commits on success, aborts on error
 * 
 * If standalone (no transaction support):
 *   - Passes `session = null` to callback
 *   - Operations run without transactional guarantees
 * 
 * Usage:
 * ```js
 * const result = await withOptionalTransaction(async (session) => {
 *   await Model.create([{ ... }], { session });
 *   await OtherModel.updateOne({ ... }, { ... }, { session });
 *   return someValue;
 * });
 * ```
 * 
 * @param {Function} callback - async (session) => result
 * @returns {Promise<*>} - result of the callback
 */
export const withOptionalTransaction = async (callback) => {
    const canUseTransactions = await detectTransactionSupport();

    if (!canUseTransactions) {
        // Standalone mode: run without session/transaction
        return await callback(null);
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const result = await callback(session);
        await session.commitTransaction();
        session.endSession();
        return result;
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

/**
 * Reset the transaction support cache (useful for testing).
 */
export const resetTransactionSupportCache = () => {
    _supportsTransactions = null;
};
