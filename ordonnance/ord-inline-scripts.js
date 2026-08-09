// Fonction pour capitaliser automatiquement les noms et prénoms
function capitalizeNames(text) {
    if (!text) return text;
    return text.toLowerCase().replace(/\b\w/g, letter => letter.toUpperCase());
}

// Ajouter des écouteurs pour capitaliser et sauvegarder automatiquement les noms
document.addEventListener('DOMContentLoaded', function() {
    const nomField = document.getElementById('nom');
    const prenomField = document.getElementById('prenom');
    const poidsField = document.getElementById('poids');

    // Capitalisation et sauvegarde automatique pour le champ nom
    if (nomField) {
        nomField.addEventListener('input', function() {
            const capitalizedName = capitalizeNames(this.value);
            localStorage.setItem('nom', capitalizedName);
            // Mettre à jour le champ sans déplacer le curseur
            if (this.value !== capitalizedName) {
                const cursorPos = this.selectionStart;
                this.value = capitalizedName;
                this.setSelectionRange(cursorPos, cursorPos);
            }
        });
    }

    // Capitalisation et sauvegarde automatique pour le champ prénom
    if (prenomField) {
        prenomField.addEventListener('input', function() {
            const capitalizedName = capitalizeNames(this.value);
            localStorage.setItem('prenom', capitalizedName);
            // Mettre à jour le champ sans déplacer le curseur
            if (this.value !== capitalizedName) {
                const cursorPos = this.selectionStart;
                this.value = capitalizedName;
                this.setSelectionRange(cursorPos, cursorPos);
            }
        });
    }

    // Sauvegarde automatique pour le champ poids
    if (poidsField) {
        poidsField.addEventListener('input', function() {
            localStorage.setItem('poids', this.value);
        });
    }

    // Sauvegarde automatique pour la date de naissance, l'âge, le numéro et la date de consultation
    const dateNaissanceField = document.getElementById('date-naissance');
    const ageField = document.getElementById('age');
    const numeroField = document.getElementById('numero');
    const dateConsultationField = document.querySelector('input[name="date-consultation"]');

    if (dateNaissanceField) {
        dateNaissanceField.addEventListener('input', function() {
            localStorage.setItem('dateNaissance', this.value);
        });
        dateNaissanceField.addEventListener('change', function() {
            localStorage.setItem('dateNaissance', this.value);
            // L'âge est recalculé automatiquement par ord.js : on le sauvegarde après
            setTimeout(function() {
                if (ageField && ageField.value) {
                    localStorage.setItem('age', ageField.value);
                }
            }, 50);
        });
    }

    if (ageField) {
        ageField.addEventListener('input', function() {
            localStorage.setItem('age', this.value);
        });
        ageField.addEventListener('change', function() {
            localStorage.setItem('age', this.value);
        });
    }

    if (numeroField) {
        numeroField.addEventListener('input', function() {
            localStorage.setItem('numero', this.value);
        });
        numeroField.addEventListener('change', function() {
            localStorage.setItem('numero', this.value);
        });
    }

    if (dateConsultationField) {
        dateConsultationField.addEventListener('input', function() {
            localStorage.setItem('date-consultation', this.value);
        });
        dateConsultationField.addEventListener('change', function() {
            localStorage.setItem('date-consultation', this.value);
        });
    }

    // Charger la valeur du poids depuis localStorage
    const savedPoids = localStorage.getItem('poids');
    if (savedPoids && poidsField) {
        poidsField.value = savedPoids;
    }
});