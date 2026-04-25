const express = require("express");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const router = express.Router();
const controller = require("../controllers/recetaController");
const { verificarToken } = require("../middlewares/authMiddleware");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "recetas",
    allowed_formats: ["jpg", "png", "jpeg", "webp"]
  }
});

const upload = multer({ storage });

router.get("/", controller.obtenerRecetas);
router.get("/:id", controller.obtenerReceta);
router.post("/", upload.single("imagen"), controller.crearReceta);
router.put("/:id", upload.single("imagen"), controller.actualizarReceta);
router.delete("/:id", controller.eliminarReceta);
router.put("/:id/calificar", verificarToken, controller.calificarReceta);

module.exports = router;