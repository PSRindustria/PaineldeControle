# PSR Marketing Dashboard - Firebase Integrated

Este é um dashboard de marketing minimalista e corporativo, desenvolvido para acompanhar tarefas e entregas da equipe PSR. O projeto está totalmente integrado ao **Firebase Realtime Database** para persistência de dados em tempo real.

## 🚀 Funcionalidades

- **Sincronização em Tempo Real**: Leitura e escrita de dados diretamente no Firebase.
- **Gestão de Tarefas**: Criação, edição e visualização detalhada de tarefas.
- **KPIs Automáticos**: Resumo de tarefas totais, pendentes, em progresso e concluídas.
- **Filtros Avançados**: Filtragem por status e por membro da equipe.
- **Design Responsivo**: Interface limpa e profissional adaptável a diferentes dispositivos.

## 🛠️ Tecnologias

- **Frontend**: React + TypeScript + Vite
- **Estilização**: Tailwind CSS + Shadcn UI
- **Backend/Banco de Dados**: Firebase Realtime Database
- **Ícones**: Lucide React

## 📋 Pré-requisitos

Antes de começar, você precisará ter instalado em sua máquina:
- [Node.js](https://nodejs.org/)
- [pnpm](https://pnpm.io/) (recomendado) ou npm/yarn

## ⚙️ Configuração e Execução

1. **Clone o repositório**:
   ```bash
   git clone [url-do-seu-repositorio]
   cd psr-marketing-dashboard
   ```

2. **Instale as dependências**:
   ```bash
   pnpm install
   ```

3. **Rode o projeto**:
   ```bash
   pnpm dev
   ```

*Nota: O projeto já está configurado para conectar ao banco de dados Firebase `agenda-portal-2d149` de forma pública, sem necessidade de chaves de API adicionais.*

## 🏃 Produção

Para gerar a versão de produção:
```bash
pnpm build
```

## 📄 Licença

Este projeto foi desenvolvido pelo Manus AI. Sinta-se à vontade para usar e modificar.
