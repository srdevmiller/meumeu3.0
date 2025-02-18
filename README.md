## 2. Instalação do PostgreSQL

```bash
# Instale o PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib -y

# Inicie e habilite o serviço
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Configure o banco de dados
sudo -u postgres psql -c "CREATE USER meuuser WITH PASSWORD 'minhasenha';"
sudo -u postgres psql -c "CREATE DATABASE meumenudb OWNER meuuser;"
```

## 3. Clonagem e Configuração do Projeto

```bash
# Clone o repositório
cd /var/www
sudo git clone https://github.com/seu-usuario/meumenuonline.git
cd meumenuonline

# Configure as permissões
sudo chown -R node-user:node-user /var/www/meumenuonline

# Instale as dependências como node-user
su node-user
npm install

# Configure as variáveis de ambiente
cp .env.example .env
nano .env
```

Edite o arquivo .env com suas configurações:

```env
DATABASE_URL=postgresql://meuuser:minhasenha@localhost:5432/meumenudb
SESSION_SECRET=sua_chave_secreta_aqui
NODE_ENV=production
```

## 4. Build e Inicialização

```bash
# Faça o build do projeto
npm run build

# Execute as migrações do banco de dados
npm run db:push

# Configure o PM2
pm2 start ecosystem.config.js
pm2 save
```

## 5. Configuração do Nginx

```bash
# Instale o Nginx
sudo apt install nginx -y

# Configure o site
sudo nano /etc/nginx/sites-available/meumenuonline
```

Adicione a seguinte configuração:

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
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Configuração para servir arquivos estáticos
    location /assets {
        alias /var/www/meumenuonline/dist/client/assets;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
```

```bash
# Ative o site
sudo ln -s /etc/nginx/sites-available/meumenuonline /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

## 6. Configuração SSL com Certbot

```bash
# Instale o Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtenha o certificado SSL
sudo certbot --nginx -d seu-dominio.com
```

## 7. Configuração de Backup Automático

Crie um script de backup:

```bash
sudo nano /var/www/meumenuonline/backup.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/meumenuonline"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Crie o diretório de backup se não existir
mkdir -p $BACKUP_DIR

# Backup do banco de dados
pg_dump -U meuuser meumenudb > $BACKUP_DIR/db_backup_$TIMESTAMP.sql

# Backup dos arquivos
tar -czf $BACKUP_DIR/files_backup_$TIMESTAMP.tar.gz /var/www/meumenuonline

# Mantenha apenas os últimos 7 dias de backup
find $BACKUP_DIR -type f -mtime +7 -delete
```

Configure a permissão e o cron:

```bash
sudo chmod +x /var/www/meumenuonline/backup.sh
sudo crontab -e
```

Adicione a linha para executar o backup diariamente às 3h da manhã:

```
0 3 * * * /var/www/meumenuonline/backup.sh
```

## 8. Monitoramento

Para monitorar o status da aplicação:

```bash
# Visualize os logs do PM2
pm2 logs meumenuonline

# Monitore o status da aplicação
pm2 monit

# Verifique o status do PM2
pm2 status

# Verifique os logs específicos da aplicação
tail -f /var/log/pm2/meumenuonline-out.log
tail -f /var/log/pm2/meumenuonline-error.log

# Verifique o status do Nginx
sudo systemctl status nginx

# Verifique os logs do Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

## Atualização do Sistema

Para atualizar o sistema com novas versões:

```bash
cd /var/www/meumenuonline
git pull origin main
npm install
npm run build
pm2 restart meumenuonline
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