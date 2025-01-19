# Event Go

This is a fullstack app used to organize a public or private event.

- People can register and login and choose a Spot Type (or Ticket Tier).
- There are Admin pages with Tables & CRUD for Users and Spot Types

## Stack

- Frontend: Vite | React | TailwindCSS with some shadcn/ui 
- Backend: Go with Gin & Gorm | Postgres

## Project Setup (Development)

Start the backend (Go Rest API & Postgres):
```sh
docker compose up
```

Run the Frontend:
```sh
cd frontend
npm run dev
```

## To Do

### Before Launch
- ✅ [Frontend] Sidebar coloring on mobile
- ✅ [Frontend] Container width
- ✅ [Frontend] Sidebar & Music on Mobile
- ✅ [Frontend] Component for Users for changing their own info such as `fullName`
- ✅ [Frontend] Changing a users (or your own) password
- ✅ [Frontend] Adding components for Password Reset and Verifying Email 
- [Frontend] Toaster is not working for Account/Email Verification
- [Frontend] Balloons? Easter Eggs? More Info?
- [Frontend] More Songs
- ✅ [Frontend] Restyling Login / Register components
- ✅ [Backend] SMTP Email Sending for Account Verification
- ✅ [DevOps] Reverse Proxy for Production (probably Caddy?)

### Future Features


