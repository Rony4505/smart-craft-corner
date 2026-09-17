# Noorzaa

Luxury womenswear ecommerce for Bangladesh.

**Live:** https://noorzaa.com

## Admin

- URL: `/store-admin`
- Username: `founder`
- Password: set `FASHION_ADMIN_PASSWORD` (default `rony4505`)

## Local

```bash
npm install
npm run dev
```

## Railway

Set:

- `NEXT_PUBLIC_SITE_URL=https://noorzaa.com`
- `FASHION_ADMIN_PASSWORD=...`
- `AUTH_SECRET=...`
- Volume mount: `/app/data`

Store data lives in `fashion-store.json` on the volume. Do not wipe `/app/data`.
