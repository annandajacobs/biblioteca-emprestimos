const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Livro = sequelize.define('Livro', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    titulo: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Título é obrigatório' },
        len: { args: [3, 200], msg: 'Título deve ter entre 3 e 200 caracteres' }
      }
    },
    autor: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Autor é obrigatório' }
      }
    },
    isbn: {
      type: DataTypes.STRING(17),
      allowNull: false,
      unique: { msg: 'ISBN já cadastrado' },
      validate: {
        notEmpty: { msg: 'ISBN é obrigatório' },
        isValidISBN(value) {
          const isbnRegex = /^(?:\d{10}|\d{13}|\d{3}-\d{10})$/;
          if (!isbnRegex.test(value.replace(/-/g, ''))) {
            throw new Error('ISBN inválido');
          }
        }
      }
    },
    status: {
      type: DataTypes.ENUM('disponível', 'emprestado', 'descartado'),
      defaultValue: 'disponível',
      validate: {
        isIn: {
          args: [['disponível', 'emprestado', 'descartado']],
          msg: 'Status deve ser disponível ou emprestado'
        }
      }
    }
  });

  return Livro;
};
