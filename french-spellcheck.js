/**
 * Correcteur orthographique et grammatical français local
 * Utilisé pour les certificats médicaux
 */
var FrenchSpellCheck = (function() {

    // Règles grammaticales : [regex_pattern, message, remplacement_suggéré]
    var regles = [
        // Articles contractés
        { regex: /\bde le\b/g, msg: "Articles contractés : 'de le' → 'du'", rep: "du" },
        { regex: /\bde les\b/g, msg: "Articles contractés : 'de les' → 'des'", rep: "des" },
        { regex: /\bà le\b/g, msg: "Articles contractés : 'à le' → 'au'", rep: "au" },
        { regex: /\bà les\b/g, msg: "Articles contractés : 'à les' → 'aux'", rep: "aux" },
        { regex: /\bde l'/gi, msg: "Vérifiez : 'de l'' est correct devant voyelle", rep: null },
        
        // Accents courants
        { regex: /\b(\w+)e\s/g, msg: "Vérifiez l'accent (ex: 'tete' → 'tête')", rep: null },
        { regex: /\bcommencer\b/g, msg: "Orthographe : 'commencer' (un seul 'n')", rep: "commencer" },
        { regex: /\bplannification\b/g, msg: "Orthographe : 'planification' (un seul 'n')", rep: "planification" },
        { regex: /\bproffessionnel\b/g, msg: "Orthographe : 'professionnel' (un seul 'f')", rep: "professionnel" },
        { regex: /\bproffesionnel\b/g, msg: "Orthographe : 'professionnel'", rep: "professionnel" },
        { regex: /\bacuté\b/g, msg: "Orthographe : 'aigu'", rep: "aigu" },
        { regex: /\bconcerne\b/g, msg: "Vérifiez : 'concerne' ou 'considérant' ?", rep: null },
        
        // Fautes médicales courantes
        { regex: /\becchimose\b/g, msg: "Orthographe : 'ecchymose' (deux 'c' et un 'h')", rep: "ecchymose" },
        { regex: /\bexchymose\b/g, msg: "Orthographe : 'ecchymose'", rep: "ecchymose" },
        { regex: /\btraumtisme\b/g, msg: "Orthographe : 'traumatisme'", rep: "traumatisme" },
        { regex: /\bfracturé\b/g, msg: "Vérifiez : 'fracturé' (participe passé) ou 'fracture' (substantif) ?", rep: null },
        { regex: /\bhemoragie\b/g, msg: "Orthographe : 'hémorragie' (avec accent et double 'r')", rep: "hémorragie" },
        { regex: /\bhémoragie\b/g, msg: "Orthographe : 'hémorragie' (double 'r')", rep: "hémorragie" },
        { regex: /\bcontusioné\b/g, msg: "Orthographe : 'contusionné' (avec accent)", rep: "contusionné" },
        { regex: /\bentorse\b/g, msg: "Vérifiez : 'entorse' ou 'entorsis' ?", rep: null },
        { regex: /\bsyncope\b/g, msg: "Vérifiez : 'syncope' (perte de connaissance) ou 'syncopé' ?", rep: null },
        { regex: /\bdiabéte\b/g, msg: "Orthographe : 'diabète' (avec accent grave)", rep: "diabète" },
        { regex: /\bdiabetique\b/g, msg: "Orthographe : 'diabétique' (avec accent)", rep: "diabétique" },
        { regex: /\bepilepsie\b/g, msg: "Orthographe : 'épilepsie' (avec accent)", rep: "épilepsie" },
        { regex: /\bsympthomes?\b/g, msg: "Orthographe : 'symptôme' (avec 'p' muet et accent)", rep: "symptôme" },
        { regex: /\bsymtomes?\b/g, msg: "Orthographe : 'symptôme'", rep: "symptôme" },
        { regex: /\bantibiotique\b/g, msg: "Vérifiez : 'antibiotique' (avec 'b')", rep: null },
        { regex: /\bantibiotque\b/g, msg: "Orthographe : 'antibiotique'", rep: "antibiotique" },
        { regex: /\binjection\b/g, msg: "Vérifiez : 'injection' (avec 'j')", rep: null },
        { regex: /\binjetion\b/g, msg: "Orthographe : 'injection'", rep: "injection" },
        { regex: /\bprescrire\b/g, msg: "Orthographe : 'prescrire' (avec 's')", rep: "prescrire" },
        { regex: /\bprscrire\b/g, msg: "Orthographe : 'prescrire'", rep: "prescrire" },
        { regex: /\bordonnance\b/g, msg: "Vérifiez : 'ordonnance' (double 'n')", rep: null },
        { regex: /\bordonance\b/g, msg: "Orthographe : 'ordonnance' (double 'n')", rep: "ordonnance" },
        { regex: /\bpatiente?\b/g, msg: "Vérifiez : 'patient' (masc.) ou 'patiente' (fém.) ?", rep: null },
        { regex: /\bgrossesse\b/g, msg: "Vérifiez : 'grossesse' (double 's')", rep: null },
        { regex: /\bgrocesse\b/g, msg: "Orthographe : 'grossesse' (double 's')", rep: "grossesse" },
        
        // Grammaire générale
        { regex: /\bil a\b/g, msg: "Vérifiez : 'il a' (verbe avoir) ou 'il à' (préposition) ?", rep: null },
        { regex: /\bce ci\b/g, msg: "Écriture : 'celui-ci' ou 'celà' ?", rep: null },
        { regex: /\bcelui la\b/g, msg: "Écriture : 'celui-là' (avec trait d'union)", rep: "celui-là" },
        { regex: /\bquelque fois\b/g, msg: "Écriture : 'quelquefois' (un seul mot)", rep: "quelquefois" },
        { regex: /\bnonetheless\b/g, msg: "Mot anglais détecté : traduisez en français", rep: null },
        { regex: /\bhowever\b/g, msg: "Mot anglais détecté : traduisez en français", rep: null },
        
        // Ponctuation
        { regex: /\.\./g, msg: "Double point détecté", rep: "." },
        { regex: /\s+,/g, msg: "Espace avant la virgule", rep: "," },
        { regex: /\s+\./g, msg: "Espace avant le point", rep: "." },
    ];

    // Dictionnaire de mots courants pour vérification
    var dictionnaire = new Set([
        "le", "la", "les", "un", "une", "des", "du", "de", "au", "aux",
        "et", "ou", "mais", "donc", "car", "ni", "ne", "pas", "plus",
        "je", "tu", "il", "elle", "nous", "vous", "ils", "elles",
        "me", "te", "se", "lui", "leur", "moi", "toi", "soi",
        "mon", "ton", "son", "ma", "ta", "sa", "mes", "tes", "ses",
        "ce", "cette", "ces", "cet", "celui", "celle", "ceux", "celles",
        "qui", "que", "quoi", "dont", "où", "lequel", "laquelle",
        "être", "avoir", "faire", "dire", "aller", "voir", "pouvoir",
        "vouloir", "devoir", "falloir", "prendre", "donner", "partir",
        "mettre", "passer", "venir", "tenir", "rester", "paraître",
        "suivre", "devenir", "sortir", "entrer", "tomber", "revenir",
        "rien", "tout", "tous", "toute", "toutes", "aucun", "aucune",
        "bien", "mal", "beaucoup", "peu", "trop", "très", "assez",
        "aussi", "encore", "déjà", "toujours", "jamais", "parfois",
        "souvent", "ici", "là", "dehors", "dedans", "alors",
        "ainsi", "cependant", "néanmoins", "cependant", "pourtant",
        "avant", "après", "pendant", "depuis", "chez", "vers",
        "avec", "sans", "pour", "selon", "malgré", "parce",
        "peut", "être", "fait", "dit", "va", "voit", "peut",
        "vient", "pense", "sait", "croit", "demande", "donne",
        "jour", "temps", "an", "mois", "jour", "heure", "fois",
        "homme", "femme", "enfant", "personne", "gens", "monde",
        "maison", "ville", "pays", "terre", "eau", "feu", "air",
        "corps", "tête", "oeil", "main", "bras", "jambe", "pied",
        "coeur", "sang", "os", "peau", "cheveux", "oreille",
        "vie", "mort", "nuit", "jour", "lumière", "ombre",
        "bon", "mauvais", "grand", "petit", "vieux", "jeune",
        "nouveau", "long", "court", "large", "étroit", "haut",
        "bas", "fort", "faible", "vite", "lentement", "ensemble",
        "vrai", "faux", "juste", "seul", "autre", "même",
        "premier", "dernier", "prochain", "ancien", "divers",
        "complet", "entier", "partiel", "possible", "impossible",
        "nécessaire", "utile", "important", "grave", "sérieux",
        "malade", "santé", "médecin", "docteur", "patient",
        "traitement", "médicament", "ordonnance", "certificat",
        "examen", "diagnostic", "symptôme", "douleur", "fièvre",
        "sang", "cœur", "poumon", "estomac", "rein", "foie",
        "os", "muscle", "nerf", "articulation", "peau",
        "fracture", "entorse", "blessure", "plaie", "coupure",
        "brûlure", "choc", "traumatisme", "accident",
        "ecchymose", "hématome", "oedème", "inflammation",
        "infection", "fièvre", "toux", "rhume", "grippe",
        "allergie", "asthme", "diabète", "hypertension",
        "cholestérol", "anémie", "diarrhée", "vomissement",
        "nausée", "vertige", "mal de tête", "migraine",
        "insomnie", "fatigue", "faiblesse", "perte de poids",
        "perte d'appétit", "perte de connaissance",
        "arrêt de travail", "congé maladie", "reprise",
        " prolongation", "visite médicale", "contrôle",
        "bilan", "résultat", "prescription", "posologie",
        "effet secondaire", "contre-indication", "intolérance",
        "chirurgie", "opération", "anesthésie", "hospitalisation",
        "urgence", "ambulance", "samu", "pompiers",
        "radio", "scanner", "irm", "échographie", "ecg",
        "prise de sang", "analyse", "laboratoire",
        "vaccination", "vaccin", "injection", "piqûre",
        "pansement", "cicatrice", "suture", "sonde",
        "perfusion", "transfusion", "greffe",
        "handicap", "invalidité", "déplacement", "locomotion",
        "marche", "station debout", "position",
        "activité physique", "sport", "effort", "repos",
        "alimentation", "régime", "hygiène", "sommeil",
        "suivi médical", "consultation", "rendez-vous",
        "assurance maladie", "mutuelle", "sécurité sociale",
        "certificat médical", "attestation", "rapport",
        "compte-rendu", "protocole", "consentement",
        "information", "explication", "conseil", "recommandation",
        "observation", "constat", "évaluation", "appréciation",
        "estimation", "pronostic", "évolution", "pronostic",
        "guérison", "rémission", "rechute", "complication",
        "séquelle", "séquelles", "séquelle fonctionnelle",
        "capacité", "incapacité", "inaptitude", "aptitude",
        "restriction", "limitation", "interdiction",
        "contre-indication", "précaution", "mise en garde",
        "avertissement", "notification", "déclaration",
        "déclaration de naissance", "déclaration de décès",
        "certificat de décès", "certificat de naissance",
        "certificat de vie", "certificat de résidence",
        "certificat de bonne santé", "certificat médical",
        "certificat d'aptitude", "certificat d'inaptitude",
        "certificat d'incapacité", "certificat d'invalidité",
        "certificat d'hospitalisation", "certificat d'urgence",
        "certificat de vaccination", "certificat de vaccination antirabique",
        "certificat de vaccination antivariolique",
        "certificat de vaccination antipoliomyélitique",
        "certificat de vaccination antidiphtérique",
        "certificat de vaccination antitétanique",
        "certificat de vaccination anticoquelucheux",
        "certificat de vaccination antiméningococcique",
        "certificat de vaccination antipneumococcique",
        "certificat de vaccination antiamarile",
        "certificat de vaccination antirougeoleuse",
        "certificat de vaccination antiparotidite",
        "certificat de vaccination antirubéoleuse",
        "certificat de vaccination anti-hépatite B",
        "certificat de vaccination anti-hépatite A",
        "certificat de vaccination antityphoïdique",
        "certificat de vaccination anticholérique",
        "certificat de vaccination antipesteuse",
        "certificat de vaccination antiamarile",
        "certificat de vaccination antirabique",
        "certificat de vaccination antivariolique",
        "certificat de vaccination antipoliomyélitique",
        "certificat de vaccination antidiphtérique",
        "certificat de vaccination antitétanique",
        "certificat de vaccination anticoquelucheux",
        "certificat de vaccination antiméningococcique",
        "certificat de vaccination antipneumococcique",
        "certificat de vaccination antiamarile",
        "certificat de vaccination antirougeoleuse",
        "certificat de vaccination antiparotidite",
        "certificat de vaccination antirubéoleuse",
        "certificat de vaccination anti-hépatite B",
        "certificat de vaccination anti-hépatite A",
        "certificat de vaccination antityphoïdique",
        "certificat de vaccination anticholérique",
        "certificat de vaccination antipesteuse",
        "patient", "patiente", "patients", "patientes",
        "médecin", "médecins", "docteur", "docteurs",
        "infirmier", "infirmière", "infirmiers", "infirmières",
        "pharmacien", "pharmacienne", "pharmaciens", "pharmaciennes",
        "chirurgien", "chirurgienne", "chirurgiens", "chirurgiennes",
        "spécialiste", "spécialistes", "généraliste", "généralistes",
        "radiologue", "radiologues", "anesthésiste", "anesthésistes",
        "ophtalmologue", "ophtalmologues", "oto-rhino-laryngologiste",
        "dermatologue", "dermatologues", "cardiologue", "cardiologues",
        "neurologue", "neurologues", "psychiatre", "psychiatres",
        "psychologue", "psychologues", "dentiste", "dentistes",
        "kinésithérapeute", "kinésithérapeutes", "ostéopathe", "ostéopathes",
        "naturopathe", "naturopathes", "hépatologue", "hépatologues",
        "gastro-entérologue", "gastro-entérologues", "pneumologue", "pneumologues",
        "uropologue", "uropologues", "gynécologue", "gynécologues",
        "obstétricien", "obstétriciennes", "pédiatre", "pédiatres",
        "gériatre", "gériatres", "oncologue", "oncologues",
        "hématologue", "hématologues", "endocrinologue", "endocrinologues",
        "rhumatologue", "rhumatologues", "néphrologue", "néphrologues",
        "immunologue", "immunologues", "allergologue", "allergologues",
        "réanimateur", "réanimatrices", "urgentiste", "urgentistes",
        "médecin légiste", "médecin du travail", "médecin scolaire",
        "médecin traitant", "médecin référent", "médecin prescripteur",
        "praticien", "praticiennes", "soignant", "soignantes",
        "professionnel de santé", "professionnelle de santé",
        "corps médical", "équipe médicale", "personnel soignant",
        "personnel médical", "personnel paramédical",
        "structure de soins", "établissement de santé",
        "hôpital", "hôpitaux", "clinique", "cliniques",
        "centre médical", "centre de santé", "cabinet médical",
        "consultation médicale", "consultation externe",
        "consultation interne", "consultation d'urgence",
        "service médical", "service de médecine",
        "service de chirurgie", "service de pédiatrie",
        "service de gynécologie", "service de cardiologie",
        "service de pneumologie", "service de neurologie",
        "service de dermatologie", "service d'ophtalmologie",
        "service d'oto-rhino-laryngologie", "service de radiologie",
        "service d'anesthésie", "service de réanimation",
        "service d'urgence", "service de réception",
        "service d'accueil", "service d'information",
        "service d'orientation", "service d'éducation",
        "service de prévention", "service de protection",
        "service de sécurité", "service de gestion",
        "service d'administration", "service de direction",
        "service de coordination", "service de contrôle",
        "service de qualité", "service d'évaluation",
        "service de recherche", "service de formation",
        "service de maintenance", "service technique",
        "service de nettoyage", "service de blanchissage",
        "service de cuisine", "service de restauration",
        "service de pharmacie", "service de laboratoire",
        "service de chirurgie", "service de maternité",
        "service de néonatalogie", "service de réanimation",
        "service de soins intensifs", "service de surveillance",
        "service de rééducation", "service de réadaptation",
        "service de prévention", "service de promotion",
        "service de recherche", "service d'enseignement",
        "service de formation continue", "service de perfectionnement",
        "service de développement", "service d'amélioration",
        "service de conseil", "service d'assistance",
        "service de soutien", "service d'accompagnement",
        "service de guidance", "service d'orientation",
        "service de planification", "service de programmation",
        "service de budgétisation", "service de financement",
        "service de ressources humaines", "service du personnel",
        "service de logistique", "service de transport",
        "service de sécurité incendie", "service de protection civile",
        "service d'hygiène", "service de salubrité",
        "service d'assainissement", "service de traitement",
        "service d'élimination", "service de destruction",
        "service de stérilisation", "service de désinfection",
        "service de décontamination", "service de quarantaine",
        "service de surveillance épidémiologique",
        "service de veille sanitaire", "service d'alerte",
        "service de surveillance sanitaire", "service de contrôle sanitaire",
        "service d'inspection sanitaire", "service de certification",
        "service d'agrément", "service d'autorisation",
        "service d'accréditation", "service de labélisation",
        "service de reconnaissance", "service de validation",
        "service d'évaluation externe", "service d'audit",
        "service de contrôle qualité", "service d'amélioration continue",
        "service de gestion des risques", "service de prévention des risques",
        "service de gestion des déchets", "service de traitement des eaux",
        "service de surveillance de l'environnement",
        "service de contrôle de la pollution",
        "service de protection de la nature",
        "service de conservation des espèces",
        "service de gestion de la biodiversité",
        "service de développement durable",
        "service de politique de santé",
        "service de stratégie sanitaire",
        "service de planification sanitaire",
        "service de programmation sanitaire",
        "service de coordination des actions",
        "service de partenariat", "service de coopération",
        "service d'échange", "service de communication",
        "service de relations publiques", "service de publicité",
        "service de marketing", "service de promotion",
        "service d'événementiel", "service de sponsoring",
        "service de mécénat", "service de bienfaisance",
        "service de charité", "service d'assistance sociale",
        "service d'aide sociale", "service d'action sociale",
        "service de protection de l'enfance",
        "service de protection de la jeunesse",
        "service de protection des personnes âgées",
        "service de protection des personnes handicapées",
        "service de protection des femmes",
        "service de lutte contre les violences",
        "service de prévention des violences",
        "service de lutte contre les discriminations",
        "service de promotion de l'égalité",
        "service de lutte contre la pauvreté",
        "service de lutte contre l'exclusion",
        "service de lutte contre le chômage",
        "service de lutte contre la précarité",
        "service de lutte contre les addictions",
        "service de lutte contre le tabagisme",
        "service de lutte contre l'alcoolisme",
        "service de lutte contre la toxicomanie",
        "service de lutte contre les troubles du comportement alimentaire",
        "service de lutte contre la dépression",
        "service de lutte contre le suicide",
        "service de lutte contre la violence conjugale",
        "service de lutte contre les violences sexuelles",
        "service de lutte contre les abus sur mineurs",
        "service de protection des victimes",
        "service d'aide aux victimes",
        "service d'accompagnement des victimes",
        "service de soutien psychologique",
        "service d'écoute téléphonique",
        "service de conseil juridique",
        "service d'assistance juridique",
        "service d'aide judiciaire",
        "service de médiation", "service de conciliation",
        "service d'arbitrage", "service de règlement des litiges",
        "service de gestion des conflits",
        "service de résolution des problèmes",
        "service d'amélioration des conditions de travail",
        "service de promotion de la santé au travail",
        "service de prévention des risques professionnels",
        "service de médecine du travail",
        "service de santé au travail",
        "service de protection contre les risques chimiques",
        "service de protection contre les risques biologiques",
        "service de protection contre les risques physiques",
        "service de protection contre les risques ergonomiques",
        "service de protection contre les risques psychosociaux",
        "service de promotion de la sécurité routière",
        "service de promotion de la sécurité incendie",
        "service de promotion de la sécurité alimentaire",
        "service de promotion de la sécurité sanitaire",
        "service de promotion de la sécurité environnementale",
        "service de promotion de la sécurité nucléaire",
        "service de promotion de la sécurité civile",
        "service de promotion de la sécurité publique",
        "service de promotion de la sécurité privée",
        "service de promotion de la sécurité informatique",
        "service de promotion de la sécurité des données",
        "service de promotion de la sécurité des personnes",
        "service de promotion de la sécurité des biens",
        "service de promotion de la sécurité des institutions",
        "service de promotion de la sécurité internationale",
        "service de promotion de la sécurité nationale",
        "service de promotion de la sécurité régionale",
        "service de promotion de la sécurité locale",
        "service de promotion de la sécurité communautaire",
        "service de promotion de la sécurité urbaine",
        "service de promotion de la sécurité rurale",
        "service de promotion de la sécurité maritime",
        "service de promotion de la sécurité aérienne",
        "service de promotion de la sécurité ferroviaire",
        "service de promotion de la sécurité routière",
        "service de promotion de la sécurité des transports",
        "service de promotion de la sécurité industrielle",
        "service de promotion de la sécurité des installations",
        "service de promotion de la sécurité des travaux",
        "service de promotion de la sécurité des produits",
        "service de promotion de la sécurité des services",
        "service de promotion de la sécurité des personnes",
        "service de promotion de la sécurité des biens",
        "service de promotion de la sécurité des données",
        "service de promotion de la sécurité informatique",
        "service de promotion de la sécurité des réseaux",
        "service de promotion de la sécurité des systèmes",
        "service de promotion de la sécurité des applications",
        "service de promotion de la sécurité des infrastructures",
        "service de promotion de la sécurité des événements",
        "service de promotion de la sécurité des installations",
        "service de promotion de la sécurité des sites",
        "service de promotion de la sécurité des zones",
        "service de promotion de la sécurité des frontières",
        "service de promotion de la sécurité des accès",
        "service de promotion de la sécurité des abords",
        "service de promotion de la sécurité des alentours",
        "service de promotion de la sécurité des environs",
        "service de promotion de la sécurité des approches",
        "service de promotion de la sécurité des abords",
        "service de promotion de la sécurité des accès",
        "service de promotion de la sécurité des entrées",
        "service de promotion de la sécurité des sorties",
        "service de promotion de la sécurité des voies d'accès",
        "service de promotion de la sécurité des voies de circulation",
        "service de promotion de la sécurité des voies de passage",
        "service de promotion de la sécurité des voies de desserte",
        "service de promotion de la sécurité des voies de service",
        "service de promotion de la sécurité des voies de secours",
        "service de promotion de la sécurité des voies d'évacuation",
        "service de promotion de la sécurité des voies de circulation",
        "service de promotion de la sécurité des voies de passage",
        "service de promotion de la sécurité des voies de desserte",
        "service de promotion de la sécurité des voies de service",
        "service de promotion de la sécurité des voies de secours",
        "service de promotion de la sécurité des voies d'évacuation"
    ]);

    // Dictionnaire de mots médicaux courants
    var motsMedicaux = [
        "ecchymose", "hématome", "oedème", "inflammation", "infection",
        "fracture", "entorse", "luxation", "claudication", "boiterie",
        "douleur", "souffrance", "gêne", "gêne fonctionnelle",
        "raideur", "limitation", "restriction", "impotence",
        "céphalée", "migraine", "vertige", "syncope",
        "nausée", "vomissement", "diarrhée", "constipation",
        "toux", "dyspnée", "essoufflement", "oppression",
        "palpitation", "arythmie", "tachycardie", "bradycardie",
        "hypertension", "hypotension", "diabète", "hyperglycémie",
        "hypoglycémie", "cholestérol", "hyperlipidémie",
        "anémie", "leucocytose", "thrombopénie", "thrombocytose",
        "infection urinaire", "infection respiratoire",
        "bronchite", "pneumonie", "pleurésie", "asthme",
        "gastrique", "duodénale", "hémorragie digestive",
        "hépatite", "cirrhose", "pancréatite", " cholécystite",
        "appendicite", " péritonite", "occlusion intestinale",
        "rénale", "lithiase rénale", "colique néphrétique",
        "cystite", "prostatite", "urétrite",
        "arthrose", "arthrite", "polyarthrite", "rhumatisme",
        "lumbago", "sciatique", "cervicalgie", "tendinite",
        "bursite", "épicondylite", "ténosynovite",
        "allergie", "asthme", "eczéma", "urticaire", "dermite",
        "psoriasis", "acné", "mycose", "herpès", "verrue",
        "traumatisme", "contusion", "plaie", "coupure", "brûlure",
        "cicatrice", "kyste", "tumeur", "néoplasme", "cancer",
        "tumeur bénigne", "tumeur maligne", "adénome", "carcinome",
        "sarcome", "lymphome", "leucémie", "myélome",
        "handicap", "invalidité", "incapacité", "déficience",
        "séquelle", "séquelles fonctionnelles",
        "arrêt de travail", "congé maladie", " prolongation",
        "reprise", "visite de contrôle", "examen médical",
        "bilan de santé", "bilan sanguin", "bilan biologique",
        "radiographie", "scanner", "irm", "échographie",
        "ecg", "eeg", "emg", "électromyographie",
        "endoscopie", "fibroscopie", "biopsie",
        "anesthésie", "chirurgie", "opération", "intervention",
        "hospitalisation", "hospitalisation de jour",
        "hospitalisation de nuit", "hospitalisation à domicile",
        "soins ambulatoires", "soins à domicile",
        "soins de suite", "rééducation", "réadaptation",
        "kinésithérapie", "ergothérapie", "psychomotricité",
        "orthophonie", "podologie", "optique",
        "audioprothèse", "prothèse", "orthèse",
        "fauteuil roulant", "déambulateur", "béquilles",
        "pansement", "suture", "ablation", "excision",
        "drainage", "ponction", "perfusion", "transfusion",
        "injection", "piqûre", "vaccination", "vaccin",
        "antibiotique", "antidouleur", "antipyrétique",
        "anti-inflammatoire", "anticoagulant", "antihypertenseur",
        "antidiabétique", "antidépresseur", "anxiolytique",
        "hypnotique", "neuroleptique", "antipsychotique",
        "hormone", "corticoïde", "cortisone", "cortisone",
        "thyroïdien", "pancréatique", "insuline",
        "cholestérol", "triglycérides", "glycémie",
        "hémoglobine", "hématocrite", "plaquettes",
        "globules blancs", "globules rouges", "leucocytes",
        "lymphocytes", "neutrophiles", "monocytes", "éosinophiles",
        "transaminases", "creatinine", "urée", "acide urique",
        "bilirubine", "phosphatase alcaline", "gamma gt",
        "amylase", "lipase", "troponine", "bnp", "nt-probnp",
        "crp", "vs", "cpk", "ldh", "ferritine", "transferrine",
        "vitamine b12", "acide folique", "folate",
        "calcium", "phosphore", "magnésium", "potassium",
        "sodium", "chlorure", "bicarbonate", "phosphate",
        "protéines", "albumine", "préalbumine",
        "coagulation", "tp", "tsa", "fibrinogène", "d-dimère",
        "hémoglobine glyquée", "hba1c", "insuline",
        "peptide c", "gastrine", "calcitonine",
        "parathormone", "pth", "vitamine d",
        "25 oh vitamine d", "1-25 dihydroxy vitamine d",
        "tsh", "t3", "t4", "anticorps anti-tpo",
        "anticorps anti-tg", "anticorps anti-récepteur tsh",
        "testostérone", "estradiol", "progestérone",
        "lh", "fsh", "prolactine", "gh", "igf-1",
        "acth", "cortisol", "aldostérone", "rénine",
        "épinéphrine", "noradrénaline", "dopamine",
        "sérotonine", "gaba", "glutamate", "acétylcholine",
        "histamine", "bradykinine", "substance p", "cgt",
        "végf", "tnf-alpha", "il-1", "il-6", "il-8",
        "inféron", "interleukine", "complément",
        "immunoglobuline", "igg", "igm", "iga", "ige",
        "auto-anticorps", "factor rhumatoïde", "antinucléaire",
        "anti-dna", "anti-sm", "anti-ro", "anti-la",
        "anti-ccp", "anticardiolipine", "anti-b2gp1",
        "lupus anticoagulant", "anticorps anti-gbm",
        "anticorps anti-plaquettaire", "anticorps anti-neutrophile",
        "marqueur tumoral", "cea", "afp", "hcg",
        "ca 125", "ca 19-9", "ca 15-3", "psa",
        "psa libre", "psa total", "psa densité",
        "marqueur osseux", "alp", "ostéocalcine",
        "cross laps", "ctx", "ntx", "p1np",
        "marqueur cardiovasculaire", "troponine",
        "bnp", "nt-probnp", "crp", "pct",
        "marqueur d'inflammation", "crp", "vs", "pct",
        "il-6", "tnf-alpha", "calprotectine",
        "marqueur d'infection", "procalcitonine",
        "crp", "leucocytes", "hémoculture",
        "marqueur hépatique", "transaminases",
        "bilirubine", "ggt", "pal", "albumine",
        "marqueur rénal", "créatinine", "débit de filtration",
        "dfg", "cleat", "cystatine c", "urée",
        "marqueur pancréatique", "amylase", "lipase",
        "glucose", "insuline", "hba1c",
        "marqueur thyroïdien", "tsh", "t3", "t4",
        "anticorps anti-tpo", "anticorps anti-tg",
        "marqueur de coagulation", "tp", "tsa",
        "fibrinogène", "d-dimère", "antithrombine",
        "marqueur hémostase", "tp", "tsa", "vps",
        "marqueur sanguin", "nfs", "bilan biologique",
        "marqueur urinaire", "ecBU", "analyse d'urine",
        "marqueur immunologique", "immunoglobulines",
        "complément", "auto-anticorps",
        "marqueur génétique", "adn", "arn",
        "marqueur viral", "pcr", "sérologie",
        "marqueur bactériologique", "culture",
        "antibiogramme", "sensibilité",
        "marqueur parasitologique", "coproculture",
        "marqueur mycologique", "culture fongique",
        "marqueur hormonal", "dosage hormonal",
        "marqueur métabolique", "bilan métabolique",
        "marqueur nutritionnel", "albumine", "préalbumine",
        "transferrine", "cholestérol", "triglycérides",
        "marqueur lipidique", "bilan lipidique",
        "marqueur glycémique", "glycémie", "hba1c",
        "marqueur rénine-angiotensine", "rénine",
        "aldostérone", "ratio aldostérone/rénine",
        "marqueur surrénalien", "cortisol", "dhea-s",
        "androstènedione", "17-oh progestérone",
        "marqueur gonadique", "fsh", "lh", "testostérone",
        "estradiol", "progestérone", "shbg",
        "marqueur hypophysaire", "gh", "igf-1",
        "prolactine", "acth", "tsh",
        "marqueur gastro-entérologique",
        "calprotectine fécale", "sang occulte",
        "sang dans les selles", "recherche de sang",
        "marqueur hépatobiliaire", "transaminases",
        "pal", "ggt", "bilirubine", "albumine",
        "marqueur pancréatique exocrine", "amylase",
        "lipase", "élastase fécale",
        "marqueur pancréatique endocrine",
        "insuline", "peptide c", "glucagon",
        "marqueur neuro-endocrinien",
        "chromogranine a", "synaptophysine",
        "marqueur tumeur neuro-endocrine",
        "chromogranine a", "5-hiaa",
        "marqueur pheochromocytome",
        "mécatéphrine", "normétanéphrine",
        "acide vanilmandélique", "avm",
        "marqueur neuroblastome",
        "acide homovanillique", "hva",
        "marqueur médullosurrénalien",
        "cortisol", "acth", "dhea-s",
        "marqueur cortical surrénalien",
        "aldostérone", "cortisol", "dhea-s"
    ];

    /**
     * Calcule la distance de Levenshtein entre deux chaînes
     */
    function levenshtein(a, b) {
        var m = a.length, n = b.length;
        var dp = [];
        for (var i = 0; i <= m; i++) { dp[i] = [i]; }
        for (var j = 0; j <= n; j++) { dp[0][j] = j; }
        for (var i = 1; i <= m; i++) {
            for (var j = 1; j <= n; j++) {
                var cost = a[i-1] === b[j-1] ? 0 : 1;
                dp[i][j] = Math.min(
                    dp[i-1][j] + 1,
                    dp[i][j-1] + 1,
                    dp[i-1][j-1] + cost
                );
            }
        }
        return dp[m][n];
    }

    /**
     * Trouve les mots similaires dans le dictionnaire
     */
    function trouverMotsSimilaires(mot, maxDistance) {
        maxDistance = maxDistance || 2;
        var mots = [];
        var motLower = mot.toLowerCase();
        
        // Chercher dans le dictionnaire médical
        for (var i = 0; i < motsMedicaux.length; i++) {
            var d = levenshtein(motLower, motsMedicaux[i].toLowerCase());
            if (d > 0 && d <= maxDistance) {
                mots.push({ mot: motsMedicaux[i], distance: d });
            }
        }
        
        // Trier par distance
        mots.sort(function(a, b) { return a.distance - b.distance; });
        return mots.slice(0, 5);
    }

    /**
     * Vérifie un mot contre le dictionnaire
     */
    function verifierMot(mot) {
        if (!mot || mot.length < 2) return null;
        if (dictionnaire.has(mot.toLowerCase())) return null;
        
        // Vérifier les mots médicaux
        for (var i = 0; i < motsMedicaux.length; i++) {
            if (motsMedicaux[i].toLowerCase() === mot.toLowerCase()) {
                return null;
            }
        }
        
        // Chercher des suggestions
        var suggestions = trouverMotsSimilaires(mot, 2);
        if (suggestions.length > 0) {
            return {
                mot: mot,
                type: "orthographe",
                message: "Mot non reconnu",
                suggestions: suggestions.map(function(s) { return s.mot; })
            };
        }
        return null;
    }

    /**
     * Applique les règles grammaticales
     */
    function appliquerRegles(texte) {
        var erreurs = [];
        
        for (var i = 0; i < regles.length; i++) {
            var regle = regles[i];
            var matches;
            var regex = new RegExp(regle.regex.source, regle.regex.flags);
            
            while ((matches = regex.exec(texte)) !== null) {
                if (regle.rep) {
                    erreurs.push({
                        position: matches.index,
                        longueur: matches[0].length,
                        texte: matches[0],
                        type: "grammaire",
                        message: regle.msg,
                        remplacement: regle.rep
                    });
                }
            }
        }
        
        return erreurs;
    }

    /**
     * Fonction principale de vérification
     */
    function verifier(texte) {
        var resultats = {
            erreurs: [],
            textCorrige: texte
        };
        
        // Appliquer les règles grammaticales
        var erreursRegles = appliquerRegles(texte);
        resultats.erreurs = resultats.erreurs.concat(erreursRegles);
        
        // Vérifier chaque mot
        var mots = texte.split(/\s+/);
        for (var i = 0; i < mots.length; i++) {
            var mot = mots[i].replace(/[.,;:!?'"()]/g, '');
            if (mot.length > 2) {
                var erreur = verifierMot(mot);
                if (erreur) {
                    resultats.erreurs.push(erreur);
                }
            }
        }
        
        return resultats;
    }

    return {
        verifier: verifier,
        trouverMotsSimilaires: trouverMotsSimilaires
    };

})();
