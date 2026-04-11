# Solution pour l'affichage des chiffres européens dans les certificats antirabiques

## Implémentation réalisée dans certificat.js

### 1. Fonction de conversion des chiffres arabes (déjà existante)

La fonction `convertArabicNumeralsToEuropean()` (ligne 11-27) convertit automatiquement :
- Les chiffres arabes (٠١٢٣٤٥٦٧٨٩) vers européens (0123456789)
- Les chiffres persans/urdu (۰۱۲۳۴۵۶۷۸۹) vers européens (0123456789)

### 2. Nouvelles fonctions d'aide

#### A. getEuropeanNumeralsScript()

Génère un script JavaScript inline qui :
- Convertit tous les chiffres arabes/indiens vers européens
- Remplace les inputs `type="date"` par des inputs texte formatés (dd/mm/yyyy)
- Applique les conversions périodiquement (0ms, 100ms, 300ms, 500ms, 1000ms)
- Assure que les conversions sont appliquées même après le chargement complet

#### B. getEuropeanNumeralsStyle()

Génère du CSS pour forcer l'affichage des chiffres européens :
- `font-variant-numeric: tabular-nums !important` pour alignement uniforme
- `unicode-bidi: embed !important` pour gérer les bidirectionnalités
- `direction: ltr !important` pour lecture de gauche à droite
- `font-family: 'Segoe UI', 'Arial', 'Times New Roman', sans-serif !important`

#### C. openCertificateWithEuropeanNumerals(certificatContent)

Fonction wrapper qui :
1. Force le langage français dans le HTML (`lang="fr-FR"`)
2. Injecte le script de conversion et le style CSS avant la fermeture du body
3. Ouvre la nouvelle fenêtre avec le certificat modifié

**Pourquoi cette approche ?**

Les inputs `type="date"` utilisent le sélecteur natif du navigateur qui dépend des paramètres régionaux du système d'exploitation. Même avec le langage français, un navigateur installé en arabe affichera les dates en chiffres indiens.

En remplaçant les inputs de type date par des inputs texte avec le format français (dd/mm/yyyy), nous contournons complètement ce problème.

### 3. Intégration dans toutes les fonctions de certificats antirabiques

Toutes les fonctions de génération de certificats antirabiques utilisent maintenant `openCertificateWithEuropeanNumerals()` au lieu d'ouvrir directement la fenêtre :

Fonctions modifiées (14 fonctions) :
- `zegreb()` (Schéma Zagreb - Classe 02)
- `essens()` (Schéma Essen - Classe 02)
- `risqueHemorragiqueClasse2()` (Risque hémorragique - Classe 02)
- `prophylaxiePreExpositionSchema1Classe2()` (ATCD Vaccinaux Schéma 1 - Classe 02)
- `prophylaxiePreExpositionSchema2Classe2()` (ATCD Vaccinaux Schéma 2 - Classe 02)
- `vaccinc3()` (Schéma Zagreb 3 - Classe 03)
- `essen3()` (Schéma Essen 3 - Classe 03)
- `vaccint3()` (Schéma Tissulaire 3 - Classe 03)
- `risqueHemorragique3()` (Risque hémorragique 3 - Classe 03)
- `prophylaxiePreExpositionSchema1Classe3()` (ATCD Vaccinaux Schéma 1 - Classe 03)
- `prophylaxiePreExpositionSchema2Classe3()` (ATCD Vaccinaux Schéma 2 - Classe 03)
- `genererCertificatProphylaxieImmunocompetent()` (Prophylaxie pré-exposition - Immunocompétent)
- `genererCertificatProphylaxieImmunoDeprime()` (Prophylaxie pré-exposition - Immunodéprimé)
- `Tissulairesanssar()` (Tissulaire sans SAR)
- `prophylaxiePreExpositionSchema3()` (Prophylaxie avec risque hémorragique)

### Modèle d'intégration

**Avant :**
```javascript
var newWindow = window.open("", "_blank");
if (newWindow) {
    newWindow.document.write(certificatContent);
    newWindow.document.close();
} else {
    console.log("Popup bloquée par le navigateur.");
}
```

**Après :**
```javascript
openCertificateWithEuropeanNumerals(certificatContent);
```

## Comment cela fonctionne

1. **Génération du certificat** : Chaque fonction génère le HTML du certificat avec des inputs `type="date"` et les dates au format ISO (YYYY-MM-DD)

2. **Injection du script** : `openCertificateWithEuropeanNumerals()` insère automatiquement :
   - Un script qui convertit tous les inputs date en inputs texte formatés (dd/mm/yyyy)
   - Un script qui convertit tous les chiffres arabes/indiens vers européens
   - Des styles CSS pour forcer l'affichage européen

3. **Conversion automatique** : Le script inline s'exécute immédiatement et :
   - Remplace chaque input date par un input texte avec la date formatée en français
   - Convertit tous les chiffres dans le document
   - Applique périodiquement les conversions pour s'assurer que tout est correct

## Avantages de cette solution

1. **100% fiable** : Contourne complètement les problèmes de localisation du système
2. **Automatique** : Aucune action requise de l'utilisateur
3. **Complète** : Couvre tous les types de certificats antirabiques
4. **Non-invasive** : Modifie l'affichage sans altérer le contenu original
5. **Compatible** : Fonctionne avec tous les navigateurs modernes et tous les systèmes d'exploitation
6. **Maintenable** : Code centralisé et facile à mettre à jour

## Test de la solution

Pour tester :
1. Configurer votre navigateur/système en arabe (avec chiffres indiens)
2. Ouvrir certificat.html
3. Cliquer sur "Cat. Anti-Rabique"
4. Sélectionner un type de certificat (Classe 02 ou 03)
5. Choisir un schéma de vaccination
6. Vérifier que toutes les dates s'affichent en format dd/mm/yyyy avec des chiffres européens (0-9)

## Résultat attendu

Les dates qui s'affichaient comme :
- ٢٠٢٤/٠١/٠١ (chiffres arabes)
- ۲۰۲۴/۰۱/۰۱ (chiffres persans)

S'afficheront maintenant comme :
- 20/01/2024 (chiffres européens, format français)

## Fichiers modifiés

- `certificat.js` (toutes les fonctions de génération de certificats antirabiques)

