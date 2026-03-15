#!/bin/bash

# Lista de arquivos
files=$(find src -name "*.tsx" -o -name "*.jsx")

# Função para substituir cores
replace_color() {
  local old_color="$1"
  local new_value="$2"
  
  for file in $files; do
    # Substituir em estilos inline
    sed -i "s/['\"]${old_color}['\"]/'${new_value}'/g" "$file"
    sed -i "s/['\"]${old_color}['\"]/\"${new_value}\"/g" "$file"
    sed -i "s/\`${old_color}\`/\`${new_value}\`/g" "$file"
    
    # Substituir em template strings
    sed -i "s/\${[^}]*${old_color}[^}]*}/\${${new_value}}/g" "$file"
  done
}

# Cores comuns para substituir
declare -A color_map=(
  ["#f8f9fa"]="var(--bg-card)"
  ["#f5f5f5"]="var(--bg-card)"
  ["#f0f0f0"]="var(--bg-card)"
  ["#fafafa"]="var(--bg-card)"
  ["#f9f9f9"]="var(--bg-card)"
  ["#f7fafc"]="var(--bg-card)"
  ["#e2e8f0"]="var(--bg-input)"
  ["#ddd"]="var(--border-color)"
  ["#4299e1"]="var(--accent-color)"
  ["#2563eb"]="var(--accent-color)"
  ["#4CAF50"]="var(--success-color)"
  ["#9D4EDD"]="var(--accent-color)"
  ["#c92c1c"]="var(--danger-color)"
  ["#FF9F1C"]="var(--accent-color)"
  ["#FFB74D"]="var(--accent-color)"
  ["#FFF3E0"]="var(--bg-card)"
  ["#FFF9E6"]="var(--bg-card)"
  ["#C8E6C9"]="var(--border-color)"
  ["#fc8181"]="var(--danger-color)"
  ["#FFCDD2"]="var(--border-color)"
  ["#FFE0B2"]="var(--border-color)"
  ["#0a0a0a"]="var(--bg-primary)"
  ["#0a1a0a"]="var(--bg-secondary)"
  ["#bae6fd"]="var(--accent-color)"
  ["#bbf7d0"]="var(--success-color)"
)

for old_color in "${!color_map[@]}"; do
  echo "Substituindo $old_color -> ${color_map[$old_color]}"
  replace_color "$old_color" "${color_map[$old_color]}"
done

echo "Substituições completas concluídas!"
