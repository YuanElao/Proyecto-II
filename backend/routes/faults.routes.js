const express = require('express');
const {faultsRegister} = require('../controllers/faults');

const router = express.Router();

router.post('/faltas', faultsRegister);

module.exports = router ;