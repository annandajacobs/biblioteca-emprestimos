const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Leitor = sequelize.define('Leitor', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nome: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Nome é obrigatório' },
        len: { args: [3, 150], msg: 'Nome deve ter entre 3 e 150 caracteres' }
      }
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: { msg: 'Email já cadastrado' },
      validate: {
        isEmail: { msg: 'Email inválido' },
        notEmpty: { msg: 'Email é obrigatório' }
      }
    },
    matricula: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: { msg: 'Matrícula já cadastrada' },
      validate: {
        notEmpty: { msg: 'Matrícula é obrigatória' }
      }
    }
  });

  return Leitor;
};
