# Park List

A lightweight Disneyland and Disney California Adventure ride checklist. Ride data and the shared completed-ride checklist are stored in Supabase so selections persist across devices.

Current version: **1.3.4**

## Run locally

Because the app uses JavaScript modules, serve the directory over HTTP rather than opening `index.html` directly. For example:

```bash
npx serve .
```

Then open the local URL shown in the terminal.

## Test

```bash
npm test
```

## Publish with GitHub Pages

Push these files to a GitHub repository, then open **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, select the main branch and the root folder, and save.

The Supabase publishable key in `app.js` is designed for browser use. Database access is restricted by grants and Row Level Security. The ride catalog is read-only; the shared checklist allows public read, insert, and delete access so it can sync without user accounts.
