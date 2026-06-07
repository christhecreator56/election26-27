# Rosary Matriculation Hr. Sec. School — Election Portal 2026 - 2027

A high-performance, secure, and visually stunning web application built to facilitate student body elections at Rosary School. The system manages candidate lists, authenticates eligible students, records votes securely, and displays live turnout and tally analytics in real-time.

---

## 🌟 Key Features

### 1. Student Voting Portal
* **Credentialed Authentication:** Student login validated securely against their unique admission number.
* **Step-by-Step Election Workflow:** Multi-stage guided voting process:
  1. **School Pupil Leader (SPL)** election.
  2. **Assistant School Pupil Leader (ASPL)** election.
  3. **Completion Screen** displaying a success state and securing the session.
* **Double-Voting Prevention:** Verification logic locks voting columns instantly upon vote receipt, preventing students from casting multiple votes.

### 2. Premium Responsive Design
* **PC View:** Immersive dark-mode UI highlighting candidates via 3D interactive hologram collectible cards with dynamic mouse orientation tilt, hover glares, and behind-glows.
* **Mobile View:** Custom horizontal glassmorphic layouts optimized specifically for phone screens. Keeps content compact, ensures proper scrolling, and reduces heights so all candidates fit within standard viewports without clutter.

### 3. Admin Command Dashboard
* **Secure Login:** Protected route providing real-time tallies of candidate votes.
* **Turnout Analytics Page:** Comprehensive participation analytics featuring:
  * **Real-time Background Polling:** Refreshes metrics, charts, and leaderboards every 3 seconds.
  * **Visual SVG Charts:** Hover-interactive SVG graphs displaying participation by class and section.
  * **Participation Leaderboards:** Sortable tables showing class-by-class percentage rankings.
  * **Audit Log Tables:** Detailed filterable student audit lists.
  * **Excel Export Tool:** Fast XLSX download of filtered vote audit logs.
  * **Security Resets:** Allows clearing election votes for a reset without erasing the student account database.

---

## 📊 System Workflows

### 1. Student Authentication & Session Routing
```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant Login as Login Form (/)
    participant API as Auth API (/api/auth/login)
    participant DB as Postgres (Supabase RPC)
    
    Student->>Login: Enters Admission Number
    Login->>API: POST { admissionNumber }
    API->>DB: rpc('verify_student')
    DB-->>API: Returns { ok, name, next_step, already_voted }
    alt Student is invalid
        API-->>Login: 401 Unauthorized Error
        Login-->>Student: Displays Invalid Credentials Dialog
    else Student already voted
        API-->>Login: 200 OK { already_voted: true }
        Login-->>Student: Displays "Already Voted" Warning Dialog
    else Student is valid (First vote)
        API->>API: Set encrypted session cookie
        API-->>Login: 200 OK { next_step }
        Login->>Student: Redirects to /vote/{next_step}
    end
```

### 2. Vote Casting & Validation Pipeline
```mermaid
flowchart TD
    A[Student clicks 'Vote Now'] --> B{Session Cookie Present?}
    B -- No --> C[Redirect to /]
    B -- Yes --> D[POST /api/vote with role & candidateId]
    D --> E{RPC 'cast_vote' Execution}
    E -->|Error/Double Vote| F[Return error code]
    E -->|Success| G[Update has_voted column & save choice]
    G --> H{Which role voted?}
    H -->|SPL| I[Return next_step: aspl]
    H -->|ASPL| J[Return next_step: complete]
    F --> K[Display Error Modal to Voter]
    I --> L[Redirect user to /vote/aspl]
    J --> M[Redirect user to /vote/complete]
```

### 3. Real-Time Admin Analytics Pipeline
```mermaid
graph TD
    A[Admin Dashboard / Analytics View] -->|Initial Page Mount| B(Fetch API endpoints)
    A -->|Periodic background polling - 3s Interval| B
    B --> C{Endpoint Authenticated?}
    C -- No --> D[Redirect to /admin login]
    C -- Yes --> E{Request Page Data}
    E -->|Results Endpoint| F[rpc 'get_election_results']
    E -->|Analytics Endpoint| G[Query students table via Service Role client]
    F --> H[Update Live Tallies & SVGs]
    G --> I[Calculate turnout % and Leaderboards]
    H --> J[Renders to Admin View]
    I --> J
```

---

## 🛠️ Technology Stack

* **Frontend Framework:** Next.js (App Router, Client Components, Server APIs)
* **Programming Language:** TypeScript
* **Database & BaaS:** Supabase (Auth, RLS, Postgres RPC Functions)
* **Styling & Theme:** Tailwind CSS v4 (Glassmorphism layout design)
* **Excel Parsing & Export:** SheetJS (xlsx library)
* **Icons:** Lucide React

---

## 💾 Database Schema

The backend uses a Supabase-managed PostgreSQL instance containing the following main entities:

### `students` Table
* `admission_number` (text, Primary Key) - Matches school student records.
* `name` (text) - Student's name.
* `class` (text) - Class grade (e.g. 10, 11).
* `section` (text) - Section letter (e.g. A, B).
* `has_voted_spl` (boolean) - Track School Pupil Leader vote completion.
* `has_voted_aspl` (boolean) - Track Assistant School Pupil Leader vote completion.
* `spl_candidate_id` (uuid) - Reference to candidate choice.
* `aspl_candidate_id` (uuid) - Reference to candidate choice.
* `completed_at` (timestamp) - Timestamp when final vote was cast.

### `candidates` Table
* `id` (uuid, Primary Key)
* `name` (text)
* `role` (text) - Role designation (`spl` or `aspl`).
* `image_url` (text) - Avatar URL reference.

---

## 🚀 Setup & Installation

### 1. Prerequisites
Ensure you have the following installed on your local machine:
* [Node.js](https://nodejs.org/) (v18 or higher)
* [npm](https://www.npmjs.com/)

### 2. Clone and Install
Clone the project repository and install its dependencies:
```bash
git clone https://github.com/christhecreator56/election26-27.git
cd rosary-election
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory and add the configuration keys:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SESSION_SECRET=your-secure-session-secret-key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=secure-admin-password
DATABASE_URL=postgresql://postgres:password@your-db.supabase.co:5432/postgres
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key
```

### 4. Database Seeding
Extract voter data from the spreadsheet template (`STUD_DATBS.xlsx`) and seed your database:
```bash
npm run seed
```

### 5. Running the Application
Run the local next development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser to test the portal locally.
