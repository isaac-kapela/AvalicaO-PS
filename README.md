# Sistema de Avaliação

Aplicação web para avaliação de pessoas, desenvolvida com **Next.js**, **MongoDB Atlas** e hospedada na **Vercel**.

## Funcionalidades

- Lista de avaliadores para seleção
- Formulário de avaliação com critérios (Comunicação, Trabalho em Equipe, Organização)
- Armazenamento das avaliações no MongoDB
- Exportação de todas as avaliações em planilha Excel (.xlsx)

## Estrutura de Pastas

```
avaliacao-app/
├── lib/
│   ├── mongodb.js          # Conexão com MongoDB Atlas
│   └── models/
│       └── Avaliacao.js    # Schema Mongoose
├── pages/
│   ├── index.js            # Tela inicial (lista de avaliadores)
│   ├── avaliacao.js        # Formulário de avaliação
│   └── api/
│       ├── avaliacoes.js   # POST: salvar avaliação | GET: listar
│       └── exportar.js     # GET: exportar Excel
├── .env.local.example      # Exemplo de variáveis de ambiente
└── README.md
```

## Configuração Local

### 1. Clone e instale as dependências

```bash
git clone <seu-repositorio>
cd avaliacao-app
npm install
```

### 2. Configure o MongoDB Atlas

1. Acesse [MongoDB Atlas](https://cloud.mongodb.com)
2. Crie um cluster gratuito (M0)
3. Crie um usuário e senha em **Database Access**
4. Libere seu IP em **Network Access** → Add IP Address → Allow from anywhere (`0.0.0.0/0`)
5. Copie a connection string em **Connect** → **Drivers**

### 3. Configure as variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Edite `.env.local`:
```
MONGODB_URI=mongodb+srv://<usuario>:<senha>@cluster0.xxxxx.mongodb.net/avaliacoes?retryWrites=true&w=majority
```

### 4. Execute localmente

```bash
npm run dev
```

Acesse: http://localhost:3000

## Deploy na Vercel

### 1. Instale a Vercel CLI (opcional)

```bash
npm install -g vercel
```

### 2. Faça o deploy

**Via CLI:**
```bash
vercel
```

**Via GitHub (recomendado):**
1. Suba o projeto para um repositório no GitHub
2. Acesse [vercel.com](https://vercel.com) e importe o repositório
3. Na tela de configuração, adicione a variável de ambiente:
   - **Key:** `MONGODB_URI`
   - **Value:** sua connection string do MongoDB Atlas
4. Clique em **Deploy**

## Personalização

### Adicionar avaliadores

Edite o array `AVALIADORES` em `pages/index.js`:
```js
const AVALIADORES = ['João', 'Maria', 'Pedro', 'Ana'];
```

### Adicionar pessoas avaliadas

Edite o array `AVALIADOS` em `pages/avaliacao.js`:
```js
const AVALIADOS = ['Fulano', 'Ciclano', 'Beltrano', 'Novo Funcionário'];
```

### Adicionar critérios de avaliação

Edite o array `CRITERIOS` em `pages/avaliacao.js` e atualize o schema em `lib/models/Avaliacao.js`.

## Estrutura dos Dados (MongoDB)

```json
{
  "avaliador": "João",
  "avaliado": "Fulano",
  "comunicacao": 9,
  "trabalhoEquipe": 8,
  "organizacao": 7,
  "observacao": "Boa comunicação e proatividade",
  "data": "2026-04-15T19:45:00.000Z"
}
```

## Tecnologias

- **Next.js** — Framework React com API Routes integradas
- **Mongoose** — ODM para MongoDB
- **MongoDB Atlas** — Banco de dados em nuvem
- **SheetJS (xlsx)** — Geração de planilhas Excel
- **Vercel** — Hospedagem serverless
