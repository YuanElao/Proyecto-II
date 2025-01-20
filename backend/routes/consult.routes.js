const express = require ('express');
const consult = require ('../controllers/consult')

const router = express.Router();

router.get('/consulta', consult.getT);


module.exports = router ;