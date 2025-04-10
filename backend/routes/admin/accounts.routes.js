const express = require("express");
const account = require("../../controllers/admin/accounts")
const authenticateJWT = require('../../authmiddle');

const router = express.Router();

router.get("/account/list", authenticateJWT("admin"), account.list);

router.post("/account/user/add", authenticateJWT("admin", 0), account.register);
router.put("/account/user/update/:c_id", authenticateJWT("admin", 0), account.update);
router.delete("/account/user/delete/:c_id", authenticateJWT("admin", 0), account.delete);

router.post("/account/admin/add", authenticateJWT("admin", 1), account.register);
router.put("/account/update/:c_id", authenticateJWT("admin", 1), account.update);
router.delete("/account/delete/:c_id", authenticateJWT("admin", 1), account.delete);

module.exports = router ;