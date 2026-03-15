#!/bin/bash

# Mais substituições de cores
replacements=(
  "s/#FFE5E5/var(--bg-card)/g"
  "s/#E5FFE5/var(--bg-card)/g"
  "s/#3DB8AC/var(--accent-color)/g"
  "s/#05C592/var(--success-color)/g"
  "s/#999/var(--text-secondary)/g"
  "s/#e3f2fd/var(--bg-card)/g"
  "s/#1976d2/var(--accent-color)/g"
  "s/#e53e3e/var(--danger-color)/g"
  "s/#fed7d7/var(--border-color)/g"
  "s/#D32F2F/var(--danger-color)/g"
  "s/#ff4444/var(--danger-color)/g"
  "s/#1a0a0a/var(--bg-primary)/g"
  "s/#ffaa00/var(--text-secondary)/g"
  "s/#1a140a/var(--bg-card)/g"
  "s/#44aaff/var(--accent-color)/g"
  "s/#0a0f1a/var(--bg-secondary)/g"
  "s/#44ff44/var(--success-color)/g"
)

for file in $(find src -name "*.tsx" -o -name "*.jsx"); do
  echo "Processando $file"
  for replacement in "${replacements[@]}"; do
    sed -i "$replacement" "$file"
  done
done
