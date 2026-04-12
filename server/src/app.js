import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route.js";
import clientRoutes from "./routes/client.route.js";


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
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use((err, req, res, next) => {
  if (err?.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "CORS policy does not allow this origin",
    });
  }

  const isProduction = process.env.NODE_ENV === "production";
  return res.status(err?.statusCode || 500).json({
    success: false,
    message: err?.message || "Internal server error",
    ...(isProduction ? {} : { error: err?.stack || String(err) }),
  });
});

export default app;