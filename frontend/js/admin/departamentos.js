document.addEventListener("DOMContentLoaded", async () => {
  const token = sessionStorage.getItem("token");
  if (!token) {
    window.location.href = "/frontend/views/login.html";
    return;
  }

  // Elementos del DOM
  const selectItem = document.getElementById("accionSelect");
  const formContainer = document.getElementById("formContainer");
  const departamentosTable = document.querySelector("#data-table tbody");
  const cargosTable = document.querySelector("#data-table2 tbody");
  let currentEditId = null;

  // Cargar datos iniciales
  const loadData = async () => {
    await loadDepartamentos();
    await loadCargos();
  };

  // Cargar departamentos
  const loadDepartamentos = async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/admin/department/list",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      renderDepartamentos(data);
    } catch (error) {
      console.error("Error cargando departamentos:", error);
    }
  };

  // Cargar cargos
  const loadCargos = async () => {
    try {
      const response = await fetch("http://localhost:3000/admin/job/list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      renderCargos(data);
    } catch (error) {
      console.error("Error cargando cargos:", error);
    }
  };

  // Renderizar departamentos
  const renderDepartamentos = (departamentos) => {
    departamentosTable.innerHTML = departamentos
      .map(
        (dep) => `
            <tr data-id="${dep.id_departamento}">
                <td>${dep.d_name}</td>
                <td>
                    <button class="enlace editar-dep">Modificar</button>
                    <button class="enlace eliminar-dep">Eliminar</button>
                </td>
            </tr>
        `
      )
      .join("");
  };

  // Renderizar cargos
  const renderCargos = (cargos) => {
    cargosTable.innerHTML = cargos
      .map(
        (c) => `
            <tr data-id="${c.id}">
                <td>${c.nombre}</td>
                <td>${c.departamento}</td>
                <td>
                    <button class="enlace editar-car">Modificar</button>
                    <button class="enlace eliminar-car">Eliminar</button>
                </td>
            </tr>
        `
      )
      .join("");
  };

  // Manejar selección de acción
  selectItem.addEventListener("change", async (e) => {
    const action = e.target.value;
    formContainer.innerHTML =
      action === "departamento"
        ? `<input type="text" class="input-crear" placeholder="Nombre" id="nombreInput">
               <button class="crear">Crear</button>`
        : `<div class="input-group">
                   <select class="seleccionable1" id="depSelect"></select>
                   <input type="text" class="input-crear" placeholder="Nombre" id="nombreInput">
               </div>
               <button class="crear">Crear</button>`;

    if (action === "cargo") await loadDepartamentosSelect("#depSelect");
  });

  // Cargar departamentos en select
  const loadDepartamentosSelect = async (selector) => {
    try {
      const response = await fetch(
        "http://localhost:3000/admin/department/list",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();

      document.querySelector(selector).innerHTML = `
                <option value="" disabled selected>Departamento</option>
                ${data
                  .map(
                    (d) =>
                      `<option value="${d.id_departamento}">${d.d_name}</option>`
                  )
                  .join("")}
            `;
    } catch (error) {
      console.error("Error cargando departamentos:", error);
    }
  };

  // Crear elementos
  formContainer.addEventListener("click", async (e) => {
    if (!e.target.classList.contains("crear") || currentEditId) return;

    const action = selectItem.value;
    const nombre = document.getElementById("nombreInput")?.value;
    const depId =
      action === "cargo" ? document.getElementById("depSelect")?.value : null;

    if (!nombre || (action === "cargo" && !depId)) {
      alert("Complete todos los campos");
      return;
    }

    try {
      const endpoint =
        action === "departamento" ? "/admin/department/add" : "/admin/job/add";

      const response = await fetch(`http://localhost:3000${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(
          action === "departamento"
            ? { d_name: nombre }
            : { c_name: nombre, id_departamento: depId }
        ),
      });

      if (response.ok) {
        document.getElementById("nombreInput").value = "";
        if (action === "cargo") document.getElementById("depSelect").value = "";
        await loadData();
      }
    } catch (error) {
      console.error("Error creando:", error);
    }
  });

  // Editar elementos
  document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("editar-dep")) {
      const row = e.target.closest("tr");
      currentEditId = row.dataset.id;
      document.getElementById("editDepNombre").value =
        row.querySelector("td:first-child").textContent;
      document.getElementById("modalDepartamento").style.display = "block";
    }

    if (e.target.classList.contains("editar-car")) {
      const row = e.target.closest("tr");
      currentEditId = row.dataset.id;
      document.getElementById("editCarNombre").value =
        row.querySelector("td:first-child").textContent;
      await loadDepartamentosSelect("#editCarDepartamento");
      document.getElementById("modalCargo").style.display = "block";
    }
  });

  // Eliminar elementos
  document.addEventListener("click", async (e) => {
    if (
      !e.target.classList.contains("eliminar-dep") &&
      !e.target.classList.contains("eliminar-car")
    )
      return;

    const confirmacion = prompt('Escriba "confirmar" para proceder:');
    if (confirmacion?.toLowerCase() !== "confirmar") {
      alert("Acción cancelada");
      return;
    }

    const isDep = e.target.classList.contains("eliminar-dep");
    const id = e.target.closest("tr").dataset.id;
    const endpoint = isDep ? `/admin/department/${id}` : `/admin/job/${id}`;

    try {
      const response = await fetch(`http://localhost:3000${endpoint}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) await loadData();
    } catch (error) {
      console.error("Error eliminando:", error);
    }
  });

  // Cerrar modales
  document.querySelectorAll(".cerrar").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".modal").forEach((modal) => {
        modal.style.display = "none";
        currentEditId = null;
      });
    });
  });

  // Guardar cambios en modales
  document
    .getElementById("btnGuardarDep")
    .addEventListener("click", async () => {
      const nuevoNombre = document.getElementById("editDepNombre").value;

      try {
        const response = await fetch(
          `http://localhost:3000/admin/department/${currentEditId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ d_name: nuevoNombre }),
          }
        );

        if (response.ok) {
          document.getElementById("modalDepartamento").style.display = "none";
          await loadData();
        }
      } catch (error) {
        console.error("Error actualizando departamento:", error);
      }
    });

  document
    .getElementById("btnGuardarCar")
    .addEventListener("click", async () => {
      const nuevoNombre = document.getElementById("editCarNombre").value;
      const Dep = document.getElementById("editCarDepartamento").value;

      try {
        const response = await fetch(
          `http://localhost:3000/admin/job/${currentEditId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              c_name: nuevoNombre,
              id_departamento: Dep,
            }),
          }
        );

        if (response.ok) {
          document.getElementById("modalCargo").style.display = "none";
          await loadData();
        }
      } catch (error) {
        console.error("Error actualizando cargo:", error);
      }
    });

  // Inicialización
  await loadData();
});
