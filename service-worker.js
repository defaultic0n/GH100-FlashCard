# GH100-FlashCard (Complete)

This folder is a complete static PWA you can upload to your GitHub Pages repo root.

Included features:
- Flashcard mode + Quiz mode
- Shuffle questions
- Shuffle answers (re-shuffles on every navigation)
- Bottom navigation (Flip/Submit + Prev/Next above I got it/I missed)
- Update banner (prompts refresh when a new version is deployed)

## Deploy
1. Upload all files in this folder to repo root.
2. Settings → Pages → Deploy from branch (main) / root.

## Update reliably
- When you deploy a new version, change CACHE_NAME in service-worker.js (e.g. v2, v3) and commit.
