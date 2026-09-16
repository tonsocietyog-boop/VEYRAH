# VEYRAH — Cinematic Movie & TV Discovery Platform

## Project Overview

VEYRAH is a cinematic discovery platform built to demonstrate how modern media experiences can combine curated catalog intelligence, AI-driven natural language discovery, and resilient API orchestration into a single, polished experience.

The application is designed as a full-stack entertainment discovery system in which data, AI understanding, and playback routing are intentionally separated to improve reliability, maintainability, and operational clarity. From a portfolio perspective, VEYRAH highlights the ability to manage:

- multi-system data flows across public and private APIs
- secure environment-driven configuration
- AI service integration and structured prompt engineering
- fallback and resilience patterns for service disruption
- provider abstraction and routing logic in media infrastructure

This repository reflects a strong foundation in enterprise-style application architecture, where each layer has a clear responsibility and a distinct failure model.

---

## Why This Project Matters

For a Technical Support Analyst role in an enterprise data infrastructure environment, VEYRAH demonstrates core competencies relevant to production operations and systems support:

- API troubleshooting and validation across external service dependencies
- service health monitoring and graceful degradation patterns
- secure configuration management using environment variables
- operational awareness of data contracts, response handling, and fallback behavior
- clear separation between intelligence services, routing layers, and user experience components

The project is not just a media app; it is a working example of distributed application design in which metadata, discovery intelligence, and playback delivery are orchestrated through independent but connected systems.

---

## System Architecture

VEYRAH follows a layered architecture designed to keep responsibilities isolated and easier to maintain in production environments.

### 1. Presentation Layer
The frontend is built with React and Vite, delivering a responsive, cinematic streaming UI with route-based browsing, search, detail pages, watch pages, discovery views, and AI-assisted recommendation flows.

Key responsibilities:
- render catalog data and user interfaces
- orchestrate user navigation and media actions
- invoke AI discovery requests and playback decisions
- handle watch flows and media detail presentation

### 2. Metadata Intelligence Layer
The application uses TMDB as the metadata intelligence source rather than as a playback engine.

This is an intentional architecture decision: TMDB provides rich movie and TV metadata such as:
- titles and summaries
- cast and crew information
- genres and mood metadata
- posters, backdrops, trailers, and related film data

The backend server exposes a proxy endpoint at `/api/tmdb/proxy`, which centralizes TMDB access behind the application server. This design provides several operational advantages:

- API keys remain server-side and are not exposed to the browser
- request validation and sanitization occur before outbound calls
- frontend code does not directly depend on TMDB consumer logic
- fallback behavior is managed centrally if TMDB is unavailable or the key is absent

In short, TMDB is treated as a content intelligence provider, not a playback delivery mechanism.

### 3. AI Discovery Layer
The natural language discovery experience is powered by Google Gemini via the server-side SDK and structured prompts.

The backend exposes:
- `/api/ai/ask` for discovery-style recommendations based on user queries
- `/api/ai/movie-chat` for contextual questions about a specific title

These routes transform user intent into a grounded recommendation engine by sending the catalog summary, user query, and constraints to Gemini. The model is instructed to:
- analyze mood, pacing, themes, and storytelling patterns
- recommend only items present in the provided catalog
- return strict JSON responses using a schema
- provide concise, user-friendly explanations for each match

This is a strong example of grounded AI design: the model is constrained by a real catalog and not allowed to invent results.

### 4. Playback Routing Layer
Playback is intentionally isolated from the metadata and AI layers.

The application does not route playback decisions through TMDB or Gemini. Instead, it uses a provider registry and adapter pattern to resolve media requests into provider-specific playback sources. Providers are abstracted behind a common interface and are selected through a controlled resolution flow.

This separation ensures that:
- metadata discovery and playback routing are independent concerns
- provider failures can be handled gracefully
- trusted providers can be safely whitelisted
- fallback logic can be implemented without impacting catalog or AI functionality

The registry architecture is especially relevant for enterprise support and systems work because it demonstrates operational resilience and fault tolerance in a service-oriented design.

### 5. Operational Resilience Layer
The project incorporates fallback logic at multiple points:

- if TMDB credentials are missing, the app falls back to local catalog data
- if Gemini is not configured, the app still returns a useful recommendation interpretation
- if a provider fails, a safe fallback path is attempted
- if an API call fails, the UI continues to function with partial or local data

This is a practical example of defensive application design, which is highly valuable in enterprise support and infrastructure contexts.

---

## AI Integration (Grounded Natural Discovery)

VEYRAH integrates Google Gemini to support dynamic, natural-language discovery rather than rigid keyword matching. This is a core differentiator for the platform and a strong technical example of AI-assisted content understanding.

### Grounded Recommendation Engine
When a user enters a request such as “I want something tense, atmospheric, and emotionally brutal,” the frontend calls the backend discovery endpoint with a summary of available titles, including metadata such as:
- title
- media type
- genres
- overview snippet
- release year
- rating
- mood tags

The backend builds a prompt that tells Gemini to interpret the request, identify intent, and select the best matching catalog items grounded in actual dataset records.

### Structured JSON Responses
The Gemini integration uses typed, schema-based JSON output to ensure stable downstream behavior. The system instructs the model to return:
- interpretation: a natural-language summary of the request
- suggestedMood: a single mood classification
- matchedMedia: a list of recommended titles with reasons and scores

This is important for production-grade integration because it reduces parsing ambiguity and improves downstream reliability.

### Resilient AI Fallbacks
The project also includes practical safeguards:
- if no Gemini API key is configured, the system gracefully returns fallback results
- if a Gemini request fails, the app falls back to local matching heuristics
- if the model returns unexpected output, the application still preserves UX continuity

This demonstrates an understanding of real-world AI service reliability, which is a highly relevant trait for enterprise technical support and infrastructure teams.

---

## Key Features

### Robust API Handling
The project includes full-stack API orchestration with careful request handling and safety checks.

Examples include:
- TMDB proxy routing through the Express server
- validation of required query parameters and API configuration
- handling of failed outbound requests without crashing the app
- JSON responses with useful fallback metadata and operational context

### Secure Environment Variable Management
Sensitive configuration is managed through environment variables and loaded using `dotenv`.

The project supports keys such as:
- `TMDB_API_KEY`
- `GEMINI_API_KEY`

This pattern is important in enterprise systems because credentials remain outside source control and are loaded at runtime rather than hardcoded in the application code.

### Full-Stack Integration
The platform operates as a single cohesive application with a client/server boundary that still feels unified from the user’s perspective.

This includes:
- React frontend for interactive UX
- Express server for API mediation and service orchestration
- Vite-based development pipeline
- server-side service initialization for Gemini and external API access
- portfolio-friendly architecture that maps naturally to production application operations

### Media Discovery and Recommendation Experience
Beyond API plumbing, VEYRAH provides:
- cinematic browsing and category organization
- mood-based recommendation flows
- AI-powered “Ask VEYRAH” discovery
- media detail pages with cast, genres, similar titles, and viewing context
- provider-driven watch experience and fallback playback selection

### Production-Style Reliability Patterns
The repository reflects a modern engineering mindset by combining:
- centralized configuration
- service-level resilience
- structured AI interaction
- provider abstraction
- clear separation of concerns across the application stack

---

## Tech Stack

### Frontend
- React 19
- TypeScript
- Vite 6
- Tailwind CSS
- Motion for UI animation
- Lucide React icons

### Backend
- Node.js
- Express
- TypeScript
- dotenv
- Google GenAI SDK

### Data & Integration Layer
- TMDB API
- Google Gemini API
- Local catalog data layer for fallback behavior and offline resilience

### Validation & Quality
- Node.js test runner
- TypeScript compiler checks
- provider registry test coverage

---

## Project Structure

```text
VEYRAH/
├── server.ts                  # Express server, API layer, Gemini setup, TMDB proxy
├── vite.config.ts            # Vite configuration for frontend dev server
├── package.json              # Scripts and dependencies
├── .env.example              # Example environment configuration
├── src/
│   ├── App.tsx               # App shell and route orchestration
│   ├── components/           # UI components and discovery experience
│   ├── context/              # App state/context management
│   ├── data/                 # Catalog and metadata dataset
│   ├── pages/                # Route-level pages (Home, Detail, Watch, Search)
│   ├── providers/            # Playback adapter and provider registry
│   ├── services/             # TMDB + Gemini integration services
│   └── types.ts              # Shared TypeScript interfaces
├── tests/
│   └── provider-registry.test.ts
├── index.html
├── metadata.json
└── dist/                    # Production build output
```

---

## Getting Started / Local Setup

### Prerequisites
Before running the project locally, ensure you have:
- Node.js 18+ installed
- npm or another package manager available
- a TMDB API key
- a Google Gemini API key

### 1. Clone the Repository

```bash
git clone <repository-url>
cd VEYRAH
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the project root based on `.env.example`.

Example:

```env
GEMINI_API_KEY="your_gemini_api_key_here"
TMDB_API_KEY="your_tmdb_api_key_here"
```

The application expects these environment variables:
- `GEMINI_API_KEY`: used for Gemini-powered recommendation and movie Q&A
- `TMDB_API_KEY`: used by the server-side TMDB proxy for metadata retrieval

> If these values are not present, the application will gracefully fall back to local catalog data and non-live AI behavior.

### 4. Run the App in Development Mode

```bash
npm run dev
```

This starts the Express server and Vite development pipeline. The application is served on:

```text
http://localhost:3000
```

### 5. Production Build
To generate a production build:

```bash
npm run build
```

To run the production server:

```bash
npm run start
```

### 6. Run Tests

```bash
npm test
```

---

## Operational Notes

This project is structured to resemble a real-world production application in which multiple services interact but remain decoupled by responsibility:

- TMDB handles metadata intelligence
- Gemini handles natural-language interpretation
- a provider registry handles playback routing
- the frontend consumes those services through a controlled API layer

This separation improves supportability, reduces operational risk, and demonstrates strong engineering judgment in system design.

---

## Summary

VEYRAH is a robust demonstration of full-stack media application engineering, AI integration, and resilient system architecture. It is purposefully designed to communicate technical capability in:

- API integration and service orchestration
- secure configuration management
- workflow resilience and fallback logic
- AI-grounded recommendation systems
- structured architecture for modern digital products

This repository is suitable for showcasing a professional, systems-oriented engineering profile, particularly for technical support and infrastructure-focused roles where API reliability, architecture clarity, and operational awareness are essential.
