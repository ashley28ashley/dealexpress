# 🚀 DealExpress API

API REST de partage de bons plans avec système de votes, commentaires et modération.

---

## 📦 Installation

### Prérequis
- Node.js 
- MongoDB
- Insomnia 

### Étapes

1. **Cloner et installer**
```bash
git clone https://github.com/ashley28ashley/dealexpress.git
cd dealexpress
npm install


2. **Configurer `.env`**
env
PORT=3000
MONGODB_URI=mongodb+srv://ashley:ashley28@cluster0.cm8hmds.mongodb.net/?appName=Cluster0
JWT_SECRET=votre_secret_super_securise
JWT_EXPIRE=7d


3. **Lancer MongoDB**
bash
# Assurez-vous que MongoDB est démarré


4. **Lancer le serveur**
`bash
npm run dev


Le serveur démarre sur `http://localhost:3000`

---

## 👥 Comptes de test

Créez ces comptes via inscription (`POST /api/auth/register`), puis modifiez le rôle manuellement dans **MongoDB Compass** :

| Email | Password | Role | Modification |
|-------|----------|------|--------------|
| user@test.com | User1234 | user | Aucune (rôle par défaut) |
| moderator@test.com | Moderator1234 | moderator | Changer `role: "user"` → `"moderator"` |
| admin@test.com | Admin1234 | admin | Changer `role: "user"` → `"admin"` |

** Important** : 
- Le mot de passe est automatiquement hashé lors de l'inscription
- Ne modifiez QUE le champ `role` dans MongoDB
- Ne touchez PAS au champ `password` 

---

##  Documentation des endpoints

### Base URL

http://localhost:3000/api




###  Authentification

#### Inscription
http
POST /auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "Password125"
}


**Réponse (201)** :
json
{
  "success": true,
  "message": "Inscription réussie",
  "data": {
    "user": {
      "id": "...",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}


#### Connexion
http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password125"
}


#### Mon profil
http
GET /auth/me
Authorization: Bearer <token>


---

###  Deals

#### Lister les deals (public)
http
GET http://localhost:3000/api/deals

**Réponse** :

```json
{
  "success": true,
  "data": {
    "deals": [
      {
        "_id": "...",
        "title": "iPhone 15 Pro en promo",
        "description": "Super deal",
        "price": 899,
        "originalPrice": 1299,
        "url": "https://example.com",
        "category": "High-Tech",
        "status": "approved",
        "temperature": 5,
        "hotVotes": 7,
        "coldVotes": 2,
        "totalVotes": 9,
        "authorId": {
          "username": "bob"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
'''

#### Rechercher des deals
```http
GET /deals/search?q=iphone
```

#### Détails d'un deal
```http
GET /deals/:id
```

#### Créer un deal (authentifié)
```http
POST /deals
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "tablette en promo",
  "description": "Excellente promo sur la tablette",
  "price": 999,
  "originalPrice": 1299,
  "url": "https://example.com/tablette",
  "category": "High-Tech"
}
```

**Catégories disponibles** : `High-Tech`, `Maison`, `Mode`, `Loisirs`, `Autre`

** Important** : Les deals créés ont le status `"pending"` et doivent être approuvés par un modérateur.

#### Modifier un deal (ownership requis, status pending uniquement)
http
PUT /deals/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Nouveau titre",
  "price": 849
}

#### Supprimer un deal (ownership ou admin)
```http
DELETE /deals/:id
Authorization: Bearer <token>
```

---

### 🗳️ Votes

#### Voter sur un deal
```http
POST /deals/:id/vote
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "hot"
}
```

**Types de vote** : `hot` ou `cold`

**Règles** :
- 1 utilisateur = 1 vote par deal
- Changer de vote remplace le vote précédent
- Température = (votes hot) - (votes cold)

#### Retirer son vote
```http
DELETE /deals/:id/vote
Authorization: Bearer <token>
```

#### Statistiques de votes (public)
```http
GET /deals/:id/votes
```

---

###  Commentaires

#### Lister les commentaires d'un deal (public)
```http
GET /deals/:dealId/comments
```

#### Créer un commentaire (authentifié)
http
POST /deals/:dealId/comments
Authorization: Bearer <token user>
Content-Type: application/json

{
  "content": "Super deal ! Merci pour le partage."
}


#### Modifier son commentaire (ownership requis)
http
PUT /comments/:id
Authorization: Bearer <token user>
Content-Type: application/json

{
  "content": "Commentaire mis à jour"
}


#### Supprimer son commentaire (ownership ou admin)
http
DELETE /comments/:id
Authorization: Bearer <token>


---

###  Administration

#### Liste des deals en attente (moderator/admin)
```http
GET /admin/deals/pending?page=1&limit=10
Authorization: Bearer <token_moderator_or_admin>
```

#### Modérer un deal (moderator/admin)
```http
PATCH /admin/deals/:id/moderate
Authorization: Bearer <token_moderator_or_admin>
Content-Type: application/json

{
  "status": "approved"
}
```

**Status possibles** : `approved` ou `rejected`

**Effet** :
- `approved` : Le deal devient visible publiquement
- `rejected` : Le deal reste invisible des users (mais visible des moderators/admins)

#### Liste des utilisateurs (admin uniquement)
```http
GET /admin/users?page=1&limit=20
Authorization: Bearer <token_admin>
```

#### Changer le rôle d'un utilisateur (admin uniquement)
```http
PATCH /admin/users/:id/role
Authorization: Bearer <token_admin>
Content-Type: application/json

{
  "role": "moderator"
}
```

**Rôles possibles** : `user`, `moderator`, `admin`

** Protection** : Un admin ne peut pas se retirer ses propres droits admin.

---

##  Tester l'API avec Insomnia

### Importer la collection

1. Ouvrez **Insomnia**
2. **Create** → **Import**
3. Sélectionnez `DealExpress.insomnia.json`
4. Toutes les requêtes sont prêtes ! 🎉

### Configuration du token

**Méthode 1 : Manuelle**
1. Faites `POST /auth/login`
2. Copiez le token de la réponse
3. Dans chaque requête authentifiée, ajoutez le header :
   - Name : `Authorization`
   - Value : `Bearer <votre_token>`

**Méthode 2 : Variable d'environnement** 
1. Créez un environnement `Local`
2. Ajoutez les variables :
```json
   {
     "base_url": "http://localhost:3000/api",
     "token": ""
   }
```
3. Après login, copiez le token dans la variable `token`
4. Utilisez `{{ _.token }}` dans vos requêtes

### Scénario de test complet
```
1. S'inscrire (POST /auth/register)
   → Récupérer le token

2. Créer un deal (POST /deals)
   → Status "pending", noter l'ID du deal

3. Créer un compte moderator
   → S'inscrire puis changer le role en "moderator" dans MongoDB

4. Se connecter en moderator (POST /auth/login)
   → Récupérer le token moderator

5. Lister les deals en attente (GET /admin/deals/pending)
   → Voir le deal créé à l'étape 2

6. Approuver le deal (PATCH /admin/deals/:id/moderate)
   → Status devient "approved"

7. Voter "hot" (POST /deals/:id/vote)
   → Température = 1

8. Commenter (POST /deals/:dealId/comments)
   → Commentaire ajouté

9. Modifier son commentaire (PUT /comments/:id)
   → Contenu mis à jour

10. Créer un admin et changer un rôle (PATCH /admin/users/:id/role)
```

---

##  Matrice de permissions

| Action | User | Moderator | Admin |
|--------|:----:|:---------:|:-----:|
| Créer deal (pending) | ✅ | ✅ | ✅ |
| Voir deals approuvés | ✅ | ✅ | ✅ |
| Voir deals pending | ❌ | ✅ | ✅ |
| Modifier son deal (pending) | ✅ | ✅ | ✅ |
| Modifier tous les deals | ❌ | ❌ | ✅ |
| Supprimer son deal | ✅ | ✅ | ✅ |
| Supprimer tous les deals | ❌ | ❌ | ✅ |
| Approuver/Rejeter deal | ❌ | ✅ | ✅ |
| Voter sur deal | ✅ | ✅ | ✅ |
| Commenter | ✅ | ✅ | ✅ |
| Modifier son commentaire | ✅ | ✅ | ✅ |
| Supprimer son commentaire | ✅ | ✅ | ✅ |
| Supprimer tous commentaires | ❌ | ❌ | ✅ |
| Lister utilisateurs | ❌ | ❌ | ✅ |
| Changer rôles | ❌ | ❌ | ✅ |

---

##  Architecture du projet
```
dealexpress/
├── src/
│   ├── config/
│   │   └── database.js              # Configuration MongoDB
│   ├── models/
│   │   ├── User.js                  # Modèle utilisateur
│   │   ├── Deal.js                  # Modèle deal
│   │   ├── Vote.js                  # Modèle vote
│   │   └── Comment.js               # Modèle commentaire
│   ├── controllers/
│   │   ├── auth.controller.js       # Logique auth
│   │   ├── deal.controller.js       # Logique deals
│   │   ├── vote.controller.js       # Logique votes
│   │   ├── comment.controller.js    # Logique commentaires
│   │   └── admin.controller.js      # Logique admin
│   ├── routes/
│   │   ├── auth.routes.js           # Routes auth
│   │   ├── deal.routes.js           # Routes deals
│   │   ├── comment.routes.js        # Routes commentaires
│   │   └── admin.routes.js          # Routes admin
│   ├── middlewares/
│   │   ├── auth.middleware.js       # Authentification JWT & RBAC
│   │   ├── ownership.middleware.js  # Vérification ownership
│   │   └── validate.middleware.js   # Gestion erreurs validation
│   ├── validators/
│   │   ├── auth.validator.js        # Validation auth
│   │   ├── deal.validator.js        # Validation deals
│   │   ├── vote.validator.js        # Validation votes
│   │   ├── comment.validator.js     # Validation commentaires
│   │   └── admin.validator.js       # Validation admin
│   └── app.js                       # Point d'entrée
├── .env                             # Variables d'environnement
├── .env.example                     # Exemple de .env
├── .gitignore                       # Fichiers à ignorer
├── package.json                     # Dépendances
├── DealExpress.insomnia.json        # Collection Insomnia
└── README.md                        # Documentation
```

---

##  Sécurité

-  **Mots de passe hashés** avec bcryptjs (10 rounds)
-  **Authentification JWT** avec expiration configurable
-  **Validation stricte** de toutes les entrées utilisateur
-  **Système RBAC** (Role-Based Access Control)
-  **Protection CORS** activée
-  **Passwords exclus** des réponses API (select: false)
-  **Index unique** sur username et email
-  **Prévention des doublons** de votes

---

##  Technologies utilisées

| Technologie | Usage |
|-------------|-------|
| **Express.js** | Framework web Node.js |
| **MongoDB** | Base de données NoSQL |
| **Mongoose** | ODM pour MongoDB |
| **JWT** | Authentification par tokens |
| **bcryptjs** | Hashing des mots de passe |
| **express-validator** | Validation des données |
| **cors** | Gestion des requêtes cross-origin |
| **dotenv** | Variables d'environnement |

---

##  Codes d'erreur HTTP

| Code | Signification | Exemple |
|------|---------------|---------|
| **200** | Succès | GET deal, Login réussi |
| **201** | Créé avec succès | POST deal, Register |
| **400** | Requête invalide | Validation échouée |
| **401** | Non authentifié | Pas de token ou token invalide |
| **403** | Non autorisé | Pas les permissions nécessaires |
| **404** | Ressource non trouvée | Deal inexistant |
| **500** | Erreur serveur | Erreur base de données |

---

##  Livrables du projet

-  Code source complet et structuré (MVC)
-  README.md avec documentation complète
-  Fichier .env.example
-  Collection Insomnia exportée
-  Documentation des 3 comptes de test
-  Commits Git réguliers avec messages explicites

---

## 🚀 Fonctionnalités implémentées

###  Phase 1 : Authentification
- Inscription et connexion
- Génération de tokens JWT
- 3 rôles (user, moderator, admin)
- Middleware d'authentification
- Middleware de vérification de rôle

###  Phase 2 : CRUD Deals
- Création de deals (status pending)
- Liste publique des deals approuvés
- Filtrage selon le rôle
- Recherche par mots-clés
- Modification (ownership + status pending)
- Suppression (ownership ou admin)
- Pagination

###  Phase 3 : Système de votes
- Vote hot/cold sur les deals
- Calcul automatique de la température
- Prévention des doublons (1 vote/user/deal)
- Modification de vote
- Suppression de vote
- Statistiques de votes

###  Phase 4 : Commentaires
- Ajout de commentaires
- Liste des commentaires par deal
- Modification (ownership)
- Suppression (ownership ou admin)
- Tri par date (plus récent en premier)

###  Phase 5 : Modération et Administration
- Liste des deals en attente (moderator/admin)
- Approbation/Rejet des deals (moderator/admin)
- Liste de tous les utilisateurs (admin)
- Changement de rôles (admin)
- Protection auto-retrait admin

---

##  Concepts avancés utilisés

- **Pattern MVC** (Model-View-Controller)
- **Middleware chaining** (enchaînement de middlewares)
- **RBAC** (Role-Based Access Control)
- **JWT Authentication** (authentification stateless)
- **Population Mongoose** (relations entre collections)
- **Validation en couches** (modèle + express-validator)
- **Gestion des erreurs** centralisée
- **Async/Await** pour le code asynchrone
- **Indexes MongoDB** pour les performances
- **Virtuals Mongoose** pour les champs calculés

---

##  Auteur

Projet réalisé dans le cadre du TP DealExpress - Formation API REST avec Express.js

---

##  Support

Pour toute question :
- Consultez la documentation Express.js : https://expressjs.com
- Consultez la documentation Mongoose : https://mongoosejs.com
- Consultez la documentation JWT : https://jwt.io

---

** API DealExpress - Prête à l'emploi !**