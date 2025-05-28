const express = require("express"); //se importa la libreria de express
const account = require("../../controllers/admin/accounts") // se iimporta el controlador en este caso cuentas
const authenticateJWT = require('../../authmiddle'); // se importa l middlewware de autenticacion

const router = express.Router(); //se crea una iinstancia de enrutador, esta es una mini aplicacion que manea sus propias rutasy middles


//aqui se establecen los endpoints a los que el frontend hhara la peticion

router.get("/account/list", authenticateJWT("admin"), account.list);

router.post("/account/user/add", authenticateJWT("admin"), account.register);
router.put("/account/user/update/:c_id", authenticateJWT("admin"), account.update);
router.delete("/account/user/delete/:c_id", authenticateJWT("admin"), account.delete);

router.post("/account/admin/add", authenticateJWT("admin", 1), account.register);
router.put("/account/admin/update/:c_id", authenticateJWT("admin", 1), account.update);
router.delete("/account/admin/delete/:c_id", authenticateJWT("admin", 1), account.delete);

module.exports = router ;