# CORS Verification for GitHub Pages

## Status: PENDING (Awaiting Task 1.7 Deployment)

This document tracks the CORS verification for GitHub Pages serving design JSON files.

## Expected Behavior

GitHub Pages should serve static files with CORS headers enabled by default. When files are served from `https://luongnv89.github.io/sleek-ui/`, the response should include:

```
Access-Control-Allow-Origin: *
```

## Verification Commands

Once Task 1.7 (CI/CD) is complete, verify CORS with:

```bash
# Test from command line (shows all headers)
curl -sI -H "Origin: https://example.com" "https://luongnv89.github.io/sleek-ui/designs/editorial-dark.json"

# Or check specific header
curl -sI "https://luongnv89.github.io/sleek-ui/designs/editorial-dark.json" | grep -i "access-control"
```

## Browser Console Test

Once deployed, run in browser console:

```javascript
fetch('https://luongnv89.github.io/sleek-ui/designs/editorial-dark.json')
  .then(r => r.json())
  .then(console.log)
```

Expected: JSON response with no CORS errors.

## Current State

| Check | Status |
|-------|--------|
| GitHub Pages deployed | ❌ No (404 on all paths) |
| CI/CD workflow exists | ❌ Task 1.7 pending |
| Design JSON in dist/ | ✅ public/designs/editorial-dark.json exists |

## Fallback Plan

If GitHub Pages CORS verification fails, migrate to **Cloudflare Pages**:

1. Connect repository to Cloudflare Pages
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Custom domain: `https://sleek-ui.design`

**Zero code changes required** — just update the deployment target.

## Notes

- GitHub Pages serves from the `gh-pages` branch (or `/docs` folder)
- CORS is enabled by default for all static files
- Custom domains on GitHub Pages also support CORS
- Cloudflare Pages is an alternative with no configuration needed
