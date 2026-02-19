
import { initializeIORedis } from './src/shared/config/ioredis.js';
import { logger } from './src/shared/utils/logger.js';
import assert from 'assert';

async function testRedisFallback() {
    console.log('--- Testing Redis Fallback ---');

    // Save original env
    const originalNodeEnv = process.env.NODE_ENV;
    const originalRedisUrl = process.env.REDIS_URL;

    try {
        // Test production failure
        process.env.NODE_ENV = 'production';
        delete process.env.REDIS_URL;

        console.log('Testing missing REDIS_URL in production...');
        try {
            await initializeIORedis();
            assert.fail('Should have thrown an error in production without REDIS_URL');
        } catch (error) {
            console.log('Caught expected error:', error.message);
            assert.strictEqual(error.message, 'REDIS_URL is required for Socket.IO horizontal scaling in production.');
        }

        // Test development warning
        process.env.NODE_ENV = 'development';
        console.log('Testing missing REDIS_URL in development...');
        const result = await initializeIORedis();
        assert.strictEqual(result.pubClient, null);
        console.log('Successfully fell back to single-process in development.');

    } finally {
        // Restore env
        if (originalNodeEnv === undefined) {
            delete process.env.NODE_ENV;
        } else {
            process.env.NODE_ENV = originalNodeEnv;
        }

        if (originalRedisUrl === undefined) {
            delete process.env.REDIS_URL;
        } else {
            process.env.REDIS_URL = originalRedisUrl;
        }
    }
}

async function run() {
    try {
        await testRedisFallback();
        console.log('\nAll tests passed successfully!');
    } catch (error) {
        console.error('\nTests failed:', error.message);
        process.exit(1);
    }
}

run();
