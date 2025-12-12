jest.mock('../models', () => ({
  Livro: {
    findByPk: jest.fn(),
    update: jest.fn()
  },
  Leitor: {
    findByPk: jest.fn()
  },
  Emprestimo: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
    findOne: jest.fn()
  }
}));

const emprestimoService = require('../services/emprestimoServices');
const { Livro, Leitor, Emprestimo } = require('../models');

describe('EmprestimoService - Testes Essenciais', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('deve criar um empréstimo válido', async () => {
    const livroMock = {
      id: 1,
      titulo: 'Dom Casmurro',
      status: 'disponível',
      update: jest.fn().mockResolvedValue({ id: 1, status: 'emprestado' })
    };
    
    const leitorMock = {
      id: 1,
      nome: 'João Silva'
    };
    
    Livro.findByPk.mockResolvedValue(livroMock);
    Leitor.findByPk.mockResolvedValue(leitorMock);
    
    const dataAtual = new Date('2024-01-01T10:00:00');
    jest.spyOn(global, 'Date').mockImplementation(() => dataAtual);
    
    Emprestimo.create.mockResolvedValue({
      id: 100,
      livroId: 1,
      leitorId: 1,
      dataSaida: '2024-01-01',
      dataPrevistaDevolucao: '2024-01-15',
      dataDevolucao: null
    });

    Emprestimo.findByPk.mockResolvedValue({
      id: 100,
      livroId: 1,
      leitorId: 1,
      dataSaida: '2024-01-01',
      dataPrevistaDevolucao: '2024-01-15',
      dataDevolucao: null
    });

    const resultado = await emprestimoService.criar({
      livroId: 1,
      leitorId: 1
    });

    expect(resultado.id).toBe(100);
    
    expect(livroMock.update).toHaveBeenCalledWith({ status: 'emprestado' });

    jest.restoreAllMocks();
  });

  test('deve falhar ao emprestar livro já emprestado', async () => {

    const livroMock = {
      id: 1,
      titulo: 'Livro Emprestado',
      status: 'emprestado'
    };
    
    Livro.findByPk.mockResolvedValue(livroMock);
    Leitor.findByPk.mockResolvedValue({ id: 1, nome: 'Leitor' });

    await expect(
      emprestimoService.criar({
        livroId: 1,
        leitorId: 1
      })
    ).rejects.toThrow('Livro está emprestado');
  });

  test('deve registrar devolução sem atraso', async () => {

    const emprestimoMock = {
      id: 100,
      livroId: 1,
      dataSaida: '2024-01-01',
      dataPrevistaDevolucao: '2024-01-15',
      dataDevolucao: null,
      livro: {
        id: 1,
        update: jest.fn().mockResolvedValue({ id: 1, status: 'disponível' })
      },
      update: jest.fn().mockResolvedValue({
        id: 100,
        dataDevolucao: '2024-01-15',
        diasAtraso: 0
      })
    };

    Emprestimo.findByPk.mockResolvedValue(emprestimoMock);
    Livro.findByPk.mockResolvedValue({ id: 1 });

    const dataAtual = new Date('2024-01-15T14:30:00');
    jest.spyOn(global, 'Date').mockImplementation(() => dataAtual);

    Emprestimo.findByPk.mockResolvedValueOnce(emprestimoMock)
      .mockResolvedValueOnce({
        id: 100,
        livroId: 1,
        dataSaida: '2024-01-01',
        dataPrevistaDevolucao: '2024-01-15',
        dataDevolucao: '2024-01-15',
        diasAtraso: 0,
        livro: { id: 1 }
      });

    const resultado = await emprestimoService.registrarDevolucao(100);

    expect(resultado.diasAtraso).toBe(0);
    
    expect(emprestimoMock.livro.update).toHaveBeenCalledWith(
      { status: 'disponível' }
    );
    
    jest.restoreAllMocks();
  });

  test('deve registrar devolução com atraso e calcular multa', async () => {

    const emprestimoMock = {
      id: 100,
      livroId: 1,
      dataSaida: '2024-01-01',
      dataPrevistaDevolucao: '2024-01-10',
      dataDevolucao: null,
      livro: {
        id: 1,
        update: jest.fn().mockResolvedValue({ id: 1, status: 'disponível' })
      },
      update: jest.fn().mockResolvedValue({
        id: 100,
        dataDevolucao: '2024-01-15',
        diasAtraso: 5
      })
    };

    Emprestimo.findByPk.mockResolvedValue(emprestimoMock);
    Livro.findByPk.mockResolvedValue({ id: 1 });

    const dataAtual = new Date('2024-01-15T14:30:00');
    jest.spyOn(global, 'Date').mockImplementation(() => dataAtual);

    Emprestimo.findByPk.mockResolvedValueOnce(emprestimoMock)
      .mockResolvedValueOnce({
        id: 100,
        livroId: 1,
        dataSaida: '2024-01-01',
        dataPrevistaDevolucao: '2024-01-10',
        dataDevolucao: '2024-01-15',
        diasAtraso: 5,
        livro: { id: 1 }
      });

    const resultado = await emprestimoService.registrarDevolucao(100);

    expect(resultado.diasAtraso).toBe(5);
    
    expect(emprestimoMock.livro.update).toHaveBeenCalledWith(
      { status: 'disponível' }
    );

    jest.restoreAllMocks();
  });

  test('deve falhar ao tentar devolver empréstimo já devolvido', async () => {
    const emprestimoMock = {
      id: 100,
      dataDevolucao: '2024-01-10',
      livro: { update: jest.fn() }
    };

    Emprestimo.findByPk.mockResolvedValue(emprestimoMock);

    await expect(
      emprestimoService.registrarDevolucao(100)
    ).rejects.toThrow('Empréstimo já foi devolvido');
  });

  test('deve listar empréstimos ativos corretamente', async () => {
    const emprestimosMock = [
      {
        id: 100,
        livroId: 1,
        leitorId: 1,
        dataSaida: '2024-01-01',
        dataPrevistaDevolucao: '2024-01-15',
        dataDevolucao: null,
        livro: { titulo: 'Dom Casmurro', autor: 'Machado' },
        leitor: { nome: 'João Silva', email: 'joao@email.com' }
      }
    ];

    Emprestimo.findAll.mockResolvedValue(emprestimosMock);

    const resultado = await emprestimoService.listarAtivos();

    expect(resultado).toHaveLength(1);
    expect(resultado[0].dataDevolucao).toBeNull();
  });

  test('deve filtrar empréstimos por leitor', async () => {
    const emprestimosMock = [
      {
        id: 100,
        livroId: 1,
        leitorId: 5,
        dataDevolucao: null,
        livro: { titulo: 'Livro 1' },
        leitor: { nome: 'Leitor Específico' }
      }
    ];

    Emprestimo.findAll.mockResolvedValue(emprestimosMock);

    const resultado = await emprestimoService.listarAtivos({
      leitorId: 5
    });

    expect(resultado).toHaveLength(1);
    expect(resultado[0].leitorId).toBe(5);
  });
});