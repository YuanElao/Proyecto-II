document.addEventListener('DOMContentLoaded', function() {
    const token = sessionStorage.getItem("token");

    if (!token) {
        alert("Debes iniciar sesión para acceder a esta página");
        window.location.href = "/frontend/views/login.html";
        return;
    }

    const itemsPorPaginaBackups = 5;
    let paginaActualBackups = 1;
    let todosBackups = [];

    // Cargar backups al iniciar
    cargarBackups();

    // Evento para crear backup manual
    document.getElementById('btn-crear-backup').addEventListener('click', crearBackupManual);

    async function cargarBackups() {
        try {
            const response = await fetch('http://localhost:3000/admin/backups', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al cargar backups');
            }
            
            const result = await response.json();
            mostrarBackups(result.data || result);
        } catch (error) {
            console.error('Error:', error);
            alert(error.message || 'Error al cargar backups');
        }
    }

    function mostrarBackups(backups) {
        todosBackups = backups || [];
        const backupsPagina = paginarBackups(todosBackups, paginaActualBackups, itemsPorPaginaBackups);
        renderBackups(backupsPagina);
        actualizarControlesPaginacionBackups();
    }

    function paginarBackups(array, pagina, itemsPorPagina) {
        const inicio = (pagina - 1) * itemsPorPagina;
        const fin = inicio + itemsPorPagina;
        return array.slice(inicio, fin);
    }

    function renderBackups(backups) {
        const tbody = document.getElementById('lista-backups');
        tbody.innerHTML = '';

        if (!backups || backups.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No hay backups disponibles</td></tr>';
            return;
        }

        backups.forEach(backup => {
            const tr = document.createElement('tr');
            
            const sizeMB = backup.size ? (backup.size / (1024 * 1024)).toFixed(2) : 'N/A';
            const fecha = backup.created ? new Date(backup.created).toLocaleString() : 'Fecha no disponible';
            
            tr.innerHTML = `
                <td>${backup.name || 'Nombre no disponible'}</td>
                <td>${sizeMB} MB</td>
                <td>${fecha}</td>
                <td>
                    <button class="btn-descargar" data-filename="${backup.name}">
                        <i class="bx bxs-download"></i> Descargar
                    </button>
                </td>
            `;
            
            tbody.appendChild(tr);
        });

        document.querySelectorAll('.btn-descargar').forEach(btn => {
            btn.addEventListener('click', function() {
                const filename = this.getAttribute('data-filename');
                if (filename) {
                    descargarBackup(filename);
                } else {
                    alert('Nombre de archivo no válido');
                }
            });
        });
    }

    function actualizarControlesPaginacionBackups() {
        const totalPaginas = Math.ceil(todosBackups.length / itemsPorPaginaBackups);
        const paginaActualElement = document.querySelector('.pagina-actual[data-tabla="backups"]');
        const btnAnterior = document.querySelector('.paginacion-btn[data-tabla="backups"][data-accion="anterior"]');
        const btnSiguiente = document.querySelector('.paginacion-btn[data-tabla="backups"][data-accion="siguiente"]');

        if (paginaActualElement) paginaActualElement.textContent = paginaActualBackups;
        if (btnAnterior) btnAnterior.disabled = paginaActualBackups <= 1;
        if (btnSiguiente) btnSiguiente.disabled = paginaActualBackups >= totalPaginas;
    }

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.paginacion-btn')) return;

        const boton = e.target.closest('.paginacion-btn');
        const tabla = boton.dataset.tabla;
        const accion = boton.dataset.accion;

        if (tabla === 'backups') {
            if (accion === 'anterior' && paginaActualBackups > 1) {
                paginaActualBackups--;
            } else if (accion === 'siguiente' && paginaActualBackups < Math.ceil(todosBackups.length / itemsPorPaginaBackups)) {
                paginaActualBackups++;
            }
            renderBackups(paginarBackups(todosBackups, paginaActualBackups, itemsPorPaginaBackups));
            actualizarControlesPaginacionBackups();
        }
    });

    async function crearBackupManual() {
    const btn = document.getElementById('btn-crear-backup');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="bx bx-loader-circle bx-spin"></i> Generando respaldo...';
    
    let newBackupFound = false;
    let checkInterval;

    try {
        // 1. Crear el backup
        const response = await fetch('http://localhost:3000/admin/backup', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al crear backup');
        }
        
        const data = await response.json();

        if(response.ok) {
                alert(data.message || `Respaldo creado correctamente`);
                
            }
        
        // 2. Actualizar texto para indicar que estamos verificando
        btn.innerHTML = '<i class="bx bx-loader-circle bx-spin"></i> Verificando nuevo backup...';
        
        // 3. Obtener lista actual de backups para comparar
        const currentBackups = todosBackups.map(b => b.name);
        let checks = 0;
        const maxChecks = 30; // Máximo 30 segundos de verificación
        
        // 4. Verificar periódicamente si aparece el nuevo backup
        await new Promise((resolve) => {
            checkInterval = setInterval(async () => {
                checks++;
                try {
                    const newResponse = await fetch('http://localhost:3000/admin/backups', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    
                    if (newResponse.ok) {
                        const newData = await newResponse.json();
                        const newBackups = newData.data || newData;
                        
                        // Comprobar si hay un backup nuevo
                        const newBackup = newBackups.find(backup => 
                            !currentBackups.includes(backup.name)
                        );
                        
                        if (newBackup) {
                            newBackupFound = true;
                            clearInterval(checkInterval);
                            resolve();
                        } else if (checks >= maxChecks) {
                            clearInterval(checkInterval);
                            resolve();
                        }
                    }
                } catch (e) {
                    console.error('Error verificando backups:', e);
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 1000);
        });

        // 5. Mostrar resultado al usuario
        if (newBackupFound) {
            btn.innerHTML = '<i class="bx bxs-check-circle"></i> ¡Backup creado!';
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }, 2000);
            cargarBackups(); // Actualizar la lista
        } else {
            btn.innerHTML = '<i class="bx bxs-error-circle"></i> No se detectó el backup';
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }, 2000);
            // Recargar como último recurso
            setTimeout(() => location.reload(), 2500);
        }

    } catch (error) {
        console.error('Error:', error);
        btn.innerHTML = '<i class="bx bxs-error-circle"></i> Error';
        alert(error.message || 'Error al crear respaldo. Verifica tu conexión.');
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }, 2000);
        
        // Limpiar intervalo si hubo error
        if (checkInterval) clearInterval(checkInterval);
    }
}

    async function descargarBackup(filename) {
        if (!filename || typeof filename !== 'string') {
            alert('Nombre de archivo no válido');
            return;
        }
        
        try {
            const response = await fetch(`http://localhost:3000/admin/backup/${encodeURIComponent(filename)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('No se pudo descargar el backup');
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error:', error);
            alert(error.message || 'Error al descargar backup');
        }
    }

    // Función auxiliar delay si no está definida
});