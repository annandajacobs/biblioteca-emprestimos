const emprestimoService = require('../services/emprestimoServices');

class EmprestimoController {
  async criar(req, res) {
    try {
      const { livroId, leitorId, diasEmprestimo } = req.body;

      if (!livroId || !leitorId) {
        return res.status(400).json({
          mensagem: 'Dados incompletos',
          erro: 'Livro e leitor são obrigatórios'
        });
      }

      const emprestimo = await emprestimoService.criar({
        livroId: parseInt(livroId),
        leitorId: parseInt(leitorId),
        diasEmprestimo: diasEmprestimo ? parseInt(diasEmprestimo) : 14
      });

      return res.status(201).json({
        mensagem: 'Empréstimo registrado com sucesso',
        data: emprestimo
      });
    } catch (error) {
      const status = error.message.includes('não encontrado') ? 404 :
                     error.message.includes('já está emprestado') ? 409 : 500;
      
      return res.status(status).json({
        mensagem: 'Erro ao registrar empréstimo',
        erro: error.message
      });
    }
  }

  async registrarDevolucao(req, res) {
    try {
      const { id } = req.params;

      const emprestimo = await emprestimoService.registrarDevolucao(parseInt(id));

      const temMulta = emprestimo.diasAtraso > 0;
      const mensagem = temMulta 
        ? `Devolução registrada com ${emprestimo.diasAtraso} dia(s) de atraso`
        : 'Devolução registrada com sucesso';

      return res.json({
        mensagem,
        data: emprestimo,
        alerta: temMulta ? `Multa por atraso: ${emprestimo.diasAtraso} dias` : null
      });
    } catch (error) {
      const status = error.message.includes('não encontrado') ? 404 :
                     error.message.includes('já foi devolvido') ? 409 : 500;
      
      return res.status(status).json({
        mensagem: 'Erro ao registrar devolução',
        erro: error.message
      });
    }
  }

  async listarAtivos(req, res) {
    try {
      const { leitorId, livroId } = req.query;
      
      const emprestimos = await emprestimoService.listarAtivos({
        leitorId: leitorId ? parseInt(leitorId) : undefined,
        livroId: livroId ? parseInt(livroId) : undefined
      });

      return res.json({
        mensagem: 'Empréstimos ativos listados com sucesso',
        data: emprestimos,
        total: emprestimos.length
      });
    } catch (error) {
      return res.status(500).json({
        mensagem: 'Erro ao listar empréstimos',
        erro: error.message
      });
    }
  }

  async listarTodos(req, res) {
    try {
      const { leitorId, livroId } = req.query;
      
      const emprestimos = await emprestimoService.listarTodos({
        leitorId: leitorId ? parseInt(leitorId) : undefined,
        livroId: livroId ? parseInt(livroId) : undefined
      });

      return res.json({
        mensagem: 'Empréstimos listados com sucesso',
        data: emprestimos,
        total: emprestimos.length
      });
    } catch (error) {
      return res.status(500).json({
        mensagem: 'Erro ao listar empréstimos',
        erro: error.message
      });
    }
  }

  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      const emprestimo = await emprestimoService.buscarPorId(parseInt(id));

      return res.json({
        mensagem: 'Empréstimo encontrado',
        data: emprestimo
      });
    } catch (error) {
      return res.status(404).json({
        mensagem: 'Empréstimo não encontrado',
        erro: error.message
      });
    }
  }
}

module.exports = new EmprestimoController();