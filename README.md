# DummyJSON Practice

Small Next.js App Router practice project for Todo and product management.

## Setup

```bash
npm install
Copy-Item .env.example .env.local
npm run dev
```

The API base URL is configured with `NEXT_PUBLIC_API_URL`.

## Validation

```bash
npx tsc --noEmit
npm run lint
npm run build
```

## Routes

- `/` — Todo management
- `/products` — Product list and cart
