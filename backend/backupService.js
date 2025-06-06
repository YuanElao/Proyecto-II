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

const backupController = {
  async createBackup(req, res) {
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

      console.log(`Iniciando respaldo: ${filePath}`);

      exec(command, { env: { ...process.env, PGPASSWORD: password } }, (error) => {
        if (error) {
          console.error('Error en respaldo:', error.message);
          return res.status(400).json({ message: `Error al crear respaldo: ${error.message}` });
        }

        console.log(`Respaldo completado: ${fileName}`);
        res.status(201).json({ message: `Respaldo creado exitosamente`, data: {name: fileName} });
      });

    } catch (error) {
      console.error('Error en createBackup:', error);
      res.status(400).json({ message: `Error al iniciar el respaldo: ${error.message}` });
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