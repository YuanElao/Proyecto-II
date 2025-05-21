const Cuenta = require('../../models/cuentas');

const account = {

    // Registrar

    async register(req, res) {
        const { c_name, c_password, c_rol, c_root = 0 } = req.body;
        const isRootAdmin = req.user?.root === 1;
        const isAdmin = req.user?.role === 'admin';

        try {
            if (!isRootAdmin && (c_rol === "admin" || c_root === 1)) {
                throw new Error ("Acceso denegado")
            }



            // Validar Campos Vacios

            if (!c_name || !c_password || !c_rol) {
                return res.status(400).json({message: "Todos los campos son obligatorios"})
            }

            const nuevaCuenta = new Cuenta(c_name, c_password, c_rol, c_root);
            await nuevaCuenta.createAccount();
            res.status(201).json({ message: "Cuenta creada exitosamente" });

        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // Actualizar

    async update(req, res) {
        const { c_id } = req.params;
        const { c_name, c_password, c_rol } = req.body;

        try {
            const cuenta = await Cuenta.getAccount(c_id);
            const isRootAdmin = req.user?.root === 1;

            // Validar permisos
            if (!isRootAdmin && (cuenta.c_rol === 'admin' || c_rol === "admin" || c_root === 1)) {
                throw new Error("No puedes asignar este rol");
            }

            // Actualizar propiedades
            cuenta.c_name = c_name || cuenta.c_name;
            cuenta.c_password = c_password || cuenta.c_password;
            cuenta.c_rol = c_rol || cuenta.c_rol;

            await cuenta.updateAccount();
            res.status(200).json({ message: "Cuenta actualizada" });

        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // Eliminar

    async delete(req, res) {
        try {
            const cuenta = await Cuenta.getAccount(req.params.c_id);
            const isRootAdmin = req.user?.root === 1;

            if (!isRootAdmin && cuenta.c_rol === 'admin') {
                throw new Error("No puedes eliminar esta cuenta");
            }
            await cuenta.deleteAccount();
            res.status(200).json({ message: "Cuenta eliminada" });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // Listar Cuentas

    async list(req, res) {
        try {
            const isRootAdmin = req.user?.root === 1;
            const cuentas = await Cuenta.listAccounts(isRootAdmin);
            res.status(200).json(cuentas);
        } catch (error) {
            res.status(500).json({ message: "Error al listar cuentas" });
        }
    }
};

module.exports = account;