# Rentokil Self-Service Frontend

A modern, responsive React application built with Vite and Vanilla CSS for the Rentokil Self-Service portal.

## Features
- **Dynamic Dashboard**: View and manage extermination appointments.
- **Booking Workflow**: intuitive booking with postcode and date validation.
- **Admin Portal**: Dedicated view for staff to manage all appointments and create new staff accounts.
- **Premium UI**: Dark mode with glassmorphism and smooth micro-animations.

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file:
```env
VITE_API_URL=http://localhost:8080
```

### 3. Run Development Server
```bash
npm run dev
```
The app will be available at [http://localhost:5173](http://localhost:5173).

## Testing

### E2E Tests with Playwright
We use Playwright for end-to-end testing of the full user journey.
```bash
# Run tests
npx playwright test

# View report
npx playwright show-report
```

## Build for Production
```bash
npm run build
```
The production assets will be in the `dist/` directory.
