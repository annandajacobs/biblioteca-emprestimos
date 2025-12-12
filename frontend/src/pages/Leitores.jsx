import { useState, useEffect } from "react"
import { Users, Plus, Search, Edit2, Trash2, Filter } from "lucide-react"
import api from "../services/api"

function Leitores() {
  const [leitores, setLeitores] = useState([])
  const [busca, setBusca] = useState("")
  const [formData, setFormData] = useState({ nome: "", email: "", matricula: "" })
  const [editando, setEditando] = useState(null)
  const [mensagem, setMensagem] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    carregarLeitores()
  }, [busca])

  const carregarLeitores = async () => {
    try {
      setLoading(true)
      const data = await api.getLeitores(busca)
      setLeitores(data.data || [])
    } catch (error) {
      mostrarMensagem("Erro ao carregar leitores", "erro")
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
        await api.updateLeitor(editando, formData)
        mostrarMensagem("Leitor atualizado com sucesso!")
      } else {
        await api.createLeitor(formData)
        mostrarMensagem("Leitor cadastrado com sucesso!")
      }
      setFormData({ nome: "", email: "", matricula: "" })
      setEditando(null)
      carregarLeitores()
    } catch (error) {
      mostrarMensagem("Erro ao salvar leitor", "erro")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (leitor) => {
    setFormData({
      nome: leitor.nome,
      email: leitor.email,
      matricula: leitor.matricula,
    })
    setEditando(leitor.id)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleDelete = async (id) => {
    if (window.confirm("Deseja realmente deletar este leitor?")) {
      try {
        setLoading(true)
        const response = await api.deleteLeitor(id)

        if (response.erro) {
          // mensagem de erro vinda do backend
          return mostrarMensagem(response.erro, "erro")
        }

        mostrarMensagem("Leitor deletado com sucesso!")
        carregarLeitores()

      } catch (error) {
        mostrarMensagem("Erro ao deletar leitor", "erro")
      } finally {
        setLoading(false)
      }
    }
  }

  const handleCancel = () => {
    setEditando(null)
    setFormData({ nome: "", email: "", matricula: "" })
  }

  return (
    <div className="container">
      <h2>
        <Users size={32} />
        Gerenciar Leitores
      </h2>

      {mensagem && <div className={`mensagem ${mensagem.tipo}`}>{mensagem.texto}</div>}

      <div className="card">
        <h3>
          {editando ? <Edit2 size={20} /> : <Plus size={20} />}
          {editando ? "Editar Leitor" : "Cadastrar Novo Leitor"}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome *</label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Digite o nome completo"
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="exemplo@email.com"
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Matrícula *</label>
            <input
              type="text"
              value={formData.matricula}
              onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
              placeholder="Ex: 2024001"
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
            placeholder="Buscar por nome, email ou matrícula..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="input-busca"
            style={{ paddingLeft: "40px" }}
          />
        </div>
      </div>

      <div className="card">
        <h3>
          <Users size={20} />
          Lista de Leitores ({leitores.length})
        </h3>
        {loading ? (
          <div className="empty-state">
            <p>Carregando...</p>
          </div>
        ) : leitores.length === 0 ? (
          <div className="empty-state">
            <Users size={48} />
            <p>Nenhum leitor encontrado.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Matrícula</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {leitores.map((leitor) => (
                  <tr key={leitor.id}>
                    <td>{leitor.id}</td>
                    <td>{leitor.nome}</td>
                    <td>{leitor.email}</td>
                    <td>{leitor.matricula}</td>
                    <td>
                      <button onClick={() => handleEdit(leitor)} className="btn-icon" title="Editar" disabled={loading}>
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(leitor.id)}
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

export default Leitores
