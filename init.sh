#!/bin/bash

# Script d'initialisation du projet MSPR

echo "🚀 Initialisation du projet MSPR TPRE501"
echo ""

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

echo "✅ Docker et Docker Compose sont installés"
echo ""

# Créer le fichier .env s'il n'existe pas
if [ ! -f .env ]; then
    echo "📝 Création du fichier .env depuis env.example..."
    cp env.example .env
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
docker-compose build

echo ""
echo "✅ Initialisation terminée !"
echo ""
supabase start
docker compose up
echo "3. Accédez à l'API: http://localhost:8000/docs"
echo "4. Accédez à Streamlit: http://localhost:8501"
echo ""

  