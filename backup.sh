#!/bin/bash

# Configurações
BACKUP_DIR="/var/backups/meumenuonline"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_USER="meuuser"
DB_NAME="meumenudb"
APP_DIR="/var/www/meumenuonline"

# Função para log
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Criar diretório de backup se não existir
if [ ! -d "$BACKUP_DIR" ]; then
    mkdir -p "$BACKUP_DIR"
    log_message "Diretório de backup criado: $BACKUP_DIR"
fi

# Backup do banco de dados
log_message "Iniciando backup do banco de dados..."
if pg_dump -U "$DB_USER" "$DB_NAME" > "$BACKUP_DIR/db_backup_$TIMESTAMP.sql"; then
    log_message "Backup do banco de dados concluído com sucesso"
else
    log_message "ERRO: Falha no backup do banco de dados"
    exit 1
fi

# Backup dos arquivos da aplicação
log_message "Iniciando backup dos arquivos..."
if tar -czf "$BACKUP_DIR/files_backup_$TIMESTAMP.tar.gz" "$APP_DIR"; then
    log_message "Backup dos arquivos concluído com sucesso"
else
    log_message "ERRO: Falha no backup dos arquivos"
    exit 1
fi

# Limpeza de backups antigos (manter últimos 7 dias)
log_message "Removendo backups mais antigos que 7 dias..."
find "$BACKUP_DIR" -type f -mtime +7 -delete

# Verificar espaço em disco
DISK_USAGE=$(df -h "$BACKUP_DIR" | tail -n 1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 90 ]; then
    log_message "ALERTA: Uso do disco está acima de 90% ($DISK_USAGE%)"
fi

log_message "Backup concluído com sucesso"

# Permissões de segurança nos arquivos de backup
chmod 600 "$BACKUP_DIR"/*_"$TIMESTAMP".*

exit 0
