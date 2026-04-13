import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route.js";
import clientRoutes from "./routes/client.route.js";
import {
  sendBadRequestError,
  sendUnauthorizedError,
  sendForbiddenError,
  sendNotFoundError,
  sendConflictError,
  sendServerError,
} from "./utils/sendError.js";


const app = express();

const allowedOrigins = (process.env.CLIENT_URLS || process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(express.json());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/clients", clientRoutes);


app.get("/", (req, res) => {
  res.send("Hello from server!");
});

app.use((req, res) => {
  return sendNotFoundError(res, "Route not found");
});

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err?.message === "Not allowed by CORS") {
    return sendForbiddenError(res, "CORS policy does not allow this origin");
  }

  if (err?.statusCode === 400) {
    return sendBadRequestError(res, err?.message || "Bad request");
  }

  if (err?.statusCode === 401) {
    return sendUnauthorizedError(res, err?.message || "Unauthorized");
  }

  if (err?.statusCode === 403) {
    return sendForbiddenError(res, err?.message || "Forbidden");
  }

  if (err?.statusCode === 404) {
    return sendNotFoundError(res, err?.message || "Not found");
  }

  if (err?.statusCode === 409) {
    return sendConflictError(res, err?.message || "Conflict");
  }

  return sendServerError(res, "App error handler", err, err?.message || "Internal server error");
});
export default app;