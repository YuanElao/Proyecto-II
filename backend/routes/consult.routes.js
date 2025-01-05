const express = require ('express');
const consult = require ('../controllers/consult')

const router = express.Router();

router.get('/consult', consult.getT);


module.exports = router ;