# JWT authentication testing with Postman

## 1. Configure environment
Create a `.env` file in the project root (same folder as `index.js`) using `.env.example` as a template.
Set `DATABASE_URL` to your MongoDB connection string and set `JWT_SECRET` to a long, random secret.
Do not commit `.env` or share the secret.

## 2. Install and start
```bash
npm install
npm run dev
```
Make sure MongoDB is running and the terminal prints `MongoDB connected` and `Server running at http://localhost:3000`.

## 3. Register
- Method: POST
- URL: `http://localhost:3000/api/auth/register`
- Body -> raw -> JSON:
```json
{
  "name": "Test User",
  "email": "testuser@example.com",
  "password": "StrongPass123"
}
```
Expected: HTTP 201 and JSON containing `success: true` and `token`.

## 4. Login
- Method: POST
- URL: `http://localhost:3000/api/auth/login`
- Body -> raw -> JSON:
```json
{
  "email": "testuser@example.com",
  "password": "StrongPass123"
}
```
Expected: HTTP 200 and JSON containing `success: true` and `token`.

## 5. Use the token
For a protected endpoint, choose Authorization -> Bearer Token in Postman and paste the returned token.
This project currently generates tokens but does not yet include a protected route or JWT verification middleware.

## Common errors
- `ECONNREFUSED`: MongoDB is not running or the connection string/port is wrong.
- `JWT_SECRET is missing`: create `.env` in the project root and set a non-example secret.
- `User already exists`: use a new email or call `/api/auth/login`.
- `Cannot find module './routes/authRoutes'`: ensure the corrected `routes/authRoutes.js` file exists.
