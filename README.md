git clone https://github.com/seu-usuario/meumenuonline.git
cd meumenuonline
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
DATABASE_URL=postgresql://seu_usuario:sua_senha@localhost:5432/nome_do_banco
SESSION_SECRET=sua_chave_secreta_aqui
```

4. Execute as migrações do banco de dados:
```bash
npm run db:push
```

5. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## Estrutura do Projeto

```
├── client/                # Frontend React com TypeScript
│   ├── src/
│   │   ├── components/   # Componentes React
│   │   ├── hooks/       # Hooks personalizados
│   │   ├── pages/       # Páginas da aplicação
│   │   └── lib/         # Utilitários e configurações
│
├── server/               # Backend Express
│   ├── routes.ts        # Rotas da API
│   ├── storage.ts       # Camada de acesso a dados
│   └── auth.ts         # Configuração de autenticação
│
└── shared/              # Código compartilhado
    └── schema.ts       # Schemas do banco de dados
```

## Deployment em VPS

1. Instale o Node.js e PostgreSQL na sua VPS

2. Clone o repositório e instale as dependências:
```bash
git clone https://github.com/seu-usuario/meumenuonline.git
cd meumenuonline
npm install
```

3. Configure o processo usando PM2:
```bash
npm install -g pm2
pm2 start npm --name "meumenuonline" -- start
pm2 save
```

4. Configure o Nginx como proxy reverso:
```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}