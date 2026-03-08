# 📓 StudyVault Desktop

![Electron](https://img.shields.io/badge/Electron-191970?style=for-the-badge&logo=Electron&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

Um aplicativo desktop projetado para resolver um problema real de produtividade acadêmica: a captura rápida, focada e padronizada de anotações durante as aulas, sem as distrações de editores pesados.

O software coleta os dados da aula através de uma interface limpa, processa essas informações e gera arquivos `.md` (Markdown) estruturados diretamente no disco local. Essa abordagem permite uma integração perfeita com sistemas de anotações baseados em arquivos locais (como o Obsidian), alimentando seu *vault* pessoal de conhecimento automaticamente.

## Funcionalidades

- **Gestão de Disciplinas (CRUD):** Armazenamento local persistente em `JSON` para seleção rápida de matérias, eliminando a necessidade de redigitação.
- **Explorador do Vault:** Aba dedicada para leitura em tempo real do sistema de arquivos, listando o histórico de anotações organizadas por disciplina e ordenadas cronologicamente.
- **Integração Nativa com o SO:** Abertura instantânea dos arquivos Markdown diretamente no seu editor padrão do sistema (ex: Obsidian, VS Code, Neovim) com um único clique.
- **Interface Moderna e Reativa:** Design minimalista com Dark Mode nativo construído com Tailwind CSS, focado em foco e produtividade.
- **Sanitização e Criação Dinâmica:** O back-end cria pastas automaticamente para novas disciplinas e sanitiza os nomes dos arquivos para evitar conflitos no sistema operacional.

## Arquitetura e Segurança (System Design)

Este projeto foi construído seguindo princípios de **Clean Architecture** aplicados ao ecossistema Electron, garantindo uma separação estrita de responsabilidades:

1. **Main Process (Node.js):** Atua como o "backend local". É o único responsável por interagir com o sistema de arquivos do sistema operacional (`fs`, `os`, `shell`), garantindo alta performance e segurança.
2. **Renderer Process (React):** A interface do usuário. Não possui nenhum acesso direto ao sistema de arquivos ou aos módulos do Node.js.
3. **Preload Script (The Bridge):** A comunicação entre a interface e o sistema operacional é feita de forma estritamente controlada através da API `contextBridge`. A interface envia requisições IPC (Inter-Process Communication) assíncronas que são tratadas e validadas pelo Main Process.

Essa estrutura garante que o aplicativo seja seguro (Context Isolation ativado, Node Integration desativado no frontend) e altamente escalável.

## Como executar o projeto localmente

### Pré-requisitos
- Node.js instalado (versão 18+ recomendada)
- Git

### Passo a passo para Desenvolvimento

1. Clone o repositório
```bash
git clone [https://github.com/theusdev/note-taker-app.git](https://github.com/theusdev/note-taker-app.git)
```

2. Acesse a pasta do projeto
```bash
cd note-taker-app
```

3. Instale as dependências
```bash
npm install
```

4. Inicie o aplicativo em modo de desenvolvimento (com Hot Reload)
```bash
npm run dev
```

*Nota para usuários Linux:* O aplicativo criará automaticamente a estrutura de pastas e arquivos de configuração em `~/Documents/Vault_Faculdade/`.

## Como gerar o Executável (Build)

Para transformar o projeto em um aplicativo standalone (`.AppImage` para Linux):

```bash
npm run build:linux
```
O arquivo final gerado estará disponível na pasta `dist/` na raiz do projeto.

* **Aviso para usuários de Arch Linux:** Caso ocorram erros relacionados ao empacotador (`fpm` ou `mksquashfs`), garanta que as bibliotecas de compatibilidade estejam instaladas rodando: `sudo pacman -S squashfs-tools libxcrypt-compat`.

## Próximos Passos (Roadmap)
- [x] Configurar o empacotamento (`electron-builder`) para distribuição em `.AppImage`.
- [ ] Implementar injeção automática de *Frontmatter* (YAML) no cabeçalho dos arquivos Markdown para indexação avançada de tags no Obsidian.
- [ ] Adicionar suporte a atalhos de teclado para foco rápido na aplicação.

---
