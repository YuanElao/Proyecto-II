const Asistencia = require("../models/asistencias");

const clients = new Set();

function notifyClients(message) {
  clients.forEach((client) => {
    client.write(`data: ${JSON.stringify(message)}\n\n`);
  });
}

const qrAssistRe = {
  sseHandler(req, res) {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    clients.add(res);

    req.on("close", () => {
      clients.delete(res);
    });
  },

  async register(req, res) {
    try {
      const { tId } = req.body;

      if (!tId) {
        console.log("Error el tId es requerido");
        return res.status(400).json({ message: "El tId es requerido" });
      }

      const asistencia = new Asistencia(tId);
      const validacion = await asistencia.validationA();

      if (!validacion.valido) {
        console.log(`Validacion fallida: ${validacion.message}`);
        return res.status(400).json({ message: validacion.message });
      }

      await asistencia.reAttendance();
      notifyClients({ message: "Un trabajador ha registrado su asistencia" });
      console.log("Asistencia registrada exitosamente");

      res.status(201).json({ message: "Asistencia registrada exitosamente" });
    } catch (error) {
      console.error("Error al registrar asistencia", error);
      res.status(500).json({ message: "Error al registrar asistencia", error });
    }
  },
};

module.exports = qrAssistRe;
