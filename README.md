Sistema Especialista de Academia (Gym Expert System)
Um sistema web completo para gerenciamento de treinos, exercícios e dietas personalizadas para academias. Esta aplicação oferece recomendações inteligentes com base no perfil do usuário, objetivos e nível de experiência.
📋 Índice

Visão Geral
Funcionalidades
Tecnologias Utilizadas
Requisitos do Sistema
Instalação e Configuração
Estrutura do Projeto
Como Executar
Rotas da API
Banco de Dados
Contribuições
Licença

🎯 Visão Geral
O Sistema Especialista de Academia é uma aplicação web projetada para auxiliar praticantes de musculação e exercícios físicos a gerenciar seus treinos e dietas de forma inteligente. O sistema utiliza um conjunto de regras e algoritmos para recomendar treinos e dietas personalizadas com base nos dados do usuário, como idade, peso, altura, objetivos e nível de experiência.
✨ Funcionalidades
👤 Gestão de Usuários

Cadastro com informações físicas e objetivos
Login seguro com JWT
Atualização de perfil e dados pessoais

🏋️ Treinos Personalizados

Recomendação de treinos baseados no perfil do usuário
Categorização por objetivo (hipertrofia, perda de peso, etc.)
Níveis de dificuldade adaptados à experiência do usuário

💪 Exercícios

Catálogo detalhado de exercícios
Filtro por grupo muscular e nível de dificuldade
Instruções detalhadas para execução correta

📝 Histórico de Treinos

Registro de treinos concluídos
Feedback sobre intensidade do treino
Visualização de estatísticas e evolução

🥗 Plano Alimentar

Cálculo automático de necessidades calóricas
Distribuição de macronutrientes baseada nos objetivos
Sugestões de alimentos e refeições
Gerenciamento de restrições alimentares

📊 Dashboard

Visão geral das métricas importantes
Estatísticas de treinos realizados
Acompanhamento de progressos

🛠️ Tecnologias Utilizadas
Backend

Node.js - Ambiente de execução JavaScript
Express - Framework web para Node.js
Sequelize - ORM para bancos de dados SQL
MySQL - Sistema de gerenciamento de banco de dados
JWT - JSON Web Token para autenticação
Bcrypt - Biblioteca para criptografia de senhas

Frontend

React - Biblioteca JavaScript para construção de interfaces
React Router - Navegação entre páginas
React Bootstrap - Framework de UI responsivo
Chart.js - Biblioteca para visualização de dados
Formik - Gerenciamento de formulários
Yup - Validação de dados
React Icons - Pacote de ícones
Axios - Cliente HTTP para requisições

💻 Requisitos do Sistema

Node.js (v14.x ou superior)
MySQL (v8.x ou superior)
npm (v6.x ou superior) ou yarn

🚀 Instalação e Configuração
Clonando o repositório
bashgit clone https://github.com/seu-usuario/gym-expert-system.git
cd gym-expert-system
Configurando o Backend

Navegue até a pasta do backend:

bashcd backend

Instale as dependências:

bashnpm install

Configure o arquivo .env com suas credenciais de banco de dados:

# Server settings
PORT=5000
NODE_ENV=development

# Database settings
DB_HOST=localhost
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=gym_expert_system

# Authentication settings
JWT_SECRET=seu_segredo_jwt
JWT_EXPIRATION=86400

Inicialize o banco de dados:

bashnpm run init-db

Inicialize os dados de alimentos:

bashnpm run init-food
Configurando o Frontend

Navegue até a pasta do frontend:

bashcd ../frontend

Instale as dependências:

bashnpm install
📁 Estrutura do Projeto
Backend
backend/
├── config/             # Configurações (banco de dados, autenticação)
├── controllers/        # Controladores de rotas
├── middleware/         # Middlewares (autenticação, validação)
├── models/             # Modelos Sequelize
├── routes/             # Definições de rotas
├── utils/              # Utilitários (formatação, logging)
├── .env                # Variáveis de ambiente
├── init-db.js          # Script para inicializar o banco
├── init-food-data.js   # Script para popular dados de alimentos
├── package.json        # Dependências
└── server.js           # Ponto de entrada da aplicação
Frontend
frontend/
├── public/             # Arquivos estáticos
├── src/
│   ├── api/            # Serviços de chamadas à API
│   ├── assets/         # Recursos estáticos (CSS, imagens)
│   ├── components/     # Componentes reutilizáveis
│   ├── context/        # Contextos React (auth, workout)
│   ├── hooks/          # Hooks personalizados
│   ├── pages/          # Páginas da aplicação
│   ├── utils/          # Utilitários (formatação, helpers)
│   ├── App.js          # Componente principal
│   └── index.js        # Ponto de entrada 
└── package.json        # Dependências
▶️ Como Executar
Iniciando o Backend
bashcd backend
npm run dev
O servidor estará disponível em http://localhost:5000
Iniciando o Frontend
bashcd frontend
npm start
A aplicação estará disponível em http://localhost:3000
🔄 Rotas da API
Autenticação

POST /api/auth/signin - Login de usuário
POST /api/auth/signup - Registro de usuário

Usuários

GET /api/users/profile - Obter perfil do usuário
PUT /api/users/profile - Atualizar perfil
POST /api/users/change-password - Alterar senha
GET /api/users/stats - Obter estatísticas do usuário

Treinos

GET /api/workouts - Listar todos os treinos
GET /api/workouts/:id - Obter detalhes do treino
GET /api/workouts/recommended - Obter treino recomendado

Exercícios

GET /api/exercises - Listar todos os exercícios
GET /api/exercises/:id - Obter detalhes do exercício
GET /api/exercises/muscle-group/:id - Filtrar por grupo muscular
GET /api/exercises/difficulty/:level - Filtrar por dificuldade

Histórico

GET /api/history - Obter histórico de treinos
POST /api/history - Registrar novo treino
GET /api/history/stats - Obter estatísticas de treinos
GET /api/history/recent - Obter treinos recentes

Dieta

POST /api/diet/calculate - Calcular dieta personalizada
GET /api/diet - Obter dieta atual
GET /api/diet/food-suggestions - Obter sugestões de alimentos
POST /api/diet/restrictions - Adicionar restrição alimentar

🗄️ Banco de Dados
O sistema utiliza MySQL com os seguintes modelos principais:

User - Dados do usuário
Exercise - Exercícios disponíveis
MuscleGroup - Grupos musculares
Workout - Treinos
WorkoutExercise - Relação entre treinos e exercícios
WorkoutHistory - Histórico de treinos realizados
Diet - Dieta personalizada
DietRestriction - Restrições alimentares
Food - Catálogo de alimentos

👥 Contribuições

Faça um fork do projeto
Crie uma branch para sua feature (git checkout -b feature/nova-funcionalidade)
Faça commit das suas alterações (git commit -m 'Adiciona nova funcionalidade')
Faça push para a branch (git push origin feature/nova-funcionalidade)
Abra um Pull Request

📄 Licença
Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para mais detalhes.

Desenvolvido como projeto para disciplina de Inteligência Artificial.
