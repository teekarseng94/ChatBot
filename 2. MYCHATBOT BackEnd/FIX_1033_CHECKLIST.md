# Fix Error 1033 – mychatbot.website not loading

Error 1033 means Cloudflare cannot reach your laptop. **All three** must be true:

---

## 1. Credential file exists

The file must be present:

- **Path:** `2. MYCHATBOT BackEnd\.cloudflared\575a256f-e335-468d-98ef-41e84dd02465.json`

If it’s missing, copy it from your old PC (from that PC’s `C:\Users\<User>\.cloudflared\` folder) into the above path, or create a new tunnel (see CLOUDFLARE_TUNNEL_COMMANDS.md).

---

## 2. Backend is running on this laptop

The tunnel sends traffic to **http://localhost:3000**. If the backend isn’t running, you get 1033 or connection errors.

**In a PowerShell window (leave it open):**

```powershell
cd "C:\Users\Acer\Desktop\MYCHATBOT\2. MYCHATBOT BackEnd"
npm start
```

You should see “WhatsApp Bot Server running on port 3000”. Leave this window open.

---

## 3. Cloudflared tunnel is running on this laptop

**In a second PowerShell window (leave it open):**

```powershell
cd "C:\Users\Acer\Desktop\MYCHATBOT\2. MYCHATBOT BackEnd"
.\cloudflared tunnel run whatsapp-tunnel
```

Or double‑click **`tunnel-run.bat`** in the backend folder.

You should see “Connection established” or “Registered tunnel connection”. Leave this window open.

---

## Summary

| What              | Where / command |
|-------------------|------------------|
| Credential file   | `.cloudflared\575a256f-e335-468d-98ef-41e84dd02465.json` in backend folder |
| Backend           | `npm start` in backend folder (port 3000) – **Window 1** |
| Tunnel            | `.\cloudflared tunnel run whatsapp-tunnel` in backend folder – **Window 2** |

If the laptop sleeps or you close either window, the site will show Error 1033 again. Start both again (backend first, then tunnel).
