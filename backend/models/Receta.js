const mongoose = require("mongoose");

const recetaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true
  },
  categoria: {
    type: String,
    required: true
  },
  ingredientes: {
    type: String,
    required: true
  },
  pasos: {
    type: String,
    required: true
  },
  tiempoPreparacion: {
    type: Number,
    required: true
  },
  dificultad: {
    type: String,
    required: true
  },

  // ⭐ Promedio (se calcula)
  calificacion: {
    type: Number,
    default: 0
  },

  // ⭐ Lista de calificaciones por usuario
  calificaciones: [
    {
      usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Usuario"
      },
      valor: {
        type: Number,
        min: 1,
        max: 5
      }
    }
  ],

  imagen: {
    type: String,
    default: ""
  }

}, {
  timestamps: true
});

module.exports = mongoose.model("Receta", recetaSchema);