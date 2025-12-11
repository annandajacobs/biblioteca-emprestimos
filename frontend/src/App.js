"use client";

import { useState } from "react"
import { BookOpen, Users, BookCopy } from "lucide-react"
import Livros from "./pages/Livros"
import Leitores from "./pages/Leitores"
import Emprestimos from "./pages/Emprestimos"
import "./App.css"

function App() {
  const [paginaAtiva, setPaginaAtiva] = useState("livros")

  const renderizarPagina = () => {
    switch (paginaAtiva) {
      case "livros":
        return <Livros />
      case "leitores":
        return <Leitores />
      case "emprestimos":
        return <Emprestimos />
      default:
        return <Livros />
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1>Sistema de Biblioteca</h1>
          <nav className="nav">
            <button
              className={`nav-btn ${paginaAtiva === "livros" ? "active" : ""}`}
              onClick={() => setPaginaAtiva("livros")}
            >
              <BookOpen size={20} />
              Livros
            </button>
            <button
              className={`nav-btn ${paginaAtiva === "leitores" ? "active" : ""}`}
              onClick={() => setPaginaAtiva("leitores")}
            >
              <Users size={20} />
              Leitores
            </button>
            <button
              className={`nav-btn ${paginaAtiva === "emprestimos" ? "active" : ""}`}
              onClick={() => setPaginaAtiva("emprestimos")}
            >
              <BookCopy size={20} />
              Empréstimos
            </button>
          </nav>
        </div>
      </header>
      <main>{renderizarPagina()}</main>
    </div>
  )
}

export default App
