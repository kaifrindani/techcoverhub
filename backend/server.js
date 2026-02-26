const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");

const app = express();

/* ================= MIDDLEWARE ================= */

app.use(express.json());
app.use(cookieParser());

/* ================= STATIC FILES (IMAGES) ================= */
// 🔥 This is what was missing
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ================= CORS ================= */

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://YOUR-REAL-VERCEL-URL.vercel.app"] // 🔥 change later when deployed
        : "http://localhost:5173",
    credentials: true,
  })
);

/* ================= ROUTES ================= */

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

/* ================= DB ================= */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

/* ================= SERVER ================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});