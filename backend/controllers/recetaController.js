const Receta = require("../models/Receta");

// Crear
exports.crearReceta = async (req, res) => {
  try {
    const {
      nombre,
      categoria,
      ingredientes,
      pasos,
      tiempoPreparacion,
      dificultad
    } = req.body;

    if (
      !nombre ||
      !categoria ||
      !ingredientes ||
      !pasos ||
      !tiempoPreparacion ||
      !dificultad
    ) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    const nueva = new Receta({
      nombre,
      categoria,
      ingredientes,
      pasos,
      tiempoPreparacion,
      dificultad,
      calificacion: 0,
      calificaciones: [],
      imagen: req.file ? req.file.path : ""
    });

    const guardada = await nueva.save();

    res.status(201).json(guardada);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Leer todas
exports.obtenerRecetas = async (req, res) => {
  try {
    const recetas = await Receta.find().sort({ createdAt: -1 });
    res.json(recetas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Leer una
exports.obtenerReceta = async (req, res) => {
  try {
    const receta = await Receta.findById(req.params.id);

    if (!receta) {
      return res.status(404).json({ error: "Receta no encontrada" });
    }

    res.json(receta);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar
exports.actualizarReceta = async (req, res) => {
  try {
    const {
      nombre,
      categoria,
      ingredientes,
      pasos,
      tiempoPreparacion,
      dificultad
    } = req.body;

    const datosActualizados = {
      nombre,
      categoria,
      ingredientes,
      pasos,
      tiempoPreparacion,
      dificultad
    };

    if (req.file) {
      datosActualizados.imagen = req.file.path;
    }

    const recetaActualizada = await Receta.findByIdAndUpdate(
      req.params.id,
      datosActualizados,
      {
        returnDocument: "after",
        runValidators: true
      }
    );

    if (!recetaActualizada) {
      return res.status(404).json({ error: "Receta no encontrada" });
    }

    res.json(recetaActualizada);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Calificar
exports.calificarReceta = async (req, res) => {
  try {
    const { calificacion } = req.body;

    if (!req.usuario || !req.usuario.id) {
      return res.status(401).json({ error: "Debe iniciar sesión para calificar" });
    }

    const usuarioId = req.usuario.id;
    const valor = Number(calificacion);

    if (!valor || valor < 1 || valor > 5) {
      return res.status(400).json({ error: "La calificación debe estar entre 1 y 5" });
    }

    const receta = await Receta.findById(req.params.id);

    if (!receta) {
      return res.status(404).json({ error: "Receta no encontrada" });
    }

    if (!receta.calificaciones) {
      receta.calificaciones = [];
    }

    const calificacionExistente = receta.calificaciones.find(
      (item) => item.usuario && item.usuario.toString() === usuarioId
    );

    if (calificacionExistente) {
      calificacionExistente.valor = valor;
    } else {
      receta.calificaciones.push({
        usuario: usuarioId,
        valor: valor
      });
    }

    const suma = receta.calificaciones.reduce((total, item) => {
      return total + Number(item.valor || 0);
    }, 0);

    receta.calificacion = suma / receta.calificaciones.length;

    await receta.save();

    res.json({
      mensaje: "Calificación guardada correctamente",
      receta: receta
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar
exports.eliminarReceta = async (req, res) => {
  try {
    const eliminada = await Receta.findByIdAndDelete(req.params.id);

    if (!eliminada) {
      return res.status(404).json({ error: "Receta no encontrada" });
    }

    res.json({ mensaje: "Receta eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};