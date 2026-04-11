// Coordonnées par défaut
const coordonneesDefaut = {
    nom: { x: 134, y: 80 },
    prenom: { x: 235, y: 80 },
    age: { x: 60, y: 111 },
    dateNaissance: { x: 110, y: 111 },
    dateConsultation: { x: 380, y: 111 },
    numero: { x: 407, y: 80 }
};

let draggedElement = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

// Charger les coordonnées sauvegardées au démarrage
document.addEventListener('DOMContentLoaded', function() {
    chargerCoordonnees();
    mettreAJourApercu();
    initialiserGlisserDeposer();
    initialiserBoutons();
});

// Écouteurs d'événements pour mettre à jour l'aperçu en temps réel
const inputs = document.querySelectorAll('input[type="number"]');
inputs.forEach(input => {
    input.addEventListener('input', mettreAJourApercu);
});

function initialiserBoutons() {
    document.getElementById('btn-sauvegarder').addEventListener('click', sauvegarderCoordonnees);
    document.getElementById('btn-appliquer').addEventListener('click', appliquerCoordonnees);
    document.getElementById('btn-reinitialiser').addEventListener('click', reinitialiserCoordonnees);
    document.getElementById('btn-fermer').addEventListener('click', fermerPage);
}

function initialiserGlisserDeposer() {
    const previewItems = document.querySelectorAll('.preview-item');
    const previewArea = document.getElementById('preview-area');

    previewItems.forEach(item => {
        item.addEventListener('mousedown', demarrerGlissement);
    });

    // Empêcher la sélection de texte pendant le glissement
    previewArea.addEventListener('selectstart', function(e) {
        if (draggedElement) {
            e.preventDefault();
        }
    });
}

function demarrerGlissement(e) {
    e.preventDefault();
    draggedElement = e.target;
    
    // Calculer l'offset par rapport à l'élément
    const rect = draggedElement.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
    
    // Ajouter la classe de style
    draggedElement.classList.add('dragging');
    
    // Ajouter les écouteurs d'événements globaux
    document.addEventListener('mousemove', glisser);
    document.addEventListener('mouseup', arreterGlissement);
}

function glisser(e) {
    if (!draggedElement) return;
    
    const previewArea = document.getElementById('preview-area');
    const areaRect = previewArea.getBoundingClientRect();
    
    // Calculer la nouvelle position relative à la zone d'aperçu
    let newX = e.clientX - areaRect.left - dragOffsetX;
    let newY = e.clientY - areaRect.top - dragOffsetY;
    
    // Limiter les positions aux limites de la zone
    newX = Math.max(0, Math.min(newX, areaRect.width - draggedElement.offsetWidth));
    newY = Math.max(0, Math.min(newY, areaRect.height - draggedElement.offsetHeight));
    
    // Arrondir à l'entier le plus proche
    newX = Math.round(newX);
    newY = Math.round(newY);
    
    // Mettre à jour la position visuelle
    draggedElement.style.left = newX + 'px';
    draggedElement.style.top = newY + 'px';
    
    // Mettre à jour les champs input correspondants
    const target = draggedElement.dataset.target;
    const xInput = document.getElementById(target + '-x');
    const yInput = document.getElementById(target + '-y');
    
    if (xInput) xInput.value = newX;
    if (yInput) yInput.value = newY;
}

function arreterGlissement() {
    if (draggedElement) {
        draggedElement.classList.remove('dragging');
        draggedElement = null;
    }
    
    // Supprimer les écouteurs d'événements globaux
    document.removeEventListener('mousemove', glisser);
    document.removeEventListener('mouseup', arreterGlissement);
}

function mettreAJourApercu() {
    document.getElementById('preview-nom').style.left = document.getElementById('nom-x').value + 'px';
    document.getElementById('preview-nom').style.top = document.getElementById('nom-y').value + 'px';
    
    document.getElementById('preview-prenom').style.left = document.getElementById('prenom-x').value + 'px';
    document.getElementById('preview-prenom').style.top = document.getElementById('prenom-y').value + 'px';
    
    document.getElementById('preview-age').style.left = document.getElementById('age-x').value + 'px';
    document.getElementById('preview-age').style.top = document.getElementById('age-y').value + 'px';
    
    document.getElementById('preview-date-naissance').style.left = document.getElementById('date-naissance-x').value + 'px';
    document.getElementById('preview-date-naissance').style.top = document.getElementById('date-naissance-y').value + 'px';
    
    document.getElementById('preview-date-consultation').style.left = document.getElementById('date-consultation-x').value + 'px';
    document.getElementById('preview-date-consultation').style.top = document.getElementById('date-consultation-y').value + 'px';
    
    document.getElementById('preview-numero').style.left = document.getElementById('numero-x').value + 'px';
    document.getElementById('preview-numero').style.top = document.getElementById('numero-y').value + 'px';
}

function sauvegarderCoordonnees() {
    const coordonnees = {
        nom: {
            x: parseInt(document.getElementById('nom-x').value) || 134,
            y: parseInt(document.getElementById('nom-y').value) || 80
        },
        prenom: {
            x: parseInt(document.getElementById('prenom-x').value) || 235,
            y: parseInt(document.getElementById('prenom-y').value) || 80
        },
        age: {
            x: parseInt(document.getElementById('age-x').value) || 60,
            y: parseInt(document.getElementById('age-y').value) || 111
        },
        dateNaissance: {
            x: parseInt(document.getElementById('date-naissance-x').value) || 110,
            y: parseInt(document.getElementById('date-naissance-y').value) || 111
        },
        dateConsultation: {
            x: parseInt(document.getElementById('date-consultation-x').value) || 380,
            y: parseInt(document.getElementById('date-consultation-y').value) || 111
        },
        numero: {
            x: parseInt(document.getElementById('numero-x').value) || 407,
            y: parseInt(document.getElementById('numero-y').value) || 80
        }
    };

    localStorage.setItem('coordonneesPersoHeader', JSON.stringify(coordonnees));
    afficherMessage('Coordonnées sauvegardées avec succès !', 'success');
}

function chargerCoordonnees() {
    const sauvegarde = localStorage.getItem('coordonneesPersoHeader');
    if (sauvegarde) {
        const coordonnees = JSON.parse(sauvegarde);
        
        document.getElementById('nom-x').value = coordonnees.nom?.x || 134;
        document.getElementById('nom-y').value = coordonnees.nom?.y || 80;
        
        document.getElementById('prenom-x').value = coordonnees.prenom?.x || 235;
        document.getElementById('prenom-y').value = coordonnees.prenom?.y || 80;
        
        document.getElementById('age-x').value = coordonnees.age?.x || 60;
        document.getElementById('age-y').value = coordonnees.age?.y || 111;
        
        document.getElementById('date-naissance-x').value = coordonnees.dateNaissance?.x || 110;
        document.getElementById('date-naissance-y').value = coordonnees.dateNaissance?.y || 111;
        
        document.getElementById('date-consultation-x').value = coordonnees.dateConsultation?.x || 380;
        document.getElementById('date-consultation-y').value = coordonnees.dateConsultation?.y || 111;
        
        document.getElementById('numero-x').value = coordonnees.numero?.x || 407;
        document.getElementById('numero-y').value = coordonnees.numero?.y || 80;
    }
}

function appliquerCoordonnees() {
    sauvegarderCoordonnees();
    
    // Envoyer un message à la fenêtre parente si elle existe
    if (window.opener && !window.opener.closed) {
        window.opener.postMessage({ type: 'coordonneesMisesAJour' }, '*');
        afficherMessage('Coordonnées appliquées !', 'success');
    } else {
        afficherMessage('Impossible de communiquer avec la page parente', 'error');
    }
}

function reinitialiserCoordonnees() {
    if (confirm('Voulez-vous vraiment réinitialiser les coordonnées aux valeurs par défaut ?')) {
        document.getElementById('nom-x').value = coordonneesDefaut.nom.x;
        document.getElementById('nom-y').value = coordonneesDefaut.nom.y;
        
        document.getElementById('prenom-x').value = coordonneesDefaut.prenom.x;
        document.getElementById('prenom-y').value = coordonneesDefaut.prenom.y;
        
        document.getElementById('age-x').value = coordonneesDefaut.age.x;
        document.getElementById('age-y').value = coordonneesDefaut.age.y;
        
        document.getElementById('date-naissance-x').value = coordonneesDefaut.dateNaissance.x;
        document.getElementById('date-naissance-y').value = coordonneesDefaut.dateNaissance.y;
        
        document.getElementById('date-consultation-x').value = coordonneesDefaut.dateConsultation.x;
        document.getElementById('date-consultation-y').value = coordonneesDefaut.dateConsultation.y;
        
        document.getElementById('numero-x').value = coordonneesDefaut.numero.x;
        document.getElementById('numero-y').value = coordonneesDefaut.numero.y;
        
        mettreAJourApercu();
        sauvegarderCoordonnees();
        afficherMessage('Coordonnées réinitialisées !', 'success');
    }
}

function fermerPage() {
    window.close();
}

function afficherMessage(message, type) {
    const statusDiv = document.getElementById('status-message');
    statusDiv.textContent = message;
    statusDiv.className = 'status-message ' + type;
    statusDiv.style.display = 'block';
    
    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 3000);
}