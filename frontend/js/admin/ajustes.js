document.addEventListener('DOMContentLoaded', function() {
    const token = sessionStorage.getItem("token");

    if (!token) {
        alert("Debes iniciar sesión para acceder a esta página");
        window.location.href = "/frontend/views/login.html";
        return;
    }

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

    async function crearBackupManual() {
        const btn = document.getElementById('btn-crear-backup');
        const originalText = btn.innerHTML;
        
        btn.disabled = true;
        btn.innerHTML = '<i class="bx bx-loader-circle bx-spin"></i> Creando respaldo...';
        
        try {
            const response = await fetch('http://localhost:3000/admin/backup', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al crear backups');
            }
            
            const data = await response.json();
            alert(data.message || `Respaldo creado correctamente`);
            cargarBackups();
        } catch (error) {
            console.error('Error:', error);
            alert(error.message || 'Error al crear respaldo. Verifica tu conexión.');
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalText;
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
});