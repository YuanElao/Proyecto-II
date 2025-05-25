const Permiso = require("../../models/permisos");

const permission = {
  async register(req, res) {
    const { tCedula, fecha_inicio, fecha_fin, motivo } = req.body;

    try {
      if (!tCedula || !fecha_inicio || !fecha_fin || !motivo) {
        return res
          .status(400)
          .json({ message: "Todos los campos son obligatorios" });
      }

      if (new Date(fecha_inicio) > new Date(fecha_fin)) {
        return res
          .status(400)
          .json({
            message: "La fecha inicial no puede ser mayor que la final",
          });
      }

      const permiso = new Permiso(tCedula, fecha_inicio, fecha_fin, motivo);
      const id_trabajador = await permiso.validationP(); // todo se valida aquí
      await permiso.rePermission(id_trabajador);

      res.status(201).json({ message: "Permiso registrado correctamente" });
    } catch (error) {
      console.error("Error al registrar permiso:", error);
      res.status(400).json({ message: error.message });
    }
  },
};

module.exports = permission;
