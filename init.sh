#!/bin/bash

# Script d'initialisation du projet MSPR

echo "🚀 Initialisation du projet MSPR TPRE502"
echo ""

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

if ! docker compose version &> /dev/null && ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas disponible (essayez : docker compose version)."
    exit 1
fi

echo "✅ Docker et Docker Compose sont installés"
echo ""

# Créer le fichier .env s'il n'existe pas
if [ ! -f .env ]; then
    echo "📝 Création du fichier .env depuis .env.example..."
    cp .env.example .env
    echo "⚠️  IMPORTANT: Veuillez éditer le fichier .env avec vos credentials Supabase"
    echo ""
else
    echo "✅ Le fichier .env existe déjà"
    echo ""
fi

# Créer le dossier data pour l'ETL s'il n'existe pas
if [ ! -d "etl/data" ]; then
    mkdir -p etl/data
    echo "✅ Dossier etl/data créé"
fi

echo "📦 Construction des images Docker..."
docker compose build

echo ""
echo "✅ Initialisation terminée !"
echo ""

# Même logique que docker-compose : ${WEB_PORT:-8003} (le compose lit .env ; on affiche le bon port)
WEB_PORT_DISPLAY=8003
if [ -f .env ]; then
  _wp_line=$(grep -E '^[[:space:]]*WEB_PORT=' .env | tail -1 || true)
  if [ -n "$_wp_line" ]; then
    WEB_PORT_DISPLAY=$(echo "$_wp_line" | sed 's/^[[:space:]]*WEB_PORT=//' | tr -d '"' | tr -d "'" | tr -d ' ')
  fi
fi

supabase start
echo ""
echo "➜  Démarrage des conteneurs (Ctrl+C pour arrêter)."
echo "   API : http://localhost:8002/docs"
echo "   Web : http://localhost:${WEB_PORT_DISPLAY}"
echo "   Astuce : port déjà utilisé → éditer WEB_PORT dans .env ou arrêter l’autre processus."
echo "   Anciens conteneurs (ex. streamlit) : nettoyés avec --remove-orphans."
echo ""
docker compose up --remove-orphans
echo ""
echo "API : http://localhost:8002/docs"
echo "Web : http://localhost:${WEB_PORT_DISPLAY}"
echo ""

  