import { useState, useEffect } from "react"
import { BookCopy, Plus, AlertCircle, CheckCircle, Clock, ListTodo } from "lucide-react"
import api from "../services/api"

function Emprestimos() {
  const [emprestimos, setEmprestimos] = useState([])
  const [livros, setLivros] = useState([])
  const [leitores, setLeitores] = useState([])
  const [formData, setFormData] = useState({
    livroId: "",
    leitorId: "",
    diasEmprestimo: "14",
  })
  const [apenasAtivos, setApenasAtivos] = useState(true)
  const [mensagem, setMensagem] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    carregarDados()
  }, [apenasAtivos])

  const carregarDados = async () => {
    try {
      setLoading(true)
      const [empData, livData, leitData] = await Promise.all([
        api.getEmprestimos(apenasAtivos),
        api.getLivros("", "disponível"),
        api.getLeitores(),
      ])
      setEmprestimos(empData.data || [])
      setLivros(livData.data || [])
      setLeitores(leitData.data || [])
    } catch (error) {
      mostrarMensagem("Erro ao carregar dados", "erro")
    } finally {
      setLoading(false)
    }
  }

  const mostrarMensagem = (texto, tipo = "sucesso") => {
    setMensagem({ texto, tipo })
    setTimeout(() => setMensagem(null), 5000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const result = await api.createEmprestimo(formData)
      mostrarMensagem(result.mensagem || "Empréstimo registrado com sucesso!")
      setFormData({ livroId: "", leitorId: "", diasEmprestimo: "14" })
      carregarDados()
    } catch (error) {
      mostrarMensagem("Erro ao registrar empréstimo", "erro")
    } finally {
      setLoading(false)
    }
  }

  const handleDevolucao = async (id) => {
    if (window.confirm("Confirmar devolução deste livro?")) {
      try {
        setLoading(true)
        const result = await api.devolverEmprestimo(id)
        const tipo = result.alerta ? "alerta" : "sucesso"
        mostrarMensagem(result.mensagem || "Devolução registrada!", tipo)
        carregarDados()
      } catch (error) {
        mostrarMensagem("Erro ao registrar devolução", "erro")
      } finally {
        setLoading(false)
      }
    }
  }

  const formatarData = (data) => {
    if (!data) return "-"
    return new Date(data + "T00:00:00").toLocaleDateString("pt-BR")
  }

  const calcularStatus = (emprestimo) => {
    if (emprestimo.dataDevolucao) {
      return { texto: "Devolvido", classe: "badge-success", icon: CheckCircle }
    }

    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const prevista = new Date(emprestimo.dataPrevistaDevolucao + "T00:00:00")

    if (hoje > prevista) {
      return { texto: "Atrasado", classe: "badge-danger", icon: AlertCircle }
    }

    return { texto: "Ativo", classe: "badge-info", icon: Clock }
  }

  return (
    <div className="container">
      <h2>
        <BookCopy size={32} />
        Gerenciar Empréstimos
      </h2>

      {mensagem && <div className={`mensagem ${mensagem.tipo}`}>{mensagem.texto}</div>}

      <div className="card">
        <h3>
          <Plus size={20} />
          Registrar Novo Empréstimo
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Livro *</label>
            <select
              value={formData.livroId}
              onChange={(e) => setFormData({ ...formData, livroId: e.target.value })}
              required
              disabled={loading}
            >
              <option value="">Selecione um livro disponível</option>
              {livros.map((livro) => (
                <option key={livro.id} value={livro.id}>
                  {livro.titulo} - {livro.autor}
                </option>
              ))}
            </select>
            {livros.length === 0 && (
              <small
                style={{ color: "var(--warning)", display: "flex", alignItems: "center", gap: "6px", marginTop: "6px" }}
              >
                <AlertCircle size={14} />
                Nenhum livro disponível no momento
              </small>
            )}
          </div>

          <div className="form-group">
            <label>Leitor *</label>
            <select
              value={formData.leitorId}
              onChange={(e) => setFormData({ ...formData, leitorId: e.target.value })}
              required
              disabled={loading}
            >
              <option value="">Selecione um leitor</option>
              {leitores.map((leitor) => (
                <option key={leitor.id} value={leitor.id}>
                  {leitor.nome} - {leitor.matricula}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Período de Empréstimo</label>
            <select
              value={formData.diasEmprestimo}
              onChange={(e) => setFormData({ ...formData, diasEmprestimo: e.target.value })}
              disabled={loading}
            >
              <option value="7">7 dias</option>
              <option value="14">14 dias (padrão)</option>
              <option value="21">21 dias</option>
              <option value="30">30 dias</option>
            </select>
          </div>

          <button type="submit" className="btn-primary" disabled={loading || livros.length === 0}>
            {loading ? "Processando..." : "Registrar Empréstimo"}
          </button>
        </form>
      </div>

      <div className="card">
        <div className="flex-between">
          <h3>
            <ListTodo size={20} />
            Lista de Empréstimos ({emprestimos.length})
          </h3>
          <label className="flex-center" style={{ cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={apenasAtivos}
              onChange={(e) => setApenasAtivos(e.target.checked)}
              style={{ cursor: "pointer" }}
            />
            <span>Apenas ativos</span>
          </label>
        </div>

        {loading ? (
          <div className="empty-state">
            <p>Carregando...</p>
          </div>
        ) : emprestimos.length === 0 ? (
          <div className="empty-state">
            <BookCopy size={48} />
            <p>Nenhum empréstimo encontrado.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Livro</th>
                  <th>Leitor</th>
                  <th>Saída</th>
                  <th>Previsão</th>
                  <th>Devolução</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {emprestimos.map((emp) => {
                  const status = calcularStatus(emp)
                  const isAtrasado = status.texto === "Atrasado"
                  const StatusIcon = status.icon

                  return (
                    <tr key={emp.id} className={isAtrasado ? "row-atrasado" : ""}>
                      <td>{emp.id}</td>
                      <td>{emp.livro?.titulo || "N/A"}</td>
                      <td>{emp.leitor?.nome || "N/A"}</td>
                      <td>{formatarData(emp.dataSaida)}</td>
                      <td>{formatarData(emp.dataPrevistaDevolucao)}</td>
                      <td>{formatarData(emp.dataDevolucao)}</td>
                      <td>
                        <span className={`badge ${status.classe}`}>
                          <StatusIcon size={14} />
                          {status.texto}
                        </span>
                      </td>
                      <td>
                        {!emp.dataDevolucao && (
                          <button onClick={() => handleDevolucao(emp.id)} className="btn-sm" disabled={loading}>
                            <CheckCircle size={16} />
                            Devolver
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Emprestimos
