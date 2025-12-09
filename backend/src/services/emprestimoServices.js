const { Emprestimo, Livro, Leitor } = require('../models');

class EmprestimoService {
  async criar(dados) {
    const { livroId, leitorId, diasEmprestimo = 14 } = dados;

    const livro = await Livro.findByPk(livroId);
    if (!livro) {
      throw new Error('Livro não foi encontrado');
    }

    if (livro.status === 'emprestado') {
      throw new Error('Livro está emprestado');
    }

    const leitor = await Leitor.findByPk(leitorId);
    if (!leitor) {
      throw new Error('Leitor não foi encontrado');
    }

    const dataSaida = new Date();
    const dataPrevista = new Date(dataSaida);
    dataPrevista.setDate(dataPrevista.getDate() + diasEmprestimo);

    const emprestimo = await Emprestimo.create({
      livroId,
      leitorId,
      dataSaida: dataSaida.toISOString().split('T')[0],
      dataPrevistaDevolucao: dataPrevista.toISOString().split('T')[0]
    });

    await livro.update({ status: 'emprestado' });

    return await this.buscarPorId(emprestimo.id);
  }

  async registrarDevolucao(id) {
    const emprestimo = await Emprestimo.findByPk(id, {
      include: [{ model: Livro, as: 'livro' }]
    });

    if (!emprestimo) {
      throw new Error('Empréstimo não foi encontrado');
    }

    if (emprestimo.dataDevolucao) {
      throw new Error('Empréstimo já foi devolvido');
    }

    const dataDevolucao = new Date().toISOString().split('T')[0];
    
    await emprestimo.update({ dataDevolucao });
    await emprestimo.livro.update({ status: 'disponível' });

    return await this.buscarPorId(id);
  }

  async listarAtivos(filtros = {}) {
    const where = { dataDevolucao: null };
    
    if (filtros.leitorId) {
      where.leitorId = filtros.leitorId;
    }
    
    if (filtros.livroId) {
      where.livroId = filtros.livroId;
    }

    return await Emprestimo.findAll({
      where,
      include: [
        { model: Livro, as: 'livro' },
        { model: Leitor, as: 'leitor' }
      ],
      order: [['dataSaida', 'DESC']]
    });
  }

  async listarTodos(filtros = {}) {
    const where = {};
    
    if (filtros.leitorId) {
      where.leitorId = filtros.leitorId;
    }
    
    if (filtros.livroId) {
      where.livroId = filtros.livroId;
    }

    return await Emprestimo.findAll({
      where,
      include: [
        { model: Livro, as: 'livro' },
        { model: Leitor, as: 'leitor' }
      ],
      order: [['dataSaida', 'DESC']]
    });
  }

  async buscarPorId(id) {
    const emprestimo = await Emprestimo.findByPk(id, {
      include: [
        { model: Livro, as: 'livro' },
        { model: Leitor, as: 'leitor' }
      ]
    });

    if (!emprestimo) {
      throw new Error('Empréstimo não foi encontrado');
    }

    return emprestimo;
  }
}

module.exports = new EmprestimoService();