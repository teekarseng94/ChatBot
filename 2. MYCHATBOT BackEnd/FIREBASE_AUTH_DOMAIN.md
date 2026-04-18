# Firebase Auth: Login on https://mychatbot.website

For users to log in with **Firebase Authentication** (e.g. teekarseng94@gmail.com) on **https://mychatbot.website**, the domain must be allowed by Firebase.

## Add your portal domain

1. Open [Firebase Console](https://console.firebase.google.com/) → project **chatbot20-21e3a**.
2. Go to **Authentication** → **Settings** (or **Sign-in method** tab) → **Authorized domains**.
3. Click **Add domain** and add:
   - **mychatbot.website**
   - **www.mychatbot.website**
4. Save.

If these domains are not listed, Firebase returns `auth/unauthorized-domain` and login fails (or shows a generic error). After adding them, try logging in again with your Firebase Auth email/password.
