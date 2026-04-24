const jwt = require("jsonwebtoken");

// Verifica login
exports.verificarToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) return res.status(401).json({ error: "Sin token" });

  try {
    const data = jwt.verify(token, "secreto");
    req.usuario = data;
    next();
  } catch {
    res.status(401).json({ error: "Token inválido" });
  }
};

// Solo admin
exports.soloAdmin = (req, res, next) => {
  if (req.usuario.rol !== "admin") {
    return res.status(403).json({ error: "Solo admin" });
  }
  next();
};