# PostHog sur le portfolio

Le site reste statique et compatible GitHub Pages. Le bandeau est retiré et le
SDK reste entièrement désactivé pour les visites ordinaires. Pour enregistrer
votre propre parcours pendant la présentation, ouvrir :

https://adamlaarais.github.io/Portfolio/?posthog_demo=1

Le mode démo est limité à cet onglet, utilise un stockage en mémoire et ne se
transmet pas aux visites normales. Le bouton « Arrêter la démo PostHog » du
pied de page arrête l’enregistrement et retire le paramètre de l’URL.
Le panneau « Démo PostHog » permet aussi d’arrêter la session, de préparer le
formulaire avec des valeurs fictives, de tester une erreur et d’ouvrir le sondage.
Les événements de démonstration portent la propriété `demo_mode: true`.
Ce lien est prévu pour le présentateur qui choisit d’enregistrer sa propre
navigation, pas pour activer silencieusement le suivi des autres visiteurs.

## Configuration et génération

1. `npm ci`
2. Copier `.env.example` en `.env`, puis renseigner le **project token public**
   et le **host d’ingestion** fournis par le projet PostHog.
3. `npm run build:analytics`
4. Publier aussi les fichiers générés dans `assets/analytics/` : GitHub Pages
   les sert directement, aucun serveur Node n’est nécessaire.

`.env` reste ignoré par Git. Les valeurs publiques de configuration sont injectées
au build dans le bundle navigateur. Ne jamais utiliser une clé API personnelle.
Le dépôt conserve les bundles générés pour son déploiement statique existant.

## Événements

| Événement | Signification |
| --- | --- |
| `$pageview` | Visite en mode démo |
| `cv_clicked` | Clic sur le CV, sans preuve de lecture |
| `section_viewed` | Section visible, une fois par chargement en mode démo |
| `project_viewed` | Carte d’un projet visible ; propriété `project_name` |
| `project_link_clicked` | Clic sur un lien de projet, si un lien est renseigné |
| `contact_link_clicked` | Clic email, LinkedIn ou GitHub ; propriété `channel` |
| `contact_section_viewed` | Section Contact visible |
| `contact_form_started` | Saisie ou soumission du formulaire |
| `contact_validation_failed` | Champs invalides ; nombre uniquement |
| `contact_submit_attempted` | Requête d’envoi après validation |
| `contact_submit_failed` | Échec ; code HTTP et catégorie technique uniquement |
| `contact_mailto_open_requested` | Ouverture de messagerie demandée, sans preuve d’envoi |
| `contact_submit_succeeded` | Réponse `{ok:true}` du service d’envoi |
| `feature_cta_clicked` | Clic sur le bouton contact activé par le feature flag |
| `demo_error_requested` | Clic pour provoquer une exception volontaire |
| `$exception` | Exception manuelle à message fixe (volontaire ou échec contact) |

Les noms, emails et messages saisis ne sont pas envoyés dans les événements.
Les champs sont masqués dans le replay ; corps des requêtes, en-têtes et logs
console ne sont pas enregistrés. Les paramètres des URL sont retirés des
événements de navigation. Le replay doit également être activé côté projet.

Les projets actuels n’ont pas de liens externes renseignés : leurs impressions
sont mesurées, les clics sur des liens ne le seront qu’après ajout de ces liens.

## Vérification et démo

`npm test` vérifie l’absence de suivi en visite normale, l’activation et l’arrêt de la démo,
le masquage, les données envoyées et les issues du formulaire, avec un SDK isolé.

Sur le lien de démo publié, cliquer sur « Mon CV », parcourir les
projets et tester le formulaire avec des données fictives. Les actions doivent
apparaître dans Activity, puis la session dans Session Replay après traitement.

Le formulaire PHP reste incompatible avec GitHub Pages : cette intégration
observe son échec ; elle ne répare pas l’envoi d’emails. En démo, le message
affiche le code HTTP et n’ouvre pas de messagerie. En visite ordinaire, le fallback
mailto demande à l’utilisateur d’envoyer le message lui-même sans annoncer un succès.

## Parcours de présentation — 10 minutes

| Temps | Action | Fonction montrée |
| --- | --- | --- |
| 0:00–1:00 | Expliquer l’objectif : comprendre le parcours d’un recruteur | PostHog et événements |
| 1:00–2:00 | Ouvrir le mode démo, voir le CV et les projets | Suivi des clics et des impressions |
| 2:00–3:30 | Ouvrir le tableau de bord, lire le taux visite → CV | Statistiques, segmentation, funnel |
| 3:30–5:00 | Préparer le formulaire, cliquer Envoyer et lire HTTP 405 | Abandon, erreur métier, limitation GitHub Pages |
| 5:00–6:00 | Ouvrir le replay de cette session depuis le panneau | Navigation reconstruite et champs masqués |
| 6:00–7:00 | Générer une erreur volontaire, ouvrir Error Tracking | Exception regroupée et replay associé |
| 7:00–8:00 | Montrer les libellés A/B et la métrique Clic CV | Expérimentation 50/50, sans conclure sur si peu de données |
| 8:00–9:00 | Désactiver le flag dans PostHog, puis actualiser les variantes | Fonctionnalité modifiée sans redéployer le site |
| 9:00–10:00 | Donner une note au sondage, montrer sa réponse | Retour utilisateur puis bilan |

Rétablir le flag contact après l’exposé. Prévoir un replay déjà traité en secours :
les enregistrements, erreurs et réponses ne sont pas toujours immédiatement visibles.
Les mesures de performance (Core Web Vitals) et les heatmaps sont aussi activées
pour le mode démo ; elles nécessitent des visites et des interactions pour se remplir.

## Ressources du projet

- [Tableau de bord Portfolio](https://eu.posthog.com/project/352470/dashboard/1120085)
- [Replays](https://eu.posthog.com/project/352470/replay)
- [Error Tracking](https://eu.posthog.com/project/352470/error-tracking)
- [Expérience : libellé du CV](https://eu.posthog.com/project/352470/experiments/113651)
- [Feature flag : bouton contact](https://eu.posthog.com/project/352470/feature-flags/364080)
- [Sondage : découverte des projets](https://eu.posthog.com/project/352470/surveys/01a1e3f1-6c88-0000-d2e6-63b72960e59f)

L’expérience est réellement répartie par PostHog. Le panneau ne force aucune
variante et « Nouvelle session » recharge avec une nouvelle identité anonyme
en mémoire : il peut donc retomber sur la même variante. Les chiffres sont ceux
des tests du présentateur, pas des statistiques représentatives de recruteurs.
Le tableau de bord filtre `demo_mode=true`, sur les sept derniers jours, et
les funnels acceptent des actions intermédiaires dans une fenêtre d’une heure.
Une « personne » de démonstration est ici une identité anonyme par chargement,
pas forcément une personne physique différente.

La configuration couvre les fonctions pertinentes pour un portfolio statique.
Les modules serveur (entrepôt de données, suivi LLM, paiements, etc.) ne sont
pas alimentés par ce site et ne font pas partie de ce parcours.

Documentation : https://posthog.com/docs/libraries/js
