const pool = require('../database/keys');

class Cuenta {
    constructor(c_name, c_password, c_rol, c_root = 0, c_id = null) {
        this.c_id = c_id;
        this.c_name = c_name;
        this.c_password = c_password;
        this.c_rol = c_rol;
        this.c_root = c_root;

        // Bindear métodos
        
        this.createAccount = this.createAccount.bind(this);
        this.updateAccount = this.updateAccount.bind(this);
        this.deleteAccount = this.deleteAccount.bind(this);
    }

    // Crear Cuenta

    async createAccount() {

        // Validar nombre único

        const exists = await pool.query("SELECT c_id FROM login WHERE c_name = $1", [this.c_name]);
        if (exists.rows.length > 0) throw new Error("El nombre de usuario ya existe");

        const result = await pool.query("INSERT INTO login (c_name, c_password, c_rol, c_root) VALUES ($1, $2, $3, $4) RETURNING c_id",[this.c_name, this.c_password, this.c_rol, this.c_root]);
        this.c_id = result.rows[0].c_id;
    }

    // Actualizar Cuenta
    async updateAccount() {

        if (!this.c_id) throw new Error("Cuenta no encontrada");
        
        // Validar nombre único excluyendo el actual
        const exists = await pool.query("SELECT c_id FROM login WHERE c_name = $1 AND c_id != $2",[this.c_name, this.c_id]);
        if (exists.rows.length > 0) throw new Error("Nombre de usuario en uso");

        await pool.query("UPDATE login SET c_name = $1, c_password = $2, c_rol = $3 WHERE c_id = $4",[this.c_name, this.c_password, this.c_rol, this.c_id]);
    }

    // ELIMINAR CUENTA
    async deleteAccount() {
        if (!this.c_id) throw new Error("Cuenta no encontrada");
        await pool.query("DELETE FROM login WHERE c_id = $1", [this.c_id]);
    }

    // Obtener Cuentas
    static async getAccount(c_id) {
        const result = await pool.query("SELECT * FROM login WHERE c_id = $1", [c_id]);
        if (result.rows.length === 0) throw new Error("Cuenta no encontrada");
        const acc = result.rows[0];
        return new Cuenta(acc.c_name, acc.c_password, acc.c_rol, acc.c_root, acc.c_id);
    }

    // Listar Cuentas
    static async listAccounts(isRoot) {
        let query = `SELECT c_id, c_name, c_password, c_rol, c_root FROM login `;

        if (isRoot) {

            query += "WHERE (c_rol = 'user' OR (c_rol = 'admin' AND c_root = 0))";

        } else {
            
            query += "WHERE c_rol = 'user'";
        }
        const result = await pool.query(query + "ORDER BY c_name");
        return result.rows;
    }
}

module.exports = Cuenta;