# Profile Intelligence Service

    This service accepts a name, enriches it with data from external APIs, stores the processed result in PostgreSQL, and exposes endpoints to retrieve, filter, and delete saved profiles.

## Features

- Integrates with Genderize, Agify, and Nationalize
- Stores enriched profile data in PostgreSQL
- Uses UUID v7 for profile IDs
- Supports idempotent profile creation by name
- Supports filtering by gender, country_id, and age_group
- Returns UTC ISO 8601 timestamps
- Enables CORS with Access-Control-Allow-Origin: *

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Axios
- uuidv7

## External APIs

The service calls these public APIs:

- Genderize
- Agify
- Nationalize

## Project Structure

```text
.
├── src
│   ├── config
│   │   └── database.js
│   ├── routes
│   │   └── profiles.js
│   ├── utils
│   │   ├── apiClient.js
│   │   └── dataProcessor.js
│   └── index.js
├── .env.example
├── package.json
└── README.md
```

## Environment Variables

Create a `.env` file in the project root.

Required variables:

```env
DATABASE_URL=postgresql://username:password@host:5432/database_name
PORT=4000
```

Notes:

- `DATABASE_URL` must point to a reachable PostgreSQL instance.
- `PORT` is optional. If omitted, the app falls back to `3000`.

## Installation

```bash
npm install
```

## Run Locally

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

## Health Check

```http
GET /health
```

Example response:

```json
{
  "status": "ok"
}
```

## API Endpoints

### POST /api/profiles

Creates a new enriched profile.

Request body:

```json
{
  "name": "ella"
}
```

Successful response:

```json
{
  "status": "success",
  "data": {
    "id": "019d9dc5-ed8b-72ef-a26a-69b9309255c2",
    "name": "ella",
    "gender": "female",
    "gender_probability": 0.99,
    "sample_size": 97517,
    "age": 53,
    "age_group": "adult",
    "country_id": "CM",
    "country_probability": 0.1,
    "created_at": "2026-04-17T23:28:07.000Z"
  }
}
```

Idempotent response when the profile already exists:

```json
{
  "status": "success",
  "message": "Profile already exists",
  "data": {
    "id": "019d9dc5-ed8b-72ef-a26a-69b9309255c2",
    "name": "ella",
    "gender": "female",
    "gender_probability": 0.99,
    "sample_size": 97517,
    "age": 53,
    "age_group": "adult",
    "country_id": "CM",
    "country_probability": 0.1,
    "created_at": "2026-04-17T23:28:07.000Z"
  }
}
```

### GET /api/profiles/:id

Fetches a single profile by ID.

Example response:

```json
{
  "status": "success",
  "data": {
    "id": "019d9dc5-ed8b-72ef-a26a-69b9309255c2",
    "name": "ella",
    "gender": "female",
    "gender_probability": 0.99,
    "sample_size": 97517,
    "age": 53,
    "age_group": "adult",
    "country_id": "CM",
    "country_probability": 0.1,
    "created_at": "2026-04-17T23:28:07.000Z"
  }
}
```

### GET /api/profiles

Returns saved profiles. Supports optional case-insensitive filters:

- `gender`
- `country_id`
- `age_group`

Example request:

```http
GET /api/profiles?gender=female&age_group=adult
```

Example response:

```json
{
  "status": "success",
  "count": 1,
  "data": [
    {
      "id": "019d9dc5-ed8b-72ef-a26a-69b9309255c2",
      "name": "ella",
      "gender": "female",
      "age": 53,
      "age_group": "adult",
      "country_id": "CM"
    }
  ]
}
```

### DELETE /api/profiles/:id

Deletes a profile by ID.

Successful response:

```http
204 No Content
```

## Processing Rules

- `gender_probability` is taken from Genderize
- `sample_size` is the renamed Genderize `count`
- `age` is taken from Agify
- `country_id` is the highest-probability country from Nationalize
- `country_probability` is the probability for the selected country

Age groups are classified as:

- `0-12` => `child`
- `13-19` => `teenager`
- `20-59` => `adult`
- `60+` => `senior`

## Error Handling

General error format:

```json
{
  "status": "error",
  "message": "<error message>"
}
```

Possible responses:

- `400 Bad Request` for missing or empty name
- `422 Unprocessable Entity` for invalid name type
- `404 Not Found` when a profile does not exist
- `500 Internal Server Error` for server-side failures

Upstream validation failures return:

```json
{
  "status": "502",
  "message": "Genderize returned an invalid response"
}
```

Possible upstream messages:

- `Genderize returned an invalid response`
- `Agify returned an invalid response`
- `Nationalize returned an invalid response`

## Notes

- Profile names are normalized to lowercase before storage.
- Profile creation is idempotent by name.
- The database schema is created automatically on startup.

## Submission Checklist

- Add your public GitHub repository URL
- Deploy the API to a public host
- Add your production base URL here before submission

Example production base URL section:

```text
profileintelligenceservice-production-684d.up.railway.app
```
