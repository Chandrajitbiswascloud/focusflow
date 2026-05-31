# FocusFlow Backend REST API

**Created and Built Entirely by Chandrajit Biswas**

This is the production-ready Node.js + Express backend service for FocusFlow. It manages the focus credits economy, user accounts, habit tracking history, transaction audits, and active app unlock schedules using a stateless JWT authentication layer and a self-contained SQLite3 database.

---

## Technical Architecture & Specs
* **Runtime**: Node.js & Express API framework.
* **Database**: SQLite3 (stored locally in `focusflow.db`, self-initializing).
* **Security**: Password hashing via BcryptJS, session tokens using HMAC-SHA256 JSON Web Tokens (JWT).
* **Communication**: Cross-Origin Resource Sharing (CORS) enabled to support local browser `file://` or custom client port connections.

---

## Getting Started

### 1. Installation & Booting

Run the following commands in your terminal:

```bash
# Navigate to the backend folder
cd /home/chandrajit/Documents/netfinance/backend

# Install production dependencies
npm install

# Start the server
npm start
```

Once running, the database file `focusflow.db` will be initialized automatically in the same folder, and the REST API will listen on `http://localhost:5000`.

### 2. Resetting the Database
To clear all data, user profiles, habits, and active unlock sessions, stop the node process (`Ctrl + C`) and delete the local database file:
```bash
rm focusflow.db
```
Upon the next server boot, `server.js` will automatically regenerate all tables with default schemas and habits.

---

## API Endpoints Reference

All authenticated requests must include the header: `Authorization: Bearer <your_jwt_token>`.

### Authentication Endpoints

#### `POST /api/auth/register`
* **Description**: Register a new account. Initializes a user profile and seeds default habits.
* **Payload**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword",
    "displayName": "Alex"
  }
  ```
* **Response (Success - 201)**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOi...",
    "user": { "id": 1, "email": "user@example.com", "displayName": "Alex" }
  }
  ```

#### `POST /api/auth/login`
* **Description**: Authenticate credentials and issue a session JWT.
* **Payload**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword"
  }
  ```
* **Response (Success - 200)**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOi...",
    "user": { "id": 1, "email": "user@example.com", "displayName": "Alex" }
  }
  ```

#### `GET /api/auth/me`
* **Description**: Fetch profile credentials, level status, current XP, and credit balances.
* **Auth Required**: Yes
* **Response (Success - 200)**:
  ```json
  {
    "success": true,
    "profile": { "creditBalance": 35, "currentXp": 120, "level": 1 }
  }
  ```

---

### Habit & Focus Endpoints

#### `GET /api/habits`
* **Description**: Fetch all habits associated with the active user.
* **Auth Required**: Yes

#### `POST /api/habits`
* **Description**: Design and append a new habit tracker.
* **Auth Required**: Yes
* **Payload**:
  ```json
  {
    "title": "Read 20 pages",
    "reward": 15,
    "category": "mind"
  }
  ```

#### `POST /api/habits/:id/complete`
* **Description**: Toggle habit completion. Completing a habit awards the reward credits and XP. Uncompleting it deducts them.
* **Auth Required**: Yes
* **Response (Success - 200)**:
  ```json
  {
    "success": true,
    "habit": { "id": 1, "completedToday": 1 },
    "profile": { "creditBalance": 55, "currentXp": 150 }
  }
  ```

#### `POST /api/focus/complete`
* **Description**: Submit a completed 25-minute Pomodoro timer session to claim 15 Focus Credits and 30 XP.
* **Auth Required**: Yes
* **Response (Success - 200)**:
  ```json
  {
    "success": true,
    "profile": { "creditBalance": 50, "currentXp": 150 }
  }
  ```

---

### Rewards & Site Blocking Endpoints

#### `GET /api/rewards/active`
* **Description**: Get active app/site unlock durations and ISO-formatted expirations. Used by the blocker extension to update interception rules.
* **Auth Required**: Yes
* **Response (Success - 200)**:
  ```json
  {
    "success": true,
    "activeUnlocks": [
      {
        "appIdentifier": "com.instagram.android",
        "duration": 15,
        "expiresAt": "2026-05-31 18:30:00"
      }
    ]
  }
  ```

#### `POST /api/rewards/unlock`
* **Description**: Spend credits to temporarily unlock a distractive domain (e.g. YouTube).
* **Auth Required**: Yes
* **Payload**:
  ```json
  {
    "appIdentifier": "com.google.android.youtube",
    "cost": 20,
    "durationMinutes": 20,
    "title": "YouTube Video"
  }
  ```
* **Response (Success - 200)**:
  ```json
  {
    "success": true,
    "profile": { "creditBalance": 15 }
  }
  ```

#### `GET /api/transactions`
* **Description**: Get transaction log history for credits (purchases and earnings).
* **Auth Required**: Yes
