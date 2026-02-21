<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/12sEW5dQbllr2mtEp3gahUyWO0hMik_3r

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Run On A VPS (Docker)

This repo now includes a production Docker setup (`Dockerfile` + `nginx.conf`) that serves the built app with Nginx.

1. SSH into your VPS and clone/upload this project.
2. Build the image with your Gemini key:
   `docker build --build-arg GEMINI_API_KEY=YOUR_REAL_KEY -t pawcrm-pro .`
3. Run the container:
   `docker run -d --name pawcrm-pro -p 80:80 --restart unless-stopped pawcrm-pro`
4. Open your VPS IP/domain in a browser.

Notes:
- `GEMINI_API_KEY` is injected at build time.
- If you use a domain, point DNS to your VPS and add HTTPS via a reverse proxy (for example, Caddy or Nginx + Certbot).
