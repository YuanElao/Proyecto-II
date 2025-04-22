document.addEventListener('DOMContentLoaded', async () => {
    
    const token = sessionStorage.getItem('token')
    
    const cedula = localStorage.getItem('cedulaActual')
    

    if (!token) {
        alert('Error: Debe iniciar sesion para acceder a el sistema');
        window.location.href = '../login.html';
        return;
    }

    if (!cedula) {
        alert('Error: No se especificó la cédula');
        window.location.href = 'Consultar.html';
        return;
    }

    const nombreInput = document.getElementById('nombre');
    const apellidoInput = document.getElementById('apellido');
    const cedulaInput = document.getElementById('cedula');
    const departamentoSelect = document.getElementById('departamentoSelect');
    const cargoSelect = document.getElementById('cargoSelect');


    try {
        

        // Cargar departamentos
        const loadDepartamentos = async () => {
        try {
            const response = await fetch('http://localhost:3000/admin/department/list', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }


            });

            if (response.status === 401 || response.status === 403) {
                sessionStorage.removeItem('token');
                window.location.href = '/frontend/views/login.html';
                return;
            }

            const departamentos = await response.json();
            departamentoSelect.innerHTML = departamentos.map(dep => 
                `<option value="${dep.id_departamento}">${dep.d_name}</option>`
            ).join('');
        } catch (error) {
            console.error('Error:', error);
        }
    };

        // Cargar cargos por departamento
        const loadCargos = async (idDep) => {
        try {
            const response = await fetch(`http://localhost:3000/admin/job/list/${idDep}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 401 || response.status === 403) {
                sessionStorage.removeItem('token');
                window.location.href = '/frontend/views/login.html';
                return;
            }

            const cargos = await response.json();
            cargoSelect.innerHTML = cargos.map(c => 
                `<option value="${c.id_cargo}">${c.c_name}</option>`
            ).join('');

            cargoSelect.disabled = false;
        } catch (error) {
            console.error('Error:', error);
        }
    };

        // Obtener datos del trabajador
        
        const loadWorkerData = async () => {
            try {
                const response = await fetch(`http://localhost:3000/user/profile/${cedula}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.status === 401 || response.status === 403) {
                    sessionStorage.removeItem('token');
                    window.location.href = '/frontend/views/login.html';
                    return;
                }

                const data = await response.json();
                
                nombreInput.value = data.trabajador.nombre;
                apellidoInput.value = data.trabajador.apellido;
                cedulaInput.value = data.trabajador.cedula;
                
                // Cargar departamento y cargo
                await loadDepartamentos();
                departamentoSelect.value = data.trabajador.departamento_id;
                await loadCargos(departamentoSelect.value);
                cargoSelect.value = data.trabajador.cargo_id;
                
            } catch (error) {
                console.error('Error:', error);
            }
        };

        localStorage.removeItem('cedulaActual');

        // Eventos
    departamentoSelect.addEventListener('change', async (e) => {
        await loadCargos(e.target.value);
    });

    document.getElementById('btnEditar').addEventListener('click', () => {
        nombreInput.readOnly = false;
        apellidoInput.readOnly = false;
        cedulaInput.readOnly = false;
        departamentoSelect.disabled = false;
        document.getElementById('btnGuardar').style.display = 'inline-block';
        document.getElementById('btnCancelar').style.display = 'inline-block';
    });

    document.getElementById('btnGuardar').addEventListener('click', async () => {
        const confirmacion = prompt('¿Está seguro de guardar los cambios? Escriba "CONFIRMAR" para continuar');
        if (confirmacion?.toUpperCase() !== "CONFIRMAR") return;

        const data = {
            nombre: nombreInput.value,
            apellido: apellidoInput.value,
            nuevaCedula: cedulaInput.value,
            id_departamento: departamentoSelect.value,
            id_cargo: cargoSelect.value
        };
        
        try {
            const response = await fetch(`http://localhost:3000/admin/profile/${cedula}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 
                            'Authorization': `Bearer ${token}` },
                body: JSON.stringify(data)
            });
            
            if (response.status === 401 || response.status === 403) {
                sessionStorage.removeItem('token');
                window.location.href = '/frontend/views/login.html';
                return;
            }

            if (response.ok) {
                alert('¡Datos actualizados!');
                localStorage.setItem('cedulaTrabajador', data.nuevaCedula); // Actualizar cédula
                window.location.reload();
            }
        } catch (error) {
            alert('Error al guardar');
        }
    });

    document.getElementById('btnEliminar').addEventListener('click', async () => {
        const confirmacion = prompt('¿Eliminar permanentemente al trabajador? Escriba "ELIMINAR" para confirmar');
        if (confirmacion?.toUpperCase() !== "ELIMINAR") return;

        try {
            const response = await fetch(`http://localhost:3000/admin/profile/${cedula}`, { 
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.status === 401 || response.status === 403) {
                sessionStorage.removeItem('token');
                window.location.href = '/frontend/views/login.html';
                return;
            }
             
            if (response.ok) {
                alert('¡Trabajador eliminado!');
                window.location.href = 'consultar.html';
            }
        } catch (error) {
            alert('Error al eliminar');
        }
    });

    await loadWorkerData();

        const qrElement = document.querySelector('.codigoqr');
        qrElement.dataset.qrBackend = data.trabajador.qr_code;

        // Llenar contadores
        document.getElementById('countA').textContent = `Asistencias: ${data.contadores.asistencias}`;
        document.getElementById('countP').textContent = `Permisos: ${data.contadores.permisos}`;
        document.getElementById('countF').textContent = `Faltas: ${data.contadores.faltas}`;

        const calendario = data.calendario;
        generarCalendarioAnual(calendario);
        
        // Agrega esta función al final del archivo:
        function generarCalendarioAnual(eventos) {
            const container = document.getElementById('calendarContainer');
            const añoActual = new Date().getFullYear();
            
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
                
                // Rellenar días
                for (let i = 1; i <= diasEnMes; i++) {
                    const dia = new Date(añoActual, mes, i);
                    const fechaISO = dia.toISOString().split('T')[0];
                    
                    const diaElement = document.createElement('div');
                    diaElement.className = 'dia';
                    diaElement.textContent = i;
                    
                    // Buscar eventos para este día
                    const eventosDia = eventos.filter(e => e.start.startsWith(fechaISO));
                    if (eventosDia.length > 0) {
                        diaElement.classList.add('evento');
                        diaElement.style.color = eventosDia[0].color;
                        diaElement.title = eventosDia.map(e => `${e.title}: ${e.description || ''}`).join('\n');
                    }
                    
                    diasDiv.appendChild(diaElement);
                }
                
                container.appendChild(divMes);
            }
        }

        // Configurar botón de imprimir
        document.getElementById('qr').addEventListener('click', imprimirCredencial);

    } catch (error) {
        console.error('Error al cargar el perfil:', error);
        alert('Error al cargar los datos del trabajador');
    }
});

function imprimirCredencial() {
    const nombre = document.getElementById('nombre').value;
    const apellido = document.getElementById('apellido').value;
    const cedula = document.getElementById('cedula').value;
    const departamento = document.getElementById('departamento').value
    const cargo = document.getElementById('cargo').value

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