# OddHarvest

## Project Overview
OddHarvest is a rescue-food marketplace web app that helps reduce food waste by connecting farmers, buyers, and drivers. It includes role-based dashboards, listing and order flows, delivery tracking, and Smart Kitchen features (AI meal planning and food-preservation suggestions) powered through a server-side Gemini API endpoint.

## Installation / Setup Guide
1. Clone the repository:
   - `git clone <your-repo-url>`
   - `cd OddHarvest`
2. Install dependencies:
   - `npm install`
3. Create a local env file:
   - Copy `.env.example` to `.env`
   - Fill in required values (Supabase and Google API key).
4. Run the app locally:
   - `npm run dev`
5. Build for production:
   - `npm run build`
6. Preview production build (optional):
   - `npm run preview`

For Vercel deployment, set environment variables in Vercel Project Settings (do not commit real secrets to git).

## Technologies Used
- **Frontend:** React, TypeScript, Vite
- **UI / Styling:** Tailwind CSS, shadcn/ui, Lucide icons
- **State / Data:** React Context, TanStack Query
- **Backend / Database / Auth:** Supabase (Postgres, Auth, RLS, Edge Functions)
- **AI Integration:** Google Gemini via server-side API route (`/api/gemini`)
- **Deployment:** Vercel

## Environment Variables
| Variable | Required | Example | Where to Set | Notes |
|---|---|---|---|---|
| `GOOGLE_API_KEY` | Yes | `AIza...` | Local `.env`, Vercel | Server-side only. Do **not** expose as `VITE_*`. |
| `VITE_SUPABASE_URL` | Yes | `https://your-project-ref.supabase.co` | Local `.env`, Vercel | Public client config for Supabase project URL. |
| `VITE_SUPABASE_ANON_KEY` | Yes | `eyJ...` | Local `.env`, Vercel | Public anon key (safe for browser usage with RLS). |
| `VITE_USE_SUPABASE_BACKEND` | Yes | `true` | Local `.env`, Vercel | Must be exactly `true` to enable Supabase-backed flows. |
| `VITE_GOOGLE_GEMINI_MODEL` | Optional | `gemini-2.5-flash` | Local `.env`, Vercel | Optional model override; if omitted, app default is used. |

## Future Roadmap
### 1. Full Order Lifecycle Notifications
We plan to implement a notification system that informs users at every stage of an order, including order confirmation, pickup, and delivery. Notifications will be delivered through in-app alerts and email to improve communication between farmers, buyers, and drivers.

### 2. Real-Time Delivery Tracking with ETA
To enhance transparency, we aim to introduce real-time delivery tracking. Users will be able to view the driver's live location and receive an estimated time of arrival (ETA), improving trust and overall user experience.

### 3. Smart Kitchen Personalization
The Smart Kitchen feature will be enhanced with personalization capabilities. Users will be able to receive recipe suggestions based on dietary preferences, allergies, household size, and previously saved recipes, making the feature more practical and user-centered.

### 4. Enhanced Payment and Financial Reporting
We plan to improve the payment system by supporting more structured workflows and providing clearer financial insights. This includes detailed transaction history, earnings summaries for drivers, and sales reports for farmers to better manage their income.

### 5. Admin Moderation and System Management
An admin management system will be introduced to ensure platform reliability and safety. This includes tools for monitoring listings, detecting fraudulent activities, and handling disputes between users, helping maintain trust within the platform.
