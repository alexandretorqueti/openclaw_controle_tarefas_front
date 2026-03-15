#!/bin/bash

files=$(find src -name "*.tsx" -o -name "*.jsx")

# Substituir cores de fundo claras restantes
sed -i 's/#f0f9ff/var(--bg-card)/g' $files
sed -i 's/#f0fdf4/var(--bg-card)/g' $files
sed -i 's/#fecaca/var(--bg-card)/g' $files
sed -i 's/#fef2f2/var(--bg-card)/g' $files
sed -i 's/#e5e7eb/var(--border-color)/g' $files
sed -i 's/#ced4da/var(--border-color)/g' $files

# Substituir cores de texto
sed -i 's/#2a7c74/var(--text-primary)/g' $files
sed -i 's/#2E7D32/var(--text-primary)/g' $files
sed -i 's/#388e3c/var(--text-primary)/g' $files
sed -i 's/#6c757d/var(--text-secondary)/g' $files
sed -i 's/#718096/var(--text-secondary)/g' $files
sed -i 's/#c53030/var(--danger-color)/g' $files
sed -i 's/#d32f2f/var(--danger-color)/g' $files
sed -i 's/#F57C00/var(--accent-color)/g' $files
sed -i 's/#a0aec0/var(--text-secondary)/g' $files
sed -i 's/#555/var(--text-secondary)/g' $files
sed -i 's/#444/var(--text-secondary)/g' $files

# Substituir cores de hover (manter como variáveis)
sed -i 's/#3182ce/var(--accent-hover)/g' $files
sed -i 's/#3db8af/var(--accent-hover)/g' $files
sed -i 's/#3dbcb4/var(--accent-hover)/g' $files
sed -i 's/#8A3EC8/var(--accent-color)/g' $files
sed -i 's/#E68A00/var(--accent-color)/g' $files
sed -i 's/#e55a5a/var(--danger-color)/g' $files
sed -i 's/#e03e2e/var(--danger-color)/g' $files
sed -i 's/#e5bc5c/var(--accent-color)/g' $files
sed -i 's/#05c090/var(--success-color)/g' $files

# Cores de status HTTP - manter como estão
# #f00, #ff0, #f80, #f0f, #0ff, #ff0

# Cores da paleta - manter como estão
# #118AB2, #6C757D, #EF476F

echo "Cores restantes substituídas!"
