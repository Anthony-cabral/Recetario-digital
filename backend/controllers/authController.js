const Usuario = require("../models/Usuario");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Registro
exports.registro = async (req, res) => {
  const { nombre, email, password } = req.body;

  const hash = await bcrypt.hash(password, 10);

  const usuario = new Usuario({
    nombre,
    email,
    password: hash
  });

  await usuario.save();

  res.json({ mensaje: "Usuario creado" });
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  const usuario = await Usuario.findOne({ email });

  if (!usuario) return res.status(400).json({ error: "No existe" });

  const valido = await bcrypt.compare(password, usuario.password);

  if (!valido) return res.status(400).json({ error: "Contraseña incorrecta" });

 const token = jwt.sign(
  {
    id: usuario._id,
    rol: usuario.rol
  },
  process.env.JWT_SECRET || "secreto",
  { expiresIn: "1d" }
);
  res.json({ token, rol: usuario.rol });
};