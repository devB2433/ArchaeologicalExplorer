#!/bin/bash

# Archaeological Explorer - Database Backup Script
# Backs up the SQLite database from Docker volume

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
VOLUME_NAME="archaeology-game-data"
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="archaeology-game-backup-${DATE}.tar.gz"

echo -e "${GREEN}📦 Archaeological Explorer - Backup Script${NC}"
echo "============================================"

# Create backup directory
mkdir -p ${BACKUP_DIR}

# Backup the data volume
echo -e "\n${YELLOW}Creating backup...${NC}"
docker run --rm \
  -v ${VOLUME_NAME}:/data:ro \
  -v "$(pwd)/${BACKUP_DIR}:/backup" \
  alpine:latest \
  tar czf /backup/${BACKUP_FILE} -C /data .

echo -e "${GREEN}✓ Backup created: ${BACKUP_DIR}/${BACKUP_FILE}${NC}"

# Show backup info
BACKUP_SIZE=$(du -h "${BACKUP_DIR}/${BACKUP_FILE}" | cut -f1)
echo "Backup size: ${BACKUP_SIZE}"

# Keep only last 7 backups
echo -e "\n${YELLOW}Cleaning old backups (keeping last 7)...${NC}"
cd ${BACKUP_DIR}
ls -t archaeology-game-backup-*.tar.gz | tail -n +8 | xargs -r rm --
cd ..
echo -e "${GREEN}✓ Cleanup complete${NC}"

# List all backups
echo -e "\n${YELLOW}Available backups:${NC}"
ls -lh ${BACKUP_DIR}/archaeology-game-backup-*.tar.gz 2>/dev/null || echo "No backups found"

echo -e "\n${GREEN}✅ Backup completed successfully!${NC}"
echo ""
echo "To restore from this backup, run:"
echo "  ./restore.sh ${BACKUP_DIR}/${BACKUP_FILE}"
