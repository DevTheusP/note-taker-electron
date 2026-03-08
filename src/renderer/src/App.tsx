import { useState, useEffect } from 'react'

// interface para tipar as notas
interface Nota {
  nome: string;
  caminho: string;
  dataModificacao: Date;
}
// função principal
function App() {
  // states
  const [abaAtual, setAbaAtual] = useState<'nova' | 'vault'>('nova')
  const [materiasList, setMateriasList] = useState<string[]>([])
  const [isAddingNova, setIsAddingNova] = useState(false)
  const [novaMateriaNome, setNovaMateriaNome] = useState('')
  // A matéria começa vazia de propósito
  const [materia, setMateria] = useState('')
  const [data, setData] = useState(new Date().toISOString().split('T')[0])
  const [titulo, setTitulo] = useState('')
  const [conteudo, setConteudo] = useState('')
  const [status, setStatus] = useState<'idle' | 'sucesso' | 'erro'>('idle')
  const [notas, setNotas] = useState<Nota[]>([])
  // useEffect para carregar as matérias
  useEffect(() => {
    const carregarMaterias = async () => {
      try {
        const lista = await (window as any).api.getMaterias()
        setMateriasList(lista)
        // REMOVEMOS a linha que auto-selecionava a primeira matéria!
      } catch (error) {
        console.error("Erro ao carregar matérias", error)
      }
    }
    carregarMaterias()
  }, [])
  // useEffect para carregar as notas
  useEffect(() => {
    if (abaAtual === 'vault' && materia) {
      const buscarNotas = async () => {
        try {
          const listaNotas = await (window as any).api.getNotas(materia)
          setNotas(listaNotas)
        } catch (error) {
          console.error("Erro ao buscar notas", error)
        }
      }
      buscarNotas()
    }
  }, [abaAtual, materia])
  // função para adicionar matéria
  const handleAddMateria = async () => {
    if (!novaMateriaNome.trim()) return

    try {
      const resposta = await (window as any).api.addMateria(novaMateriaNome)
      if (resposta.sucesso) {
        setMateriasList(resposta.materias)
        setMateria(novaMateriaNome) // Seleciona a nova matéria automaticamente
        setIsAddingNova(false)
        setNovaMateriaNome('')
      } else {
        alert(`Erro: ${resposta.erro}`)
      }
    } catch (error) {
      alert("Falha ao comunicar com o sistema.")
    }
  }
  // função para salvar nota
  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault()

    // A nossa validação já cobre o caso de tentar salvar sem escolher a matéria!
    if (!materia) return alert("Por favor, selecione uma matéria.")

    const dadosDaAula = { materia, data, titulo, conteudo }

    try {
      const resposta = await (window as any).api.salvarAula(dadosDaAula)
      if (resposta.sucesso) {
        setStatus('sucesso')
        setTitulo('')
        setConteudo('')
        setTimeout(() => setStatus('idle'), 3000)
      } else {
        setStatus('erro')
        alert(`Erro: ${resposta.erro}`)
      }
    } catch (error) {
      setStatus('erro')
      alert("Falha na comunicação.")
    }
  }
  // função para abrir nota
  const abrirNota = async (caminho: string) => {
    await (window as any).api.abrirNota(caminho)
  }
  // renderização
  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 p-8 font-sans selection:bg-blue-500/30">
      <div className="max-w-3xl mx-auto">

        <header className="mb-8 border-b border-zinc-800 pb-4 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              StudyVault <span className="text-blue-500">.</span>
            </h1>
            <p className="text-zinc-400 mt-1">Seu conhecimento acadêmico estruturado.</p>
          </div>

          <div className="flex space-x-2 bg-zinc-800/50 p-1 rounded-lg border border-zinc-700">
            <button
              onClick={() => setAbaAtual('nova')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${abaAtual === 'nova' ? 'bg-blue-600 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50'}`}
            >
              📝 Nova Anotação
            </button>
            <button
              onClick={() => setAbaAtual('vault')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${abaAtual === 'vault' ? 'bg-blue-600 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50'}`}
            >
              🗂️ Meu Vault
            </button>
          </div>
        </header>

        <div className="mb-6 bg-zinc-800/30 p-4 rounded-lg border border-zinc-700/50">
          <label className="block text-sm font-medium text-zinc-400 mb-2">Disciplina Ativa</label>
          {isAddingNova ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={novaMateriaNome}
                onChange={(e) => setNovaMateriaNome(e.target.value)}
                placeholder="Nova disciplina..."
                autoFocus
                className="flex-1 bg-zinc-800 border border-zinc-600 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button onClick={handleAddMateria} className="bg-emerald-600 hover:bg-emerald-500 px-4 rounded-md transition-colors text-white font-medium">✓</button>
              <button onClick={() => setIsAddingNova(false)} className="bg-zinc-700 hover:bg-zinc-600 px-4 rounded-md transition-colors text-white font-medium">✕</button>
            </div>
          ) : (
            <div className="flex gap-2">
              <select
                value={materia}
                onChange={(e) => setMateria(e.target.value)}
                className="flex-1 bg-zinc-800 border border-zinc-600 rounded-md px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none font-medium text-lg"
              >
                { }
                <option value="" disabled>Selecione uma matéria...</option>

                {materiasList.map((mat) => (
                  <option key={mat} value={mat}>{mat}</option>
                ))}
              </select>
              <button
                onClick={() => setIsAddingNova(true)}
                className="bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30 px-5 py-2 rounded-md font-medium transition-colors"
                title="Adicionar nova disciplina"
              >
                +
              </button>
            </div>
          )}
        </div>

        {abaAtual === 'nova' ? (

          <form onSubmit={handleSalvar} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-zinc-400 flex justify-between">
                <span>Data</span>
                <span>Título da Aula</span>
              </label>
              <div className="flex gap-4">
                <input
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  required
                  className="w-40 bg-zinc-800/50 border border-zinc-700 rounded-md px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 [color-scheme:dark]"
                />
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Assunto principal..."
                  required
                  className="flex-1 bg-zinc-800/50 border border-zinc-700 rounded-md px-4 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                />
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-zinc-400">Anotações (Markdown)</label>
              <textarea
                value={conteudo}
                onChange={(e) => setConteudo(e.target.value)}
                rows={12}
                placeholder="# Tópico 1&#10;Comece a digitar..."
                required
                className="bg-zinc-800/50 border border-zinc-700 rounded-md px-4 py-3 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-y"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                {status === 'sucesso' && (
                  <span className="text-emerald-400 text-sm font-medium flex items-center gap-2">✓ Guardado no vault com sucesso!</span>
                )}
              </div>
              <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-2.5 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
                Guardar Anotação
              </button>
            </div>
          </form>

        ) : (

          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Aviso se o usuário tentar ver o Vault sem selecionar a matéria */}
            {!materia ? (
              <div className="text-center py-12 bg-zinc-800/20 rounded-lg border border-zinc-800 border-dashed">
                <p className="text-zinc-500">Selecione uma matéria acima para ver suas anotações.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <h2 className="text-lg font-medium text-zinc-200">Arquivos da Disciplina</h2>
                  <span className="text-xs font-medium text-zinc-500 bg-zinc-800 px-2 py-1 rounded-full">
                    {notas.length} notas
                  </span>
                </div>

                {notas.length === 0 ? (
                  <div className="text-center py-12 bg-zinc-800/20 rounded-lg border border-zinc-800 border-dashed">
                    <p className="text-zinc-500">Nenhuma anotação encontrada para esta matéria.</p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {notas.map((nota, index) => (
                      <li key={index} className="flex items-center justify-between p-4 bg-zinc-800/40 hover:bg-zinc-800/80 rounded-lg border border-zinc-700/50 transition-colors group">
                        <div className="flex flex-col">
                          <span className="text-zinc-200 font-medium group-hover:text-blue-400 transition-colors">
                            {nota.nome}
                          </span>
                          <span className="text-xs text-zinc-500 mt-1">
                            Modificado em: {new Date(nota.dataModificacao).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <button
                          onClick={() => abrirNota(nota.caminho)}
                          className="px-3 py-1.5 bg-zinc-700 hover:bg-blue-600 text-zinc-300 hover:text-white rounded text-sm font-medium transition-colors"
                          title="Abrir arquivo no editor padrão"
                        >
                          Abrir
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App