var FrenchSpellCheck = (function() {

    // ============================================================
    // 1. MOTS CONFONDUS (les erreurs les plus fréquentes)
    // ============================================================
    var motsConfondus = [
        // et / est
        { regex: /\bil et\b/g, msg: "Confusion : 'il et' → 'il est' (verbe être)", rep: "il est" },
        { regex: /\bell et\b/g, msg: "Confusion : 'elle et' → 'elle est' (verbe être)", rep: "elle est" },
        { regex: /\bnous et\b/g, msg: "Confusion : 'nous et' → 'nous êtes' (verbe être)", rep: "nous êtes" },
        { regex: /\bvous et\b/g, msg: "Confusion : 'vous et' → 'vous êtes' (verbe être)", rep: "vous êtes" },
        { regex: /\bce et\b/g, msg: "Confusion : 'ce et' → 'c'est' (verbe être)", rep: "c'est" },
        { regex: /\bqui et\b/g, msg: "Confusion : 'qui et' → 'qui est' (verbe être)", rep: "qui est" },
        { regex: /\bquoi et\b/g, msg: "Confusion : 'quoi et' → 'quoi est'", rep: "quoi est" },
        { regex: /\bcela et\b/g, msg: "Confusion : 'cela et' → 'cela est'", rep: "cela est" },
        { regex: /\bje et\b/g, msg: "Confusion : 'je et' → 'je suis' (verbe être)", rep: "je suis" },
        { regex: /\btu et\b/g, msg: "Confusion : 'tu et' → 'tu es' (verbe être)", rep: "tu es" },

        // à / a
        { regex: /\bil a un\b/g, msg: "Vérifiez : 'il a un' (avoir) ou 'il à un' ?", rep: null },
        { regex: /\bil à\b/g, msg: "Confusion : 'il à' → 'il a' (verbe avoir, pas préposition)", rep: "il a" },
        { regex: /\belle à\b/g, msg: "Confusion : 'elle à' → 'elle a' (verbe avoir)", rep: "elle a" },
        { regex: /\bje à\b/g, msg: "Confusion : 'je à' → 'j'ai' (verbe avoir)", rep: "j'ai" },
        { regex: /\bnous à\b/g, msg: "Confusion : 'nous à' → 'nous avons' (verbe avoir)", rep: "nous avons" },
        { regex: /\bvous à\b/g, msg: "Confusion : 'vous à' → 'vous avez' (verbe avoir)", rep: "vous avez" },

        // son / sont
        { regex: /\bil son\b/g, msg: "Confusion : 'il son' → 'il sont' ou 'son' (possessif) ?", rep: null },
        { regex: /\bell son\b/g, msg: "Confusion : 'elle son' → 'elle sont' ou 'son' (possessif) ?", rep: null },

        // ou / où
        { regex: /\bil va ou\b/g, msg: "Vérifiez : 'où' (lieu) ou 'ou' (alternative) ?", rep: null },

        // ces / c'est / ses
        { regex: /\bces est\b/g, msg: "Confusion : 'ces est' → 'c'est' (ce + est)", rep: "c'est" },
        { regex: /\bcest\b/g, msg: "Écriture : 'c'est' (avec apostrophe)", rep: "c'est" },

        // leur / leurs
        { regex: /\bleur ont\b/g, msg: "Vérifiez : 'leur' (singulier) ou 'leurs' (pluriel) ?", rep: null },

        // que / qu'
        { regex: /\bil que\b/g, msg: "Vérifiez : 'qu'il' (devant voyelle) ou 'il que' ?", rep: null },

        // était / était
        { regex: /\belle etait\b/g, msg: "Orthographe : 'était' (avec accent)", rep: "elle était" },
        { regex: /\bil etait\b/g, msg: "Orthographe : 'était' (avec accent)", rep: "il était" },

        // plus / plus
        { regex: /\bne plus\b/g, msg: "Vérifiez : 'ne plus' (négation) ou 'plus' (comparatif) ?", rep: null },

        // comment / com-ment
        { regex: /\bcoment\b/g, msg: "Orthographe : 'comment' (double 'm')", rep: "comment" },

        // commencer / commencer
        { regex: /\bcommencer\b/g, msg: "Orthographe : 'commencer' (un seul 'n')", rep: "commencer" },

        // professionnel / professionnel
        { regex: /\bproffessionnel\b/g, msg: "Orthographe : 'professionnel' (un seul 'f')", rep: "professionnel" },
        { regex: /\bproffesionnel\b/g, msg: "Orthographe : 'professionnel'", rep: "professionnel" },

        // planification / planification
        { regex: /\bplannification\b/g, msg: "Orthographe : 'planification' (un seul 'n')", rep: "planification" },

        // quelquefois / quelquefois
        { regex: /\bquelque fois\b/g, msg: "Écriture : 'quelquefois' (un seul mot)", rep: "quelquefois" },

        // celuila / celui-là
        { regex: /\bcelui la\b/g, msg: "Écriture : 'celui-là' (avec trait d'union)", rep: "celui-là" },
    ];

    // ============================================================
    // 2. ORTHOGRAPHE MÉDICALE (fautes fréquentes en contexte médical)
    // ============================================================
    var orthographeMedicale = [
        // Ecchymose / ecchymose
        { regex: /\becchimose\b/gi, msg: "Orthographe : 'ecchymose' (un seul 'c')", rep: "ecchymose" },
        { regex: /\bexchimose\b/gi, msg: "Orthographe : 'ecchymose'", rep: "ecchymose" },

        // Hémorragie
        { regex: /\bhemoragie\b/gi, msg: "Orthographe : 'hémorragie' (accent + double 'r')", rep: "hémorragie" },
        { regex: /\bhémoragie\b/gi, msg: "Orthographe : 'hémorragie' (double 'r')", rep: "hémorragie" },

        // Symptôme
        { regex: /\bsympthomes?\b/gi, msg: "Orthographe : 'symptôme' (p muet + accent)", rep: "symptôme" },
        { regex: /\bsymtomes?\b/gi, msg: "Orthographe : 'symptôme'", rep: "symptôme" },

        // Diabète
        { regex: /\bdiabéte\b/gi, msg: "Orthographe : 'diabète' (accent grave)", rep: "diabète" },
        { regex: /\bdiabetique\b/gi, msg: "Orthographe : 'diabétique'", rep: "diabétique" },

        // Épilepsie
        { regex: /\bepilepsie\b/gi, msg: "Orthographe : 'épilepsie' (accent)", rep: "épilepsie" },

        // Ordonnance
        { regex: /\bordonance\b/gi, msg: "Orthographe : 'ordonnance' (double 'n')", rep: "ordonnance" },

        // Grossesse
        { regex: /\bgrocesse\b/gi, msg: "Orthographe : 'grossesse' (double 's')", rep: "grossesse" },

        // Injection
        { regex: /\binjetion\b/gi, msg: "Orthographe : 'injection'", rep: "injection" },

        // Prescrire
        { regex: /\bprscrire\b/gi, msg: "Orthographe : 'prescrire'", rep: "prescrire" },

        // Contusionné
        { regex: /\bcontusioné\b/gi, msg: "Orthographe : 'contusionné' (accent)", rep: "contusionné" },

        // Traumatisme
        { regex: /\btraumtisme\b/gi, msg: "Orthographe : 'traumatisme'", rep: "traumatisme" },

        // Antibiotique
        { regex: /\bantibiotque\b/gi, msg: "Orthographe : 'antibiotique'", rep: "antibiotique" },

        // Aigu
        { regex: /\bacuté\b/gi, msg: "Orthographe : 'aigu' (pas d'accent sur le 'u')", rep: "aigu" },

        // Fracture
        { regex: /\bfracturé\b/gi, msg: "Vérifiez : 'fracturé' (participe) ou 'fracture' (substantif) ?", rep: null },

        // Pronostic
        { regex: /\bpronostique\b/gi, msg: "Orthographe : 'pronostic' (pas de 'que')", rep: "pronostic" },
    ];

    // ============================================================
    // 3. ACCORD MASCULIN / FÉMININ
    // ============================================================
    var accordRules = [
        // Noms - formes féminines
        { regex: /\bun patient\b/g, msg: "Vérifiez : 'un patient' (masc.) ou 'une patiente' (fém.) ?", rep: null },
        { regex: /\bune patiente?\b/g, msg: "Vérifiez : 'une patiente' (fém.) ou 'un patient' (masc.) ?", rep: null },
        { regex: /\bun docteur\b/g, msg: "Vérifiez : 'un docteur' (masc.) ou 'une docteure' (fém.) ?", rep: null },
        { regex: /\bun médecin\b/g, msg: "Vérifiez : 'un médecin' (masc.) ou 'une médecin' (fém.) ?", rep: null },
        { regex: /\bun chirurgien\b/g, msg: "Vérifiez : 'un chirurgien' (masc.) ou 'une chirurgienne' (fém.) ?", rep: null },

        // Adjectifs - accord
        { regex: /\bil est important\b/g, msg: "Vérifiez : 'important' (masc.) ou 'importante' (fém.) ?", rep: null },
        { regex: /\belle est important\b/g, msg: "Accord : 'elle est importante' (fém.)", rep: "elle est importante" },
        { regex: /\bil est léger\b/g, msg: "Vérifiez : 'léger' (masc.) ou 'légère' (fém.) ?", rep: null },
        { regex: /\belle est léger\b/g, msg: "Accord : 'elle est légère' (fém.)", rep: "elle est légère" },
        { regex: /\bil est bon\b/g, msg: "Vérifiez : 'bon' (masc.) ou 'bonne' (fém.) ?", rep: null },
        { regex: /\belle est bon\b/g, msg: "Accord : 'elle est bonne' (fém.)", rep: "elle est bonne" },
        { regex: /\bil est grand\b/g, msg: "Vérifiez : 'grand' (masc.) ou 'grande' (fém.) ?", rep: null },
        { regex: /\belle est grand\b/g, msg: "Accord : 'elle est grande' (fém.)", rep: "elle est grande" },
        { regex: /\bil est petit\b/g, msg: "Vérifiez : 'petit' (masc.) ou 'petite' (fém.) ?", rep: null },
        { regex: /\belle est petit\b/g, msg: "Accord : 'elle est petite' (fém.)", rep: "elle est petite" },
        { regex: /\bil est nouveau\b/g, msg: "Vérifiez : 'nouveau' (masc.) ou 'nouvelle' (fém.) ?", rep: null },
        { regex: /\belle est nouveau\b/g, msg: "Accord : 'elle est nouvelle' (fém.)", rep: "elle est nouvelle" },
        { regex: /\bil est ancien\b/g, msg: "Vérifiez : 'ancien' (masc.) ou 'ancienne' (fém.) ?", rep: null },
        { regex: /\belle est ancien\b/g, msg: "Accord : 'elle est ancienne' (fém.)", rep: "elle est ancienne" },
        { regex: /\bil est mauvais\b/g, msg: "Vérifiez : 'mauvais' (masc.) ou 'mauvaise' (fém.) ?", rep: null },
        { regex: /\belle est mauvais\b/g, msg: "Accord : 'elle est mauvaise' (fém.)", rep: "elle est mauvaise" },

        // Participes passés avec être
        { regex: /\bil est tombé\b/g, msg: "Vérifiez : 'tombé' (masc.) ou 'tombée' (fém.) ?", rep: null },
        { regex: /\belle est tombé\b/g, msg: "Accord : 'elle est tombée' (fém.)", rep: "elle est tombée" },
        { regex: /\bil est allé\b/g, msg: "Vérifiez : 'allé' (masc.) ou 'allée' (fém.) ?", rep: null },
        { regex: /\belle est allé\b/g, msg: "Accord : 'elle est allée' (fém.)", rep: "elle est allée" },
        { regex: /\bil est venu\b/g, msg: "Vérifiez : 'venu' (masc.) ou 'venue' (fém.) ?", rep: null },
        { regex: /\belle est venu\b/g, msg: "Accord : 'elle est venue' (fém.)", rep: "elle est venue" },
        { regex: /\bil est resté\b/g, msg: "Vérifiez : 'resté' (masc.) ou 'restée' (fém.) ?", rep: null },
        { regex: /\belle est resté\b/g, msg: "Accord : 'elle est restée' (fém.)", rep: "elle est restée" },
        { regex: /\bil est parti\b/g, msg: "Vérifiez : 'parti' (masc.) ou 'partie' (fém.) ?", rep: null },
        { regex: /\belle est parti\b/g, msg: "Accord : 'elle est partie' (fém.)", rep: "elle est partie" },
        { regex: /\bil est rentré\b/g, msg: "Vérifiez : 'rentré' (masc.) ou 'rentrée' (fém.) ?", rep: null },
        { regex: /\belle est rentré\b/g, msg: "Accord : 'elle est rentrée' (fém.)", rep: "elle est rentrée" },
        { regex: /\bil est sorti\b/g, msg: "Vérifiez : 'sorti' (masc.) ou 'sortie' (fém.) ?", rep: null },
        { regex: /\belle est sorti\b/g, msg: "Accord : 'elle est sortie' (fém.)", rep: "elle est sortie" },
        { regex: /\bil est entré\b/g, msg: "Vérifiez : 'entré' (masc.) ou 'entrée' (fém.) ?", rep: null },
        { regex: /\belle est entré\b/g, msg: "Accord : 'elle est entrée' (fém.)", rep: "elle est entrée" },
        { regex: /\bil est décédé\b/g, msg: "Vérifiez : 'décédé' (masc.) ou 'décédée' (fém.) ?", rep: null },
        { regex: /\belle est décédé\b/g, msg: "Accord : 'elle est décédée' (fém.)", rep: "elle est décédée" },
        { regex: /\bil est né\b/g, msg: "Vérifiez : 'né' (masc.) ou 'née' (fém.) ?", rep: null },
        { regex: /\belle est né\b/g, msg: "Accord : 'elle est née' (fém.)", rep: "elle est née" },

        // Participes passés avec avoir (devant COD)
        { regex: /\bil a examiné\b/g, msg: "Vérifiez : 'examiné' (avant COD → invariable)", rep: null },
        { regex: /\belle a examiné\b/g, msg: "Vérifiez : 'examiné' (avant COD → invariable)", rep: null },
    ];

    // ============================================================
    // 4. CONJUGAISON
    // ============================================================
    var conjugaisonRules = [
        // Être
        { regex: /\bje suis\b/g, msg: "Vérifiez : 'je suis' (verbe être)", rep: null },
        { regex: /\bje sois\b/g, msg: "Erreur : 'je suis' (présent) ou 'je sois' (subjonctif) ?", rep: null },
        { regex: /\btu es\b/g, msg: "Vérifiez : 'tu es' (verbe être)", rep: null },
        { regex: /\bil est\b/g, msg: "Vérifiez : 'il est' (masc.) ou 'elle est' (fém.) ?", rep: null },
        { regex: /\belle est\b/g, msg: "Vérifiez : 'elle est' (fém.) ou 'il est' (masc.) ?", rep: null },
        { regex: /\bnous sommes\b/g, msg: "Vérifiez : 'nous sommes' (verbe être)", rep: null },
        { regex: /\bvous êtes\b/g, msg: "Vérifiez : 'vous êtes' (verbe être)", rep: null },

        // Avoir
        { regex: /\bj'ai\b/g, msg: "Vérifiez : 'j'ai' (verbe avoir)", rep: null },
        { regex: /\btu as\b/g, msg: "Vérifiez : 'tu as' (verbe avoir)", rep: null },
        { regex: /\bil a\b/g, msg: "Vérifiez : 'il a' (avoir) ou 'il à' (préposition) ?", rep: null },
        { regex: /\belle a\b/g, msg: "Vérifiez : 'elle a' (avoir) ou 'elle à' (préposition) ?", rep: null },
        { regex: /\bnous avons\b/g, msg: "Vérifiez : 'nous avons' (verbe avoir)", rep: null },
        { regex: /\bvous avez\b/g, msg: "Vérifiez : 'vous avez' (verbe avoir)", rep: null },
    ];

    // ============================================================
    // 5. GRAMMAIRE GÉNÉRALE
    // ============================================================
    var grammaireRules = [
        // Articles contractés
        { regex: /\bde le\b/g, msg: "Articles contractés : 'de le' → 'du'", rep: "du" },
        { regex: /\bde les\b/g, msg: "Articles contractés : 'de les' → 'des'", rep: "des" },
        { regex: /\bà le\b/g, msg: "Articles contractés : 'à le' → 'au'", rep: "au" },
        { regex: /\bà les\b/g, msg: "Articles contractés : 'à les' → 'aux'", rep: "aux" },

        // Négation
        { regex: /\bne pas\b/g, msg: "Vérifiez : 'ne pas' (négation complète)", rep: null },
        { regex: /\bpas ne\b/g, msg: "Erreur : 'pas ne' → 'ne pas' (ordre correct)", rep: "ne pas" },

        // Ponctuation
        { regex: /\.\./g, msg: "Double point détecté", rep: "." },
        { regex: /\s+,/g, msg: "Espace avant la virgule", rep: "," },
        { regex: /\s+\./g, msg: "Espace avant le point", rep: "." },
    ];

    // ============================================================
    // 6. CORRECTIONS PAR DISTANCE DE LEVENSHTEIN (dyslexie / typos)
    // ============================================================
    var dictionnaireMedical = [
        "ecchymose", "hématome", "oedème", "inflammation", "infection",
        "fracture", "entorse", "luxation", "claudication", "boiterie",
        "douleur", "souffrance", "gêne", "raideur", "limitation",
        "céphalée", "migraine", "vertige", "syncope",
        "nausée", "vomissement", "diarrhée", "constipation",
        "toux", "dyspnée", "essoufflement", "oppression",
        "palpitation", "arythmie", "tachycardie", "bradycardie",
        "hypertension", "hypotension", "diabète", "hyperglycémie",
        "hypoglycémie", "cholestérol", "anémie", "thrombopénie",
        "bronchite", "pneumonie", "pleurésie", "asthme",
        "hépatite", "cirrhose", "pancréatite", "cholécystite",
        "appendicite", "arthrose", "arthrite", "polyarthrite",
        "rhumatisme", "lumbago", "sciatique", "cervicalgie",
        "tendinite", "bursite", "épicondylite", "ténosynovite",
        "allergie", "eczéma", "urticaire", "dermite",
        "psoriasis", "acné", "mycose", "herpès", "verrue",
        "traumatisme", "contusion", "plaie", "coupure", "brûlure",
        "cicatrice", "kyste", "tumeur", "cancer",
        "handicap", "invalidité", "incapacité", "déficience",
        "séquelle", "syndrome", "pathologie", "affection",
        "traitement", "médicament", "ordonnance", "prescription",
        "diagnostic", "pronostic", "bilan", "examen",
        "radiographie", "scanner", "irm", "échographie",
        "injection", "perfusion", "transfusion", "vaccination",
        "chirurgie", "opération", "anesthésie", "hospitalisation",
        "consultation", "examen clinique", "auscultation",
        "palpation", "percussion", "auscultation",
        "amplitude", "articulation", "mobilité", "souplesse",
        "muscle", "tendon", "ligament", "os", "cartilage",
        "tête", "front", "tempe", "oeil", "nez", "oreille",
        "bouche", "gorge", "cou", "épaule", "bras", "coude",
        "poignet", "main", "doigt", "thorax", "dos", "rein",
        "ventre", "abdomen", "hanche", "genou", "jambe",
        "cheville", "pied", "talon", "visage", "menton",
        "patient", "patiente", "médecin", "docteur",
        "arrêt", "reprise", "prolongation", "congé",
        "certificat", "attestation", "rapport",
        "plaie", "coupure", "entaille", "déchirure",
        "ecchymose", "hématome", "œdème", "gorge",
        "poignet", "cheville", "genou", "coude", "épaule",
        "genou", "cuisse", "tibia", "mollet", "orteil",
        "radius", "cubitus", "humérus", "fémur", "rotule",
        "clavicule", "omoplate", "sternum", "colonne",
        "vertèbre", "bassin", "sacrum", "coccyx",
        "paume", "dos", "talon", "voûte",
        "pouce", "annulaire", "auriculaire", "majeur",
    ];

    /**
     * Distance de Levenshtein
     */
    function levenshtein(a, b) {
        var m = a.length, n = b.length;
        if (m === 0) return n;
        if (n === 0) return m;
        var dp = [];
        for (var i = 0; i <= m; i++) { dp[i] = [i]; }
        for (var j = 0; j <= n; j++) { dp[0][j] = j; }
        for (var i = 1; i <= m; i++) {
            for (var j = 1; j <= n; j++) {
                var cost = a[i-1] === b[j-1] ? 0 : 1;
                dp[i][j] = Math.min(dp[i-1][j] + 1, dp[i][j-1] + 1, dp[i-1][j-1] + cost);
            }
        }
        return dp[m][n];
    }

    /**
     * Détecte les lettres transposées (dyslexie)
     * Ex: "ecchymsoe" → "ecchymose"
     */
    function detecterTransposition(mot) {
        var corrections = [];
        for (var i = 0; i < mot.length - 1; i++) {
            var transposed = mot.substring(0, i) + mot[i+1] + mot[i] + mot.substring(i+2);
            for (var j = 0; j < dictionnaireMedical.length; j++) {
                if (levenshtein(transposed, dictionnaireMedical[j]) <= 1) {
                    corrections.push(dictionnaireMedical[j]);
                }
            }
        }
        return corrections;
    }

    /**
     * Trouve les corrections par Levenshtein
     */
    function trouverCorrections(mot) {
        var corrections = [];
        var motLower = mot.toLowerCase();

        for (var i = 0; i < dictionnaireMedical.length; i++) {
            var d = levenshtein(motLower, dictionnaireMedical[i].toLowerCase());
            if (d > 0 && d <= 2) {
                corrections.push({ mot: dictionnaireMedical[i], distance: d });
            }
        }

        corrections.sort(function(a, b) { return a.distance - b.distance; });
        return corrections.slice(0, 5).map(function(c) { return c.mot; });
    }

    /**
     * Vérifie un mot (hors dictionnaire)
     */
    function verifierMot(mot) {
        if (!mot || mot.length < 3) return null;
        var motLower = mot.toLowerCase();

        // Vérifier dictionnaire français
        var dictionnaireBase = [
            "le", "la", "les", "un", "une", "des", "du", "de", "au", "aux",
            "et", "ou", "mais", "donc", "car", "ni", "ne", "pas", "plus",
            "je", "tu", "il", "elle", "nous", "vous", "ils", "elles",
            "me", "te", "se", "lui", "leur", "moi", "toi", "soi",
            "mon", "ton", "son", "ma", "ta", "sa", "mes", "tes", "ses",
            "ce", "cette", "ces", "cet", "celui", "celle", "ceux", "celles",
            "qui", "que", "quoi", "dont", "où", "lequel", "laquel",
            "être", "avoir", "faire", "dire", "aller", "voir", "pouvoir",
            "vouloir", "devoir", "falloir", "prendre", "donner", "partir",
            "mettre", "passer", "venir", "tenir", "rester", "paraître",
            "suivre", "devenir", "sortir", "entrer", "tomber", "revenir",
            "bien", "mal", "beaucoup", "peu", "trop", "très", "assez",
            "aussi", "encore", "déjà", "toujours", "jamais", "parfois",
            "souvent", "ici", "là", "alors", "ainsi", "cependant",
            "avant", "après", "pendant", "depuis", "chez", "vers",
            "avec", "sans", "pour", "selon", "malgré",
            "jour", "temps", "an", "mois", "heure", "fois",
            "homme", "femme", "enfant", "personne", "gens", "monde",
            "maison", "ville", "pays", "terre", "eau", "feu", "air",
            "corps", "tête", "oeil", "main", "bras", "jambe", "pied",
            "coeur", "sang", "os", "peau", "cheveux", "oreille",
            "vie", "mort", "nuit", "jour", "lumière", "ombre",
            "bon", "mauvais", "grand", "petit", "vieux", "jeune",
            "nouveau", "long", "court", "large", "haut", "bas",
            "fort", "faible", "vite", "lentement", "ensemble",
            "vrai", "faux", "juste", "seul", "autre", "même",
            "premier", "dernier", "prochain", "ancien",
            "malade", "santé", "médecin", "docteur", "patient",
            "traitement", "médicament", "ordonnance", "certificat",
            "examen", "diagnostic", "symptôme", "douleur", "fièvre",
            "injection", "piqûre", "pansement", "cicatrice",
            "radiographie", "scanner", "irm", "échographie",
            "chirurgie", "opération", "anesthésie", "hospitalisation",
            "consultation", "arrêt", "reprise", "prolongation",
            "bilan", "résultat", "prescription", "posologie",
            "effet", "secondaire", "contre-indication",
            "urgence", "ambulance", "samu", "pompiers",
            "vaccination", "vaccin", "sérum", "antibiotique",
            "antidouleur", "anti-inflammatoire", "anticoagulant",
            "handicap", "invalidité", "incapacité", "déficience",
            "séquelle", "fonctionnelle", "motrice",
            "sport", "effort", "repos", "activité",
            "alimentation", "régime", "hygiène", "sommeil",
            "suivi", "contrôle", "visite", "rendez-vous",
            "assurance", "mutuelle", "sécurité", "sociale",
            "rapport", "compte-rendu", "protocole",
            "information", "conseil", "recommandation",
            "observation", "constat", "évaluation", "appréciation",
            "guérison", "rémission", "rechute", "complication",
            "capacité", "aptitude", "restriction", "limitation",
            "déplacement", "locomotion", "marche", "position",
            "état", "etat", "formé", "guéri", "soulagé", "stabilisé",
            "modéré", "important", "sévère", "léger", "grave",
            "aigu", "chronique", "récidivante", "récurrent",
            "bilatéral", "unilatéral", "droit", "gauche",
            "antérieur", "postérieur", "supérieur", "inférieur",
            "interne", "externe", "profond", "superficiel",
            "total", "partiel", "complet", "incomplet",
            "normal", "anormal", "régulier", "irrégulier",
            "positif", "négatif", "actif", "inactif",
            "stables", "instable", "évolué", "non évolué",
            "associé", "isolé", "primaire", "secondaire",
            "direct", "indirect", "médiat", "immédiat",
            "temporaire", "permanent", "définitif", "provisoire",
            "volontaire", "involontaire", "accidentel",
            "mecanique", "mécanique", "physique", "chimique",
            "biologique", "psychologique", "social", "médical",
            "chirurgical", "thérapeutique", "diagnostique",
            "pronostique", "préventif", "curatif", "palliatif",
            "symptomatique", "étiologique", "pathogène",
            "bénin", "malin", "local", "généralisé",
            "superficiel", "profond", "partiel", "total",
            "complet", "incomplet", "initial", "terminal",
            "précoce", "tardif", "immédiat", "retardé",
            "aiguë", "subaiguë", "chronique", "évolutive",
            "stable", "instable", "progressive", "régressive",
            "réversible", "irréversible", "fonctionnelle",
            "organique", "structurelle", "fonctionnel",
            "organique", "structurel", "morphologique",
            "histologique", "cytologique", "biochimique",
            "hormonal", "métabolique", "endocrinien",
            "vasculaire", "hématologique", "immunologique",
            "allergique", "auto-immun", "inflammatoire",
            "infectieux", "contagieux", "bactérien", "viral",
            "parasitaire", "fongique", "néoplasique", "tumoral",
            "dégénératif", "dystrophique", "atrophié", "hypertrophié",
            "hyperplasique", "herniaire", "obstructif", "occlusif",
            "perforant", "hémorragique", "ischémique", "hypoxique",
            "anoxique", "toxique", "septique", "abcessé",
            "phlegmoneux", "gangréneux", "nécrotique", "ulcéré",
            "excorié", "érosif", "fissuré", "déchiré",
            "décollé", "désinséré", "luxé", "fracturé",
            "subluxé", "entorsé", "étiré", "distendu",
            "contracturé", "spasmodique", "tétanique", "convulsif",
            "paralytique", "parétique", "paresthésique", "dysesthésique",
            "hyperesthésique", "hypoesthésique", "anesthésique",
            "algique", "douloureux", "douloureuse",
            "sensible", "insensible", "hypersensible", "hyposensible",
            "mobile", "immobile", "stable", "mobile",
            "souple", "rigide", "souple", "rigide",
            "souple", "rigide", "souple", "rigide",
            "souple", "rigide",
            "syndrome", "maladie", "affection", "pathologie",
            "lésion", "atteinte", "trouble", "dérèglement",
            "dysfonction", "insuffisance", "hypofonction",
            "hyperfonction", "excès", "manque", "déficit",
            "altération", "modification", "changement",
            "progression", "évolution", "aggravation",
            "amélioration", "stabilisation", "guérison",
            "rémission", "rechute", "récidive", "complication",
            "séquelle", "séquelles", "séquelle fonctionnelle",
            "capacité", "incapacité", "inaptitude", "aptitude",
            "restriction", "limitation", "interdiction",
            "contre-indication", "précaution", "mise en garde",
            "avertissement", "notification", "déclaration",
            "certificat", "attestation", "rapport",
            "compte-rendu", "protocole", "consentement",
            "information", "explication", "conseil",
            "recommandation", "observation", "constat",
            "évaluation", "appréciation", "estimation",
            "pronostic", "évolution", "pronostic",
            "guérison", "rémission", "rechute", "complication",
            "séquelle", "séquelles", "séquelle fonctionnelle",
        ];

        // Vérifier dans le dictionnaire de base
        if (dictionnaireBase.indexOf(motLower) !== -1) return null;

        // Vérifier dans le dictionnaire médical
        for (var i = 0; i < dictionnaireMedical.length; i++) {
            if (dictionnaireMedical[i].toLowerCase() === motLower) return null;
        }

        // Chercher des corrections
        var corrections = trouverCorrections(mot);
        if (corrections.length > 0) {
            return {
                mot: mot,
                type: "orthographe",
                message: "Mot non reconnu",
                suggestions: corrections
            };
        }
        return null;
    }

    /**
     * Fonction principale de vérification
     */
    function verifier(texte) {
        var erreurs = [];
        var texteCorrige = texte;

        // 1. Appliquer les mots confondus
        for (var i = 0; i < motsConfondus.length; i++) {
            var rule = motsConfondus[i];
            var regex = new RegExp(rule.regex.source, rule.regex.flags);
            var match;
            while ((match = regex.exec(texte)) !== null) {
                erreurs.push({
                    position: match.index,
                    longueur: match[0].length,
                    texte: match[0],
                    type: "confusion",
                    message: rule.msg,
                    remplacement: rule.rep
                });
            }
        }

        // 2. Appliquer l'orthographe médicale
        for (var i = 0; i < orthographeMedicale.length; i++) {
            var rule = orthographeMedicale[i];
            var regex = new RegExp(rule.regex.source, rule.regex.flags);
            var match;
            while ((match = regex.exec(texte)) !== null) {
                erreurs.push({
                    position: match.index,
                    longueur: match[0].length,
                    texte: match[0],
                    type: "orthographe",
                    message: rule.msg,
                    remplacement: rule.rep
                });
            }
        }

        // 3. Appliquer les règles d'accord
        for (var i = 0; i < accordRules.length; i++) {
            var rule = accordRules[i];
            var regex = new RegExp(rule.regex.source, rule.regex.flags);
            var match;
            while ((match = regex.exec(texte)) !== null) {
                erreurs.push({
                    position: match.index,
                    longueur: match[0].length,
                    texte: match[0],
                    type: "accord",
                    message: rule.msg,
                    remplacement: rule.rep
                });
            }
        }

        // 4. Appliquer la conjugaison
        for (var i = 0; i < conjugaisonRules.length; i++) {
            var rule = conjugaisonRules[i];
            var regex = new RegExp(rule.regex.source, rule.regex.flags);
            var match;
            while ((match = regex.exec(texte)) !== null) {
                erreurs.push({
                    position: match.index,
                    longueur: match[0].length,
                    texte: match[0],
                    type: "conjugaison",
                    message: rule.msg,
                    remplacement: rule.rep
                });
            }
        }

        // 5. Appliquer la grammaire
        for (var i = 0; i < grammaireRules.length; i++) {
            var rule = grammaireRules[i];
            var regex = new RegExp(rule.regex.source, rule.regex.flags);
            var match;
            while ((match = regex.exec(texte)) !== null) {
                erreurs.push({
                    position: match.index,
                    longueur: match[0].length,
                    texte: match[0],
                    type: "grammaire",
                    message: rule.msg,
                    remplacement: rule.rep
                });
            }
        }

        // 6. Vérifier les mots inconnus (dyslexie / typos)
        var mots = texte.split(/\s+/);
        for (var i = 0; i < mots.length; i++) {
            var mot = mots[i].replace(/[.,;:!?'"()\-]/g, '');
            if (mot.length >= 3) {
                var erreur = verifierMot(mot);
                if (erreur) {
                    erreurs.push(erreur);
                }
            }
        }

        return {
            erreurs: erreurs,
            textCorrige: texteCorrige
        };
    }

    return {
        verifier: verifier,
        trouverCorrections: trouverCorrections,
        _regles: motsConfondus.concat(orthographeMedicale).concat(accordRules).concat(conjugaisonRules).concat(grammaireRules)
    };

})();
