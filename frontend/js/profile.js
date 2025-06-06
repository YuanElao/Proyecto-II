document.addEventListener("DOMContentLoaded", async () => {
  const cedula = localStorage.getItem("cedulaActual");

  // Obtener parámetro de la cédula

  if (!cedula) {
    alert("Error: No se especificó la cédula");
    window.location.href = "Consultar.html";
    return;
  }

  try {
    const token = sessionStorage.getItem("token");
    // Obtener datos del trabajador

    const response = await fetch(
      `http://localhost:3000/user/profile/${cedula}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await response.json();
    console.log(data);

    
    // Llenar datos principales
    document.getElementById("nombre").value = data.trabajador.nombre;
    document.getElementById("apellido").value = data.trabajador.apellido;
    document.getElementById("cedula").value = data.trabajador.cedula;
    document.getElementById("departamento").value = data.trabajador.departamento;
    document.getElementById("cargo").value = data.trabajador.cargo;

    const qrElement = document.querySelector(".codigoqr");
    qrElement.dataset.qrBackend = data.trabajador.qr_code;

    // Llenar contadores
    document.getElementById(
      "countA"
    ).textContent = `Asistencias: ${data.contadores.asistencias}`;
    document.getElementById(
      "countP"
    ).textContent = `Permisos: ${data.contadores.permisos}`;
    document.getElementById(
      "countF"
    ).textContent = `Faltas: ${data.contadores.faltas}`;

    const calendario = data.calendario;
    generarCalendarioAnual(calendario);

   

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
    const primerDiaSemana = (primerDia.getDay() + 6) % 7; // Día de la semana del primer día (0=Dom, 1=Lun...)

    // Añadir celdas vacías para alinear el primer día
    for (let i = 0; i < primerDiaSemana; i++) {
      const emptyDay = document.createElement("div");
      emptyDay.className = "dia empty";
      diasDiv.appendChild(emptyDay);
    }

    // Rellenar días del mes
    for (let dia = 1; dia <= diasEnMes; dia++) {
      const diaElement = document.createElement("div");
      diaElement.className = "dia";
      diaElement.textContent = dia;
      
      // Formato de fecha simple (YYYY-MM-DD)
      const fechaISO = `${añoActual}-${(mes+1).toString().padStart(2,'0')}-${dia.toString().padStart(2,'0')}`;
      diaElement.dataset.fecha = fechaISO;

      // Buscar eventos para este día (comparación directa)
      const eventosDia = eventos.filter(e => {
        // Extraer solo la parte de la fecha (ignorando hora y zona horaria)
        const fechaEvento = e.start.split('T')[0];
        return fechaEvento === fechaISO;
      });

      if (eventosDia.length > 0) {
        const evento = eventosDia[0];
        diaElement.classList.add("evento");
        
        // Asignar colores según tipo de evento
        if (evento.title === "Asistencia") {
          diaElement.style.color = "#28a745"; // Verde
        } else if (evento.title === "Falta") {
          diaElement.style.color = "#dc3545"; // Rojo
        } else if (evento.title === "Permiso") {
          diaElement.style.color = "#ffc107"; // Amarillo
        }

        // Tooltip con información
        diaElement.title = evento.title + 
          (evento.description ? `: ${evento.description}` : "");
      }

      diasDiv.appendChild(diaElement);
    }

    container.appendChild(divMes);
  }
}

    // Configurar botón de imprimir
    document.getElementById("qr").addEventListener("click", imprimirCredencial);
  } catch (error) {
    console.error("Error al cargar el perfil:", error);
    alert("Error al cargar los datos del trabajador");
  }
});

function imprimirCredencial() {
  const nombre = document.getElementById("nombre").value;
  const apellido = document.getElementById("apellido").value;
  const cedula = document.getElementById("cedula").value;
  const departamento = document.getElementById("departamento").value;
  const cargo = document.getElementById("cargo").value;

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
