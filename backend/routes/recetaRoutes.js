const express = require("express");
const multer = require("multer");
const path = require("path");

const router = express.Router();
const controller = require("../controllers/recetaController");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const nombreArchivo = Date.now() + path.extname(file.originalname);
    cb(null, nombreArchivo);
  }
});

const upload = multer({ storage });

router.get("/", controller.obtenerRecetas);
router.get("/:id", controller.obtenerReceta);
router.post("/", upload.single("imagen"), controller.crearReceta);
router.put("/:id", upload.single("imagen"), controller.actualizarReceta);
router.delete("/:id", controller.eliminarReceta);

module.exports = router;