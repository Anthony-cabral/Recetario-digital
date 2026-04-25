const BASE_URL = window.location.origin;
const API_URL = `${BASE_URL}/api/recetas`;

let token = localStorage.getItem("token");
let rol = localStorage.getItem("rol");
let modoLogin = true;

const formReceta = document.getElementById("formReceta");
const listaRecetas = document.getElementById("listaRecetas");
const totalRecetas = document.getElementById("totalRecetas");
const promedioCalificacion = document.getElementById("promedioCalificacion");
const promedioTiempo = document.getElementById("promedioTiempo");
const buscar = document.getElementById("buscar");
const filtroCategoria = document.getElementById("filtroCategoria");
const filtroDificultad = document.getElementById("filtroDificultad");
const btnCancelar = document.getElementById("btnCancelar");
const tituloFormulario = document.getElementById("tituloFormulario");

const modalDetalle = document.getElementById("modalDetalle");
const detalleReceta = document.getElementById("detalleReceta");
const cerrarModal = document.getElementById("cerrarModal");

const modalAuth = document.getElementById("modalAuth");
const formAuth = document.getElementById("formAuth");
const tituloAuth = document.getElementById("tituloAuth");
const nombreAuth = document.getElementById("nombreAuth");
const emailAuth = document.getElementById("emailAuth");
const passwordAuth = document.getElementById("passwordAuth");
const cambiarModo = document.getElementById("cambiarModo");
const btnLogin = document.getElementById("btnLogin");
const btnLogout = document.getElementById("btnLogout");

let recetas = [];

// Mensaje bonito
function mostrarMensaje(texto, tipo = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${tipo}`;
  toast.textContent = texto;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Modal de confirmación
function abrirConfirmacion(titulo, mensaje, accionConfirmar) {
  detalleReceta.innerHTML = `
    <div class="confirm-box">
      <h2>${titulo}</h2>
      <p>${mensaje}</p>

      <div class="confirm-acciones">
        <button class="btn-cancelar" onclick="cerrarDetalle()">Cancelar</button>
        <button class="btn-confirmar" id="btnConfirmarAccion">Confirmar</button>
      </div>
    </div>
  `;

  modalDetalle.classList.remove("oculto");

  document.getElementById("btnConfirmarAccion").addEventListener("click", accionConfirmar);
}

// Cerrar modal detalle
function cerrarDetalle() {
  modalDetalle.classList.add("oculto");
}

// Validar vista por rol
function controlarVistaPorRol() {
  const admin = document.getElementById("admin");
  const linkAdmin = document.getElementById("linkAdmin");

  if (rol === "admin") {
    admin.classList.remove("oculto");
    linkAdmin.classList.remove("oculto");
  } else {
    admin.classList.add("oculto");
    linkAdmin.classList.add("oculto");
  }

  if (token) {
    btnLogin.classList.add("oculto");
    btnLogout.classList.remove("oculto");
  } else {
    btnLogin.classList.remove("oculto");
    btnLogout.classList.add("oculto");
  }
}

// Cargar recetas
async function cargarRecetas() {
  try {
    const res = await fetch(API_URL);
    recetas = await res.json();

    mostrarRecetas(recetas);
    actualizarIndicadores();
  } catch (error) {
    mostrarMensaje("No se pudieron cargar las recetas", "error");
    console.error(error);
  }
}

// Mostrar recetas
function mostrarRecetas(lista) {
  listaRecetas.innerHTML = "";

  if (lista.length === 0) {
    listaRecetas.innerHTML = `<p class="mensaje">Sin resultados</p>`;
    return;
  }

  lista.forEach((r) => {
    const imagen = r.imagen || null;

    const card = document.createElement("div");
    card.classList.add("receta-card");

    card.innerHTML = `
      ${imagen ? `<img src="${imagen}" alt="${r.nombre}">` : `<div class="sin-imagen">Sin imagen</div>`}

      <div class="receta-info">
        <h3>${r.nombre}</h3>

        <div class="estrellas">${crearEstrellas(r.calificacion || 0)}</div>

        <div class="receta-meta">
          <span>⏱ ${r.tiempoPreparacion} min</span>
          <span>🍽 ${r.categoria}</span>
          <span>📌 ${r.dificultad}</span>
        </div>

        <div class="acciones">
          <button class="btn-ver" onclick="verDetalle('${r._id}')">Ver</button>

          ${
            token
              ? `<button class="btn-editar" onclick="abrirCalificacion('${r._id}')">Calificar</button>`
              : `<button class="btn-editar" onclick="abrirAuth()">Calificar</button>`
          }

          ${
            rol === "admin"
              ? `
                <button class="btn-editar" onclick="editarReceta('${r._id}')">Editar</button>
                <button class="btn-eliminar" onclick="eliminarReceta('${r._id}')">Eliminar</button>
              `
              : ""
          }
        </div>
      </div>
    `;

    listaRecetas.appendChild(card);
  });
}

// Estrellas
function crearEstrellas(valor = 0) {
  let estrellas = "";
  const numero = Math.round(Number(valor) || 0);

  for (let i = 1; i <= 5; i++) {
    estrellas += i <= numero ? "★" : "☆";
  }

  return estrellas;
}

// Indicadores
function actualizarIndicadores() {
  totalRecetas.textContent = recetas.length;

  if (recetas.length === 0) {
    promedioCalificacion.textContent = "0";
    promedioTiempo.textContent = "0 min";
    return;
  }

  const sumaCal = recetas.reduce((a, r) => a + Number(r.calificacion || 0), 0);
  const sumaTiempo = recetas.reduce((a, r) => a + Number(r.tiempoPreparacion || 0), 0);

  promedioCalificacion.textContent = (sumaCal / recetas.length).toFixed(1);
  promedioTiempo.textContent = Math.round(sumaTiempo / recetas.length) + " min";
}

// Guardar / actualizar receta admin
formReceta.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (rol !== "admin") {
    mostrarMensaje("No tienes permiso para realizar esta acción.", "error");
    return;
  }

  const id = document.getElementById("recetaId").value;

  const formData = new FormData();

  formData.append("nombre", document.getElementById("nombre").value.trim());
  formData.append("categoria", document.getElementById("categoria").value);
  formData.append("ingredientes", document.getElementById("ingredientes").value.trim());
  formData.append("pasos", document.getElementById("pasos").value.trim());
  formData.append("tiempoPreparacion", document.getElementById("tiempoPreparacion").value);
  formData.append("dificultad", document.getElementById("dificultad").value);

  const file = document.getElementById("imagen").files[0];

  if (file) {
    formData.append("imagen", file);
  }

  const url = id ? `${API_URL}/${id}` : API_URL;
  const method = id ? "PUT" : "POST";

  try {
    const respuesta = await fetch(url, {
      method: method,
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      mostrarMensaje(data.error || "Ocurrió un error", "error");
      return;
    }

    mostrarMensaje(id ? "Receta actualizada correctamente" : "Receta guardada correctamente");

    limpiarFormulario();
    await cargarRecetas();
  } catch (error) {
    mostrarMensaje("No se pudo guardar la receta", "error");
    console.error(error);
  }
});

// Editar receta admin
function editarReceta(id) {
  if (rol !== "admin") {
    mostrarMensaje("Solo el admin puede editar recetas.", "error");
    return;
  }

  abrirConfirmacion(
    "Editar receta",
    "¿Deseas editar esta receta?",
    () => {
      const r = recetas.find((x) => x._id === id);

      if (!r) {
        mostrarMensaje("No se encontró la receta", "error");
        return;
      }

      document.getElementById("recetaId").value = r._id;
      document.getElementById("nombre").value = r.nombre || "";
      document.getElementById("categoria").value = r.categoria || "";
      document.getElementById("ingredientes").value = r.ingredientes || "";
      document.getElementById("pasos").value = r.pasos || "";
      document.getElementById("tiempoPreparacion").value = r.tiempoPreparacion || "";
      document.getElementById("dificultad").value = r.dificultad || "";

      tituloFormulario.textContent = "Editar receta";
      btnCancelar.classList.remove("oculto");

      cerrarDetalle();
      document.getElementById("admin").scrollIntoView({ behavior: "smooth" });
    }
  );
}

// Eliminar receta admin
async function eliminarReceta(id) {
  if (rol !== "admin") {
    mostrarMensaje("Solo el admin puede eliminar recetas.", "error");
    return;
  }

  abrirConfirmacion(
    "Eliminar receta",
    "¿Estás seguro de que deseas eliminar esta receta? Esta acción no se puede deshacer.",
    async () => {
      try {
        const respuesta = await fetch(`${API_URL}/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await respuesta.json();

        if (!respuesta.ok) {
          mostrarMensaje(data.error || "No se pudo eliminar", "error");
          return;
        }

        cerrarDetalle();
        mostrarMensaje("Receta eliminada correctamente");
        await cargarRecetas();
      } catch (error) {
        mostrarMensaje("No se pudo eliminar la receta", "error");
        console.error(error);
      }
    }
  );
}

// Ver detalle
function verDetalle(id) {
  const r = recetas.find((x) => x._id === id);

  if (!r) {
    mostrarMensaje("No se encontró la receta", "error");
    return;
  }

  const imagen = r.imagen || null;

  detalleReceta.innerHTML = `
    <div class="detalle">
      ${imagen ? `<img class="detalle-img" src="${imagen}" alt="${r.nombre}">` : ""}
      <h2>${r.nombre}</h2>
      <div class="estrellas">${crearEstrellas(r.calificacion || 0)}</div>
      <p><strong>Categoría:</strong> ${r.categoria}</p>
      <p><strong>Dificultad:</strong> ${r.dificultad}</p>
      <p><strong>Tiempo:</strong> ${r.tiempoPreparacion} min</p>
      <p><strong>Ingredientes:</strong> ${r.ingredientes}</p>
      <p><strong>Pasos:</strong> ${r.pasos}</p>

      <div class="acciones">
        ${
          token
            ? `<button class="btn-editar" onclick="abrirCalificacion('${r._id}')">Calificar receta</button>`
            : `<button class="btn-editar" onclick="abrirAuth()">Iniciar sesión para calificar</button>`
        }
      </div>
    </div>
  `;

  modalDetalle.classList.remove("oculto");
}

// Abrir calificación con estrellas
function abrirCalificacion(id) {
  const r = recetas.find((x) => x._id === id);

  if (!r) {
    mostrarMensaje("No se encontró la receta", "error");
    return;
  }

  detalleReceta.innerHTML = `
    <div class="modal-rating">
      <h2>Calificar receta</h2>
      <p><strong>${r.nombre}</strong></p>
      <p>Selecciona una calificación:</p>

      <div class="rating-estrellas">
        <button onclick="calificarReceta('${id}', 1)">★</button>
        <button onclick="calificarReceta('${id}', 2)">★</button>
        <button onclick="calificarReceta('${id}', 3)">★</button>
        <button onclick="calificarReceta('${id}', 4)">★</button>
        <button onclick="calificarReceta('${id}', 5)">★</button>
      </div>
    </div>
  `;

  modalDetalle.classList.remove("oculto");
}

// Calificar receta
async function calificarReceta(id, valor) {
  if (!token) {
    abrirAuth();
    return;
  }

  if (valor < 1 || valor > 5) {
    mostrarMensaje("La calificación debe ser entre 1 y 5.", "error");
    return;
  }

  try {
    const respuesta = await fetch(`${API_URL}/${id}/calificar`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        calificacion: valor
      })
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      mostrarMensaje(data.error || "No se pudo calificar", "error");
      return;
    }

    mostrarMensaje("Calificación guardada correctamente");

    modalDetalle.classList.add("oculto");
    await cargarRecetas();
  } catch (error) {
    mostrarMensaje("No se pudo guardar la calificación", "error");
    console.error(error);
  }
}

// Abrir login
function abrirAuth() {
  modalAuth.classList.remove("oculto");
}

// Cerrar login
function cerrarAuth() {
  modalAuth.classList.add("oculto");
}

// Cerrar modal haciendo click fuera
modalAuth.addEventListener("click", (e) => {
  if (e.target === modalAuth) {
    cerrarAuth();
  }
});

// Cambiar entre login y registro
cambiarModo.addEventListener("click", () => {
  modoLogin = !modoLogin;

  tituloAuth.textContent = modoLogin ? "Iniciar sesión" : "Registrarse";
  nombreAuth.classList.toggle("oculto");

  cambiarModo.innerHTML = modoLogin
    ? '¿No tienes cuenta? <span>Regístrate</span>'
    : '¿Ya tienes cuenta? <span>Inicia sesión</span>';
});

// Login / registro
formAuth.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = emailAuth.value.trim();
  const password = passwordAuth.value.trim();
  const nombre = nombreAuth.value.trim();

  const url = modoLogin
    ? `${BASE_URL}/api/auth/login`
    : `${BASE_URL}/api/auth/registro`;

  const body = modoLogin
    ? { email, password }
    : { nombre, email, password };

  try {
    const respuesta = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    let data;

    try {
      data = await respuesta.json();
    } catch {
      mostrarMensaje("Error del servidor. No se recibió una respuesta válida.", "error");
      return;
    }

    if (!respuesta.ok) {
      mostrarMensaje(data.error || "No se pudo registrar o iniciar sesión. Verifique los datos.", "error");
      return;
    }

    if (modoLogin) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("rol", data.rol);

      token = data.token;
      rol = data.rol;

      cerrarAuth();
      controlarVistaPorRol();
      mostrarRecetas(recetas);

      mostrarMensaje("Sesión iniciada correctamente");
    } else {
      mostrarMensaje("Usuario creado correctamente. Ahora inicia sesión.");

      modoLogin = true;
      tituloAuth.textContent = "Iniciar sesión";
      nombreAuth.classList.add("oculto");
      cambiarModo.innerHTML = '¿No tienes cuenta? <span>Regístrate</span>';

      formAuth.reset();
    }
  } catch (error) {
    mostrarMensaje("No se pudo conectar con el servidor. Verifique que el backend esté encendido.", "error");
    console.error(error);
  }
});

// Cerrar sesión
function cerrarSesion() {
  localStorage.removeItem("token");
  localStorage.removeItem("rol");

  token = null;
  rol = null;

  controlarVistaPorRol();
  mostrarRecetas(recetas);

  mostrarMensaje("Sesión cerrada correctamente", "info");
}

// Cerrar modal detalle
cerrarModal.addEventListener("click", () => {
  modalDetalle.classList.add("oculto");
});

// Limpiar form
function limpiarFormulario() {
  formReceta.reset();
  document.getElementById("recetaId").value = "";
  tituloFormulario.textContent = "Agregar receta";
  btnCancelar.classList.add("oculto");
}

// Filtros
function filtrarRecetas() {
  const texto = buscar.value.toLowerCase();
  const cat = filtroCategoria.value;
  const dif = filtroDificultad.value;

  const filtradas = recetas.filter((r) => {
    const coincideNombre = r.nombre.toLowerCase().includes(texto);
    const coincideCategoria = cat === "" || r.categoria === cat;
    const coincideDificultad = dif === "" || r.dificultad === dif;

    return coincideNombre && coincideCategoria && coincideDificultad;
  });

  mostrarRecetas(filtradas);
}

// Filtrar por categoría desde los botones
function filtrarPorCategoria(categoria) {
  filtroCategoria.value = categoria;
  filtrarRecetas();
}

// Eventos
btnCancelar.addEventListener("click", limpiarFormulario);
buscar.addEventListener("input", filtrarRecetas);
filtroCategoria.addEventListener("change", filtrarRecetas);
filtroDificultad.addEventListener("change", filtrarRecetas);

// Inicio
controlarVistaPorRol();
cargarRecetas();