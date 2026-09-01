# Sweet Batch — Restaurant Full Stack Application

CloudExify Summer Internship 2026 — Full Stack Web Development, Month 2, Project 4

**Concept:** Cafe & Bakery
**Tech stack:** HTML5, CSS3, vanilla JavaScript, Bootstrap 5, Supabase (Auth + PostgreSQL)

## What's inside
- `index.html` — customer panel: menu, search/filter, cart, checkout, order history
- `login.html` / `register.html` — shared auth pages
- `admin.html` — admin dashboard: live orders, status updates, menu management, stats
- `css/style.css` — the whole visual theme (design tokens at the top)
- `js/supabase.js` — Supabase client init (**add your own project URL + anon key here**)
- `js/auth.js`, `js/menu.js`, `js/cart.js`, `js/orders.js`, `js/admin.js`, `js/ui.js`

## Supabase setup
1. Create a free project at supabase.com.
2. Authentication → Providers → make sure Email is enabled.
3. SQL Editor → run the three `create table` statements + RLS policies from the
   Project 4 brief (profiles, menu_items, orders).
4. Settings → API → copy your **Project URL** and **anon public key** into
   `supabase.js`.
5. Manually add a couple of rows to `menu_items` so the menu isn't empty on first load.
6. To create an admin account: register normally through `register.html`, then in the
   Supabase table editor open `profiles` and change that row's `role` from `customer`
   to `admin`.

**Name:** Khadija Niaz
**Registration number:** CX-INT-2026-GEN-544
**Admin login (for PM testing):** mX9?NbauNPFs@6q
**Live link:**
