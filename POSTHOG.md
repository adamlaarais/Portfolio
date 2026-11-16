# PostHog sur le portfolio

Le site reste statique et compatible GitHub Pages. Le bandeau est retiré et le
SDK reste entièrement désactivé pour les visites ordinaires. Pour enregistrer
votre propre parcours pendant la présentation, ouvrir :

https://adamlaarais.github.io/Portfolio/?posthog_demo=1

Le mode démo est limité à cet onglet, utilise un stockage en mémoire et ne se
transmet pas aux visites normales. Le bouton « Arrêter la démo PostHog » du
pied de page arrête l’enregistrement et retire le paramètre de l’URL.
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
observe son échec et son fallback mailto ; elle ne répare pas l’envoi d’emails.

Documentation : https://posthog.com/docs/libraries/js
