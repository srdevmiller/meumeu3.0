#!/bin/bash

# Função para verificar erro
check_error() {
    if [ $? -ne 0 ]; then
        echo "Erro: $1"
        exit 1
    fi
}

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then 
    echo "Por favor, execute este script como root (usando sudo)"
    exit 1
fi

echo "Iniciando instalação do Node.js e dependências..."

# Atualizar os pacotes do sistema
echo "Atualizando pacotes do sistema..."
apt update
check_error "Falha ao atualizar pacotes"
apt upgrade -y
check_error "Falha ao fazer upgrade dos pacotes"

# Instalar dependências necessárias
echo "Instalando dependências necessárias..."
apt install -y curl build-essential git
check_error "Falha ao instalar dependências"

# Criar usuário node-user se não existir
if ! id "node-user" &>/dev/null; then
    useradd -m -s /bin/bash node-user
    check_error "Falha ao criar usuário node-user"
fi

# Mudar para o usuário node-user para instalar o nvm
echo "Instalando NVM..."
su - node-user -c 'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash'
check_error "Falha ao baixar/instalar NVM"

# Configurar NVM e instalar Node.js
echo "Configurando NVM e instalando Node.js..."
su - node-user -c '
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm install --lts
    nvm use --lts

    # Verificar instalação
    node --version
    npm --version

    # Instalar PM2 globalmente
    npm install -g pm2
'
check_error "Falha ao instalar Node.js ou PM2"

echo "Configurando PM2 para iniciar com o sistema..."
env PATH=$PATH:/usr/local/bin pm2 startup systemd -u node-user --hp /home/node-user
check_error "Falha ao configurar PM2"

echo "Instalação concluída com sucesso!"
echo "Node.js, NPM e PM2 foram instalados e configurados."

# Mostrar versões instaladas
echo "Versões instaladas:"
su - node-user -c '
    echo "Node.js: $(node --version)"
    echo "NPM: $(npm --version)"
    echo "PM2: $(pm2 --version)"
'