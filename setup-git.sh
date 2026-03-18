#!/bin/bash
# ============================================================
# setup-git.sh — Inițializare Git + push pe GitHub
# Rulează din folderul rădăcină al proiectului (mindbridge/)
# ============================================================

echo "🚀 Inițializare Git pentru MindBridge..."

# 1. Init repo
git init
git add .
git commit -m "feat: initial commit — MindBridge platform"

echo ""
echo "✅ Repository local creat."
echo ""
echo "📋 PAȘI URMĂTORI pentru GitHub:"
echo ""
echo "  1. Creează un repository NOU pe https://github.com/new"
echo "     - Nume: mindbridge"
echo "     - Vizibilitate: Private (recomandat)"
echo "     - NU bifa 'Initialize with README' (avem deja)"
echo ""
echo "  2. Conectează și trimite codul:"
echo "     git remote add origin https://github.com/USERNAME/mindbridge.git"
echo "     git branch -M main"
echo "     git push -u origin main"
echo ""
echo "  3. (Opțional) Creează branch-uri separate:"
echo "     git checkout -b develop"
echo "     git push -u origin develop"
echo ""
echo "🎉 Gata! Proiectul tău este pe GitHub."
