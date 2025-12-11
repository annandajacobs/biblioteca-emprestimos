const API_URL = 'http://localhost:5000/api';

const api = {
  getLivros: async (busca = '', status = '') => {
    const params = new URLSearchParams();
    if (busca) params.append('busca', busca);
    if (status) params.append('status', status);
    const response = await fetch(`${API_URL}/livros?${params}`);
    return response.json();
  },
  
  getLivroById: async (id) => {
    const response = await fetch(`${API_URL}/livros/${id}`);
    return response.json();
  },
  
  createLivro: async (data) => {
    const response = await fetch(`${API_URL}/livros`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },
  
  updateLivro: async (id, data) => {
    const response = await fetch(`${API_URL}/livros/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },
  
  deleteLivro: async (id) => {
    const response = await fetch(`${API_URL}/livros/${id}`, { 
      method: 'DELETE' 
    });
    return response.json();
  },
  
  getLeitores: async (busca = '') => {
    const params = new URLSearchParams();
    if (busca) params.append('busca', busca);
    const response = await fetch(`${API_URL}/leitores?${params}`);
    return response.json();
  },
  
  getLeitorById: async (id) => {
    const response = await fetch(`${API_URL}/leitores/${id}`);
    return response.json();
  },
  
  createLeitor: async (data) => {
    const response = await fetch(`${API_URL}/leitores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },
  
  updateLeitor: async (id, data) => {
    const response = await fetch(`${API_URL}/leitores/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },
  
  deleteLeitor: async (id) => {
    const response = await fetch(`${API_URL}/leitores/${id}`, { 
      method: 'DELETE' 
    });
    return response.json();
  },
  
  getEmprestimos: async (ativos = false) => {
    const url = ativos 
      ? `${API_URL}/emprestimos/ativos` 
      : `${API_URL}/emprestimos`;
    const response = await fetch(url);
    return response.json();
  },
  
  getEmprestimoById: async (id) => {
    const response = await fetch(`${API_URL}/emprestimos/${id}`);
    return response.json();
  },
  
  createEmprestimo: async (data) => {
    const response = await fetch(`${API_URL}/emprestimos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },
  
  devolverEmprestimo: async (id) => {
    const response = await fetch(`${API_URL}/emprestimos/${id}/devolucao`, {
      method: 'PUT'
    });
    return response.json();
  }
};

export default api;