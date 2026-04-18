# Serving the React frontend from the backend (fix 502)

The backend **does not** ship with its own `public/index.html`. The main portal is the **React app** in `1.MYCHATBOT FrontEnd`. To have https://www.mychatbot.website serve that app:

1. **Build the frontend and copy it into the backend**
   - From the **backend** folder run:
     ```bash
     npm run copy-frontend
     ```
   - This builds `1.MYCHATBOT FrontEnd` and copies its `dist/` into `2. MYCHATBOT BackEnd/public/`.

2. **Restart the backend** (e.g. `node index.js` or your process manager).

3. The backend will then serve the React app at `/` and `/login` (SPA fallback). Do **not** recreate a separate `public/index.html` in the backend; use this flow so the frontend remains the single source of truth.

If `public/index.html` is missing and you have not run `copy-frontend`, visiting the site will show a 503 message with these instructions.
