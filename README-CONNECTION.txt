MyTube frontend connection notes

The frontend now targets:
https://my-youtube-vedio-download.vercel.app

Required backend routes (same domain):
- POST /api/analyze
  JSON body: {"videoId":"11-character-video-id"}
  Expected JSON: {"success":true,"title":"...","thumbnail":"..."}

- POST /api/download
  JSON body: {"videoId":"...","format":"720|1080|480|audio"}
  Expected JSON: {"success":true,"downloadUrl":"https://..."}

Important:
The uploaded ZIP contained only index.html, script.js, style.css and an empty vercel.json.
It did not contain backend/serverless function code. Therefore this frontend configuration
alone cannot create the API routes. Deploy the backend functions at the same Vercel project
(or update API_BASE to the actual backend host) before expecting Analyze/Download to work.
Only download videos/files you own or are authorized to download, and respect the source
platform's terms and technical restrictions.
