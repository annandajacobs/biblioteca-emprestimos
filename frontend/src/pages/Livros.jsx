import { useState, useEffect } from "react"
import { BookOpen, Plus, Search, Edit2, Trash2, Filter } from "lucide-react"
import api from "../services/api"

function Livros() {
  const [livros, setLivros] = useState([])
  const [busca, setBusca] = useState("")
  const [status, setStatus] = useState("")
  const [formData, setFormData] = useState({ titulo: "", autor: "", isbn: "" })
  const [editando, setEditando] = useState(null)
  const [mensagem, setMensagem] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    carregarLivros()
  }, [busca, status])

  const carregarLivros = async () => {
    try {
      setLoading(true)
      const data = await api.getLivros(busca, status)
      setLivros(data.data || [])
    } catch (error) {
      mostrarMensagem("Erro ao carregar livros", "erro")
    } finally {
      setLoading(false)
    }
  }

  const mostrarMensagem = (texto, tipo = "sucesso") => {
    setMensagem({ texto, tipo })
    setTimeout(() => setMensagem(null), 3000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      if (editando) {
        await api.updateLivro(editando, formData)
        mostrarMensagem("Livro atualizado com sucesso!")
      } else {
        await api.createLivro(formData)
        mostrarMensagem("Livro cadastrado com sucesso!")
      }
      setFormData({ titulo: "", autor: "", isbn: "" })
      setEditando(null)
      carregarLivros()
    } catch (error) {
      mostrarMensagem("Erro ao salvar livro", "erro")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (livro) => {
    setFormData({ titulo: livro.titulo, autor: livro.autor, isbn: livro.isbn })
    setEditando(livro.id)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleDelete = async (id) => {
    if (window.confirm("Deseja realmente deletar este livro?")) {
      try {
        setLoading(true)
        const response = await api.deleteLivro(id)
        
        // Verificar se houve erro na resposta
        if (response.erro) {
          // Se o livro foi marcado como desativado
          if (response.mensagem && response.mensagem.includes('desativado')) {
            mostrarMensagem(response.mensagem, 'alerta')
            if (response.alerta) {
              console.warn(response.alerta)
            }
          } else {
            // Outro tipo de erro
            mostrarMensagem(response.mensagem || response.erro, 'erro')
          }
        } else {
          // Sucesso na deleção
          mostrarMensagem(response.mensagem || "Livro deletado com sucesso!")
        }
        
        carregarLivros()
      } catch (error) {
        console.error('Erro ao deletar livro:', error)
        mostrarMensagem(
          error.response?.data?.erro || 
          error.message || 
          "Erro ao deletar livro", 
          "erro"
        )
      } finally {
        setLoading(false)
      }
    }
  }

  const handleCancel = () => {
    setEditando(null)
    setFormData({ titulo: "", autor: "", isbn: "" })
  }

  return (
    <div className="container">

      <div className="mensagem-container">
      {mensagem && (
        <div className={`mensagem ${mensagem.tipo}`}>
          {mensagem.texto}
        </div>
      )}
      </div>

      <h2>
        <BookOpen size={32} />
        Gerenciar Livros
      </h2>

      <div className="card">
        <h3>
          {editando ? <Edit2 size={20} /> : <Plus size={20} />}
          {editando ? "Editar Livro" : "Cadastrar Novo Livro"}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Título *</label>
            <input
              type="text"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              placeholder="Digite o título do livro"
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Autor *</label>
            <input
              type="text"
              value={formData.autor}
              onChange={(e) => setFormData({ ...formData, autor: e.target.value })}
              placeholder="Digite o nome do autor"
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>ISBN *</label>
            <input
              type="text"
              value={formData.isbn}
              onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
              placeholder="Ex: 9780132350884"
              required
              disabled={loading}
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Processando..." : editando ? "Atualizar" : "Cadastrar"}
            </button>
            {editando && (
              <button type="button" className="btn-secondary" onClick={handleCancel} disabled={loading}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <h3>
          <Filter size={20} />
          Filtros
        </h3>
        <div className="filtros">
          <div style={{ position: "relative" }}>
            <Search
              size={18}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--gray-400)",
              }}
            />
            <input
              type="text"
              placeholder="Buscar por título, autor ou ISBN..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="input-busca"
              style={{ paddingLeft: "40px" }}
            />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Todos os status</option>
            <option value="disponível">Disponível</option>
            <option value="emprestado">Emprestado</option>
            <option value="descartado">Descartado</option>
          </select>
        </div>
      </div>

      <div className="card">
        <h3>
          <BookOpen size={20} />
          Lista de Livros ({livros.length})
        </h3>
        {loading ? (
          <div className="empty-state">
            <p>Carregando...</p>
          </div>
        ) : livros.length === 0 ? (
          <div className="empty-state">
            <BookOpen size={48} />
            <p>Nenhum livro encontrado.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Título</th>
                  <th>Autor</th>
                  <th>ISBN</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {livros.map((livro) => (
                  <tr key={livro.id}>
                    <td>{livro.id}</td>
                    <td>{livro.titulo}</td>
                    <td>{livro.autor}</td>
                    <td>{livro.isbn}</td>
                    <td>
                      <span className={`badge ${livro.status === "disponível" ? "badge-success" : livro.status === "emprestado" ? "badge-warning" : "badge-danger"}`}>
                        {livro.status}
                      </span>
                    </td>
                    <td>
                      <button onClick={() => handleEdit(livro)} className="btn-icon" title="Editar" disabled={loading}>
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(livro.id)}
                        className="btn-icon danger"
                        title="Deletar"
                        disabled={loading}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Livros
