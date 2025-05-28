document.addEventListener("DOMContentLoaded", async () => {
  const token = sessionStorage.getItem("token");
  const cedula = localStorage.getItem("cedulaActual");
  let originalData = {};
  let workerData = {};

  // Elementos del DOM
  const nombreInput = document.getElementById("nombre");
  const apellidoInput = document.getElementById("apellido");
  const cedulaInput = document.getElementById("cedula");
  const departamentoSelect = document.getElementById("departamentoSelect");
  const cargoSelect = document.getElementById("cargoSelect");
  const btnEditar = document.getElementById("btnEditar");
  const btnGuardar = document.getElementById("btnGuardar");
  const btnCancelar = document.getElementById("btnCancelar");
  const btnEliminar = document.getElementById("btnEliminar");
  let fechaSeleccionada;
  let eventoActual;

  // Validaciones iniciales
  if (!token) {
    alert("Error: Debe iniciar sesión");
    window.location.href = "../login.html";
    return;
  }

  if (!cedula) {
    alert("Error: No se especificó la cédula");
    window.location.href = "Consultar.html";
    return;
  }

  // Funciones para mostrar/ocultar popups
  function showPopup(popupId) {
    const popup = document.getElementById(popupId);
    popup.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function hidePopup(popupId) {
    const popup = document.getElementById(popupId);
    popup.classList.remove("active");
    document.body.style.overflow = "";
  }

  // Configurar eventos de cierre
  document.querySelectorAll(".popup-close").forEach((btn) => {
    btn.addEventListener("click", function () {
      const popup = this.closest(".popup-overlay");
      hidePopup(popup.id);
    });
  });

  document.querySelectorAll(".popup-overlay").forEach((popup) => {
    popup.addEventListener("click", function (e) {
      if (e.target === this) {
        hidePopup(this.id);
      }
    });
  });

  try {
    // Cargar datos del trabajador
    const workerResponse = await fetch(
      `http://localhost:3000/user/profile/${cedula}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (workerResponse.status === 401 || workerResponse.status === 403) {
      sessionStorage.removeItem("token");
      window.location.href = "/frontend/views/login.html";
      return;
    }

    workerData = await workerResponse.json();

    // Guardar datos originales
    originalData = {
      nombre: workerData.trabajador.nombre,
      apellido: workerData.trabajador.apellido,
      cedula: workerData.trabajador.cedula,
      id_departamento: workerData.trabajador.id_departamento,
      id_cargo: workerData.trabajador.id_cargo,
    };

    // Llenar campos básicos
    nombreInput.value = workerData.trabajador.nombre;
    apellidoInput.value = workerData.trabajador.apellido;
    cedulaInput.value = workerData.trabajador.cedula;

    // Cargar departamentos
    const depResponse = await fetch(
      "http://localhost:3000/admin/department/list",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const departamentos = await depResponse.json();
    departamentoSelect.innerHTML = departamentos
      .map(
        (dep) => `<option value="${dep.id_departamento}">${dep.d_name}</option>`
      )
      .join("");

    departamentoSelect.value = workerData.trabajador.id_departamento.toString();

    // Cargar cargos del departamento inicial y luego asignar valor
    await loadCargos(workerData.trabajador.id_departamento);
    cargoSelect.value = workerData.trabajador.id_cargo.toString();

    // Configurar QR
    const qrElement = document.querySelector(".codigoqr");
    qrElement.dataset.qrBackend = workerData.trabajador.qr_code;

    // Llenar contadores
    document.getElementById(
      "countA"
    ).textContent = `Asistencias: ${workerData.contadores.asistencias}`;
    document.getElementById(
      "countP"
    ).textContent = `Permisos: ${workerData.contadores.permisos}`;
    document.getElementById(
      "countF"
    ).textContent = `Faltas: ${workerData.contadores.faltas}`;

    // Generar calendario
    generarCalendarioAnual(workerData.calendario);
  } catch (error) {
    console.error("Error:", error);
    alert("Error al cargar datos");
  }

  // Función para cargar cargos
  async function loadCargos(id_departamento) {
    try {
      const response = await fetch(
        `http://localhost:3000/admin/job/list/${id_departamento}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const cargos = await response.json();
      cargoSelect.innerHTML = cargos
        .map((c) => `<option value="${c.id_cargo}">${c.c_name}</option>`)
        .join("");
    } catch (error) {
      console.error("Error cargando cargos:", error);
    }
  }

  // Evento cambio departamento
  departamentoSelect.addEventListener("change", async (e) => {
    await loadCargos(e.target.value);
  });

  // Botón Editar
  btnEditar.addEventListener("click", () => {
    nombreInput.readOnly = false;
    apellidoInput.readOnly = false;
    cedulaInput.readOnly = false;
    departamentoSelect.disabled = false;
    cargoSelect.disabled = false;

    btnGuardar.style.display = "inline-block";
    btnCancelar.style.display = "inline-block";
    btnEditar.style.display = "none";
    btnEliminar.style.display = "none";
  });

  // Botón Cancelar
  btnCancelar.addEventListener("click", async () => {
    nombreInput.value = originalData.nombre;
    apellidoInput.value = originalData.apellido;
    cedulaInput.value = originalData.cedula;
    departamentoSelect.value = originalData.id_departamento;
    await loadCargos(originalData.id_departamento);
    cargoSelect.value = originalData.id_cargo;

    toggleEditMode(false);
  });

  // Botón Guardar
  btnGuardar.addEventListener("click", async () => {

    if (!nombreInput.value.trim()) {
      alert("El nombre es obligatorio");
      nombreInput.focus();
      return;
    }

    if (!apellidoInput.value.trim()) {
      alert("El apellido es obligatorio");
      apellidoInput.focus();
      return;
    }

    if (!cedulaInput.value.trim()) {
      alert("La cédula es obligatoria");
      cedulaInput.focus();
      return;
    }

    if (!departamentoSelect.value) {
      alert("Debe seleccionar un departamento");
      departamentoSelect.focus();
      return;
    }

    if (!cargoSelect.value) {
      alert("Debe seleccionar un cargo");
      cargoSelect.focus();
      return;
    }

              //validar solo letras
      const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+$/;

      // Validar nombres y apellidos
      if (!soloLetras.test(nombreInput.value)) {
        alert("El nombre solo puede contener letras");
        nombreInput.focus();
        return;
      }

      if (!soloLetras.test(apellidoInput.value)) {
        alert("El apellido solo puede contener letras");
        apellidoInput.focus();
        return;
      }

      if (cedulaInput.value.length < 7 || cedulaInput.value.length > 8) {
        alert("Verifique que la cedula propuesta es correcta")
        cedulaInput.focus();
        return;
      }

    const confirmacion = confirm("¿Guardar cambios?");
    if (!confirmacion) return;


    try {
      const updateData = {
        nombre: nombreInput.value,
        apellido: apellidoInput.value,
        nuevaCedula: cedulaInput.value,
        id_departamento: departamentoSelect.value,
        id_cargo: cargoSelect.value,
      };

      const response = await fetch(
        `http://localhost:3000/admin/profile/${cedula}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updateData),
        }
      );

      if (response.ok) {
        alert("¡Datos actualizados!");
        localStorage.setItem("cedulaActual", updateData.nuevaCedula);
        window.location.reload();
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al guardar cambios");
    }
  });

  // Botón Eliminar
  btnEliminar.addEventListener("click", async () => {
    const confirmacion = prompt('Escriba "eliminar" para confirmar');
    if (confirmacion !== "eliminar") return;

    try {
      const response = await fetch(
        `http://localhost:3000/admin/profile/${cedula}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        alert("Trabajador eliminado");
        window.location.href = "Consultar.html";
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al eliminar");
    }
  });

  // Función para cambiar modo edición
  function toggleEditMode(editing) {
    nombreInput.readOnly = !editing;
    apellidoInput.readOnly = !editing;
    cedulaInput.readOnly = !editing;
    departamentoSelect.disabled = !editing;
    cargoSelect.disabled = !editing;

    btnGuardar.style.display = editing ? "inline-block" : "none";
    btnCancelar.style.display = editing ? "inline-block" : "none";
    btnEditar.style.display = editing ? "none" : "inline-block";
    btnEliminar.style.display = editing ? "none" : "inline-block";
  }

  // Función de impresión modificada
  function imprimirCredencial() {
    const nombre = nombreInput.value;
    const apellido = apellidoInput.value;
    const cedula = cedulaInput.value;
    const departamento =
      departamentoSelect.options[departamentoSelect.selectedIndex].text;
    const cargo = cargoSelect.options[cargoSelect.selectedIndex].text;
    const qrBase64 = document.querySelector(".codigoqr").dataset.qrBackend;

    const ventana = window.open("", "_blank");
    ventana.document.write(`
            <html>
                <head>
                    <title>Credencial - ${nombre} ${apellido}</title>
                    <style>
                        @page { margin: 0; }
                        body { 
                            font-family: Arial;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            min-height: 100vh;
                            margin: 0;
                        }
                        .credencial {
                            text-align: center;
                            border: 2px solid #000;
                            padding: 20px;
                            width: 300px;
                        }
                        .qr-impresion {
                            width: 200px;
                            height: 200px;
                            margin: 15px auto;
                            display: block;
                        }
                    </style>
                </head>
                <body>
                    <div class="credencial">
                        <h2>${nombre} ${apellido}</h2>
                        <p>${departamento} - ${cargo}</p>
                        <p>C.I.: ${cedula}</p>
                        <img src="${qrBase64}" class="qr-impresion">
                    </div>
                </body>
            </html>
        `);

    ventana.onload = () => {
      ventana.print();
      ventana.close();
    };
    ventana.document.close();
  }

  // Configurar botón de imprimir
  document.getElementById("qr").addEventListener("click", imprimirCredencial);

  function generarCalendarioAnual(eventos) {
    const container = document.getElementById("calendarContainer");
    const añoActual = new Date().getFullYear();

    container.innerHTML = "";

    for (let mes = 0; mes < 12; mes++) {
      const primerDia = new Date(añoActual, mes, 1);
      const ultimoDia = new Date(añoActual, mes + 1, 0);

      const divMes = document.createElement("div");
      divMes.className = "mes-calendario";
      divMes.innerHTML = `
            <h3>${primerDia.toLocaleDateString("es-ES", { month: "long" })}</h3>
            <div class="dias-semana">
                ${["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"]
                  .map((d) => `<span>${d}</span>`)
                  .join("")}
            </div>
            <div class="dias-mes"></div>
        `;

      const diasDiv = divMes.querySelector(".dias-mes");
      const diasEnMes = ultimoDia.getDate();

      for (let i = 1; i <= diasEnMes; i++) {
        const dia = new Date(añoActual, mes, i);
        const fechaISO = dia.toISOString().split("T")[0];

        const diaElement = document.createElement("div");
        diaElement.className = "dia";
        diaElement.textContent = i;

        const eventosDia = eventos.filter((e) => e.start.startsWith(fechaISO));
        if (eventosDia.length > 0) {
          const evento = eventosDia[0];
          diaElement.classList.add("evento");

          // Asignar color según el tipo de evento
          if (evento.title === "Asistencia") {
            diaElement.style.color = "#28a745"; // Verde
          } else if (evento.title === "Falta") {
            diaElement.style.color = "#dc3545"; // Rojo
          } else if (evento.title === "Permiso") {
            diaElement.style.color = "#ffc107"; // Amarillo
          }

          // Tooltip con información del evento
          diaElement.title =
            evento.title +
            (evento.description ? `: ${evento.description}` : "");
        }

        diaElement.addEventListener("click", (e) => {
          const eventosDia = eventos.filter((e) =>
            e.start.startsWith(fechaISO)
          );
          if (eventosDia.length > 0) {
            mostrarModalEdicion(eventosDia, fechaISO);
          } else {
            mostrarModalRegistro(fechaISO);
          }
        });

        diasDiv.appendChild(diaElement);
      }

      container.appendChild(divMes);
    }
  }

  // Función para mostrar modal de registro
  function mostrarModalRegistro(fecha) {
    fechaSeleccionada = fecha;
    const camposPermiso = document.getElementById("camposPermiso");

    // Resetear campos
    document.getElementById("fechaInicioPermiso").value = fecha;
    document.getElementById("fechaFinPermiso").value = fecha;
    document.getElementById("fechaFinPermiso").min = fecha;
    document.getElementById("motivoPermiso").value = "";
    document.getElementById("tipoEvento").value = "asistencia";
    camposPermiso.style.display = "none";

    // Mostrar popup
    showPopup("popupRegistrar");
  }

  // Función para mostrar modal de edición
  function mostrarModalEdicion(eventos, fecha) {
    eventoActual = eventos[0];

    let contenido = "";
    const esPermiso = eventoActual.extendedProps?.esPermiso || false;
    const esAsistencia = eventoActual.title === "Asistencia";
    const esFalta = eventoActual.title === "Falta";

    document.getElementById("btnEditarPermiso").style.display = "none";
    document.getElementById("btnGuardarPermiso").style.display = "none";
    document.getElementById("btnEliminarEvento").style.display = "inline-block";

    // Agrupar eventos por ID de permiso
    const eventosAgrupados = eventos.reduce((acc, evento) => {
      if (evento.extendedProps?.esPermiso) {
        const id = evento.id;
        if (!acc[id]) {
          acc[id] = {
            ...evento,
            dias: [],
          };
        }
        acc[id].dias.push(evento.start.split("T")[0]);
      }
      return acc;
    }, {});

    // Tomar el primer evento del grupo (todos comparten misma info)
    eventoActual = Object.values(eventosAgrupados)[0] || eventos[0];

    if (esPermiso) {
      const fechaInicio = new Date(eventoActual.extendedProps.fechaInicio);
      const fechaFin = new Date(eventoActual.extendedProps.fechaFin);
      const diasPermiso = eventoActual.dias
        ? eventoActual.dias.length
        : Math.round((fechaFin - fechaInicio) / (1000 * 60 * 60 * 24)) + 1;

      contenido = `
            <div class="input-group">
                <label>Periodo del Permiso:</label>
                <div class="input-row">
                    <div class="input-group">
                        <label>Desde</label>
                        <input type="date" 
                            value="${fechaInicio.toISOString().split("T")[0]}" 
                            disabled
                        >
                    </div>
                    <div class="input-group">
                        <label>Hasta</label>
                        <input type="date" 
                            value="${fechaFin.toISOString().split("T")[0]}" 
                            disabled
                        >
                    </div>
                </div>
            </div>
            <div class="input-group">
                <label>Motivo:</label>
                <input type="text" id="motivoExistente" value="${
                  eventoActual.description || ""
                }" readonly>
            </div>
        `;

      document.getElementById("btnEditarPermiso").style.display =
        "inline-block";
    } else {
      contenido = `
                <div class="input-group">
                    <label>Fecha:</label>
                    <input type="date" value="${fecha.split("T")[0]}" disabled>
                </div>
            `;

      if (esAsistencia) {
        contenido += `
                    <div class="input-group">
                        <label>Hora registrada:</label>
                        <input type="time" 
                            value="${
                              eventoActual.start
                                .split("T")[1]
                                ?.substring(0, 5) || "00:00"
                            }" 
                            disabled
                        >
                    </div>
                `;
      }
    }

    document.getElementById("detallesEvento").innerHTML = contenido;
    document.getElementById("tituloEvento").textContent = eventoActual.title;
    showPopup("popupEditar");
  }

  // Actualizar el evento de cambio para tipo de evento
  document.getElementById("tipoEvento").addEventListener("change", (e) => {
    const permisoFields = document.getElementById("camposPermiso");
    permisoFields.style.display =
      e.target.value === "permiso" ? "block" : "none";

    if (e.target.value === "permiso") {
      document.getElementById("fechaInicioPermiso").value = fechaSeleccionada;
      document.getElementById("fechaFinPermiso").min = fechaSeleccionada;
      document.getElementById("fechaFinPermiso").value = fechaSeleccionada;
    }
  });

  // Configurar botón cancelar registro
  document
    .getElementById("btnCancelarRegistro")
    .addEventListener("click", () => {
      hidePopup("popupRegistrar");
    });

  // Función para registrar nuevo evento
document.getElementById("btnRegistrarEvento").addEventListener("click", async () => {
    const tipo = document.getElementById("tipoEvento").value;
    const id_trabajador = workerData.trabajador.id_trabajador;
    const cedula = workerData.trabajador.cedula;

    try {
        let response;
        let endpoint;
        let body = {};

        switch (tipo) {
            case "asistencia":
                endpoint = `http://localhost:3000/admin/assist/create`;
                body = {
                    id_trabajador: id_trabajador,
                    fecha: fechaSeleccionada,
                };
                break;

            case "falta":
                endpoint = `http://localhost:3000/admin/fault/create`;
                body = {
                    id_trabajador: id_trabajador,
                    fecha: fechaSeleccionada,
                };
                break;

            case "permiso":
                const motivo = document.getElementById("motivoPermiso").value.trim();
                if (!motivo) {
                    alert("Debe especificar un motivo para el permiso");
                    document.getElementById("motivoPermiso").focus();
                    return;
                }
                
                endpoint = `http://localhost:3000/admin/permission/create`;
                body = {
                    cedula: cedula,
                    fecha_inicio: fechaSeleccionada,
                    fecha_fin: document.getElementById("fechaFinPermiso").value,
                    motivo: document.getElementById("motivoPermiso").value,
                };
                break;
        }

        response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        });

        if (response.ok) {
            alert("Evento registrado correctamente");
            hidePopup("popupRegistrar");
            window.location.reload();
        } else {
            const errorData = await response.json();
            alert(`Error: ${errorData.message || "No se pudo registrar el evento"}`);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Error al registrar evento");
    }
})
    // Función para editar permiso
    document
      .getElementById("btnEditarPermiso")
      .addEventListener("click", () => {
        if (eventoActual.title === "Permiso") {
          const motivoInput = document.getElementById("motivoExistente");
          motivoInput.readOnly = false;
          motivoInput.focus();

          document.getElementById("btnEditarPermiso").style.display = "none";
          document.getElementById("btnGuardarPermiso").style.display =
            "inline-block";
        }
      });

  // Función para guardar cambios en permiso
  document
    .getElementById("btnGuardarPermiso")
    .addEventListener("click", async () => {
      if (eventoActual.title !== "Permiso") {
        hidePopup("popupEditar");
        return;
      }

      try {
        const nuevoMotivo = document.getElementById("motivoExistente").value;
        const cedula = localStorage.getItem("cedulaActual");

        if(!nuevoMotivo) {
          alert("El motivo no puede estar en blanco")
          return
        }

        const response = await fetch(
          `http://localhost:3000/admin/permission/update`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              id_p: eventoActual.id,
              motivo: nuevoMotivo,
            }),
          }
        );

        if (response.ok) {
          alert("Permiso actualizado correctamente");
          hidePopup("popupEditar");
          window.location.reload();
        } else {
          const errorData = await response.json();
          alert(
            `Error: ${errorData.message || "No se pudo actualizar el permiso"}`
          );
        }
      } catch (error) {
        console.error("Error al actualizar permiso:", error);
        alert("Error al actualizar permiso");
      }
    });

  // Función para eliminar evento
  document
    .getElementById("btnEliminarEvento")
    .addEventListener("click", async () => {
      const confirmacion = confirm(
        "¿Está seguro que desea eliminar este evento?"
      );
      if (!confirmacion) return;

      try {
        let endpoint;
        let body;

        switch (eventoActual.title) {
          case "Asistencia":
            endpoint = `http://localhost:3000/admin/assist/delete`;
            body = { id_a: eventoActual.id };
            break;
          case "Falta":
            endpoint = `http://localhost:3000/admin/fault/delete`;
            body = { id_f: eventoActual.id };
            break;
          case "Permiso":
            endpoint = `http://localhost:3000/admin/permission/delete`;
            body = { id_p: eventoActual.id };
            break;
        }

        const response = await fetch(endpoint, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });

        if (response.ok) {
          alert("Evento eliminado correctamente");
          hidePopup("popupEditar");
          window.location.reload();
        } else {
          const errorData = await response.json();
          alert(
            `Error: ${errorData.message || "No se pudo eliminar el evento"}`
          );
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Error al eliminar evento");
      }
    });
});
