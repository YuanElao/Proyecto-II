document.addEventListener('DOMContentLoaded', async () => {
    // Elementos del DOM
    const tipoReporteSelect = document.getElementById('tipoReporte');
    const recordOptionsDiv = document.getElementById('recordOptions');
    const tipoRecordSelect = document.getElementById('tipoRecord');
    const anioRecordSelect = document.getElementById('anioRecord');
    const btnGenerarReporte = document.getElementById('btnGenerarReporte');
    const reportContainer = document.getElementById('reportContainer');
    
    // Variables de estado
    const token = sessionStorage.getItem('token');
    const cedula = localStorage.getItem('cedulaActual');
    let workerData = {};

    // Validaciones iniciales
    if (!token || !cedula) {
        window.location.href = '../login.html';
        return;
    }

    try {
        // Cargar datos del trabajador
        const workerResponse = await fetch(`http://localhost:3000/user/profile/${cedula}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!workerResponse.ok) {
            throw new Error('Error al cargar datos del trabajador');
        }

        workerData = await workerResponse.json();
        setupEventListeners();
        loadAvailableYears(); // Cargar años disponibles

    } catch (error) {
        console.error('Error:', error);
        alert(error.message);
        window.location.href = 'Consultar.html';
    }

    function setupEventListeners() {
        // Cambio en tipo de reporte
        tipoReporteSelect.addEventListener('change', (e) => {
            const showRecordOptions = e.target.value === 'record';
            recordOptionsDiv.style.display = showRecordOptions ? 'block' : 'none';
        });

        // Botón Generar Reporte
        btnGenerarReporte.addEventListener('click', generateHTMLReport);
    }

    async function loadAvailableYears() {
        try {
            const { id_trabajador } = workerData.trabajador;
            const response = await fetch(`http://localhost:3000/admin/report/${id_trabajador}/anios`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Error al obtener años disponibles');

            const anios = await response.json();
            anioRecordSelect.innerHTML = anios.map(anio => 
                `<option value="${anio}" ${anio === new Date().getFullYear() ? 'selected' : ''}>${anio}</option>`
            ).join('');

        } catch (error) {
            console.error('Error:', error);
            alert(error.message);
        }
    }

    async function generateHTMLReport() {
    const { id_trabajador, nombre, apellido } = workerData.trabajador;
    const tipoReporte = tipoReporteSelect.value;
    
    // Determinar qué tipo de reporte generar
    if (tipoReporte === 'datos') {
        await generateWorkerDataReport();
        return;
    }

    // Si es record laboral
    const tipoRecord = tipoRecordSelect.value;
    const anio = anioRecordSelect.value;
    
    try {
        // Mostrar indicador de carga
        btnGenerarReporte.disabled = true;
        btnGenerarReporte.innerHTML = '<i class="bx bx-loader bx-spin"></i> Generando Reporte...';
        
        // Obtener datos del servidor
        const params = new URLSearchParams({ 
            tipo: tipoRecord,
            anio: anio
        });
        
        const response = await fetch(`http://localhost:3000/admin/report/${id_trabajador}/data?${params}`, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al obtener datos para el reporte');
        }

        const eventos = await response.json();
        
        // Llamar a la función correcta para generar el reporte
        await generateRecordReport();

    } catch (error) {
        console.error('Error al generar reporte:', error);
        alert('Error al generar reporte: ' + error.message);
    } finally {
        btnGenerarReporte.disabled = false;
        btnGenerarReporte.innerHTML = '<i class="bx bx-file"></i> Generar Reporte';
    }
}

    async function generateWorkerDataReport() {
    try {
        btnGenerarReporte.disabled = true;
        btnGenerarReporte.innerHTML = '<i class="bx bx-loader bx-spin"></i> Generando Reporte...';
        
        const { nombre, apellido } = workerData.trabajador;
        
        // Crear ventana de impresión directamente
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Reporte de Trabajador - ${nombre} ${apellido}</title>
                <style>
                    @page { size: A4; margin: 1cm; }
                    body { font-family: Arial, sans-serif; }
                    .reporte-header { text-align: center; margin-bottom: 20px; }
                    .datos-trabajador { margin: 0 auto; width: 80%; }
                    .fila-dato { display: flex; margin-bottom: 10px; }
                    .etiqueta { font-weight: bold; width: 150px; }
                    .valor { flex-grow: 1; }
                    .resumen { margin-top: 20px; text-align: center; }
                    .contadores { display: flex; justify-content: center; gap: 20px; }
                    @media print {
                        body { -webkit-print-color-adjust: exact; }
                        button { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="reporte-header">
                    <h2>Datos del Trabajador</h2>
                    <p>Generado el: ${new Date().toLocaleDateString('es-ES')}</p>
                </div>
                <div class="datos-trabajador">
                    <div class="fila-dato">
                        <span class="etiqueta">Nombre:</span>
                        <span class="valor">${nombre} ${apellido}</span>
                    </div>
                    <div class="fila-dato">
                        <span class="etiqueta">Cédula:</span>
                        <span class="valor">${workerData.trabajador.cedula}</span>
                    </div>
                    <div class="fila-dato">
                        <span class="etiqueta">Departamento:</span>
                        <span class="valor">${workerData.trabajador.departamento || 'N/A'}</span>
                    </div>
                    <div class="fila-dato">
                        <span class="etiqueta">Cargo:</span>
                        <span class="valor">${workerData.trabajador.cargo || 'N/A'}</span>
                    </div>
                </div>
                <div class="resumen">
                    <h3>Resumen Laboral</h3>
                    <div class="contadores">
                        <div>Asistencias: ${workerData.contadores?.asistencias || 0}</div>
                        <div>Faltas: ${workerData.contadores?.faltas || 0}</div>
                        <div>Permisos: ${workerData.contadores?.permisos || 0}</div>
                    </div>
                </div>
                <script>
                    window.onload = function() {
                        setTimeout(function() {
                            window.print();
                            window.close();
                        }, 200);
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
        
    } catch (error) {
        throw error;
    } finally {
        btnGenerarReporte.disabled = false;
        btnGenerarReporte.innerHTML = '<i class="bx bx-file"></i> Generar Reporte';
    }
}

async function generateRecordReport() {
    try {
        const { id_trabajador, nombre, apellido } = workerData.trabajador;
        const tipoRecord = tipoRecordSelect.value;
        const anio = anioRecordSelect.value;
        
        btnGenerarReporte.disabled = true;
        btnGenerarReporte.innerHTML = '<i class="bx bx-loader bx-spin"></i> Generando Reporte...';
        
        // Obtener datos del servidor
        const params = new URLSearchParams({ 
            tipo: tipoRecord,
            anio: anio
        });
        
        const response = await fetch(`http://localhost:3000/admin/report/${id_trabajador}/data?${params}`, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al obtener datos para el reporte');
        }

        const eventos = await response.json();
        
        // Crear ventana de impresión directamente
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Record Laboral - ${nombre} ${apellido}</title>
                <link rel="stylesheet" href="../../css/admin/calendarioAdmin.css">
                <style>
                    @page { 
                        size: A4 landscape;
                        margin: 0.5cm;
                    }
                    body { 
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 20px;
                    }
                    .reporte-header { 
                        text-align: center; 
                        margin-bottom: 20px;
                        page-break-after: avoid;
                    }
                    #calendarContainer {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 20px;
                        padding: 15px;
                    }
                    .mes-calendario {
                        page-break-inside: avoid;
                        break-inside: avoid;
                    }
                    .leyenda {
                        display: flex;
                        justify-content: center;
                        gap: 20px;
                        margin-top: 20px;
                        font-size: 0.9rem;
                        page-break-before: avoid;
                    }
                    .leyenda span {
                        display: inline-block;
                        width: 12px;
                        height: 12px;
                        border-radius: 50%;
                        margin-right: 5px;
                    }
                    .color-asistencia { background: #28a745; }
                    .color-falta { background: #dc3545; }
                    .color-permiso { background: #ffc107; }
                    @media print {
                        body { -webkit-print-color-adjust: exact; }
                    }
                </style>
            </head>
            <body>
                <div class="reporte-header">
                    <h2>Record Laboral - ${nombre} ${apellido}</h2>
                    <p>Año: ${anio} | Tipo: ${tipoRecord === 'general' ? 'General' : tipoRecord === 'asistencias' ? 'Asistencias' : tipoRecord === 'faltas' ? 'Faltas' : 'Permisos'}</p>
                    <p>Generado el: ${new Date().toLocaleDateString('es-ES')}</p>
                </div>
                
                <div id="calendarContainer">
                    ${generateCalendarHTML(anio, eventos)}
                </div>
                
                <div class="leyenda">
                    <div><span class="color-asistencia"></span> Asistencia</div>
                    <div><span class="color-falta"></span> Falta</div>
                    <div><span class="color-permiso"></span> Permiso</div>
                </div>
                
                <script>
                    window.onload = function() {
                        setTimeout(function() {
                            window.print();
                            window.close();
                        }, 200);
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
        
    } catch (error) {
        throw error;
    } finally {
        btnGenerarReporte.disabled = false;
        btnGenerarReporte.innerHTML = '<i class="bx bx-file"></i> Generar Reporte';
    }
}

function generateCalendarHTML(anio, eventos) {
    return Array.from({ length: 12 }, (_, mes) => {
        const primerDia = new Date(anio, mes, 1);
        const ultimoDia = new Date(anio, mes + 1, 0);
        const nombreMes = primerDia.toLocaleDateString('es-ES', { month: 'long' });
        
        let diasHTML = '';
        for (let i = 1; i <= ultimoDia.getDate(); i++) {
            const fechaISO = new Date(anio, mes, i).toISOString().split('T')[0];
            const eventosDia = eventos.filter(e => e.start.startsWith(fechaISO));
            
            let claseDia = 'dia';
            let estiloDia = '';
            let tooltip = '';
            
            if (eventosDia.length > 0) {
                const evento = eventosDia[0];
                claseDia += ' evento';
                
                // Estilo según tipo de evento
                if (evento.tipo === 'Asistencia') {
                    estiloDia = 'color: #28a745;'; // Verde
                } else if (evento.tipo === 'Falta') {
                    estiloDia = 'color: #dc3545;'; // Rojo
                } else if (evento.tipo === 'Permiso') {
                    estiloDia = 'color: #ffc107;'; // Amarillo
                }
                
                // Tooltip
                tooltip = `title="${evento.tipo}${evento.hora ? ' - Hora: ' + evento.hora : ''}${evento.motivo ? ' - Motivo: ' + evento.motivo : ''}"`;
            }
            
            diasHTML += `<div class="${claseDia}" style="${estiloDia}" ${tooltip}>${i}</div>`;
        }
        
        return `
            <div class="mes-calendario">
                <h3>${nombreMes}</h3>
                <div class="dias-semana">
                    ${['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'].map(d => `<span>${d}</span>`).join('')}
                </div>
                <div class="dias-mes">${diasHTML}</div>
            </div>
        `;
    }).join('');
}


    function addPrintButton() {
        const btnImprimir = document.createElement('button');
        btnImprimir.textContent = 'Imprimir Reporte';
        btnImprimir.className = 'btn-imprimir';
        btnImprimir.addEventListener('click', () => window.print());
        reportContainer.appendChild(btnImprimir);
    }
});