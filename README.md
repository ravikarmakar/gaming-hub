<div align="center">
  <h1>🎮 Squadex</h1>
  <p><strong>Real-Time Competitive Gaming Platform</strong></p>

  <!-- Tech Stack Badges -->
  <p>
    <img src="https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
    <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.io" />
  </p>
</div>

---

## 🛑 Proprietary License

**Copyright © 2026 Ravi Karmakar. All Rights Reserved.**

This repository and its contents are **Proprietary and Closed Source**.
You may not copy, modify, distribute, sell, or lease any part of this code or its derivatives without explicit written permission from the author. This repository is strictly for demonstration, portfolio, and interview purposes to showcase advanced software engineering practices.

---

## 🏗️ System Architecture

Squadex is designed with a highly decoupled, horizontally scalable architecture, utilizing an API-first approach and a real-time event-driven layer.

### 🖥️ 1. Client Layer (Frontend)
> The user-facing application built for speed and responsiveness.
* **Framework**: React 18 (built with Vite for fast HMR).
* **Data Fetching**: TanStack React Query for aggressive server-state caching.
* **Communication**: REST API for CRUD operations, Socket.IO client for real-time events.

### ⚙️ 2. API Gateway & Logic Layer (Backend)
> The core engine handling business logic, validation, and real-time streaming.
* **Engine**: Node.js & Express.js.
* **Real-Time Server**: Socket.IO handles bi-directional event streaming (chat, notifications).
* **Security & Routing**: Centralized JWT validation, RBAC (Role-Based Access Control), and rate limiting.

### 🗄️ 3. Data & Caching Layer
> The persistence layer designed for data integrity and sub-millisecond reads.
* **Primary Database**: MongoDB (Mongoose) utilizing **ACID Transactions** for complex operations.
* **High-Speed Cache**: Redis (L1/L2 Cache) drastically reduces MongoDB queries for read-heavy routes.
* **Message Broker**: Redis Pub/Sub acts as the Socket.IO adapter, allowing the Node.js server to be horizontally scaled across multiple CPU cores or instances.

### 🌍 4. External Services
> Third-party integrations for optimized delivery and communication.
* **Asset Optimization**: ImageKit CDN for dynamic, on-the-fly image resizing and caching.
* **Transactional Emails**: Brevo SMTP for reliable delivery of password resets and invites.
* **Identity Providers**: Google & Discord OAuth.

---

## 🚀 Advanced Engineering Highlights

This project was built to demonstrate senior-level software engineering capabilities, specifically focusing on **distributed systems, concurrency control, data consistency, and high availability.**

### 1. Concurrency Control & ACID Transactions
In a highly competitive environment like esports, race conditions (e.g., two managers accepting players simultaneously when only one slot is left) are critical failures.
* **MongoDB ACID Transactions**: Complex multi-document operations (like joining a team, updating user roles, and invalidating requests) are wrapped in MongoDB transactions ensuring atomicity. If any step fails, the entire operation rolls back.
* **Atomic Validation**: Utilizes MongoDB `$expr` to perform atomic limit checks at the database layer (e.g., enforcing a strict 12-member roster limit) preventing race conditions under heavy load.

### 2. Sophisticated Caching Strategy (L1/L2)
Database queries are minimized using a sophisticated multi-tier caching architecture via Redis (`ioredis` & native client).
* **L2-L1 Sync & Denormalization**: Critical data (like User Avatars) is denormalized into Team documents for read-heavy operations. Updates are synchronized with **retry logic and exponential backoff** to ensure eventual consistency.
* **Self-Healing Caches**: Built-in mechanisms detect JSON parse failures or stale data, automatically invalidating corrupted keys and refetching truth from MongoDB.
* **Robust Invalidation**: Every mutation triggers an immediate `redis.del` pipeline. Fallbacks include forcing 1-second TTLs if primary deletion fails, completely preventing users from seeing stale UI states.

### 3. Real-Time Infrastructure (WebSockets)
* **Horizontal Scaling Ready**: The WebSocket implementation (`Socket.IO`) utilizes the `@socket.io/redis-adapter`, allowing the real-time layer to be horizontally scaled across multiple Node.js instances without losing message delivery context.
* **Contextual Namespaces**: Implements isolated, secure chat rooms for Teams, Organizers, and private messaging.
* **In-Memory Rate Limiting**: WebSocket events are protected by ultra-fast LRU-cache rate limiters (e.g., max 5 messages per 5 seconds per user) preventing spam and memory leaks without hitting the database.

---

## 🛡️ API Design & Security

* **Multi-Provider Identity**: Secure authentication utilizing Google OAuth, Discord OAuth, and strictly signed JWTs (Access + Refresh tokens).
* **Unified Error Handling**: A centralized global error handler catches and formats all system errors into a consistent, predictable RESTful response structure.
* **Strict Role-Based Access Control (RBAC)**: Fine-grained permissions across scopes (Super Admin, Organizer, Team Owner/Manager, Member) validated strictly at the middleware layer.
* **Enterprise Protection**: Implementation of `helmet`, `hpp` (HTTP Parameter Pollution), `express-mongo-sanitize` (NoSQL Injection Prevention), and strict CORS policies.

---

## 🧪 Code Quality & Observability

* **Strict Type Safety & Validation**:
  * **Frontend**: Utilizes `Zod` combined with React Hook Form to ensure complex form state is perfectly validated before network requests.
  * **Backend**: Utilizes `Joi` to validate all incoming request payloads, query parameters, and URL parameters, immediately rejecting malformed data.
* **Automated Testing**: Powered by `Vitest` for ultra-fast unit and integration testing across business-critical logic.
* **Observability**: **Sentry** integration for real-time error tracking and Node.js profiling, combined with **Winston** for automated, daily-rotated structured server logging.

---

## 🧩 Domain-Driven Modules

The backend is strictly modularized to separate concerns and ensure maintainability as the application grows:

* `src/modules/auth`: JWT lifecycle, OAuth integrations, password resets (via Brevo SMTP).
* `src/modules/team`: Roster management, join requests, branding, atomic transactions.
* `src/modules/chat`: Redis-backed real-time messaging, access control validation.
* `src/modules/event`: Tournament bracket management and scheduling.
* `src/modules/admin`: Global dashboard, user metrics, system-wide controls.

---

<div align="center">
  <p><i>Engineered by <strong>Ravi Karmakar</strong> to demonstrate production-ready system design.</i></p>
</div>
