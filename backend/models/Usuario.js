const mongoose = require("mongoose");

const usuarioSchema = new mongoose.Schema({
  nombre: String,
  email: { type: String, unique: true },
  password: String,
  rol: {
    type: String,
    enum: ["usuario", "admin"],
    default: "usuario"
  }
});

module.exports = mongoose.model("Usuario", usuarioSchema);