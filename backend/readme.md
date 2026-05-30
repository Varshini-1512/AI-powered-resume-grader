# Resume Grader Backend

Express backend for the Resume Grader MERN application. It handles authentication, resume uploads, PDF parsing, ATS scoring, AI-powered resume improvement suggestions, resume history, and resume file preview.

## Tech Stack

- Node.js
- Express 5
- MongoDB with Mongoose
- JSON Web Tokens
- bcryptjs
- Multer
- Cloudinary
- OpenAI
- pdf-parse / pdfjs-dist
- dotenv

## Getting Started

Install dependencies:

```bash
npm install
```

Create a `.env` file in the backend folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Start the server:

```bash
node server.js
```

For development with automatic restarts, you can run:

```bash
npx nodemon server.js
```

The API runs on:

```text
http://localhost:5000
```

## Available Script

```bash
npm test
```

Currently this is a placeholder script and does not run automated tests.

## Project Structure

```text
config/          Database and Cloudinary configuration
controllers/     Request handlers for auth and resume features
middleware/      Authentication and upload middleware
models/          Mongoose models
routes/          Express route definitions
services/        AI, ATS scoring, and resume parsing services
uploads/         Local upload workspace
app.js           Express app setup
server.js        Environment loading, DB connection, and server start
```

## API Routes

### Auth

```text
POST /api/auth/register
POST /api/auth/login
PUT  /api/auth/update-profile
PUT  /api/auth/change-password
```

The profile and password routes require a bearer token.

### Resume

```text
POST /api/resume/upload
GET  /api/resume/my-resumes
GET  /api/resume/file/:id
GET  /api/resume/:id
```

Upload, history, and resume detail routes require authentication. Resume upload expects a multipart form field named `resume`.

## Environment Variables

- `PORT`: Server port, usually `5000`.
- `MONGO_URI`: MongoDB connection string.
- `JWT_SECRET`: Secret used to sign and verify authentication tokens.
- `OPENAI_API_KEY`: Enables AI resume enhancement and ATS scoring support.
- `CLOUDINARY_CLOUD_NAME`: Cloudinary account name.
- `CLOUDINARY_API_KEY`: Cloudinary API key.
- `CLOUDINARY_API_SECRET`: Cloudinary API secret.

Cloudinary credentials are validated during startup. If they are missing, the server can still load, but Cloudinary upload features will fail until the values are configured.

## CORS

The backend currently allows requests from:

```text
http://localhost:5173
```

If the frontend runs on a different URL, update the CORS `origin` in `app.js`.

## Authentication

Protected routes expect this header:

```text
Authorization: Bearer <token>
```

The frontend stores the token in local storage and attaches it automatically through the Axios interceptor.
