const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const pool = require('./database/keys');
const moment = require('moment');
const cron = require('node-cron');

const { host, port, user, password, database } = pool.options;
const backupDir = path.join(__dirname, 'backups');

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Función para procesar el backup (ahora está fuera del objeto)
async function processBackupAsync() {
  try {
    const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss');
    const fileName = `backup_${timestamp}.sql`;
    const filePath = path.join(backupDir, fileName);

    const command = `pg_dump -U ${user} -h ${host} -p ${port} -d ${database} \
--format=plain \
--create \
--clean \
--if-exists \
--blobs \
--no-privileges \
--no-owner \
--verbose \
-f "${filePath}"`;

    console.log(`Iniciando respaldo en segundo plano: ${filePath}`);

    await new Promise((resolve, reject) => {
      exec(command, { env: { ...process.env, PGPASSWORD: password } }, (error, stdout, stderr) => {
        if (error) {
          console.error('Error en respaldo:', error.message);
          console.error('Stderr:', stderr);
          return reject(new Error(`Error al crear respaldo: ${error.message}`));
        }
        console.log(`Respaldo completado: ${fileName}`);
        resolve();
      });
    });

    console.log(`Respaldo ${fileName} completado exitosamente en segundo plano`);
    return { success: true, fileName };
  } catch (error) {
    console.error('Error en processBackupAsync:', error);
    return { success: false, error: error.message };
  }
}

const backupController = {
  async createBackup(req, res) {
    try {
      // Responder inmediatamente con 202 Accepted
      res.status(202).json({ 
        message: 'Solicitud de respaldo recibida, procesando en segundo plano...',
        status: 'processing'
      });

      // Procesar el backup en segundo plano
      processBackupAsync();
    } catch (error) {
      console.error('Error en createBackup:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async listBackups(req, res) {
    try {
      const files = fs.readdirSync(backupDir)
        .filter(file => file.endsWith('.sql'))
        .map(file => {
          const stats = fs.statSync(path.join(backupDir, file));
          return {
            name: file,
            size: stats.size,
            created: stats.birthtime
          };
        })
        .sort((a, b) => b.created - a.created);

      res.status(200).json(files);
    } catch (error) {
      console.error('Error en listBackups:', error);
      res.status(500).json({ message: 'Error al listar respaldos' });
    }
  },

  async downloadBackup(req, res) {
    try {
      const { filename } = req.params;
      const filePath = path.join(backupDir, filename);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'Archivo de respaldo no encontrado' });
      }

      res.setHeader('Content-Type', 'application/sql');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

    } catch (error) {
      console.error('Error en downloadBackup:', error);
      res.status(500).json({ message: 'Error al descargar respaldo' });
    }
  },

  initScheduledBackups() {
    cron.schedule('00 11 8 1 *', () => {
      console.log('[Programado] Ejecutando respaldo automático anual...');
      this.createBackup(null, null);
    }, {
      timezone: "America/Caracas"
    });

    console.log('[Sistema] Backups automáticos programados (anual el 8 de enero)');
  }
}

backupController.initScheduledBackups();
module.exports = backupController;