# ShopEasy frontend

## Run locally

Start the backend first, then in PowerShell:

```powershell
Set-Location C:\Users\prasa\Downloads\shopeasy\shopeasy-frontend
npm install
npm run dev
```

Open the Vite URL (normally `http://localhost:5173`). The frontend calls
`http://localhost:8080/api` by default. To use another backend URL, set
`VITE_API_BASE_URL` before starting Vite.

## Shop and order flows

- Browse products from `GET /api/products`; search, category filters, and price
  sorting are applied in the UI.
- Add items to the persistent browser cart, then proceed to checkout.
- Log in or create an account to place a COD order and see your order history.
- JWTs are sent in the `Authorization: Bearer` header by the Axios client.
- Online payment is not available until a payment gateway is integrated.

Run `npm run lint` and `npm run build` to validate the frontend.
