#!/bin/bash
# Carrega o NVM e usa a versão correta do Node.js
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 24.11.0
npm run dev