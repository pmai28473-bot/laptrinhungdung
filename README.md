# LHU E-Commerce Backend

REST API for the LHU E-Commerce project, built with Node.js, Express, and MongoDB.

## Setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env`.
3. Set `MONGODB_URI` and a strong `JWT_SECRET` in `.env`.
4. Start the API with `npm run dev`.

To load sample data, set unique `ADMIN_SEED_PASSWORD` and
`CUSTOMER_SEED_PASSWORD` values, then run `npm run seed`. **The seeder deletes
all existing users, products, and categories in the configured database before
creating sample records.** Use it only with a development database.

`EMAIL_USER` and `EMAIL_PASS` are optional and enable Gmail invoice emails.
Never commit `.env`; it is excluded by `.gitignore`.