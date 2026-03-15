#!/bin/bash

# Substituição case-insensitive para cores restantes
files=$(find src -name "*.tsx" -o -name "*.jsx")

# Função para substituir case-insensitive
replace_ci() {
  local old="$1"
  local new="$2"
  
  # Converter para padrão regex case-insensitive
  local pattern=$(echo "$old" | sed 's/./[&]/g')
  
  for file in $files; do
    # Usar perl para substituição case-insensitive
    perl -i -pe "s/\Q$old\E/$new/gi" "$file"
  done
}

# Cores restantes
replace_ci "#E3F2FD" "var(--bg-card)"
replace_ci "#E5F7ED" "var(--bg-card)"
replace_ci "#E8F5E9" "var(--bg-card)"
replace_ci "#f0f9f8" "var(--bg-card)"
replace_ci "#F3E5F5" "var(--bg-card)"
replace_ci "#C8E6C9" "var(--border-color)"
replace_ci "#ddd" "var(--border-color)"
replace_ci "#fc8181" "var(--danger-color)"
replace_ci "#FFB74D" "var(--accent-color)"
replace_ci "#FFCDD2" "var(--border-color)"
replace_ci "#FFE0B2" "var(--border-color)"
replace_ci "#e2e8f0" "var(--bg-input)"
replace_ci "#1976D2" "var(--accent-color)"
replace_ci "#FF9A76" "var(--accent-color)"

echo "Substituição case-insensitive concluída!"
