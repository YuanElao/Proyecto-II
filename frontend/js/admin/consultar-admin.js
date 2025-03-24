document.addEventListener('DOMContentLoaded', async () => {
    const token = sessionStorage.getItem('token');
    if (!token) {
        alert('Debes iniciar sesión');
        window.location.href = '/frontend/views/login.html';
        return;
    }

    // Consultar
    const searchInput = document.getElementById('searchInput');
    const departamentoFilter = document.getElementById('departamentoFilter');
    const tableBody = document.querySelector('#data-table tbody');

    // Cargar departamentos
    const loadDepartamentos = async () => {
        try {
            const response = await fetch('http://localhost:3000/admin/department/list', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const departamentos = await response.json();
            
            // Para el filtro
            departamentoFilter.innerHTML = `<option value="">Todos</option>${
                departamentos.map(dep => `<option value="${dep.id_departamento}">${dep.d_name}</option>`).join('')
            }`;
            
            // Para el modal
            document.getElementById('departamentoModal').innerHTML = 
                `<option value="" disabled selected>Departamento</option>${
                    departamentos.map(dep => `<option value="${dep.id_departamento}">${dep.d_name}</option>`).join('')
                }`;
            
        } catch (error) {
            console.error("Error cargando departamentos:", error);
        }
    };

    // Cargar trabajadores
    const loadWorkers = async (search = '', idDep = '') => {
        try {
            const response = await fetch(`http://localhost:3000/user/consult/worker?search=${search}&departamento=${idDep}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const trabajadores = await response.json();
            tableBody.innerHTML = trabajadores.map(t => `
                <tr>
                    <td>${t.nombre}</td>
                    <td>${t.apellido}</td>
                    <td>${t.t_cedula}</td>
                    <td>${t.departamento}</td>
                    <td>${t.cargo}</td>
                </tr>`
            ).join('');
        } catch (error) {
            console.error("Error cargando trabajadores:", error);
        }
    };

    // Eventos de búsqueda
    searchInput.addEventListener('input', (e) => loadWorkers(e.target.value, departamentoFilter.value));
    departamentoFilter.addEventListener('change', (e) => loadWorkers(searchInput.value, e.target.value));

    // Registro
    const departamentoSelect = document.getElementById('departamentoModal');
    const cargoSelect = document.getElementById('cargoModal');

    // Cargar cargos al seleccionar departamento
    departamentoSelect.addEventListener('change', async (e) => {
        try {
            const response = await fetch(`http://localhost:3000/admin/job/list/${e.target.value}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const cargos = await response.json();
            cargoSelect.innerHTML = `<option value="" disabled selected>Cargo</option>${
                cargos.map(c => `<option value="${c.id_cargo}">${c.c_name}</option>`).join('')
            }`;
        } catch (error) {
            console.error("Error cargando cargos:", error);
        }
    });

    //Enviar formulario
    document.getElementById('registroForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const trabajador = {
            tname: document.getElementById('nombreModal').value,
            tapellido: document.getElementById('apellidoModal').value,
            tcedula: document.getElementById('cedulaModal').value,
            id_departamento: departamentoSelect.value,
            id_cargo: cargoSelect.value
        };

        try {
            const response = await fetch('http://localhost:3000/user/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(trabajador)
            });

            if (response.ok) {
                alert('Trabajador registrado');
                document.getElementById('popup').hidePopover();
                loadWorkers();
            }
        } catch (error) {
            console.error("Error registrando trabajador:", error);
        }
    });

    //Logica de Faltas 
    document.querySelector('.enlace').addEventListener('click', async () => {
        const password = prompt('Al presionar este boton esta deacuerdo con registrar faltas a todos aquellos trabajadores que aun no han registrado su asistencia. Para continuar, ingrese su contraseña nuevamente:');
        if (!password) return;

        try {
            const response = await fetch('http://localhost:3000/admin/faltas/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ password })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            
            alert('Faltas registradas exitosamente');
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    });

    // Inicializar
    await loadDepartamentos();
    await loadWorkers();

});