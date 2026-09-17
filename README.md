# 🎫 Queueless — Smart Queue Management System

A beautiful, real-time queue management platform built with **React + Supabase** (no backend required).

## ✨ Features

| Role | Capabilities |
|------|-------------|
| **Super Admin** | Create/manage Admin accounts, system-wide analytics, activate/deactivate accounts |
| **Admin** | Create/manage Staff accounts, run their own queues, view analytics |
| **Staff** | Create queue events with QR codes, live control panel (Next/Hold/Recall), manage multiple parallel queues |
| **Customer** | Scan QR → get ticket instantly, see live position, estimated wait, receive browser notifications when turn approaches |

## 🚀 Quick Start

### 1. Clone & Install

```bash
cd queueless-app
npm install
```

### 2. Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run `supabase/migrations/001_init.sql`
3. In **Database → Replication → supabase_realtime** publication, add tables: `events` and `tickets`
4. Copy your project URL and anon key

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Create First SuperAdmin

In **Supabase Auth → Users**, create a user manually, then run this in SQL Editor:

```sql
insert into public.profiles (id, username, email, role, is_active)
values ('<USER_UUID>', 'superadmin', 'your@email.com', 'superadmin', true)
on conflict (id) do update set role = 'superadmin';
```

### 5. Run Dev Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🗂 Project Structure

```
src/
├── components/
│   ├── layout/         # Sidebar, MobileNav, DashboardShell
│   ├── auth/           # ProtectedRoute
│   └── ui/             # GlassCard, Modal, PageHeader
├── hooks/
│   ├── useAuth.js          # Supabase Auth hook
│   └── useRealtimeQueue.js # Supabase Realtime subscriptions
├── lib/
│   ├── supabase.js     # Supabase client
│   └── queueUtils.js   # Helpers (QR code, time calc, notifications)
├── pages/
│   ├── auth/           # LoginPage
│   ├── superadmin/     # Dashboard, ManageAdmins, SystemStats, Settings
│   ├── admin/          # Dashboard, ManageStaff, ManageQueues, Analytics, Settings
│   ├── staff/          # StaffDashboard, EventManager, PastEvents, Settings
│   └── customer/       # TicketPage (public, no login)
└── store/
    └── useStore.js     # Zustand stores (auth, UI)
```

## 🎨 Design System

- **Glassmorphism** — `backdrop-filter: blur(20px)` cards throughout
- **Dark gradient** background — deep navy → purple → dark
- **Accent colors** — Electric Cyan `#00d4ff` + Violet `#7c3aed`
- **Framer Motion** — page transitions, card animations, counter flips
- **Responsive** — sidebar on desktop, hamburger drawer on mobile

## 📱 Customer Flow

1. Staff creates an event → QR code generated
2. Customer scans QR → lands on `/q/<CODE>` (no login required)
3. Taps "Get My Ticket" → assigned ticket #1, #2, #3...
4. Sees live: currently serving, people ahead, estimated wait
5. Gets **browser notification** when ≤3 people ahead

## 🏗 Build for Production

```bash
npm run build
# Output in dist/ — deploy to Vercel, Netlify, Cloudflare Pages, etc.
```

---

*Built with ❤️ using React 18, Vite, Tailwind CSS, Framer Motion, Supabase, and Zustand*
