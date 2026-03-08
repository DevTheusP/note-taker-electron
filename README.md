# 📓 StudyVault Desktop

![Electron](https://img.shields.io/badge/Electron-191970?style=for-the-badge&logo=Electron&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)

Um aplicativo desktop projetado para resolver um problema real de produtividade acadêmica: a captura rápida, focada e padronizada de anotações durante as aulas, sem as distrações de editores pesados.

O software coleta os dados da aula através de uma interface limpa, processa essas informações e gera arquivos `.md` (Markdown) estruturados diretamente no disco local. Essa abordagem permite uma integração perfeita com sistemas de anotações baseados em arquivos locais, alimentando seu *vault* pessoal de conhecimento automaticamente.

## Funcionalidades

- **Criação Dinâmica de Diretórios:** O sistema verifica a existência da pasta da matéria e a cria automaticamente caso seja uma disciplina nova.
- **Geração de Markdown Padrão:** Formata o título, data, matéria e o corpo da anotação em um template `.md` limpo.
- **Sanitização de Dados:** Tratamento automático de strings no backend para evitar erros de criação de arquivos com caracteres inválidos no sistema operacional.
- **Interface Reativa:** Formulário construído em React com controle de estado e feedback instantâneo de sucesso ou erro.

## Arquitetura e Segurança (System Design)

Este projeto foi construído seguindo princípios de **Clean Architecture** aplicados ao ecossistema Electron, garantindo uma separação estrita de responsabilidades:

1. **Main Process (Node.js):** Atua como o "backend local". É o único responsável por interagir com o sistema de arquivos do sistema operacional (`fs`, `os`), garantindo alta performance e segurança.
2. **Renderer Process (React):** A interface do usuário. Não possui nenhum acesso direto ao sistema de arquivos ou aos módulos do Node.js.
3. **Preload Script (The Bridge):** A comunicação entre a interface e o sistema operacional é feita de forma estritamente controlada através da API `contextBridge`. A interface envia requisições IPC (Inter-Process Communication) assíncronas que são tratadas e validadas pelo Main Process.

Essa estrutura garante que o aplicativo seja seguro (Context Isolation ativado, Node Integration desativado no frontend) e altamente escalável.

## Como executar o projeto localmente

### Pré-requisitos
- Node.js instalado (versão 18+ recomendada)
- Git

### Passo a passo

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

*Nota para usuários Linux:* O aplicativo criará automaticamente a estrutura de pastas em `~/Documents/Vault_Faculdade/`.

## Próximos Passos (Roadmap)
- [ ] Implementar visualização prévia (Preview) do Markdown em tempo real.
- [ ] Adicionar suporte a atalhos de teclado globais (Global Shortcuts) para abrir o app em segundo plano.
- [ ] Configurar o empacotamento (`electron-builder`) para distribuição em `.AppImage` e `.exe`.

---
