# Gemini API key expired – renew the key

The bot uses **Google Gemini** for replies. If you see:

- `API key expired. Please renew the API key`
- `API_KEY_INVALID`

your Gemini API key has expired or was revoked.

## Steps to fix

1. **Get a new API key**
   - Open **[Google AI Studio](https://aistudio.google.com/apikey)** (sign in with your Google account).
   - Click **Create API key** (or use an existing key that is still valid).
   - Copy the key (it starts with `AIza...`).

2. **Put the key in the backend**
   - Open the backend `.env` file: `2. MYCHATBOT BackEnd\.env`
   - Set:
     ```env
     GEMINI_API_KEY=your_new_key_here
     ```
   - Save the file.

3. **Restart the backend**
   - Stop the running `node index.js` (Ctrl+C).
   - Start again:
     ```bash
     cd "2. MYCHATBOT BackEnd"
     node index.js
     ```

4. **Optional: set per user in Dashboard**
   - Users can also set their own API key in **Dashboard → Settings**.
   - If set there, it overrides the server `.env` key for that user.

After this, the bot should work again until the new key expires (Google may require periodic renewal).
