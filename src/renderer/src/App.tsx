import { useState } from 'react'

function App() {
  // state guarda os dados que o usuário digita
  // O React atualiza a tela automaticamente sempre que essas variáveis mudam.
  const [materia, setMateria] = useState('')
  const [data, setData] = useState('')
  const [titulo, setTitulo] = useState('')
  const [conteudo, setConteudo] = useState('')

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault()

    const dadosDaAula = { materia, data, titulo, conteudo }

    try {
      // Como estamos usando TypeScript, usamos 'as any' rapidinho só para ele
      // não reclamar que o 'window' padrão do navegador não tem a propriedade 'api'.
      // Em um projeto avançado, nós tiparíamos isso globalmente.
      const resposta = await (window as any).api.salvarAula(dadosDaAula)

      if (resposta.sucesso) {
        alert(`Sucesso! Anotação salva em:\n${resposta.caminho}`)
        // Limpa os campos após salvar
        setTitulo('')
        setConteudo('')
      } else {
        alert(`Deu erro ao salvar: ${resposta.erro}`)
      }
    } catch (error) {
      alert("Falha na comunicação com o sistema.")
    }
  }

  // INTERFACE (JSX): O visual da aplicação
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1>📝 Nova Anotação da Faculdade</h1>

      <form onSubmit={handleSalvar} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label>Matéria:</label>
          <input
            type="text"
            value={materia}
            // O onChange captura cada letra digitada e salva no Estado (useState)
            onChange={(e) => setMateria(e.target.value)}
            placeholder="Ex: Arquitetura de Computadores"
            required
            style={{ padding: '8px' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label>Data:</label>
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            required
            style={{ padding: '8px' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label>Título da Aula:</label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ex: Introdução ao SimpleScalar"
            required
            style={{ padding: '8px' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label>Anotações (em Markdown):</label>
          <textarea
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            rows={12}
            placeholder="Digite suas notas aqui..."
            required
            style={{ padding: '8px', fontFamily: 'monospace' }}
          />
        </div>

        <button type="submit" style={{ padding: '10px', fontSize: '16px', cursor: 'pointer', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
          Salvar no Vault
        </button>

      </form>
    </div>
  )
}

export default App