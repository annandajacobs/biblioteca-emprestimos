const { Leitor } = require('../models');
const { Op } = require('sequelize');

class LeitorController {
  async criar(req, res) {
    try {
      const { nome, email, matricula } = req.body;

      if (!nome || !email || !matricula) {
        return res.status(400).json({
          mensagem: 'Dados incompletos',
          erro: 'Nome, email e matrícula são obrigatórios'
        });
      }

      const leitor = await Leitor.create({ nome, email, matricula });

      return res.status(201).json({
        mensagem: 'Leitor cadastrado com sucesso',
        data: leitor
      });
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          mensagem: 'Erro de validação',
          erro: error.errors[0].message
        });
      }
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
          mensagem: 'Dados duplicados',
          erro: 'Email ou matrícula já cadastrados'
        });
      }
      return res.status(500).json({
        mensagem: 'Erro ao cadastrar leitor',
        erro: error.message
      });
    }
  }

  async listar(req, res) {
    try {
      const { busca } = req.query;
      const where = {};

      if (busca) {
        where[Op.or] = [
          { nome: { [Op.iLike]: `%${busca}%` } },
          { email: { [Op.iLike]: `%${busca}%` } },
          { matricula: { [Op.iLike]: `%${busca}%` } }
        ];
      }

      const leitores = await Leitor.findAll({
        where,
        order: [['nome', 'ASC']]
      });

      return res.json({
        mensagem: 'Leitores listados com sucesso',
        data: leitores,
        total: leitores.length
      });
    } catch (error) {
      return res.status(500).json({
        mensagem: 'Erro ao listar leitores',
        erro: error.message
      });
    }
  }

  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      const leitor = await Leitor.findByPk(id);

      if (!leitor) {
        return res.status(404).json({
          mensagem: 'Leitor não encontrado',
          erro: 'ID inválido ou leitor inexistente'
        });
      }

      return res.json({
        mensagem: 'Leitor encontrado',
        data: leitor
      });
    } catch (error) {
      return res.status(500).json({
        mensagem: 'Erro ao buscar leitor',
        erro: error.message
      });
    }
  }

  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { nome, email, matricula } = req.body;

      const leitor = await Leitor.findByPk(id);

      if (!leitor) {
        return res.status(404).json({
          mensagem: 'Leitor não encontrado',
          erro: 'ID inválido ou leitor inexistente'
        });
      }

      await leitor.update({ nome, email, matricula });

      return res.json({
        mensagem: 'Leitor atualizado com sucesso',
        data: leitor
      });
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          mensagem: 'Erro de validação',
          erro: error.errors[0].message
        });
      }
      return res.status(500).json({
        mensagem: 'Erro ao atualizar leitor',
        erro: error.message
      });
    }
  }

  async deletar(req, res) {
    try {
      const { id } = req.params;
      const leitor = await Leitor.findByPk(id);

      if (!leitor) {
        return res.status(404).json({
          mensagem: 'Leitor não encontrado',
          erro: 'ID inválido ou leitor inexistente'
        });
      }

      await leitor.destroy();

      return res.json({
        mensagem: 'Leitor deletado com sucesso'
      });
    } catch (error) {
      return res.status(500).json({
        mensagem: 'Erro ao deletar leitor',
        erro: error.message
      });
    }
  }
}

module.exports = new LeitorController();