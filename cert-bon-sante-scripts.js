// Fonction pour capitaliser automatiquement les noms et prénoms
function capitalizeNames(text) {
    if (!text) return text;
    return text.toLowerCase().replace(/\b\w/g, letter => letter.toUpperCase());
}

// Champs synchronisés automatiquement entre la partie 1 et la partie 2
const champsSynchronises = [
    ['wilaya-ar-1', 'wilaya-ar-2'],
    ['polyclinique-ar-1', 'polyclinique-ar-2'],
    ['docteur-1', 'docteur-2'],
    ['nom-1', 'nom-2'],
    ['prenom-1', 'prenom-2'],
    ['age-1', 'age-2'],
    ['travail-1', 'travail-2'],
    ['date-1', 'date-2'],
    ['adresse-1', 'adresse-2']
];

function formaterDateDuJour() {
    const d = new Date();
    const jj = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${jj}/${mm}/${d.getFullYear()}`;
}

function synchroniserParties() {
    champsSynchronises.forEach(([srcId, dstId]) => {
        const src = document.getElementById(srcId);
        const dst = document.getElementById(dstId);
        if (src && dst) dst.value = src.value;
    });
}

function sauvegarderWilayaPolyclinique() {
    const header = {};
    ['wilaya-ar-1', 'polyclinique-ar-1', 'wilaya-ar-2', 'polyclinique-ar-2'].forEach(id => {
        const el = document.getElementById(id);
        if (el) header[id] = el.value;
    });
    localStorage.setItem('certBonSanteHeader', JSON.stringify(header));
}

function chargerWilayaPolyclinique() {
    const saved = localStorage.getItem('certBonSanteHeader');
    if (!saved) return;
    try {
        const header = JSON.parse(saved);
        Object.keys(header).forEach(id => {
            const el = document.getElementById(id);
            if (el && header[id]) el.value = header[id];
        });
    } catch (e) {}
}

// Auto-fill current date and load saved data
document.addEventListener('DOMContentLoaded', function () {
    const todayStr = formaterDateDuJour();
    const date1 = document.getElementById('date-1');
    const date2 = document.getElementById('date-2');
    if (date1) date1.value = todayStr;
    if (date2) date2.value = todayStr;

    // Add print button functionality
    const printBtn = document.getElementById('printBtn');
    if (printBtn) {
        printBtn.addEventListener('click', function () {
            // Alerte en français pour les paramètres d'impression
            alert('Veuillez sélectionner le format "A4" et le paramètre des marges "par défaut" dans les options d\'impression.');
            window.print();
        });
    }

    // Synchronisation automatique : partie 1 -> partie 2
    champsSynchronises.forEach(([srcId, dstId]) => {
        const src = document.getElementById(srcId);
        const dst = document.getElementById(dstId);
        if (src && dst) {
            src.addEventListener('input', function () {
                dst.value = src.value;
                if (srcId === 'wilaya-ar-1' || srcId === 'polyclinique-ar-1') {
                    sauvegarderWilayaPolyclinique();
                }
            });
            // Les valeurs wilaya/polyclinique de la partie 2 sont aussi sauvegardées
            if (dstId === 'wilaya-ar-2' || dstId === 'polyclinique-ar-2') {
                dst.addEventListener('input', function () {
                    sauvegarderWilayaPolyclinique();
                });
            }
        }
    });

    // Debug: Show all localStorage data
    console.log('=== DEBUG: All localStorage data ===');
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        console.log(`${key}: ${value}`);
    }
    console.log('=== END DEBUG ===');

    // Load saved data from localStorage with delay to ensure data is available
    setTimeout(() => {
        loadContent(); // Load old saved content first
        loadSavedData(); // Then load fresh data from main app (this will override)
        chargerWilayaPolyclinique(); // Restaurer les dernières valeurs wilaya/polyclinique saisies
        synchroniserParties(); // Garantir que la partie 2 reflète la partie 1
    }, 100);
});

// Load saved data from main application
function loadSavedData() {
    // Debug: Show all localStorage data first
    console.log('=== All localStorage keys ===');
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        console.log(`${key}: "${value}"`);
    }
    console.log('=== End localStorage keys ===');

    // Get saved data from localStorage (using the exact keys from popup.js) with capitalization
    const polycliniqueAr = localStorage.getItem('polyclinique-ar') || '';
    const docteur = localStorage.getItem('docteur') || '';
    const nom = capitalizeNames(localStorage.getItem('nom') || '');
    const prenom = capitalizeNames(localStorage.getItem('prenom') || '');
    const age = localStorage.getItem('age') || '';

    console.log('Loading specific data:', { polycliniqueAr, docteur, nom, prenom, age });
    console.log('Raw values from localStorage:');
    console.log('nom:', localStorage.getItem('nom'));
    console.log('prenom:', localStorage.getItem('prenom'));
    console.log('age:', localStorage.getItem('age'));

    // Fill polyclinique-ar fields
    const polycliniqueFields = document.querySelectorAll('#polyclinique-ar-1, #polyclinique-ar-2');
    polycliniqueFields.forEach(field => {
        if (field && polycliniqueAr) {
            field.value = polycliniqueAr;
            console.log('Filled polyclinique-ar:', polycliniqueAr);
        }
    });

    // Fill docteur fields
    const docteurFields = document.querySelectorAll('#docteur-1, #docteur-2');
    docteurFields.forEach(field => {
        if (field && docteur) {
            field.value = docteur;
            console.log('Filled docteur:', docteur);
        }
    });

    // Fill patient data fields for both certificates
    const nomField1 = document.getElementById('nom-1');
    const prenomField1 = document.getElementById('prenom-1');
    const ageField1 = document.getElementById('age-1');
    const nomField2 = document.getElementById('nom-2');
    const prenomField2 = document.getElementById('prenom-2');
    const ageField2 = document.getElementById('age-2');

    // Fill first certificate (general)
    if (nomField1 && nom) {
        nomField1.value = nom;
        nomField1.setAttribute('value', nom);
        console.log('Filled nom-1:', nom);
    }
    if (prenomField1 && prenom) {
        prenomField1.value = prenom;
        prenomField1.setAttribute('value', prenom);
        console.log('Filled prenom-1:', prenom);
    }
    if (ageField1 && age) {
        ageField1.value = age;
        ageField1.setAttribute('value', age);
        console.log('Filled age-1:', age);
    }

    // Fill second certificate (special)
    if (nomField2 && nom) {
        nomField2.value = nom;
        nomField2.setAttribute('value', nom);
        console.log('Filled nom-2:', nom);
    }
    if (prenomField2 && prenom) {
        prenomField2.value = prenom;
        prenomField2.setAttribute('value', prenom);
        console.log('Filled prenom-2:', prenom);
    }
    if (ageField2 && age) {
        ageField2.value = age;
        ageField2.setAttribute('value', age);
        console.log('Filled age-2:', age);
    }


}

// Save content to localStorage
function saveContent() {
    const editableElements = document.querySelectorAll('.editable');
    const content = {};
    editableElements.forEach((element, index) => {
        // Skip date fields - they should always use today's date
        if (element.type !== 'date' && !element.classList.contains('date-input')) {
            content[index] = element.value;
        }
    });
    localStorage.setItem('certBonSanteContent', JSON.stringify(content));
}

// Load content from localStorage
function loadContent() {
    const saved = localStorage.getItem('certBonSanteContent');
    if (saved) {
        const content = JSON.parse(saved);
        const editableElements = document.querySelectorAll('.editable');
        editableElements.forEach((element, index) => {
            // Skip date fields - they should always use today's date
            if (element.type !== 'date' && !element.classList.contains('date-input') && content[index]) {
                element.value = content[index];
            }
        });
    }
}

// Auto-save on input
document.addEventListener('input', function (e) {
    if (e.target.classList.contains('editable')) {
        saveContent();
    }
});