# Passer de Supabase local à Supabase Cloud

## 1. Créer le projet cloud

1. Va sur [supabase.com](https://supabase.com) → **New project**.
2. Choisis une **région** (ex. `West EU` si ton app est en Europe).
3. Définis un **mot de passe** fort pour la base PostgreSQL (à conserver, tu en aurois besoin pour `DATABASE_URL`).

## 2. Récupérer les clés (Dashboard)

Dans **Project Settings** :

| Onglet | Copier |
|--------|--------|
| **API** | **Project URL** → `SUPABASE_URL` (ex. `https://abcdefgh.supabase.co`) |
| **API** | **anon** `public` → `SUPABASE_KEY` |
| **API** | **service_role** `secret` → `SUPABASE_SERVICE_KEY` (ne jamais l’exposer côté navigateur) |
| **API** | **JWT Secret** (souvent section *Legacy* ou *JWT*) → `JWT_SECRET` (chaîne entière) |
| **Database** | **Connection string** (URI) → `DATABASE_URL` (choisis *Session* ou *Transaction* selon le besoin, souvent le **pooler** `aws-0-...pooler.supabase.com:6543` pour les conteneurs) |

> Si tu choisis l’onglet *Connection string* / *URI*, remplace `[YOUR-PASSWORD]` par le mot de passe défini à la création du projet.

## 3. Appliquer le schéma (migrations)

Depuis la racine du dépôt, avec le **CLI** Supabase lié au projet cloud :

```bash
# une fois (token : Account → Access Tokens sur supabase.com)
supabase login
supabase link --project-ref TON_REF   # ex. dans l’URL du dashboard : /project/abcdefghijklmnop
supabase db push
```

> `project-ref` : dans **Project Settings → General** (souvent visible dans l’URL du dashboard).

**Alternative** : colle le contenu des fichiers de `supabase/migrations/*.sql` dans l’**SQL Editor** du dashboard, dans l’ordre (dates dans les noms de fichiers), puis *Run*.

## 4. Mettre à jour `.env`

Remplace les blocs **Supabase** et **Database** (et `JWT_SECRET`) par les valeurs du dashboard. Exemple (valeurs factices) :

```env
SUPABASE_URL=https://abcdefgh.supabase.co
SUPABASE_KEY=eyJhbGciOiJI...
SUPABASE_SERVICE_KEY=eyJhbGciOiJI...
DATABASE_URL=postgresql://postgres.abcdefgh:TON_MOT_DE_PASSE@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
JWT_SECRET=ta-longue-chaîne-copiée-dans-API
```

- Plus besoin de `host.docker.internal` : l’URL est publique (HTTPS / Postgres hébergé).
- `supabase start` n’est **plus** nécessaire pour l’app : tu peux faire `supabase stop` en local pour libérer des ports.

## 5. Redémarrer l’appli

```bash
docker compose down
docker compose up -d --build
```

Ouvre l’api : [http://localhost:8001/docs](http://localhost:8001/docs) et l’UI : [http://localhost:8000](http://localhost:8000) (ou ton `WEB_PORT`).

## Dépannage

- **401** sur `/auth/me` : `JWT_SECRET` ne correspond pas au secret du projet cloud (recopie depuis le dashboard).
- **Connexion DB** : vérifie le mot de passe dans `DATABASE_URL`, le **pooler** (port 6543) et que l’**IP** du serveur hébergeur du Docker est autorisée si le dashboard impose des **restrictions réseau** (Network Restrictions) — par défaut le cloud accepte souvent toutes les IP ; sinon ajoute celle de ta machine / ton serveur.
