document.addEventListener("DOMContentLoaded", async function () {
  // Verificar autenticación
  const token = sessionStorage.getItem("token");
  if (!token) {
    alert("Debes iniciar sesión primero");
    window.location.href = "../../views/login.html";
    return;
  }

  // Extraer información del usuario del token
  let currentUser;
  try {
    const payloadBase64 = token.split(".")[1];
    const payloadJson = atob(
      payloadBase64.replace(/-/g, "+").replace(/_/g, "/")
    );
    currentUser = JSON.parse(payloadJson);
  } catch (e) {
    console.error("Error decodificando token:", e);
    alert("Sesión inválida");
    window.location.href = "../../views/login.html";
    return;
  }

  // Verificar rol de admin
  if (currentUser.role !== "admin") {
    alert("No tienes permisos para acceder a esta página");
    window.location.href = "../../views/index.html";
    return;
  }

  const isRootAdmin = currentUser.root === 1;

  // Elementos del DOM
  const form = document.getElementById("accountForm");
  const usernameInput = document.querySelector('input[type="text"]');
  const passwordInput = document.querySelector('input[type="password"]');
  const roleSelect = document.getElementById("accountType");
  const table = document.getElementById("data-table");
  const tbody = table.querySelector("tbody");
  const toggleFormBtn = document.getElementById("toggleFormBtn");
  const formContainer = document.getElementById("formContainer");

  const itemsPorPagina = 5; // Puedes ajustar este número
let paginaActualCuentas = 1;
let todosCuentas = [];


  // Configurar select de roles según permisos
  roleSelect.innerHTML = `
        <option value="" disabled selected>Tipo de Cuenta</option>
        <option value="user">Secretario</option>
        ${isRootAdmin ? '<option value="admin">Administrador</option>' : ""}
    `;

  // Función para mostrar modal de edición
  async function showEditModal(account, isRootAdmin) {
    const modal = document.createElement("div");
    modal.className = "modal-overlay";
    modal.innerHTML = `
            <div class="modal-content">
                <h3>Editar Cuenta: ${account.c_name}</h3>
                <form class="edit-form">
                    <div class="input-box">
                        <input type="text" id="editUsername" value="${
                          account.c_name
                        }" 
                               placeholder="${account.c_name}" required>
                        <i class='bx bxs-user'></i>
                    </div>
                    <div class="input-box">
                        <input type="password" id="editPassword" 
                               placeholder="•••••••• (dejar vacío para no cambiar)">
                        <i class='bx bxs-lock-alt'></i>
                    </div>
                    ${
                      isRootAdmin
                        ? `
                    <div class="seleccionable">
                        <select id="editRole" class="seleccionable1">
                            <option value="user" ${
                              account.c_rol === "user" ? "selected" : ""
                            }>Secretario</option>
                            <option value="admin" ${
                              account.c_rol === "admin" ? "selected" : ""
                            }>Administrador</option>
                        </select>
                    </div>
                    `
                        : ""
                    }
                    <div class="modal-buttons">
                        <button type="button" class="btn cancel">Cancelar</button>
                        <button type="submit" class="btn">Guardar Cambios</button>
                    </div>
                </form>
            </div>
        `;

    document.body.appendChild(modal);

    // Configurar placeholders
    const usernameInput = modal.querySelector("#editUsername");
    const passwordInput = modal.querySelector("#editPassword");

    // Manejar placeholders
    usernameInput.addEventListener("focus", function () {
      if (this.value === this.placeholder) {
        this.value = "";
        this.style.color = "#e4e6eb";
      }
    });

    usernameInput.addEventListener("blur", function () {
      if (this.value === "") {
        this.value = this.placeholder;
        this.style.color = "#9ca3af";
      }
    });

    // Inicializar colores
    if (usernameInput.value === usernameInput.placeholder) {
      usernameInput.style.color = "#9ca3af";
    }

    // Manejar cierre del modal
    modal.querySelector(".cancel").addEventListener("click", () => {
      document.body.removeChild(modal);
    });

    // Manejar envío del formulario
    modal.querySelector(".edit-form").addEventListener("submit", async (e) => {
      e.preventDefault();

      let newUsername = modal.querySelector("#editUsername").value.trim();
      const newPassword = modal.querySelector("#editPassword").value.trim();
      const newRole = isRootAdmin
        ? modal.querySelector("#editRole").value
        : account.c_rol;

      // Si el usuario no modificó el nombre, usar el original
      if (newUsername === usernameInput.placeholder) {
        newUsername = account.c_name;
      }

      if (newUsername.length < 8 ) {
      alert("El nombre de usuario debe contener 8 caracteres o mas");
      return;
      }

      if (newPassword && newPassword.length < 5 ) {
      alert("La contraseña debe contener 5 caracteres o mas");
      return;
      }


      try {
        const endpoint =
          account.c_rol === "admin"
            ? `http://localhost:3000/admin/account/admin/update/${account.c_id}`
            : `http://localhost:3000/admin/account/user/update/${account.c_id}`;

        const response = await fetch(endpoint, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            c_name: newUsername,
            c_password: newPassword || undefined,
            c_rol: newRole,
            c_root: 0,
          }),
        });

        if (!response.ok) throw new Error("Error al actualizar cuenta");

        alert("Cuenta actualizada correctamente");
        document.body.removeChild(modal);
        loadAccounts();
      } catch (error) {
        alert(error.message);
      }
    });
  }

  // Función para manejar eliminación
  async function handleDeleteAccount(account) {
    if (!confirm("¿Estás seguro de eliminar esta cuenta?")) return;

    try {
      const endpoint =
        account.c_rol === "admin"
          ? `http://localhost:3000/admin/account/admin/delete/${account.c_id}`
          : `http://localhost:3000/admin/account/user/delete/${account.c_id}`;

      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Error al eliminar cuenta");
      alert("Cuenta eliminada correctamente");
      loadAccounts();
    } catch (error) {
      alert(error.message);
    }
  }

  function paginar(array, pagina, itemsPorPagina) {
    const inicio = (pagina -1) * itemsPorPagina;
    const fin = inicio + itemsPorPagina;
    return array.slice(inicio, fin);
  }

  function actualizarControlesPaginacion(totalItem) {
    const totalPaginas = Math.ceil(totalItem / itemsPorPagina);
    const paginaActualElement = document.querySelector('.pagina-actual[data-tabla="cuentas"]');
    const btnAnterior = document.querySelector('.paginacion-btn[data-tabla="cuentas"][data-accion="anterior"]');
    const btnSiguiente = document.querySelector('.paginacion-btn[data-tabla="cuentas"][data-accion="siguiente"]');


    if (paginaActualElement) paginaActualElement.textContent = paginaActualCuentas;
    if (btnAnterior) btnAnterior.disabled = paginaActualCuentas <= 1;
    if (btnSiguiente) btnSiguiente.disabled = paginaActualCuentas >= totalPaginas;
  }

  // Función para cargar y mostrar las cuentas
  async function loadAccounts() {
    try {
      const response = await fetch("http://localhost:3000/admin/account/list", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Error al obtener cuentas");

      const accounts = await response.json();
      todosCuentas = accounts;

const cuentasPagina = paginar(accounts, paginaActualCuentas, itemsPorPagina)
renderAccounts(cuentasPagina)

actualizarControlesPaginacion(accounts.length);

      
    } catch (error) {
      alert(error.message);
    }
  }

  function renderAccounts(accounts) {
    tbody.innerHTML = "";
      accounts.forEach((account) => {
        const isAdminAccount = account.c_rol === "admin";
        const canModify = isRootAdmin || !isAdminAccount;
        const canDelete = isRootAdmin || !isAdminAccount;

        const tr = document.createElement("tr");
        tr.innerHTML = `
                    <td>${account.c_name}</td>
                    <td>${isAdminAccount ? "Administrador" : "Secretario"}</td>
                    <td>
                        ${
                          canModify
                            ? `<button class="action-btn edit-btn" data-id="${account.c_id}">Modificar</button>`
                            : ""
                        }
                        ${
                          canDelete
                            ? `<button class="action-btn delete-btn delete" data-id="${account.c_id}">Eliminar</button>`
                            : ""
                        }
                    </td>
                `;

        // Asignar eventos a los botones
        if (canModify) {
          tr.querySelector(".edit-btn").addEventListener("click", () =>
            showEditModal(account, isRootAdmin)
          );
        }
        if (canDelete) {
          tr.querySelector(".delete-btn").addEventListener("click", () =>
            handleDeleteAccount(account)
          );
        }

        tbody.appendChild(tr);
      });
  }

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.paginacion-btn')) return;

    const boton = e.target.closest('.paginacion-btn');
    const tabla = boton.dataset.tabla;
    const accion = boton.dataset.accion;

    if (tabla === 'cuentas') {
      if (accion === 'anterior' && paginaActualCuentas > 1) {
        paginaActualCuentas--;
      } else if (accion === 'siguiente' && paginaActualCuentas < Math.ceil(todosCuentas.length / itemsPorPagina)) {
        paginaActualCuentas++;
      }
      renderAccounts(paginar(todosCuentas, paginaActualCuentas, itemsPorPagina));
      actualizarControlesPaginacion(todosCuentas.length)
    }
  })

  // Manejar envío del formulario
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    const role = roleSelect.value;

    if (!username || !password || !role) {
      alert("Todos los campos son obligatorios");
      return;
    }

    if (username.length < 8 ) {
      alert("El nombre de usuario debe contener 8 caracteres o mas");
      return;
    } 
    
    if (password.length < 5 ) {
      alert("La contraseña debe contener 5 caracteres o mas");
      return;
    }

  
    try {
      const endpoint =
        role === "admin"
          ? "http://localhost:3000/admin/account/admin/add"
          : "http://localhost:3000/admin/account/user/add";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          c_name: username,
          c_password: password,
          c_rol: role,
          c_root: 0,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear cuenta");
      }

      alert("Cuenta creada exitosamente");
      form.reset();
      loadAccounts();
    } catch (error) {
      alert(error.message);
    }
  });

  // Toggle del formulario
  toggleFormBtn.addEventListener("click", () => {
    formContainer.classList.toggle("collapsed");
    toggleFormBtn.classList.toggle("collapsed");

    if (formContainer.classList.contains("collapsed")) {
      toggleFormBtn.innerHTML =
        '<i class="bx bxs-plus-circle"></i> Crear Cuenta';
    } else {
      toggleFormBtn.innerHTML =
        '<i class="bx bxs-minus-circle"></i> Ocultar Formulario';
    }
  });

  // Inicialmente colapsado
  formContainer.classList.add("collapsed");
  toggleFormBtn.classList.add("collapsed");

  // Cargar cuentas al iniciar
  loadAccounts();
});
