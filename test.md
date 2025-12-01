pour tester le deal


### Étape 1 : Lister vos deals pour obtenir un ID

GET http://localhost:3000/api/deals

recuperer l'ID

### Étape 2
Reconnectez-vous pour obtenir un nouveau token :

POST http://localhost:3000/api/auth/login

** {
  "username": "testeur",
  "email": "testeur@test.com",
}


POST http://localhost:3000/api/deals/id/vote

Headers:
  Content-Type: application/json
  Authorization: Bearer <votre_vrai_token>

Body (raw JSON):
{
  "type": "hot" /
}
6923a9a37af979b7e6f5455f

Créer un commentaire sur un deal
POST http://localhost:3000/api/deals/6923a9a37af979b7e6f5455f/comments
Headers:
  Content-Type: application/json
  Authorization: Bearer <token>

  ### 2. Lister les commentaires d'un deal

GET http://localhost:3000/api/deals/6923a9a37af979b7e6f5455f/comments

3. Modifier son commentaire
PUT http://localhost:3000/api/comments/<comment_id>
Headers:
  Content-Type: application/json
  Authorization: Bearer <token>

Body:
{
  "content": "Mise à jour : j'ai reçu ma commande, tout est parfait !"
}
```

### 4. Supprimer son commentaire
```
DELETE http://localhost:3000/api/comments/<comment_id>
Headers:
  Authorization: Bearer <token>

  POST http://localhost:3000/api/auth/login

 ### Se connecter en tant que moderator
 POST http://localhost:3000/api/auth/login
{
  "email": "moderator@test.com",
  "password": "Test1234"
}
```

Copiez le token du moderator.

---

### 2. Lister les deals en attente (moderator)
```
GET http://localhost:3000/api/admin/deals/pending
Headers:
  Authorization: Bearer <token_moderator>

  3. Approuver un deal (moderator)
jsonPATCH http://localhost:3000/api/admin/deals/<deal_id>/moderate
Headers:
  Content-Type: application/json
  Authorization: Bearer <token_moderator>

Body:
{
  "status": "approved"
}

4. Rejeter un deal (moderator)
PATCH http://localhost:3000/api/admin/deals/<deal_id>/moderate
Headers:
  Content-Type: application/json
  Authorization: Bearer <token_moderator>

Body:
{
  "status": "rejected"
}


---

### 5. Lister tous les utilisateurs (admin uniquement)

GET http://localhost:3000/api/admin/users
Headers:
  Authorization: Bearer <token_admin>

  6. Changer le rôle d'un utilisateur (admin uniquement)
jsonPATCH http://localhost:3000/api/admin/users/<user_id>/role
Headers:
  Content-Type: application/json
  Authorization: Bearer <token_admin>

Body:
{
  "role": "moderator"
}
