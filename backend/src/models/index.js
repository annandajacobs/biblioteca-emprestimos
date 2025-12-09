const { sequelize } = require('../config/database');

const LivroModel = require('./Livro');
const LeitorModel = require('./Leitor');
const EmprestimoModel = require('./Emprestimo');

const Livro = LivroModel(sequelize);
const Leitor = LeitorModel(sequelize);
const Emprestimo = EmprestimoModel(sequelize);

Livro.hasMany(Emprestimo, {
  foreignKey: 'livroId',
  as: 'emprestimos',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});
Emprestimo.belongsTo(Livro, {
  foreignKey: 'livroId',
  as: 'livro'
});

Leitor.hasMany(Emprestimo, {
  foreignKey: 'leitorId',
  as: 'emprestimos',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});
Emprestimo.belongsTo(Leitor, {
  foreignKey: 'leitorId',
  as: 'leitor'
});

module.exports = { sequelize, Livro, Leitor, Emprestimo };
