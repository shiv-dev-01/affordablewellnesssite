# Affordable Wellness

Marketing site for **Affordable Wellness**.

The repository name is `affordablewellnesssite` because this project is the site code for Affordable Wellness.

## Stack

- React
- Vite
- React Router
- Axios
- Tailwind CSS
- TypeScript
- Stripe

## Requirements

- Node.js 18 or later
- npm

## Run locally

```bash
git clone https://github.com/shiv-dev-01/affordablewellnesssite.git
cd affordablewellnesssite
cd affordable_wellness_site_code
npm install
npm run dev
```

The dev server opens at http://localhost:5173.

## Scripts

| Command | What it runs |
| --- | --- |
| `npm run dev` | `vite` |
| `npm run build` | `vite build` |
| `npm run build:dev` | `vite build --mode development` |
| `npm run lint` | `eslint .` |
| `npm run preview` | `vite preview` |
| `npm run sync:staging` | `vite build --mode staging && gsutil rsync -r ./dist/ "gs://staging-vigmdshop-com"` |

## Project files

- `affordable_wellness_site_code`
- `.gitignore`

## Configuration

Files named `.env` stay on your machine and are not part of this repository. Use `.env.example` when the project includes one.

