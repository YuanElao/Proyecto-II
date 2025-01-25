const express = require ('express');
const {getW, workerList} = require ('../controllers/consult')

const router = express.Router();

router.get('/consult', getW);
router.get('/list', workerList);

module.exports = router ;