# 🚀 DealExpress API

API REST de partage de bons plans avec système de votes, commentaires et modération.

---

## 📦 Installation

### Prérequis
- Node.js
- MongoDB
- Insomnia (pour tester)

### Étapes

1. **Cloner et installer**
```bash
git clone <votre-repo>
cd dealexpress
npm install
```

2. **Configurer `.env`**

3. **Lancer le serveur**
```bash
npm run dev
```

Le serveur démarre sur `http://localhost:3000`

---

## 👥 Comptes de test

Créez ces comptes via inscription, puis modifiez le rôle dans MongoDB Compass :

| Email | Password | Role |
|-------|----------|------|
| user@test.com | User1234 | user |
| moderator@test.com | Moderator1234 | moderator |
| admin@test.com | Admin1234 | admin |

---

## 📖 Endpoints principaux

### 🔐 Authentification
```http
POST /api/auth/register  # Inscription
POST /api/auth/login     # Connexion
GET  /api/auth/me        # Mon profil
```

### 📦 Deals
```http
GET    /api/deals              # Liste des deals
GET    /api/deals/search?q=    # Recherche
GET    /api/deals/:id          # Détails d'un deal
POST   /api/deals              # Créer un deal (auth)
PUT    /api/deals/:id          # Modifier (ownership)
DELETE /api/deals/:id          # Supprimer (ownership)
```

### 🗳️ Votes
```http
POST   /api/deals/:id/vote     # Voter hot/cold (auth)
DELETE /api/deals/:id/vote     # Retirer son vote (auth)
GET    /api/deals/:id/votes    # Statistiques
```

### 💬 Commentaires
```http
GET    /api/deals/:dealId/comments  # Liste des commentaires
POST   /api/deals/:dealId/comments  # Créer (auth)
PUT    /api/comments/:id            # Modifier (ownership)
DELETE /api/comments/:id            # Supprimer (ownership)
```

### 👮 Administration
```http
GET   /api/admin/deals/pending       # Deals en attente (moderator/admin)
PATCH /api/admin/deals/:id/moderate  # Approuver/Rejeter (moderator/admin)
GET   /api/admin/users               # Liste users (admin)
PATCH /api/admin/users/:id/role      # Changer rôle (admin)
```

---

## 🧪 Tester l'API

### Avec Insomnia
1. Importer `DealExpress.insomnia.json`
2. Se connecter via `/auth/login`
3. Le token est automatiquement utilisé

### Scénario complet
```
1. S'inscrire (POST /auth/register)
2. Créer un deal (POST /deals) → status "pending"
3. En tant que moderator, approuver le deal (PATCH /admin/deals/:id/moderate)
4. Voter "hot" (POST /deals/:id/vote)
5. Commenter (POST /deals/:dealId/comments)
```

---

## 📊 Permissions

| Action | User | Moderator | Admin |
|--------|:----:|:---------:|:-----:|
| Créer deal | ✅ | ✅ | ✅ |
| Modifier son deal (pending) | ✅ | ✅ | ✅ |
| Supprimer son deal | ✅ | ✅ | ✅ |
| Approuver/Rejeter deal | ❌ | ✅ | ✅ |
| Supprimer tous les deals | ❌ | ❌ | ✅ |
| Voter | ✅ | ✅ | ✅ |
| Commenter | ✅ | ✅ | ✅ |
| Supprimer tous commentaires | ❌ | ❌ | ✅ |
| Gérer utilisateurs | ❌ | ❌ | ✅ |

---

## 🏗️ Structure
```
dealexpress/
├── src/
│   ├── config/         # Configuration MongoDB
│   ├── models/         # Modèles (User, Deal, Vote, Comment)
│   ├── controllers/    # Logique métier
│   ├── routes/         # Définition des routes
│   ├── middlewares/    # Auth, validation, ownership
│   ├── validators/     # Validation des données
│   └── app.js          # Point d'entrée
├── .env                # Variables d'environnement
├── package.json
└── README.md
```

---

## 🔒 Sécurité

- ✅ Mots de passe hashés (bcryptjs)
- ✅ Authentification JWT
- ✅ Validation de toutes les entrées
- ✅ Système de permissions (RBAC)
- ✅ Protection CORS

---

## 🛠️ Technologies

- Express.js - Framework web
- MongoDB - Base de données
- Mongoose - ODM
- JWT - Authentification
- bcryptjs - Hashing
- express-validator - Validation

---

## 📄 Livrables

- ✅ Code source complet
- ✅ README.md
- ✅ .env.example
- ✅ Collection Insomnia
- ✅ Documentation des comptes de test

---

## 👨‍💻 Auteur

Projet réalisé dans le cadre du TP DealExpress

---

**🎉 API prête à l'emploi !**