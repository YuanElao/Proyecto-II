const express = require ('express');
const {permissionRegister} = require ('../../controllers/admin/permissions')

const router = express.Router();

router.post('/permission', permissionRegister);


module.exports= router;