# Timetable Maker & Goal Tracker

A dynamic, responsive application built with Next.js, Tailwind CSS, and Supabase that helps you manage your weekly timetable, track your goals, and view performance analytics.

**Live Demo:** [https://project-cal-gamma.vercel.app](https://project-cal-gamma.vercel.app)

## Features

- **Dynamic Timetable**: A highly interactive visual calendar to schedule your fixed events and working sessions.
- **Goal Tracking**: Create goals, mark them as completed, and track your achievements.
- **Dashboard & Analytics**: View a breakdown of your task distribution and a chart showing your daily performance trends.
- **Dark/Light Mode**: Full support for both system themes.
- **Supabase Integration**: Data is stored and synced with a Supabase PostgreSQL database.

## Getting Started

### Prerequisites

You will need a [Supabase](https://supabase.com/) account and project set up.

1. Create a new project in Supabase.
2. Ensure you have the `goals` and `tasks` tables set up matching the schema expected by the app, along with RPC functions `get_performance_trend` and `get_task_distribution`.

### Installation

1. Clone the repository:

```bash
git clone https://github.com/himydvv/ProjectCal.git
cd ProjectCal
```

2. Install the dependencies:

```bash
npm install
```

3. Create a `.env.local` file in the root directory and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack

- [Next.js](https://nextjs.org/) (App Router)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/)
- [Recharts](https://recharts.org/) for charts
- [Framer Motion](https://www.framer.com/motion/) for animations

## Deploy on Vercel

The easiest way to deploy this Next.js app is to use the [Vercel Platform](https://vercel.com/new).

**Important**: Make sure to add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to your Vercel Project Environment Variables, otherwise the app won't be able to fetch data from Supabase.
