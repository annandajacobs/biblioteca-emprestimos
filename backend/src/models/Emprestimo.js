const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Emprestimo = sequelize.define('Emprestimo', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    livroId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    leitorId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    dataSaida: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      validate: {
        isDate: { msg: 'Data de saída inválida' },
        notEmpty: { msg: 'Data de saída é obrigatória' }
      }
    },
    dataPrevistaDevolucao: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: { msg: 'Data prevista inválida' },
        isAfterSaida(value) {
          if (new Date(value) <= new Date(this.dataSaida)) {
            throw new Error('Data prevista deve ser após data de saída');
          }
        }
      }
    },
    dataDevolucao: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      validate: {
        isDate: { msg: 'Data de devolução inválida' }
      }
    },
    diasAtraso: {
      type: DataTypes.VIRTUAL,
      get() {
        const dataFim = this.dataDevolucao
          ? new Date(this.dataDevolucao)
          : new Date();

        const prevista = new Date(this.dataPrevistaDevolucao);

        if (dataFim <= prevista) return 0;

        const diffMs = dataFim - prevista;
        return Math.floor(diffMs / (1000 * 60 * 60 * 24));
      }
    }
  });

  return Emprestimo;
};
