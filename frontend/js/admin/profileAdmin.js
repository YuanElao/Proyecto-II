document.addEventListener('DOMContentLoaded', async () => {
    const token = sessionStorage.getItem('token');
    const cedula = localStorage.getItem('cedulaActual');
    let originalData = {};

    // Elementos del DOM
    const nombreInput = document.getElementById('nombre');
    const apellidoInput = document.getElementById('apellido');
    const cedulaInput = document.getElementById('cedula');
    const departamentoSelect = document.getElementById('departamentoSelect');
    const cargoSelect = document.getElementById('cargoSelect');
    const btnEditar = document.getElementById('btnEditar');
    const btnGuardar = document.getElementById('btnGuardar');
    const btnCancelar = document.getElementById('btnCancelar');
    const btnEliminar = document.getElementById('btnEliminar');

    // Validaciones iniciales
    if (!token) {
        alert('Error: Debe iniciar sesión');
        window.location.href = '../login.html';
        return;
    }

    if (!cedula) {
        alert('Error: No se especificó la cédula');
        window.location.href = 'Consultar.html';
        return;
    }

    try {
        // Cargar datos del trabajador
        const workerResponse = await fetch(`http://localhost:3000/user/profile/${cedula}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (workerResponse.status === 401 || workerResponse.status === 403) {
            sessionStorage.removeItem('token');
            window.location.href = '/frontend/views/login.html';
            return;
        }

        const workerData = await workerResponse.json();
        console.log(workerData)
        // Guardar datos originales
        originalData = {
            nombre: workerData.trabajador.nombre,
            apellido: workerData.trabajador.apellido,
            cedula: workerData.trabajador.cedula,
            id_departamento: workerData.trabajador.id_departamento,
            id_cargo: workerData.trabajador.id_cargo
        };

        // Llenar campos básicos
        nombreInput.value = workerData.trabajador.nombre;
        apellidoInput.value = workerData.trabajador.apellido;
        cedulaInput.value = workerData.trabajador.cedula;

        // Cargar departamentos
        const depResponse = await fetch('http://localhost:3000/admin/department/list', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const departamentos = await depResponse.json();
        departamentoSelect.innerHTML = departamentos.map(dep => 
            `<option value="${dep.id_departamento}">${dep.d_name}</option>`
        ).join('');
        
        departamentoSelect.value = workerData.trabajador.id_departamento.toString();
        
        // Cargar cargos del departamento inicial y luego asignar valor
        await loadCargos(workerData.trabajador.id_departamento);
        cargoSelect.value = workerData.trabajador.id_cargo.toString(); // Mover aquí después de loadCargos
        

        

        // Configurar QR
        const qrElement = document.querySelector('.codigoqr');
        qrElement.dataset.qrBackend = workerData.trabajador.qr_code;

        // Llenar contadores
        document.getElementById('countA').textContent = `Asistencias: ${workerData.contadores.asistencias}`;
        document.getElementById('countP').textContent = `Permisos: ${workerData.contadores.permisos}`;
        document.getElementById('countF').textContent = `Faltas: ${workerData.contadores.faltas}`;

        // Generar calendario
        generarCalendarioAnual(workerData.calendario);

    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar datos');
    }

    // Función para cargar cargos
    async function loadCargos(id_departamento) {
        try {
           
            const response = await fetch(`http://localhost:3000/admin/job/list/${id_departamento}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const cargos = await response.json();
            cargoSelect.innerHTML = cargos.map(c => 
                `<option value="${c.id_cargo}">${c.c_name}</option>`
            ).join('');

        } catch (error) {
            console.error('Error cargando cargos:', error);
        }
    }

    // Evento cambio departamento
    departamentoSelect.addEventListener('change', async (e) => {
        await loadCargos(e.target.value);
    });

    // Botón Editar
    btnEditar.addEventListener('click', () => {
        nombreInput.readOnly = false;
        apellidoInput.readOnly = false;
        cedulaInput.readOnly = false;
        departamentoSelect.disabled = false;
        cargoSelect.disabled = false;
        
        btnGuardar.style.display = 'inline-block';
        btnCancelar.style.display = 'inline-block';
        btnEditar.style.display = 'none';
        btnEliminar.style.display = 'none';
    });

    // Botón Cancelar
    btnCancelar.addEventListener('click', async () => {
        nombreInput.value = originalData.nombre;
        apellidoInput.value = originalData.apellido;
        cedulaInput.value = originalData.cedula;
        departamentoSelect.value = originalData.id_departamento;
        await loadCargos(originalData.id_departamento);
        cargoSelect.value = originalData.id_cargo;
        
        toggleEditMode(false);
    });

    // Botón Guardar
    btnGuardar.addEventListener('click', async () => {
        const confirmacion = confirm('¿Guardar cambios?');
        if (!confirmacion) return;

        try {
            const updateData = {
                nombre: nombreInput.value,
                apellido: apellidoInput.value,
                nuevaCedula: cedulaInput.value,
                id_departamento: departamentoSelect.value,
                id_cargo: cargoSelect.value
            };

            const response = await fetch(`http://localhost:3000/admin/profile/${cedula}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updateData)
            });

            if (response.ok) {
                alert('¡Datos actualizados!');
                localStorage.setItem('cedulaActual', updateData.nuevaCedula);
                window.location.reload();
            }

        } catch (error) {
            console.error('Error:', error);
            alert('Error al guardar cambios');
        }
    });

    // Botón Eliminar
    btnEliminar.addEventListener('click', async () => {
        const confirmacion = prompt('Escriba "eliminar" para confirmar');
        if (confirmacion !== "eliminar") return;

        try {
            const response = await fetch(`http://localhost:3000/admin/profile/${cedula}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                alert('Trabajador eliminado');
                window.location.href = 'Consultar.html';
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al eliminar');
        }
    });

    // Función para cambiar modo edición
    function toggleEditMode(editing) {
        nombreInput.readOnly = !editing;
        apellidoInput.readOnly = !editing;
        cedulaInput.readOnly = !editing;
        departamentoSelect.disabled = !editing;
        cargoSelect.disabled = !editing;
        
        btnGuardar.style.display = editing ? 'inline-block' : 'none';
        btnCancelar.style.display = editing ? 'inline-block' : 'none';
        btnEditar.style.display = editing ? 'none' : 'inline-block';
        btnEliminar.style.display = editing ? 'none' : 'inline-block';
    }

    

    // Función de impresión modificada
    function imprimirCredencial() {
        const nombre = nombreInput.value;
        const apellido = apellidoInput.value;
        const cedula = cedulaInput.value;
        const departamento = departamentoSelect.options[departamentoSelect.selectedIndex].text;
        const cargo = cargoSelect.options[cargoSelect.selectedIndex].text;
        const qrBase64 = document.querySelector('.codigoqr').dataset.qrBackend;

        const ventana = window.open('', '_blank');
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
        }
        ventana.document.close();
    }

    // Configurar botón de imprimir
    document.getElementById('qr').addEventListener('click', imprimirCredencial);

    function generarCalendarioAnual(eventos) {
        const container = document.getElementById('calendarContainer');
        const añoActual = new Date().getFullYear();
        
        container.innerHTML = '';
        
        for (let mes = 0; mes < 12; mes++) {
            const primerDia = new Date(añoActual, mes, 1);
            const ultimoDia = new Date(añoActual, mes + 1, 0);
            
            const divMes = document.createElement('div');
            divMes.className = 'mes-calendario';
            divMes.innerHTML = `
                <h3>${primerDia.toLocaleDateString('es-ES', { month: 'long' })}</h3>
                <div class="dias-semana">
                    ${['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'].map(d => `<span>${d}</span>`).join('')}
                </div>
                <div class="dias-mes"></div>
            `;
            
            const diasDiv = divMes.querySelector('.dias-mes');
            const diasEnMes = ultimoDia.getDate();
            
            for (let i = 1; i <= diasEnMes; i++) {
                const dia = new Date(añoActual, mes, i);
                const fechaISO = dia.toISOString().split('T')[0];
                
                const diaElement = document.createElement('div');
                diaElement.className = 'dia';
                diaElement.textContent = i;
                
                const eventosDia = eventos.filter(e => e.start.startsWith(fechaISO));
                if (eventosDia.length > 0) {
                    diaElement.classList.add('evento');
                    diaElement.style.color = eventosDia[0].color;
                    diaElement.title = eventosDia.map(e => `${e.title}: ${e.description || ''}`).join('\n');
                }
                
    
                diasDiv.appendChild(diaElement);
    
                diaElement.addEventListener('click', (e) => {
                const fechaISO = dia.toISOString().split('T')[0];
                const eventosDia = eventos.filter(e => e.start.startsWith(fechaISO));
        
                if (eventosDia.length > 0) {
                    mostrarModalEdicion(eventosDia, fechaISO);
                } else {
                    mostrarModalRegistro(fechaISO);
                }
            });
            }
    
    
            
            container.appendChild(divMes);
        }
    }
    
    let fechaSeleccionada;
    let eventoActual;
    
    // Función para mostrar modal de registro
function mostrarModalRegistro(fecha) {
    fechaSeleccionada = fecha;
    const modal = document.getElementById('modalRegistrar');
    const camposPermiso = document.getElementById('camposPermiso');
    
    // Resetear campos
    document.getElementById('fechaInicioPermiso').value = fecha;
    document.getElementById('fechaFinPermiso').value = fecha;
    document.getElementById('fechaFinPermiso').min = fecha;
    document.getElementById('motivoPermiso').value = '';
    document.getElementById('tipoEvento').value = 'asistencia';
    
    // Mostrar modal
    modal.showModal();
}

document.getElementById('btnCerrarModalEditar').addEventListener('click', () => {
    document.getElementById('modalEditar').close();
});

// También para el modal de registro
document.querySelector('#modalRegistrar .modal-close').addEventListener('click', () => {
    document.getElementById('modalRegistrar').close();
});

// Función para mostrar modal de edición
function mostrarModalEdicion(eventos, fecha) {
    const modal = document.getElementById('modalEditar');
    eventoActual = eventos[0];
    
    let contenido = '';
    const esPermiso = eventoActual.title === 'Permiso';
    
    if (esPermiso) {
        const fechaInicio = new Date(eventoActual.start);
        const fechaFin = eventoActual.end ? new Date(eventoActual.end) : fechaInicio;
        
        contenido = `
            <div class="input-group">
                <label>Periodo:</label>
                <div class="input-row">
                    <input type="date" 
                        value="${fechaInicio.toISOString().split('T')[0]}" 
                        disabled
                    >
                    <input type="date" 
                        value="${fechaFin.toISOString().split('T')[0]}" 
                        disabled
                    >
                </div>
            </div>
            <div class="input-group">
                <label>Motivo:</label>
                <input type="text" id="motivoExistente" value="${eventoActual.description || ''}" readonly>
            </div>
        `;
        
        document.getElementById('btnEditarPermiso').style.display = 'inline-block';
        document.getElementById('btnGuardarPermiso').style.display = 'none';
    } else {
        contenido = `
            <div class="input-group">
                <label>Fecha:</label>
                <input type="date" value="${fecha.split('T')[0]}" disabled>
            </div>
        `;
        
        if (eventoActual.title === 'Asistencia') {
            contenido += `
                <div class="input-group">
                    <label>Hora registrada:</label>
                    <input type="time" 
                        value="${eventoActual.start.split('T')[1]?.substring(0,5) || '00:00'}" 
                        disabled
                    >
                </div>
            `;
        }
        
        document.getElementById('btnEditarPermiso').style.display = 'none';
    }
    
    document.getElementById('detallesEvento').innerHTML = contenido;
    document.getElementById('tituloEvento').textContent = eventoActual.title;
    modal.showModal();
}

// Función para registrar nuevo evento
document.getElementById('btnRegistrarEvento').addEventListener('click', async () => {
    const tipo = document.getElementById('tipoEvento').value;
    const cedula = localStorage.getItem('cedulaActual');
    
    try {
        let response;
        let endpoint;
        let body;
        
        switch(tipo) {
            case 'asistencia':
                endpoint = `http://localhost:3000/asistencia/${cedula}`;
                body = {
                    fecha: fechaSeleccionada,
                    hora: '00:00:01'
                };
                break;
                
            case 'falta':
                endpoint = `http://localhost:3000/falta/${cedula}`;
                body = { 
                    fecha: fechaSeleccionada 
                };
                break;
                
            case 'permiso':
                endpoint = `http://localhost:3000/permiso/${cedula}`;
                body = {
                    fecha_inicio: fechaSeleccionada,
                    fecha_fin: document.getElementById('fechaFinPermiso').value,
                    motivo: document.getElementById('motivoPermiso').value
                };
                break;
        }
        
        response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });
        
        if (response.ok) {
            alert('Evento registrado correctamente');
            document.getElementById('modalRegistrar').close();
            window.location.reload();
        } else {
            const errorData = await response.json();
            alert(`Error: ${errorData.message || 'No se pudo registrar el evento'}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al registrar evento');
    }
});

// Función para editar permiso
document.getElementById('btnEditarPermiso').addEventListener('click', () => {
    const motivoInput = document.getElementById('motivoExistente');
    motivoInput.readOnly = false;
    motivoInput.focus();
    
    document.getElementById('btnEditarPermiso').style.display = 'none';
    document.getElementById('btnGuardarPermiso').style.display = 'inline-block';
});

// Función para guardar cambios en permiso
document.getElementById('btnGuardarPermiso').addEventListener('click', async () => {
    try {
        const nuevoMotivo = document.getElementById('motivoExistente').value;
        const cedula = localStorage.getItem('cedulaActual');
        
        const response = await fetch(`http://localhost:3000/permiso/${cedula}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                fecha_inicio: eventoActual.start.split('T')[0],
                motivo: nuevoMotivo
            })
        });
        
        if (response.ok) {
            alert('Permiso actualizado correctamente');
            document.getElementById('modalEditar').close();
            window.location.reload();
        } else {
            const errorData = await response.json();
            alert(`Error: ${errorData.message || 'No se pudo actualizar el permiso'}`);
        }
    } catch (error) {
        console.error('Error al actualizar permiso:', error);
        alert('Error al actualizar permiso');
    }
});

// Función para eliminar evento
document.getElementById('btnEliminarEvento').addEventListener('click', async () => {
    const confirmacion = confirm('¿Está seguro que desea eliminar este evento?');
    if (!confirmacion) return;
    
    const cedula = localStorage.getItem('cedulaActual');
    
    try {
        let endpoint;
        let body;
        
        switch(eventoActual.title) {
            case 'Asistencia':
                endpoint = `http://localhost:3000/asistencia/${cedula}`;
                body = { fecha: eventoActual.start.split('T')[0] };
                break;
            case 'Falta':
                endpoint = `http://localhost:3000/falta/${cedula}`;
                body = { fecha: eventoActual.start.split('T')[0] };
                break;
            case 'Permiso':
                endpoint = `http://localhost:3000/permiso/${cedula}`;
                body = { fecha_inicio: eventoActual.start.split('T')[0] };
                break;
        }
        
        const response = await fetch(endpoint, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });
        
        if (response.ok) {
            alert('Evento eliminado correctamente');
            document.getElementById('modalEditar').close();
            window.location.reload();
        } else {
            const errorData = await response.json();
            alert(`Error: ${errorData.message || 'No se pudo eliminar el evento'}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar evento');
    }
});

// Cambiar visibilidad de campos de permiso
document.getElementById('tipoEvento').addEventListener('change', (e) => {
    const permisoFields = document.getElementById('camposPermiso');
    permisoFields.style.display = e.target.value === 'permiso' ? 'grid' : 'none';
    
    if (e.target.value === 'permiso') {
        document.getElementById('fechaInicioPermiso').value = fechaSeleccionada;
        document.getElementById('fechaFinPermiso').min = fechaSeleccionada;
        document.getElementById('fechaFinPermiso').value = fechaSeleccionada;
    }
});
});