const express = require('express');
const router = express.Router();

const livrosRoutes = require('./livroRoutes');
const leitoresRoutes = require('./leitorRoutes');
const emprestimosRoutes = require('./emprestimoRoutes');

router.use('/livros', livrosRoutes);
router.use('/leitores', leitoresRoutes);
router.use('/emprestimos', emprestimosRoutes);

module.exports = router;