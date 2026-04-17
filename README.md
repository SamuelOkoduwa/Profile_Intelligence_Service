# Profile Intelligence Service

HNG14 Stage 1 Backend Task - Building a Profile Intelligence Service that enriches user profiles with demographic data from multiple APIs.

## Project Overview

This service accepts a user's name and enriches it with data from three external APIs:
- **Genderize** - Predicts gender
- **Agify** - Estimates age
- **Nationalize** - Predicts nationality

The enriched profiles are stored in a database and can be retrieved, filtered, and deleted.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **HTTP Client**: Axios

## Setup

### Prerequisites
- Node.js (v14+)
- PostgreSQL
- npm

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update `.env` with your database credentials:
```
DATABASE_URL=postgresql://user:password@localhost:5432/profile_intelligence
PORT=3000
```

5. Start the development server:
```bash
npm run dev
```

## API Endpoints

- `POST /api/profiles` - Create a new profile
- `GET /api/profiles/{id}` - Retrieve a profile by ID
- `GET /api/profiles` - List all profiles with optional filtering
- `DELETE /api/profiles/{id}` - Delete a profile

## Development

Run in development mode with auto-reload:
```bash
npm run dev
```

Run in production mode:
```bash
npm start
```
