#!/bin/bash

# Substituições de cores para tema escuro
replacements=(
  "s/#666/var(--text-secondary)/g"
  "s/#fff/white/g"
  "s/#f0f0f0/var(--text-primary)/g"
  "s/#ccc/var(--text-secondary)/g"
  "s/#FFD166/var(--accent-color)/g"
  "s/#FFF3CD/var(--bg-card)/g"
  "s/#FFEEBA/var(--border-color)/g"
  "s/#856404/var(--text-secondary)/g"
  "s/#4285F4/var(--accent-color)/g"
  "s/#3367D6/var(--accent-hover)/g"
  "s/#222/var(--bg-secondary)/g"
)

for file in $(find src -name "*.tsx" -o -name "*.jsx"); do
  echo "Processando $file"
  for replacement in "${replacements[@]}"; do
    sed -i "$replacement" "$file"
  done
done
