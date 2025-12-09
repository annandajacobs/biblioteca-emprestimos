const express = require('express');
const router = express.Router();
const leitorController = require('../controllers/leitorController');

router.get('/', leitorController.listar);
router.get('/:id', leitorController.buscarPorId);
router.post('/', leitorController.criar);
router.put('/:id', leitorController.atualizar);
router.delete('/:id', leitorController.deletar);

module.exports = router;