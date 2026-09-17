# Noorzaa — Railway deploy

This repo is **Noorzaa only** (`https://noorzaa.com`). Store data lives on a Railway volume at `/app/data`.

## Service variables

```text
NEXT_PUBLIC_SITE_URL=https://noorzaa.com
FASHION_ADMIN_USERNAME=founder
FASHION_ADMIN_PASSWORD=<your-password>
AUTH_SECRET=<long-random-secret>
DATA_DIR=/app/data
RESEND_API_KEY=
RESEND_FROM_EMAIL=Noorzaa <noreply@noorzaa.com>
```

1. Connect this GitHub repo to Railway (Dockerfile builder).
2. Add a **Volume** → mount path `/app/data`.
3. Custom domain: `noorzaa.com` / `www.noorzaa.com`.
4. Redeploy and check `https://noorzaa.com/api/health`.

Admin: `https://noorzaa.com/store-admin`.

Do not wipe the volume. Product, order, and customer data is stored in `fashion-store.json`.
