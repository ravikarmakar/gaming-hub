import { describe, it, expect, vi, beforeEach } from 'vitest';
import { rateLimiter } from './rateLimiter.middleware.js';
import { redis } from '../config/redis.js';

vi.mock('../config/redis.js', () => ({
    redis: {
        pipeline: vi.fn(),
        expire: vi.fn().mockResolvedValue('OK'),
    },
}));

vi.mock('../utils/logger.js', () => ({
    logger: {
        debug: vi.fn(),
        error: vi.fn(),
    },
}));

describe('Rate Limiter Middleware', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        mockReq = {
            headers: {},
            socket: { remoteAddress: '127.0.0.1' },
        };
        mockRes = {};
        mockNext = vi.fn();
        vi.clearAllMocks();
    });

    it('should prevent IP spoofing by using the first address in X-Forwarded-For', async () => {
        mockReq.headers['x-forwarded-for'] = '1.1.1.1, 2.2.2.2';

        const mockPipeline = {
            incr: vi.fn(),
            ttl: vi.fn(),
            exec: vi.fn().mockResolvedValue([[null, 1], [null, -1]]),
        };
        redis.pipeline.mockReturnValue(mockPipeline);

        const middleware = rateLimiter({ limit: 10, timer: 60, key: 'test' });
        await middleware(mockReq, mockRes, mockNext);

        expect(mockPipeline.incr).toHaveBeenCalledWith('rate_limit:test:1.1.1.1');
    });

    it('should not reset TTL on every request (Fixed Window)', async () => {
        const mockPipeline = {
            incr: vi.fn(),
            ttl: vi.fn(),
            exec: vi.fn().mockResolvedValue([[null, 2], [null, 59]]),
        };
        redis.pipeline.mockReturnValue(mockPipeline);

        const middleware = rateLimiter({ limit: 10, timer: 60, key: 'test' });
        await middleware(mockReq, mockRes, mockNext);

        // Should NOT call expire since TTL was already > 0 (or not -1)
        expect(redis.expire).not.toHaveBeenCalled();
    });

    it('should set EXPIRE if key is new (TTL is -1)', async () => {
        const mockPipeline = {
            incr: vi.fn(),
            ttl: vi.fn(),
            exec: vi.fn().mockResolvedValue([[null, 1], [null, -1]]),
        };
        redis.pipeline.mockReturnValue(mockPipeline);

        const middleware = rateLimiter({ limit: 10, timer: 60, key: 'test' });
        await middleware(mockReq, mockRes, mockNext);

        expect(redis.expire).toHaveBeenCalledWith(expect.any(String), 60);
    });

    it('should block requests when limit is exceeded', async () => {
        const mockPipeline = {
            incr: vi.fn(),
            ttl: vi.fn(),
            exec: vi.fn().mockResolvedValue([[null, 11], [null, 30]]),
        };
        redis.pipeline.mockReturnValue(mockPipeline);

        const middleware = rateLimiter({ limit: 10, timer: 60, key: 'test' });
        await middleware(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 429 }));
    });
});
