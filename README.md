# 🎯 JobTracker

A full-stack job application tracker with AI-powered interview preparation — built with Next.js 14, Supabase, and Groq AI.

**🔗 Live Demo → [jobtracker-version1.vercel.app](https://jobtracker-version1.vercel.app)**

---

## ✨ Features

### 📋 Kanban Board
- Drag and drop jobs across columns: **Applied → Interview → Offer → Rejected**
- Visual status badges with color coding
- Real-time optimistic updates

### 🤖 AI Interview Prep
- One-click interview preparation for any job
- Generates **5 tailored interview questions** based on role and company
- **3 specific research points** about the company
- **2 talking points** to highlight your fit
- **1 smart question** to ask the interviewer
- Practice answers with STAR method textarea
- Research checklist with progress tracking
- Prep score (0–100%) that updates as you complete tasks

### 📊 Dashboard
- Total applications, interviews, offers, response rate
- Applications per week bar chart
- Status breakdown pie chart
- Recent activity table

### 🔐 Auth & Security
- Google OAuth login via Supabase
- Row Level Security — users only see their own data
- Rate limiting on AI endpoints (10 requests/day)

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Database + Auth | Supabase |
| Styling | Tailwind CSS |
| Drag & Drop | @dnd-kit |
| Charts | Recharts |
| AI | Groq API (Llama 3.1) |
| Deployment | Vercel |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) account
- A [Groq](https://console.groq.com) API key (free)

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/job-tracker.git
cd job-tracker
npm install
```

### 2. Set up environment variables
Create a `.env.local` file in the root:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key
```

### 3. Set up the database
Run this SQL in your Supabase SQL editor:

```sql
-- Jobs table
create table jobs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  company text not null,
  role text not null,
  url text,
  notes text,
  status text default 'applied',
  applied_date date default now(),
  updated_at timestamp default now(),
  created_at timestamp default now()
);

-- Status history table
create table status_history (
  id uuid default gen_random_uuid() primary key,
  job_id uuid references jobs(id) on delete cascade,
  old_status text,
  new_status text not null,
  changed_at timestamp default now()
);

-- API usage tracking
create table api_usage (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  endpoint text not null,
  created_at timestamp default now()
);

-- Enable Row Level Security
alter table jobs enable row level security;
alter table status_history enable row level security;
alter table api_usage enable row level security;

-- RLS Policies
create policy "Users see own jobs" on jobs for all using (auth.uid() = user_id);
create policy "Users see own history" on status_history for all using (
  job_id in (select id from jobs where user_id = auth.uid())
);
create policy "Users see own usage" on api_usage for all using (auth.uid() = user_id);
```

### 4. Enable Google OAuth
In Supabase → Authentication → Providers → enable Google and add your credentials.

### 5. Run locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
src/
  app/
    (auth)/login/          # Google login page
    (dashboard)/           # Protected routes
      page.tsx             # Kanban board
      dashboard/           # Stats & charts
      jobs/[id]/           # Job detail + status timeline
    api/
      jobs/                # CRUD API routes
      interview-prep/      # AI generation endpoint
  components/
    KanbanBoard.tsx        # Main board with drag & drop
    KanbanColumn.tsx       # Droppable column
    JobCard.tsx            # Draggable job card
    InterviewPrepButton.tsx
    InterviewPrepModal.tsx # Full screen AI prep view
  lib/
    supabase.ts
    types.ts
```

---

## 🔒 Security

- All database tables have **Row Level Security** enabled
- Users can only access their own data
- API keys are never exposed to the client
- AI endpoint is rate limited per user per day

---

## 📦 Deployment

The app is deployed on **Vercel** with automatic deployments on every push to `main`.

Required environment variables in Vercel:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
GROQ_API_KEY
```

---

## 🙌 Built By

**Rishika Batra** — [GitHub](https://github.com/Rishika-Batra)

---

## 📄 License

MIT
