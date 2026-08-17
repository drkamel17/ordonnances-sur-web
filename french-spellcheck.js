var FrenchSpellCheck = (function() {

    // ============================================================
    // 1. MOTS CONFONDUS (à/a, ou/où, ces/ses, et/est, son/sont...)
    // ============================================================
    var motsConfondus = [
        { regex: /\b(\w+)\s+à\b/g, msg: "Confusion 'à/a' : après un verbe, c'est 'a' (avoir). Ex: 'il a mal'", rep: null },
        { regex: /\bil à\b/g, msg: "'il à' → 'il a' (verbe avoir, sans accent)", rep: "il a", auto: true },
        { regex: /\belle à\b/g, msg: "'elle à' → 'elle a' (verbe avoir, sans accent)", rep: "elle a", auto: true },
        { regex: /\bnous à\b/g, msg: "'nous à' → 'nous a' (verbe avoir)", rep: "nous a", auto: true },
        { regex: /\bvous à\b/g, msg: "'vous à' → 'vous a' (verbe avoir)", rep: "vous a", auto: true },
        { regex: /\bils à\b/g, msg: "'ils à' → 'ils a' (verbe avoir)", rep: "ils a", auto: true },
        { regex: /\belles à\b/g, msg: "'elles à' → 'elles a' (verbe avoir)", rep: "elles a", auto: true },

        { regex: /\bou\b/g, msg: "Vérifiez : 'ou' (conjonction) ou 'où' (lieu/moment) ?", rep: null },
        { regex: /\boù\b/g, msg: "Vérifiez : 'où' (lieu/moment) ou 'ou' (conjonction) ?", rep: null },

        { regex: /\bces\b/g, msg: "Vérifiez : 'ces' (démonstratif) ou 'ses' (possessif) ?", rep: null },
        { regex: /\bses\b/g, msg: "Vérifiez : 'ses' (possessif) ou 'ces' (démonstratif) ?", rep: null },

        { regex: /\b(et)\s+(est)\b/g, msg: "'et est' → 'et est' est correct (conjonction + verbe)", rep: null },
        { regex: /\bil est\b/g, msg: "Vérifiez : 'il est' (être) ou 'il ét' (incorrect) ?", rep: null },

        { regex: /\bson\b/g, msg: "Vérifiez : 'son' (possessif) ou 'sont' (verbe être) ?", rep: null },
        { regex: /\bsont\b/g, msg: "Vérifiez : 'sont' (verbe être) ou 'son' (possessif) ?", rep: null },

        { regex: /\bc'\s*est\b/g, msg: "Vérifiez : 'c'est' (contraction) correct", rep: null },
        { regex: /\bs'\s*est\b/g, msg: "Vérifiez : 's'est' (verbe être avec pronom réfléchi) correct", rep: null },

        { regex: /\bce\b/g, msg: "Vérifiez : 'ce' (démonstratif) ou 'se' (pronom réfléchi) ?", rep: null },
        { regex: /\bse\b/g, msg: "Vérifiez : 'se' (pronom réfléchi) ou 'ce' (démonstratif) ?", rep: null },

        { regex: /\bcompliment\b/g, msg: "Confusion : 'compliment' (souhaite) ou 'complément' (qui complète) ?", rep: null },
        { regex: /\bcomplément\b/g, msg: "Vérifiez : 'complément' (qui complète) ou 'compliment' (souhaite) ?", rep: null },
    ];

    // ============================================================
    // 2. ORTHOGRAPHE / DYSLEXIE (transpositions, doubles, omissions)
    // ============================================================
    var orthographe = [
        // Transpositions (dyslexie)
        { regex: /\bfoirat\b/g, msg: "'foirat' → 'forfait'", rep: "forfait", auto: true },
        { regex: /\bfolret\b/g, msg: "'folret' → 'forlet' ? Vérifiez", rep: null },
        { regex: /\bfractior\b/g, msg: "'fractior' → 'fracture'", rep: "fracture", auto: true },
        { regex: /\bplatie\b/g, msg: "'platie' → 'plaie'", rep: "plaie", auto: true },

        // Doubles lettres manquées
        { regex: /\bcommancer\b/g, msg: "'commancer' → 'commencer'", rep: "commencer", auto: true },
        { regex: /\bcommencé\b/g, msg: "'commencé' est correct (participe passé)", rep: null },
        { regex: /\bcommencer\b/g, msg: "'commencer' est correct (infinitif)", rep: null },
        { regex: /\bplannifier\b/g, msg: "'plannifier' → 'planifier' (un seul 'n')", rep: "planifier", auto: true },
        { regex: /\bplannification\b/g, msg: "'plannification' → 'planification'", rep: "planification", auto: true },
        { regex: /\bproffessionnel\b/g, msg: "'proffessionnel' → 'professionnel' (un seul 'f')", rep: "professionnel", auto: true },
        { regex: /\bproffesionnel\b/g, msg: "'proffesionnel' → 'professionnel'", rep: "professionnel", auto: true },
        { regex: /\bbesoins?\s+essentiels?\b/g, msg: "Vérifiez l'accord : 'besoin essentiel' ou 'besoins essentiels' ?", rep: null },
        { regex: /\bordonance\b/g, msg: "'ordonance' → 'ordonnance' (double 'n')", rep: "ordonnance", auto: true },
        { regex: /\bgrocesse\b/g, msg: "'grocesse' → 'grossesse' (double 's')", rep: "grossesse", auto: true },
        { regex: /\bappatite\b/g, msg: "'appatite' → 'appétit' ou 'appétite'", rep: null },

        // Accents manqués
        { regex: /\bdiabete\b/g, msg: "'diabete' → 'diabète' (accent grave)", rep: "diabète", auto: true },
        { regex: /\bdiabetique\b/g, msg: "'diabetique' → 'diabétique' (accent aigu)", rep: "diabétique", auto: true },
        { regex: /\bepilepsie\b/g, msg: "'epilepsie' → 'épilepsie' (accent aigu)", rep: "épilepsie", auto: true },
        { regex: /\bhemoragie\b/g, msg: "'hemoragie' → 'hémorragie' (accent + double 'r')", rep: "hémorragie", auto: true },
        { regex: /\bhemoragie\b/g, msg: "'hemoragie' → 'hémorragie' (double 'r')", rep: "hémorragie", auto: true },
        { regex: /\bcontusioné\b/g, msg: "'contusioné' → 'contusionné' (accent aigu)", rep: "contusionné", auto: true },
        { regex: /\bacuté\b/g, msg: "'acuté' → 'aigu' (mot différent)", rep: "aigu", auto: true },

        // Fautes médicales courantes (dyslexie + orthographe)
        { regex: /\becchimose\b/g, msg: "'ecchimose' → 'ecchymose' (avec 'y')", rep: "ecchymose", auto: true },
        { regex: /\bexchymose\b/g, msg: "'exchymose' → 'ecchymose'", rep: "ecchymose", auto: true },
        { regex: /\bexchimose\b/g, msg: "'exchimose' → 'ecchymose'", rep: "ecchymose", auto: true },
        { regex: /\btraumtisme\b/g, msg: "'traumtisme' → 'traumatisme'", rep: "traumatisme", auto: true },
        { regex: /\bsympthome\b/g, msg: "'sympthome' → 'symptôme' (p muet + accent)", rep: "symptôme", auto: true },
        { regex: /\bsympthomes\b/g, msg: "'sympthomes' → 'symptômes'", rep: "symptômes", auto: true },
        { regex: /\bsymtome\b/g, msg: "'symtome' → 'symptôme'", rep: "symptôme", auto: true },
        { regex: /\bsymtomes\b/g, msg: "'symtomes' → 'symptômes'", rep: "symptômes", auto: true },
        { regex: /\bantibiotque\b/g, msg: "'antibiotque' → 'antibiotique'", rep: "antibiotique", auto: true },
        { regex: /\binjetion\b/g, msg: "'injetion' → 'injection'", rep: "injection", auto: true },
        { regex: /\bprscrire\b/g, msg: "'prscrire' → 'prescrire'", rep: "prescrire", auto: true },
        { regex: /\bcelui la\b/g, msg: "'celui la' → 'celui-là' (trait d'union)", rep: "celui-là", auto: true },
        { regex: /\bquelque fois\b/g, msg: "'quelque fois' → 'quelquefois' (un seul mot)", rep: "quelquefois", auto: true },
        { regex: /\bc'est à dire\b/g, msg: "'c'est à dire' → 'c'est-à-dire' (traits d'union)", rep: "c'est-à-dire", auto: true },
    ];

    // ============================================================
    // 3. ACCORDS MASCULIN / FÉMININ
    // ============================================================
    var accords = [
        // Patients
        { regex: /\bpatient\b/g, msg: "Accord : 'patient' (masc.) ou 'patiente' (fém.) ?", rep: null },
        { regex: /\bpatiente\b/g, msg: "Accord : 'patiente' (fém.)", rep: null },

        // Adjectifs fréquents — laisser en info, pas de remplacement auto
        { regex: /\b(\w+)ée?\s+(patient|personne|femme|patiente)\b/gi, msg: "Vérifiez l'accord de l'adjectif avec le nom féminin", rep: null },
        { regex: /\b(\w+)é\s+(homme|garçon|médecin)\b/gi, msg: "Vérifiez l'accord de l'adjectif avec le nom masculin", rep: null },
    ];

    // ============================================================
    // 4. CONJUGAISON
    // ============================================================
    var conjugaison = [
        { regex: /\bil à\b/g, msg: "'il à' → 'il a' (avoir sans accent)", rep: "il a", auto: true },
        { regex: /\belle à\b/g, msg: "'elle à' → 'elle a' (avoir sans accent)", rep: "elle a", auto: true },
        { regex: /\bils à\b/g, msg: "'ils à' → 'ils a' (avoir)", rep: "ils a", auto: true },
        { regex: /\belles à\b/g, msg: "'elles à' → 'elles a' (avoir)", rep: "elles a", auto: true },
        { regex: /\bnous avons\b/g, msg: "'nous avons' correct", rep: null },
        { regex: /\bvous avez\b/g, msg: "'vous avez' correct", rep: null },
        { regex: /\bil sont\b/g, msg: "'il sont' → 'ils sont' ou 'il est'", rep: null },
        { regex: /\belle sont\b/g, msg: "'elle sont' → 'elles sont' ou 'elle est'", rep: null },
        { regex: /\bil on\b/g, msg: "'il on' → 'il' ou 'on'", rep: null },
        { regex: /\belle on\b/g, msg: "'elle on' → 'elle' ou 'on'", rep: null },
    ];

    // ============================================================
    // 5. GRAMMAIRE GÉNÉRALE
    // ============================================================
    var grammaire = [
        { regex: /\bde le\b/g, msg: "'de le' → 'du' (article contracté)", rep: "du", auto: true },
        { regex: /\bde les\b/g, msg: "'de les' → 'des' (article contracté)", rep: "des", auto: true },
        { regex: /\bà le\b/g, msg: "'à le' → 'au' (article contracté)", rep: "au", auto: true },
        { regex: /\bà les\b/g, msg: "'à les' → 'aux' (article contracté)", rep: "aux", auto: true },

        { regex: /\bnonetheless\b/g, msg: "Mot anglais : traduisez en français", rep: null },
        { regex: /\bhowever\b/g, msg: "Mot anglais : traduisez en français", rep: null },
        { regex: /\bmoreover\b/g, msg: "Mot anglais : traduisez en français", rep: null },

        { regex: /\.\./g, msg: "Double point détecté", rep: ".", auto: true },
        { regex: /\s+,/g, msg: "Espace avant virgule supprimé", rep: ",", auto: true },
        { regex: /\s+\./g, msg: "Espace avant point supprimé", rep: ".", auto: true },
    ];

    // ============================================================
    // TOUTES LES RÈGLES COMBINÉES
    // ============================================================
    var toutesRegles = [].concat(motsConfondus, orthographe, accords, conjugaison, grammaire);

    // ============================================================
    // DICTIONNAIRE DE BASE (mots très courants)
    // ============================================================
    var dictionnaireBase = new Set([
        // Articles, prépositions, conjonctions
        "le", "la", "les", "un", "une", "des", "du", "de", "au", "aux",
        "et", "ou", "mais", "donc", "car", "ni", "ne", "pas", "plus",
        "en", "y", "à", "ce", "se", "me", "te", "lui", "leur",
        // Pronoms
        "je", "tu", "il", "elle", "nous", "vous", "ils", "elles",
        "mon", "ton", "son", "ma", "ta", "sa", "mes", "tes", "ses",
        "qui", "que", "quoi", "dont", "où", "lequel", "laquelle",
        "celui", "celle", "ceux", "celles", "cette", "cet",
        // Verbes courants
        "être", "avoir", "faire", "dire", "aller", "voir", "pouvoir",
        "vouloir", "devoir", "falloir", "prendre", "donner", "partir",
        "mettre", "passer", "venir", "tenir", "rester", "paraître",
        "suivre", "devenir", "sortir", "entrer", "tomber", "revenir",
        "savoir", "croire", "penser", "vivre", "porter", "jeter",
        "sentir", "partir", "ouvrir", "offrir", "servir",
        // Formes conjuguées courantes
        "est", "sont", "a", "ont", "été", "fait", "dit", "va", "peut",
        "vient", "faut", "doit", "prend", "donne", "met", "passe",
        "reste", "entre", "sort", "tombe", "croit", "sait",
        // Adjectifs
        "bon", "mauvais", "grand", "petit", "vieux", "jeune",
        "nouveau", "long", "court", "large", "haut", "bas",
        "fort", "faible", "vrai", "faux", "juste", "seul", "autre",
        "premier", "dernier", "important", "grave", "sérieux",
        "malade", "fatigué", "fatiguée", "souffrant", "souffrante",
        // Noms courants
        "jour", "temps", "an", "mois", "heure", "fois",
        "homme", "femme", "enfant", "personne", "gens", "monde",
        "maison", "ville", "pays", "terre", "eau", "feu",
        "corps", "tête", "main", "bras", "jambe", "pied",
        "coeur", "sang", "os", "peau", "oeil", "yeux",
        "vie", "mort", "nuit", "lumière", "ombre",
        // Adverbes
        "bien", "mal", "beaucoup", "peu", "trop", "très", "assez",
        "aussi", "encore", "déjà", "toujours", "jamais", "parfois",
        "souvent", "ici", "là", "alors", "ainsi", "cependant",
        "néanmoins", "pourtant", "avant", "après", "pendant", "depuis",
        "avec", "sans", "pour", "selon", "malgré", "chez", "vers",
        // Mots médicaux de base
        "patient", "patiente", "médecin", "docteur",
        "soin", "soins", "santé", "maladie",
        "traitement", "médicament", "ordonnance", "certificat",
        "examen", "diagnostic", "symptôme", "symptômes",
        "douleur", "douleurs", "fièvre", "toux",
        "fracture", "entorse", "blessure", "plaie", "plaies",
        "coupure", "brûlure", "choc", "traumatisme",
        "ecchymose", "ecchymoses", "hématome", "hématomes",
        "oedème", "inflammation", "infection",
        "allergie", "asthme", "diabète", "hypertension",
        "nausée", "vomissement", "vertige", "syncope",
        "radio", "scanner", "irm", "échographie",
        "chirurgie", "opération", "hospitalisation",
        "injection", "piqûre", "vaccination",
        "pansement", "cicatrice", "suture",
        "repos", "marche", "effort",
        "certificat", "attestation", "rapport",
        "arrêt", "congé", "reprise", "prolongation",
        "poignet", "poignets", "cheville", "chevilles",
        "genou", "genoux", "épaule", "épaules",
        "coude", "coudes", "genou", "genoux",
        "cuisse", "cuisses", "jambe", "jambes",
        "tibia", "mollet", "mollets",
        "pied", "pieds", "talon", "orteil", "orteils",
        "dos", "rein", "reins", "ventre",
        "cou", "gorge", "bouche", "nez", "oreille", "oreilles",
        "front", "tempe", "menton", "nuque",
        "main", "mains", "doigt", "doigts", "pouce",
        "bras", "avant-bras",
        "thorax", "poitrine", "abdomen",
        "hanche", "hanches", "bassin",
        "coeur", "cœur", "poumon", "poumons",
        "foie", "rate", "estomac", "intestin",
        "cerveau", "nerf", "nerfs",
        "muscle", "muscles", "tendon", "tendons",
        "ligament", "ligaments", "articulation", "articulations",
        "os", "squelette", "peau", "veine", "veines",
        "artère", "artères", "glande", "glandes",
        "patiente", "patients", "patientes",
        "infirmier", "infirmière",
        "pharmacien", "pharmacienne",
    ]);

    // ============================================================
    // LEVENSHTEIN
    // ============================================================
    function levenshtein(a, b) {
        var m = a.length, n = b.length;
        var dp = [];
        for (var i = 0; i <= m; i++) { dp[i] = [i]; }
        for (var j = 0; j <= n; j++) { dp[0][j] = j; }
        for (var i = 1; i <= m; i++) {
            for (var j = 1; j <= n; j++) {
                var cost = a[i - 1] === b[j - 1] ? 0 : 1;
                dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
            }
        }
        return dp[m][n];
    }

    function trouverSimilaires(mot, maxDist) {
        maxDist = maxDist || 2;
        var resultats = [];
        var m = mot.toLowerCase();
        dictionnaireBase.forEach(function(d) {
            if (d === m) return;
            var dist = levenshtein(m, d);
            if (dist > 0 && dist <= maxDist) {
                resultats.push({ mot: d, distance: dist });
            }
        });
        resultats.sort(function(a, b) { return a.distance - b.distance; });
        return resultats.slice(0, 5).map(function(r) { return r.mot; });
    }

    // ============================================================
    // VÉRIFICATION PRINCIPALE
    // ============================================================
    function verifier(texte) {
        var erreurs = [];
        var vus = {};

        // Pass 1 : règles regex (orthographe, grammaire, mots confondus, conjugaison)
        for (var i = 0; i < toutesRegles.length; i++) {
            var regle = toutesRegles[i];
            var regex = new RegExp(regle.regex.source, regle.regex.flags);
            var match;
            while ((match = regex.exec(texte)) !== null) {
                var cle = regle.msg + "|" + match.index;
                if (vus[cle]) continue;
                vus[cle] = true;
                erreurs.push({
                    position: match.index,
                    texte: match[0],
                    type: regle.msg.indexOf("Accord") >= 0 ? "accord" :
                          regle.msg.indexOf("→") >= 0 ? "correction" : "vérification",
                    message: regle.msg,
                    remplacement: regle.rep || null,
                    auto: regle.auto || false
                });
            }
        }

        // Pass 2 : vérification orthographique des mots isolés
        var mots = texte.split(/\s+/);
        for (var j = 0; j < mots.length; j++) {
            var mot = mots[j].replace(/[.,;:!?'"()\[\]{}]/g, "").toLowerCase();
            if (mot.length < 3) continue;
            if (dictionnaireBase.has(mot)) continue;
            // Chercher similaire uniquement si court (évite les faux positifs sur les termes longs)
            if (mot.length <= 15) {
                var similaires = trouverSimilaires(mot, mot.length <= 6 ? 2 : 3);
                if (similaires.length > 0) {
                    var cleMot = "mot|" + mot;
                    if (!vus[cleMot]) {
                        vus[cleMot] = true;
                        erreurs.push({
                            position: texte.toLowerCase().indexOf(mot),
                            texte: mot,
                            type: "orthographe",
                            message: "Mot possibly mal orthographié : '" + mot + "'",
                            remplacement: null,
                            suggestions: similaires,
                            auto: false
                        });
                    }
                }
            }
        }

        return { erreurs: erreurs };
    }

    return { verifier: verifier };

})();
