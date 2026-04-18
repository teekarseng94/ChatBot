# Cloudflare Tunnel – Re-authenticate on a new machine (e.g. laptop)

**Your Cloudflare Account ID:** `e88aa4b595d46fa75d8c0974243a3792`  
*(Use this in Cloudflare dashboard or API. The **Tunnel ID** is different – you get it in Step 3 below.)*

Use these steps when moving the project to another PC/laptop so the tunnel works there.

---

## Quick checklist (run on your laptop)

| Step | Command / action |
|------|-------------------|
| 1 | Install cloudflared (see below) or run `winget install Cloudflare.cloudflared` |
| 2 | **PowerShell:** `.\cloudflared tunnel login` (or double‑click `tunnel-login.bat`) → pick domain in browser |
| 3 | `cd "2. MYCHATBOT BackEnd"` then `.\cloudflared tunnel create whatsapp-tunnel` → **copy the Tunnel ID** from the output |
| 4 | Create folder: `mkdir .cloudflared` then copy credential: `copy "%USERPROFILE%\.cloudflared\<TUNNEL_ID>.json" ".cloudflared\<TUNNEL_ID>.json"` (replace `<TUNNEL_ID>`) |
| 5 | Edit `config.yml`: set `credentials-file: .cloudflared/<TUNNEL_ID>.json` (same ID as in step 4) |
| 6 | Route DNS: `.\cloudflared tunnel route dns whatsapp-tunnel mychatbot.website` (and same for `www.mychatbot.website`) |
| 7 | Run tunnel: `.\cloudflared tunnel run whatsapp-tunnel` |

---

## 1. Install cloudflared (if needed)

- **Windows:** Download from https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
- Or with winget: `winget install Cloudflare.cloudflared`

## 2. Log in to Cloudflare

**Windows PowerShell:** Use `.\cloudflared` so the command runs from the current folder:

```powershell
cd "2. MYCHATBOT BackEnd"
.\cloudflared tunnel login
```

Or double‑click **`tunnel-login.bat`** in the backend folder (it runs the same command).

This opens a browser; pick your domain (e.g. mychatbot.website). It saves a cert to your user folder (e.g. `C:\Users\YourName\.cloudflared\`).

## 3. Create a new tunnel (for this laptop)

```bash
cd "2. MYCHATBOT BackEnd"
cloudflared tunnel create whatsapp-tunnel
```

If the tunnel name already exists in your account, either use that tunnel’s ID (step 4) or create with a different name, e.g.:

```powershell
.\cloudflared tunnel create whatsapp-tunnel-laptop
```

Then set `tunnel: whatsapp-tunnel-laptop` in `config.yml` and use the new tunnel’s ID below.

## 4. Copy the credential file into the project (relative path)

The command prints something like:

```text
Created tunnel whatsapp-tunnel with id abc12345-def6-7890-abcd-ef1234567890
```

Copy the JSON credential file from your user folder into the backend’s `.cloudflared` folder **and** rename it to match the ID, so the path is relative to the backend:

**Windows (PowerShell):**

```powershell
cd "2. MYCHATBOT BackEnd"
mkdir .cloudflared -ErrorAction SilentlyContinue
copy "$env:USERPROFILE\.cloudflared\<TUNNEL_ID>.json" ".cloudflared\<TUNNEL_ID>.json"
```

Replace `<TUNNEL_ID>` with the actual id (e.g. `abc12345-def6-7890-abcd-ef1234567890`).

**Then** in `config.yml` set:

```yaml
credentials-file: .cloudflared/<TUNNEL_ID>.json
```

(e.g. `credentials-file: .cloudflared/abc12345-def6-7890-abcd-ef1234567890.json`)

## 5. Route DNS (if not already done)

```powershell
.\cloudflared tunnel route dns whatsapp-tunnel mychatbot.website
.\cloudflared tunnel route dns whatsapp-tunnel www.mychatbot.website
```

Use your tunnel name and hostnames as needed.

## 6. Run the tunnel

```powershell
cd "2. MYCHATBOT BackEnd"
.\cloudflared tunnel run whatsapp-tunnel
```

Or run with config file explicitly:

```powershell
.\cloudflared tunnel --config config.yml run whatsapp-tunnel
```

---

**Summary:** `config.yml` uses **relative** paths (`credentials-file: .cloudflared/YOUR_TUNNEL_ID.json`), so the same repo works on any machine once you run `cloudflared tunnel login`, create (or reuse) the tunnel, and copy the credential JSON into `2. MYCHATBOT BackEnd\.cloudflared\`.
