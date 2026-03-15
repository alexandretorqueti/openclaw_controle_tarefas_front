#!/bin/bash

# Substituições agrupadas por tonalidade

# Cores claras (backgrounds) -> var(--bg-card)
light_colors=(
  "#E3F2FD" "#E5F7ED" "#E8F5E9" "#f0f9f8" "#F3E5F5" "#ddd" "#e2e8f0"
  "#f8f9fa" "#f5f5f5" "#f0f0f0" "#fafafa" "#f9f9f9"
)

# Cores médias -> var(--bg-input)
medium_colors=(
  "#4299e1" "#4CAF50" "#9D4EDD" "#c92c1c" "#2563eb"
)

# Cores específicas do tema
for color in "${light_colors[@]}"; do
  find src -name "*.tsx" -o -name "*.jsx" -exec sed -i "s/${color}/var(--bg-card)/g" {} \;
done

for color in "${medium_colors[@]}"; do
  find src -name "*.tsx" -o -name "*.jsx" -exec sed -i "s/${color}/var(--accent-color)/g" {} \;
done

# Cores específicas
sed -i 's/#10b981/var(--success-color)/g' $(find src -name "*.tsx" -o -name "*.jsx")
sed -i 's/#3b82f6/var(--accent-color)/g' $(find src -name "*.tsx" -o -name "*.jsx")

echo "Substituições concluídas!"
