# 🖥️ Nubemox UI (Frontend)

> *Interface de Auto-Atendimento para Orquestração Proxmox*

O **Nubemox UI** é a interface web moderna e responsiva do sistema Nubemox. Desenvolvida em **React (TypeScript)** com **Vite**, ela oferece uma experiência fluida para que usuários finais gerenciem suas próprias Máquinas Virtuais (VMs) e Containers (LXC), visualizem cotas e acessem o catálogo de serviços.

-----

## Funcionalidades

  * **Autenticação:** Login seguro e persistência de sessão via JWT.
  * **Dashboard de Cotas:** Visualização em tempo real do consumo de CPU, RAM e Disco.
  * **Catálogo de Serviços:** Listagem de templates disponíveis com especificações de hardware claras.
  * **One-Click Deploy:** Provisionamento simplificado (apenas nome do host necessário).
  * **Gestão de Recursos:**
      * Ações de Energia (Ligar, Desligar, Reiniciar).
      * Acesso ao Console (VNC/NoVNC).
      * Escalonamento Vertical (Aumentar CPU/RAM).
  * **Snapshots:** Criação e restauração de backups de estado instantâneos.

-----

## Tech Stack

  * **Core:** React 18, TypeScript
  * **Build Tool:** Vite (Super rápido)
  * **Estilização:** Tailwind CSS
  * **Ícones:** Lucide React
  * **Requisições:** Axios (com Interceptors para JWT)
  * **Notificações:** React Hot Toast

-----

## Pré-requisitos

  * **Node.js:** Versão 18 ou superior.
  * **Nubemox Backend:** A API Flask deve estar rodando (padrão: `http://localhost:5000`).

-----

## Instalação e Execução

### 1\. Clonar e Instalar Dependências

```bash
# Entre na pasta do frontend
cd nubemox-ui

# Instale as dependências do projeto
npm install
```

### 2\. Configurar Conexão com Backend

Por padrão, o frontend espera que a API esteja em `http://localhost:5000/api`.
Se precisar alterar (ex: para produção ou outro IP), edite o arquivo `src/services/api.ts`:

```typescript
// src/services/api.ts
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // <--- Ajuste aqui se necessário
});
```

### 3\. Rodar em Desenvolvimento

Para iniciar o servidor local com *Hot Reload*:

```bash
npm run dev
```

O terminal exibirá o link de acesso, geralmente:

> ➜  Local:   http://localhost:5173/

-----

## Estrutura do Projeto

```text
src/
├── components/       # Componentes visuais (Dashboard, Modais, Cards)
│   ├── DeployModal.tsx
│   ├── Layout.tsx
│   ├── ResourceList.tsx
│   └── ...
├── services/         # Comunicação com a API
│   └── api.ts        # Configuração do Axios e Endpoints
├── types/            # Definições de Tipos TypeScript (Interfaces)
│   └── index.ts
├── App.tsx           # Roteamento e Lógica Principal
└── main.tsx          # Ponto de entrada React
```

-----

## Telas Principais

### 1\. Dashboard

Visão geral dos recursos ativos e barras de progresso mostrando o consumo da cota do usuário.

### 2\. Catálogo

Grid de templates disponíveis. O usuário vê as especificações fixas (CPU/RAM) antes de criar.

### 3\. Meus Serviços

Lista tabular das VMs/Containers com botões rápidos para Start/Stop, Console e Snapshots.

-----

## Build para Produção

Para gerar os arquivos estáticos otimizados (pasta `dist/`) para deploy em Nginx ou Apache:

```bash
npm run build
```

-----

## Contribuição

1.  Crie uma Branch (`git checkout -b feature/NovaUI`).
2.  Commit suas mudanças (`git commit -m 'Add: Novo componente de gráfico'`).
3.  Push para a Branch (`git push origin feature/NovaUI`).
4.  Abra um Pull Request.

-----

## Licença

Este projeto é parte da suíte Nubemox. Distribuído sob a licença AGPL3.