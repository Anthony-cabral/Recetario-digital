require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");

// Crear app
const app = express();

// Conectar DB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Servir imágenes (esto puedes dejarlo aunque uses Cloudinary)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Rutas
const recetaRoutes = require("./routes/recetaRoutes");
const authRoutes = require("./routes/authRoutes");

app.use("/api/recetas", recetaRoutes);
app.use("/api/auth", authRoutes);

// Frontend
app.use(express.static(path.join(__dirname, "../frontend/public")));

app.get("/", (req, res) => {
  res.send("Servidor funcionando");
});

// Puerto
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en: http://localhost:${PORT}`);
});