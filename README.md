# DataPath - Study & Career Tracker

An all-in-one study app for becoming an industry-ready **Data Analyst, Data Scientist or ML Engineer**.
No install, no build, no internet needed: open `index.html` in Chrome or Edge.

## What is inside

| Page | What it does |
|---|---|
| **Dashboard** | Weighted job-readiness score, streak, study hours, next-up topics, revision reminders, job pipeline |
| **Roadmap & Skills** | 10 tracks, 83 topics, 560 subtopics with industry **weightage per role** (Excel, SQL, Python, Statistics, BI, ML, Deep Learning/GenAI, Data Eng/MLOps, Business, Career) |
| **Track pages** | Per-topic status, subtopic checklist, confidence stars, hours, notes, YouTube/Google search, free resources |
| **Study Plan** | 13 / 17 / 18-week plans (Analyst / Scientist / ML Eng) with a realistic hours-per-day check |
| **Interview Practice** | 82 questions with model answers, flashcards (Space = flip, K = known, R = review), add your own |
| **Notes** | Free notes + all topic notes in one searchable place, export to Markdown |
| **Projects** | 13 portfolio project ideas with step checklists; add your own |
| **Job Tracker** | Kanban from Wishlist to Offer with follow-up reminders |
| **Study Log & Timer** | Pomodoro timer that logs automatically, 7-day chart, 18-week heatmap, time per track |
| **Settings** | Target role, target date, daily goal, theme, backup / restore |

Use **＋ Add skill / topic** (Roadmap or any track) to add your own skills with your own weightage, hours and subtopics.

## How readiness is calculated

`readiness = Σ(weight × completion) ÷ Σ(weight)` using the weights of your selected role.
Completion = subtopics checked ÷ total. Topics with weight 0 for your role are "Optional" and ignored.
Weightages (0-10) are curated estimates based on typical job descriptions and interviews, not a measured survey.

## Your data & privacy

- Everything is stored in this browser's `localStorage`. The app makes **no network requests**
  (enforced by a Content-Security-Policy with `connect-src 'none'`).
- Clearing browser data, or opening the app in another browser/profile, starts you from zero.
  **Export a backup regularly** (Settings → Export backup) and keep the file private - it contains your notes.
- Imports are validated: only known fields and types are accepted, links must be `http(s)`.
- The YouTube / Google / resource links open external sites only when you click them.
- Do not store passwords, API keys or ID numbers in notes or the job tracker.

## Files

```
index.html        page shell + strict CSP
css/styles.css    themes (light/dark), layout, charts
js/data.js        curriculum: tracks, topics, weights, plans, questions, projects  <- edit to customise
js/app.js         app logic, rendering, storage, validation
```
