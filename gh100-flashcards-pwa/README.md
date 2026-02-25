# GH-100 Flashcards (Phone-friendly PWA)

This is a lightweight Progressive Web App (PWA) generated from **GH-100 GitHub Admin Cert Exam QnA.docx**.

## What it does
- Works in mobile Safari/Chrome.
- Offline-capable (service worker caches the content).
- Flip cards to see the **yellow-highlighted** answer(s).
- Track *I got it* vs *I missed* (stored locally on your device).
- Filter to **Only missed**, Shuffle, and Search.

## Quick start (local)
1. Copy the folder `gh100-flashcards-pwa` to any machine.
2. Serve it with any static web server (examples):
   - Python: `python -m http.server 8080`
   - Node: `npx serve` (if you have Node)
3. Open `http://<your-ip>:8080/gh100-flashcards-pwa/` on your phone (same Wi‑Fi).

## GitHub Pages (recommended)
1. Create a new repo (e.g., `gh100-flashcards`).
2. Upload the contents of this folder to the repo root.
3. In GitHub: **Settings → Pages → Deploy from branch → main / root**.
4. Open the Pages URL on your phone and choose **Add to Home Screen**.

## Data
- `cards.json` contains all parsed questions/options and the yellow-highlighted answers.

Generated automatically.
