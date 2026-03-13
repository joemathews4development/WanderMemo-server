# WanderMemo Server 🌍💾  
### Backend API for the WanderMemo Travel Social App

---

## Project Name

WanderMemo Server

This repository contains the backend REST API used by the WanderMemo travel application.

The server manages user authentication, travel trips, memories, reactions, comments, follow relationships, premium subscriptions, and AI-powered itinerary generation.

It connects to a MongoDB database and integrates with third-party services including Cloudinary, Stripe, and OpenAI.

---

## 🗄 Data Models

### Users
```
{
    _id,
    firstName,
    lastName,
    email,
    password,
    profileImage,
    role,
    createdAt,
    updatedAt
}
```
---

### Trips
```
{
    _id,
    title,
    description,
    cities,
    category,
    startDate,
    endDate,
    cost,
    visibility,
    user,
    createdAt,
    updatedAt
}
```
---

### Memories
```
{
    _id,
    title,
    caption,
    city,
    medias,
    type,
    date,
    cost,
    visibility,
    user,
    trip,
    createdAt,
    updatedAt
}
```
---

### Reactions
```
{
    _id,
    emoji,
    user,
    memory,
    createdAt,
    updatedAt
}
```
---

### Comments
```
{
    _id,
    text,
    user,
    memory,
    createdAt,
    updatedAt
}
```
---

### Follow
```
{
    _id,
    follower,
    following,
    status,
    createdAt,
    updatedAt
}
```
Status values:
```
Pending
Accepted
Rejected
```
---

### Cities
```
{
    _id,
    city,
    country,
    latitude,
    longitude
}
```

Used for autocomplete and trip location mapping.

---

## 🤖 AI Trip Planner Model
```
{
    itinerary: [
        {
            day,
            date,
            city,
            activities: [
                {
                    title,
                    description,
                    type,
                    location,
                    estimatedCost
                }
            ]
        }
    ]
}
```
Generated using OpenAI based on:

- number of days
- selected cities
- travel preferences

---

## Used API Endpoints

### Authentication

| Method | Endpoint | Description |
|------|------|-------------|
| POST | `/auth/signup` | Create user account |
| POST | `/auth/login` | Login user |
| GET | `/auth/verify` | Verify authentication token |

---

### Users

| Method | Endpoint | Description |
|------|------|-------------|
| GET | `/users` | Search users |
| GET | `/users/:userId` | Get user profile |
| PATCH | `/users` | Update user profile |
| PATCH | `/users/changeEmail` | Update email |
| PATCH | `/users/changePassword` | Update password |

---

### Trips

| Method | Endpoint | Description |
|------|------|-------------|
| GET | `/trips` | Get user trips |
| POST | `/trips` | Create trip |
| GET | `/trips/:tripId` | Get trip details |
| PATCH | `/trips/:tripId` | Update trip |
| DELETE | `/trips/:tripId` | Delete trip |

---

### Memories

| Method | Endpoint | Description |
|------|------|-------------|
| GET | `/memories/feed` | Get memory feed |
| POST | `/memories` | Create memory |
| GET | `/memories/:memoryId` | Get memory details |
| PATCH | `/memories/:memoryId` | Update memory |
| DELETE | `/memories/:memoryId` | Delete memory |

---

### Reactions

| Method | Endpoint | Description |
|------|------|-------------|
| POST | `/reactions` | Add or update reaction |

Each user can react only once per memory.

---

### Comments

| Method | Endpoint | Description |
|------|------|-------------|
| GET | `/comments/:memoryId` | Get comments |
| POST | `/comments` | Add comment |
| DELETE | `/comments/:commentId` | Delete comment |

---

### Follow System

| Method | Endpoint | Description |
|------|------|-------------|
| POST | `/follows` | Send follow request |
| PATCH | `/follows/:id` | Accept or reject request |
| GET | `/follows/requests` | Get pending follow requests |

---

### Cities

| Method | Endpoint | Description |
|------|------|-------------|
| GET | `/cities` | Search cities (autocomplete) |

---

### AI Trip Planner

| Method | Endpoint | Description |
|------|------|-------------|
| POST | `/ai/plan-trip` | Generate AI itinerary |

Uses OpenAI to generate a travel plan.

---

### Payments (Stripe)

| Method | Endpoint | Description |
|------|------|-------------|
| POST | `/payments/create-checkout-session` | Start Stripe checkout |
| POST | `/payments/webhook` | Stripe webhook |

Used to upgrade users to **Premium membership**.

---

## Running the Server Locally

### Install Dependencies

npm install
---

### Configure Environment Variables

Create `.env` file:
PORT=
ORIGIN=
MONGODB_URI=
TOKEN_SECRET=

CLOUDINARY_NAME=
CLOUDINARY_KEY=
CLOUDINARY_SECRET=

OPENAI_API_KEY=

STRIPE_SECRET_KEY=

---

### Start Server
npm run dev
Server runs at: http://localhost:{PORT}

---

## Technologies Used

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Stripe Payments
- Cloudinary Media Storage
- OpenAI API
- REST API Architecture

---

## AI Assistance

Artificial Intelligence tools were used extensively during the development of this project.

AI assistance was used for:

- Code suggestions and debugging
- API structure guidance
- Documentation writing
- Architecture brainstorming
- UI/UX design ideas for the frontend

AI tools were used as development assistance, while the final implementation and architecture were designed and implemented manually.

---

## Project

### Repository (Client)

Frontend application

### Repository (Server)

Backend API

---

## Author

Developed independently as part of the WanderMemo full-stack travel social application.