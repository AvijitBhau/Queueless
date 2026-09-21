# 🏥 QueueLess Health

> **Don't wait in line. Wait for your turn.**

QueueLess Health is a digital queue management system designed for hospitals and Primary Health Centres (PHCs).

It helps reduce physical waiting lines by allowing patients to scan a QR code, get a digital token, and track their turn in real time.

---

## 🔐 Demo Credentials

> **For demo/testing purposes only.**
>
> Do not commit production passwords, API keys, Supabase service-role keys, or other sensitive credentials to a public repository.

### PHC Admin
- **Email:** `central@queueless.com`
- **Password:** `central321`

> Please do not modify or delete existing demo data.

---

## 🌐 Live Demo

**[QueueLess Health](https://queueless-xi-nine.vercel.app/)**

---

## 💡 Problem

Patients visiting hospitals and PHC centres often have to stand in long queues with little information about:

- Their position in the queue
- How many people are ahead of them
- How long they may have to wait
- When they should return to the counter

This can lead to overcrowded waiting areas, wasted time, and inefficient queue management for healthcare staff.

---

## 💡 Solution

**QueueLess Health** converts a physical patient queue into a digital queue.

### Patient Flow

```text
Scan QR Code
     ↓
Join Queue
     ↓
Receive Digital Token
     ↓
Track Queue Position
     ↓
Wait Without Standing in Line
     ↓
Get Called
     ↓
Visit Healthcare Staff
```

Patients can join a queue without creating an account.

---

# ✨ Features

### 🎟️ Digital Patient Tokens

Patients scan a QR code and receive a digital token for the selected queue.

### 🔄 Real-Time Queue Management

Queue information is updated in real time so patients and staff can see the latest queue status.

### 📊 Queue Analytics

The management dashboard provides operational information related to patient queues and activity.

### 💊 Medicine Stock Monitoring

PHC administrators can monitor available medicine stock and related information from the management dashboard.

### 👥 Staff Management

PHC administrators can create and manage staff accounts for handling day-to-day queue operations.

### 🔐 Role-Based Access

The application provides separate access levels for different users.

---

# 👥 User Roles

```text
                    Super Admin
                         │
                         ▼
                     PHC Admin
                         │
                         ▼
                     PHC Staff
                         │
                         ▼
                      Patient
```

### Super Admin

Manages the overall QueueLess Health platform.

### PHC Admin

Manages a PHC, including queues, staff accounts, and operational information.

### PHC Staff

Handles day-to-day patient queue operations.

### Patient

Joins a queue through a QR code and tracks their token and queue position.

---

# 🎯 Queue Operations

PHC staff can manage patients using operations such as:

- **Next Call**
- **Hold**
- **Recall**
- **Complete**
- **Cancel**
- **End Queue**

---

# 🏥 Healthcare Use Case

QueueLess Health is designed around the workflow of a **Primary Health Centre (PHC)**.

A typical workflow looks like:

```text
Patient arrives at PHC
        ↓
Scans Queue QR
        ↓
Receives digital token
        ↓
Tracks queue remotely
        ↓
PHC Staff calls patient
        ↓
Patient reaches the counter
        ↓
Service completed
```

This reduces the need for patients to continuously stand in a physical queue.

---

# 🛠️ Tech Stack

### Frontend
- React
- Vite
- JavaScript
- HTML
- CSS

### Backend & Database
- Supabase
- PostgreSQL
- Supabase Authentication
- Supabase Realtime

### AI
- Google AI / Gemini

### Deployment
- Vercel

---

# 🔐 Authentication

QueueLess Health uses **Supabase Authentication** for administrative and staff accounts.

Patients do not need to create an account to join a queue.

The application uses role-based access for:

```text
Super Admin
PHC Admin
PHC Staff
```

---

# ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> Never expose the Supabase service-role key or other sensitive credentials in frontend code or public repositories.

---

# 🚀 Getting Started

## 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/queueless-health.git
```

## 2. Open the project

```bash
cd queueless-health
```

## 3. Install dependencies

```bash
npm install
```

## 4. Configure environment variables

Create a `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 5. Start the development server

```bash
npm run dev
```

The application will normally be available at:

```text
http://localhost:5173
```

---

# 🗄️ System Architecture

```text
                         QueueLess Health
                                │
             ┌──────────────────┼──────────────────┐
             │                  │                  │
             ▼                  ▼                  ▼
        Super Admin         PHC Admin          PHC Staff
             │                  │                  │
             └──────────────────┼──────────────────┘
                                │
                                ▼
                           Supabase
                    ┌───────────┼───────────┐
                    │           │           │
                    ▼           ▼           ▼
              PostgreSQL     Auth       Realtime
                                │
                                ▼
                           Patients
```

---

# 🎟️ Ticket States

Patient tickets can move through different states:

```text
WAITING
   │
   ▼
CALLED
   │
   ├──────► HOLD
   │          │
   │          ▼
   │        RECALL
   │
   ▼
COMPLETED
```

Tickets can also be cancelled when required.

---

# 📱 QR-Based Queue

Each queue can have its own QR code.

Patients simply:

```text
Scan QR
   ↓
Open Queue Page
   ↓
Join Queue
   ↓
Receive Token
```

No complicated registration is required for patients.

---

# 📊 Dashboard

The management dashboard provides access to important operational information, including:

- Active queues
- Patient queue activity
- Queue status
- Staff management
- Medicine stock information
- Analytics and operational insights

---

# 🔮 Future Scope

Possible future improvements include:

- SMS and WhatsApp notifications
- Push notifications
- Multilingual patient interface
- Voice-based interaction
- Advanced AI-based demand forecasting
- Automated medicine stock-out alerts
- Advanced healthcare analytics
- Multi-PHC deployment
- District and state-level dashboards
- Integration with existing healthcare systems

---

# 👨‍💻 Team

## NexGen Innovators

QueueLess Health was developed by **Team NexGen Innovators** as a hackathon project.

### Team Members

- **Avijit Agarwal** — Developer
- **Anshika Srivastava** — Team Member

---

# 📜 License

This project was developed for educational and hackathon purposes.

---

## ❤️ Built by NexGen Innovators

**QueueLess Health — Don't wait in line. Wait for your turn.**
