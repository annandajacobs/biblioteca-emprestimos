const express = require('express');
const router = express.Router();
const emprestimoController = require('../controllers/emprestimoController');

router.post('/', emprestimoController.criar);
router.put('/:id/devolucao', emprestimoController.registrarDevolucao);
router.get('/ativos', emprestimoController.listarAtivos);
router.get('/', emprestimoController.listarTodos);
router.get('/:id', emprestimoController.buscarPorId);

module.exports = router;
