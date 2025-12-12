const { Livro } = require('../models');
const { Op } = require('sequelize');

class LivroController {
  async criar(req, res) {
    try {
      console.log('Recebendo requisição para criar livro:', req.body);
      
      const { titulo, autor, isbn } = req.body;

      if (!titulo || !autor || !isbn) {
        console.log('Validação falhou: dados incompletos');
        return res.status(400).json({
          mensagem: 'Dados incompletos',
          erro: 'Título, autor e ISBN são obrigatórios'
        });
      }

      console.log('Validação passou, criando livro...');
      const livro = await Livro.create({ titulo, autor, isbn });
      console.log('Livro criado com sucesso:', livro.toJSON());

      return res.status(201).json({
        mensagem: 'Livro cadastrado com sucesso',
        data: livro
      });
    } catch (error) {
      console.error('Erro ao criar livro:', error);
      console.error('Stack:', error.stack);
      
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          mensagem: 'Erro de validação',
          erro: error.errors[0].message
        });
      }
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
          mensagem: 'ISBN já cadastrado',
          erro: 'Este ISBN já existe no sistema'
        });
      }
      return res.status(500).json({
        mensagem: 'Erro ao cadastrar livro',
        erro: error.message
      });
    }
  }

  async listar(req, res) {
    try {
      const { busca, status } = req.query;
      const where = {};

      if (busca) {
        where[Op.or] = [
          { titulo: { [Op.iLike]: `%${busca}%` } },
          { autor: { [Op.iLike]: `%${busca}%` } },
          { isbn: { [Op.iLike]: `%${busca}%` } }
        ];
      }

      if (status) {
        where.status = status;
      }

      const livros = await Livro.findAll({
        where,
        order: [['titulo', 'ASC']]
      });

      return res.json({
        mensagem: 'Livros listados com sucesso',
        data: livros,
        total: livros.length
      });
    } catch (error) {
      return res.status(500).json({
        mensagem: 'Erro ao listar livros',
        erro: error.message
      });
    }
  }

  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      const livro = await Livro.findByPk(id);

      if (!livro) {
        return res.status(404).json({
          mensagem: 'Livro não encontrado',
          erro: 'ID inválido ou livro inexistente'
        });
      }

      return res.json({
        mensagem: 'Livro encontrado',
        data: livro
      });
    } catch (error) {
      return res.status(500).json({
        mensagem: 'Erro ao buscar livro',
        erro: error.message
      });
    }
  }

  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { titulo, autor, isbn } = req.body;

      const livro = await Livro.findByPk(id);

      if (!livro) {
        return res.status(404).json({
          mensagem: 'Livro não encontrado',
          erro: 'ID inválido ou livro inexistente'
        });
      }

      await livro.update({ titulo, autor, isbn });

      return res.json({
        mensagem: 'Livro atualizado com sucesso',
        data: livro
      });
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          mensagem: 'Erro de validação',
          erro: error.errors[0].message
        });
      }
      return res.status(500).json({
        mensagem: 'Erro ao atualizar livro',
        erro: error.message
      });
    }
  }

  async deletar(req, res) {
    try {
      const { id } = req.params;
      const livro = await Livro.findByPk(id);

      if (!livro) {
        return res.status(404).json({
          mensagem: 'Livro não encontrado',
          erro: 'ID inválido ou livro inexistente'
        });
      }

      const { Emprestimo } = require('../models');

      const totalEmprestimos = await Emprestimo.count({ where: { livroId: id } });

      if (livro.status === 'emprestado') {
        return res.status(400).json({
          mensagem: 'Não é possível excluir',
          erro: 'O livro está emprestado no momento'
        });
      }

      if (totalEmprestimos === 0) {
        await livro.destroy();
        return res.json({
          mensagem: 'Livro excluído permanentemente (sem histórico de empréstimos)'
        });
      }

      await livro.update({ status: 'descartado' });

      return res.json({
        mensagem: 'Livro marcado como descartado (mantido por ter histórico de empréstimos)'
      });

    } catch (error) {
      return res.status(500).json({
        mensagem: 'Erro ao excluir livro',
        erro: error.message
      });
    }
  }
}

module.exports = new LivroController();