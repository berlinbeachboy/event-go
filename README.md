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

## To To

### Before Launch
- [Frontend] Sidebar coloring on mobile
- [Frontend] Container width
- [Frontend] Component for Users for changing their own info such as `fullName`
- [Frontend] Changing a users (or your own) password
- [Backend] SMTP Email Sending for Account Verification
- [DevOps] Reverse Proxy for Production (probably Caddy?)
- [DevOps] Dockerize Frontend for Production

### Future Features


