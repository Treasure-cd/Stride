# Stride

Stride is a neurodivergent-friendly study planner and “home base” for school. It is designed to help students organise their learning in a way that feels more supportive, flexible, and less overwhelming than traditional study tools.

The app was created for students who may struggle with rigid study systems, especially those navigating ADHD, autism, anxiety, dyslexia, or other neurodivergent experiences. Instead of forcing users into a one-size-fits-all workflow, Stride aims to make studying feel more manageable, visual, and personalised.

Try it live: https://stride-take.netlify.app

## What Stride does

Stride helps students:

- Keep track of courses, assessments, topics, and study material in one place
- Organise notes and study links in a calm, visually clear workspace
- Use colour coding and spaced-out UI patterns to reduce sensory overload
- Receive personalised study recommendations based on their learning profile and current needs
- Log their mood and get supportive nudges when they are feeling overwhelmed
- Celebrate progress with small rewards and encouraging feedback
- Store important academic information in a structure that feels more like a digital binder than a stressful planner

## Key features

### Neurodivergent-friendly experience
- Designed with accessibility and sensory comfort in mind
- Clear, low-friction interface with reduced cognitive overload
- Visual organisation through colour and structure

### Study organisation
- Manage courses and assessments
- Track topics and mark progress as you study
- Save useful study links and general resources
- Keep personal notes in a flexible, easy-to-scan format

### Personalised support
- Recommendations that respond to the user’s profile and study context
- Assessment prioritisation for users who benefit from that structure
- Mood check-ins that help surface when a student may need extra support

### Motivation and reward
- Small celebratory interactions to encourage momentum
- Positive reinforcement for completed study actions

## Tech stack

### Frontend
- React
- Vite
- TypeScript
- Tailwind CSS
- Firebase Authentication

### Backend
- Node.js
- Express
- MongoDB / Mongoose
- Firebase Admin

## Project structure

- client/ – React frontend
- server/ – Express API and database logic

## Getting started

### Prerequisites
- Node.js
- pnpm

### Frontend
```bash
cd client
pnpm install
pnpm dev
```

### Backend
```bash
cd server
pnpm install
pnpm dev
```

### Environment setup
The server relies on environment-based configuration, including Firebase credentials and database connection details. Make sure the required environment files and credentials are available before starting the backend.

## Why Stride exists

Stride is not just a productivity app. It is meant to be a supportive study environment for students whose needs are often overlooked by traditional educational tools. The goal is to make studying feel more human, more flexible, and more manageable.

