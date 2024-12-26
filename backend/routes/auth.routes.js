const express = require ('express');
const authentication = require ('../controllers/auth');

const router = express.Router();

router.post('/login', authentication.login)
router.get('/test', (req, res) => {
    res.status(200).json({ message: 'Servidor Funcionando'});
});


module.exports= router;