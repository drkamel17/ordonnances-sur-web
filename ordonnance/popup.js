// popup.js
// Écouter les messages pour ouvrir popup.js
// Note: Chrome extension APIs have been replaced with standard web APIs
// In a web context, this would be handled differently or removed


// Declaration de la variable pour stocker les medicaments
const ordonnanceMedicaments = [];

// Fonction pour capitaliser automatiquement les noms et prénoms
function capitalizeNames(text) {
    if (!text) return text;
    return text.toLowerCase().replace(/\b\w/g, letter => letter.toUpperCase());
}

// Fonction pour échapper les caractères HTML spéciaux
function escapeHTML(text) {
    if (typeof text !== 'string') return text;
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

document.addEventListener("DOMContentLoaded", async () => {
    // Gerer l'ouverture de la modale
    const gererMedicamentsBtn = document.getElementById("gerer-medicaments");
    if (gererMedicamentsBtn) {
        gererMedicamentsBtn.addEventListener("click", () => {
            afficherMedicamentsPersonnalises();
            document.getElementById("modal").style.display = "block";
        });
    }

    // Gerer la fermeture de la modale
    const closeBtn = document.querySelector(".close");
    if (closeBtn) {
        closeBtn.onclick = function () {
            document.getElementById("modal").style.display = "none";
        };
    }

    window.onclick = function (event) {
        if (event.target == document.getElementById("modal")) {
            document.getElementById("modal").style.display = "none";
        }
    };

    // Vider les medicaments
    const viderMedicamentsBtn = document.getElementById("vider-medicaments");
    if (viderMedicamentsBtn) {
        viderMedicamentsBtn.addEventListener("click", () => {
            if (confirm("Voulez-vous vraiment supprimer tous les medicaments enregistres ?")) {
                localStorage.setItem("medicaments", JSON.stringify([]));
                afficherMedicamentsPersonnalises();
                remplirDatalist([]);
            }
        });
    }
	
	// Gestion du bouton de réglage des coordonnées pour l'en-tête Perso
const btnReglageCoordonnees = document.getElementById('btn-reglage-coordonnees');
if (btnReglageCoordonnees) {
    btnReglageCoordonnees.addEventListener('click', function() {
        window.open('reglage.html', 'reglage', 'width=900,height=700,scrollbars=yes');
    });
}

    // Gestion de la navigation au clavier entre les champs
    const champMedicament = document.getElementById("medicament");
    const champDosage = document.getElementById("dosage");
    const champDuree = document.getElementById("duree");
    const champFrequence = document.getElementById("frequence");
    const champQuantite = document.getElementById("quantite");
    const champPosologie = document.getElementById("posologie");

    if (champMedicament && champDosage) {
        champMedicament.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                champDosage.focus();
            }
        });

        champDosage.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                champDuree?.focus();
            }
        });
    }

    if (champDuree && champFrequence) {
        champDuree.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                champFrequence.focus();
            }
        });
    }

    if (champFrequence && champQuantite) {
        champFrequence.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                champQuantite.focus();
            }
        });
    }

    if (champQuantite && champPosologie) {
        champQuantite.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                champPosologie.focus();
            }
        });
    }

    // Charger les données de stockage
    const data = JSON.parse(localStorage.getItem('patientData') || '{}');
    const nomInput = document.getElementById("nom");
    const prenomInput = document.getElementById("prenom");
    const dobInput = document.getElementById("dob");
    const poidsInput = document.getElementById("poids");

    if (nomInput) nomInput.value = data.nom || "";
    if (prenomInput) prenomInput.value = data.prenom || "";
    if (dobInput) dobInput.value = data.dob || "";
    if (poidsInput) poidsInput.value = data.poids || "";

    // Charger les médicaments
    try {
        let meds = await chargerMedicaments();
        remplirDatalist(meds);
    } catch (error) {
        console.error("Erreur lors du chargement des médicaments:", error);
    }

    // Ajouter un médicament à l'ordonnance
    const ajouterMedicamentBtn = document.getElementById("ajouter-medicament");
    if (ajouterMedicamentBtn) {
        ajouterMedicamentBtn.addEventListener("click", () => {
            const medicament = document.getElementById("medicament")?.value.trim();
            const dosage = document.getElementById("dosage")?.value.trim();
            const duree = document.getElementById("duree")?.value.trim();
            const frequence = document.getElementById("frequence")?.value.trim();
            const quantite = document.getElementById("quantite")?.value.trim();
            const posologie = document.getElementById("posologie")?.value.trim();

            if (!medicament) {
                alert("Veuillez entrer un médicament");
                return;
            }

            const medicamentObj = {
                medicament,
                dosage,
                duree,
                frequence,
                quantite,
                posologie
            };

            ordonnanceMedicaments.push(medicamentObj);
            afficherMedicamentsPersonnalises();

            // Réinitialiser les champs
            if (document.getElementById("medicament")) document.getElementById("medicament").value = "";
            if (document.getElementById("dosage")) document.getElementById("dosage").value = "";
            if (document.getElementById("duree")) document.getElementById("duree").value = "";
            if (document.getElementById("frequence")) document.getElementById("frequence").value = "";
            if (document.getElementById("quantite")) document.getElementById("quantite").value = "";
            if (document.getElementById("posologie")) document.getElementById("posologie").value = "";

            // Mettre le focus sur le premier champ
            if (document.getElementById("medicament")) document.getElementById("medicament").focus();
        });
    }

    // Générer l'ordonnance
    const genererOrdonnanceBtn = document.getElementById("generer-ordonnance");
    if (genererOrdonnanceBtn) {
        genererOrdonnanceBtn.addEventListener("click", async () => {
            const nom = document.getElementById("nom")?.value.trim();
            const prenom = document.getElementById("prenom")?.value.trim();
            const dob = document.getElementById("dob")?.value.trim();
            const poids = document.getElementById("poids")?.value.trim();

            if (!nom || !prenom || !dob || !poids) {
                alert("Veuillez remplir tous les champs du patient");
                return;
            }

            if (ordonnanceMedicaments.length === 0) {
                alert("Veuillez ajouter au moins un médicament");
                return;
            }

            // Stocker les données du patient
            const patientData = { nom, prenom, dob, poids };
            localStorage.setItem('patientData', JSON.stringify(patientData));

            // Stocker les médicaments
            localStorage.setItem('medicaments', JSON.stringify(ordonnanceMedicaments));

            // Ouvrir la page d'ordonnance
            window.open('ord.html', '_blank');
        });
    }
});

// Charger les médicaments depuis le stockage ou le fichier local
async function chargerMedicaments() {
    const meds = JSON.parse(localStorage.getItem("medicaments") || "[]");
    return meds;
}

// Remplir le datalist avec les médicaments
function remplirDatalist(medicaments) {
    const datalist = document.getElementById("medicaments-list");
    if (datalist) {
        datalist.innerHTML = "";

        medicaments.forEach(med => {
            const option = document.createElement("option");
            option.value = med;
            datalist.appendChild(option);
        });
    }
}

// Afficher les médicaments ajoutés
function afficherMedicamentsPersonnalises() {
    const liste = document.getElementById("medicaments-personnalises");
    if (!liste) return;

    liste.innerHTML = "";

    if (ordonnanceMedicaments.length === 0) {
        liste.innerHTML = "<li>Aucun médicament ajouté</li>";
        return;
    }

    ordonnanceMedicaments.forEach((med, index) => {
        const li = document.createElement("li");
        li.textContent = `${med.medicament} - ${med.dosage} - ${med.duree} - ${med.frequence} - ${med.quantite} - ${med.posologie}`;
        li.innerHTML += `<button class="supprimer" data-index="${index}">Supprimer</button>`;
        liste.appendChild(li);
    });

    // Ajouter les écouteurs pour les boutons de suppression
    document.querySelectorAll(".supprimer").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const index = parseInt(e.target.getAttribute("data-index"));
            ordonnanceMedicaments.splice(index, 1);
            afficherMedicamentsPersonnalises();
        });
    });
}
// Fonction pour générer l'ordonnance avec en-tête personnalisé
function ordonnanceperso() {
    // Charger les coordonnées personnalisées depuis le localStorage
    const coordonnees = localStorage.getItem('coordonneesPersoHeader');
    
    if (!coordonnees) {
        // Si aucune coordonnée n'est sauvegardée, demander à l'utilisateur s'il veut configurer
        if (confirm('Aucune coordonnée personnalisée n\'est configurée. Voulez-vous ouvrir les réglages ?')) {
            window.open('reglage.html', 'reglage', 'width=900,height=700,scrollbars=yes');
        }
        return;
    }
    
    const coords = JSON.parse(coordonnees);
    const nom = capitalizeNames(document.getElementById("nom").value.trim());
    const prenom = capitalizeNames(document.getElementById("prenom").value.trim());
    const dateNaissance = document.getElementById("date-naissance").value;
    const age = document.getElementById("age").value;
    const numero = document.getElementById("numero").value;
    const poids = document.getElementById("poids").value.trim();

    // Formater la date de naissance en JJ/MM/AAAA
    let formattedDateNaissance = '';
    
    if (dateNaissance && dateNaissance.trim() !== '') {
        // Le format de l'input date est AAAA-MM-JJ
        const parts = dateNaissance.split('-');
        if (parts.length === 3) {
            const [annee, mois, jour] = parts;
            formattedDateNaissance = `${jour}/${mois}/${annee}`;
        } else {
            formattedDateNaissance = dateNaissance;
        }
    }




    const dateConsultation = document.querySelector('input[name="date-consultation"]').value;
    let formattedDate = '';
    if (dateConsultation) {
        const [year, month, day] = dateConsultation.split('-');
        formattedDate = `${day}/${month}/${year}`;
    }

    let itemsContent = '';

    // Utiliser ordonnanceList (de ord.js) ou ordonnanceMedicaments (de popup.js)
    const listeMedicaments = (typeof ordonnanceList !== 'undefined' && ordonnanceList.length > 0) ? ordonnanceList : ordonnanceMedicaments;

    listeMedicaments.forEach((item, index) => {
        const med = item.medicament;
        const poso = item.posologie;
        const qt = item.quantite;
        const nbr = index + 1;

        itemsContent += `
            <div style="margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: baseline;">
                    <span style="flex: 1;">
                        <span style="font-weight: bold; min-width: 20px; display: inline-block;" class="med-font">${nbr}.</span>
                        <span style="white-space: normal;" class="med-font">${escapeHTML(med)}</span>
                    </span>
                    <span style="margin-left: 20px; white-space: nowrap;" class="med-font">${escapeHTML(qt)}</span>
                </div>
                <div style="margin-left: 30px; color: #555; font-style: italic; margin-top: 5px;" class="med-font">${escapeHTML(poso)}</div>
            </div>`;
    });

    // En-tête vide pour l'en-tête personnalisé (l'utilisateur configurera les positions)
    const enteteContent = '<div style="height: 50px;"></div>';

    const certificatContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ordonnance Medicale</title>
        <style>
            :root {
                --med-font-size: 12px;
            }
            body {
                font-family: Arial, sans-serif;
                padding: 20px;
                background-color: #f9f9f9;
            }
            .certificat {
                background-color: white;
                border: 1px solid #ddd;
                padding: 20px;
                max-width: 600px;
                margin: 0 auto;
                margin-top: 60px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                position: relative;
            }
            
            .info {
                position: absolute;
                font-size: 16px;
                font-weight: bold;
            }
            
            .info.nom { 
                top: ${coords.nom?.y || 80}px; 
                left: ${coords.nom?.x || 134}px; 
            }
            .info.prenom { 
                top: ${coords.prenom?.y || 80}px; 
                left: ${coords.prenom?.x || 235}px; 
            }
            .info.date-naissance { 
                top: ${coords.dateNaissance?.y || 111}px; 
                left: ${coords.dateNaissance?.x || 110}px; 
            }
            .info.age { 
                top: ${coords.age?.y || 111}px; 
                left: ${coords.age?.x || 60}px; 
            }
            .info.today { 
                top: ${coords.dateConsultation?.y || 111}px; 
                left: ${coords.dateConsultation?.x || 380}px; 
            }
            .info.numero { 
                top: ${coords.numero?.y || 80}px; 
                left: ${coords.numero?.x || 407}px; 
            }
            .info.poids { 
                top: ${coords.age?.y || 111}px; 
                left: ${(coords.age?.x || 60) + 170}px; 
            }
            
            h1 {
                text-align: center;
                color: #333;
                text-decoration: underline;
                font-size: 20px;
                margin: 10px 0 20px 0;
            }
            
            .medication-list {
                margin-top: 250px;
                margin-bottom: 20px;
                margin-right: 14px;
                margin-left: 14px;
            }
            
            .med-font {
                font-size: var(--med-font-size);
            }
            
            .print-button {
                text-align: center;
                margin-top: 20px;
            }
            .print-button button {
                padding: 10px 20px;
                font-size: 16px;
                background-color: #007bff;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            }
            .print-button button:hover {
                background-color: #0056b3;
            }
            @media print {
                @page {
                    size: A5;
                    margin: 0.2cm 0.2cm 0.2cm 0.2cm;
                }
                
                body {
                    margin: 0 !important;
                    padding: 0 !important;
                    font-size: 10pt !important;
                    line-height: 1.2 !important;
                    background-color: white;
                }
                
                .certificat {
                    border: none;
                    box-shadow: none;
                    margin: 0 !important;
                    padding: 2px !important;
                    max-width: 100% !important;
                }
                
                h1 {
                    font-size: 14pt !important;
                    margin: 5px 0 !important;
                }
                
                .info {
                    font-size: 9pt !important;
                }
                
                div[style*="margin-bottom: 15px"] {
                    margin-bottom: 5px !important;
                }
                
                .medication-list span,
                .medication-list div[style*="margin-left: 30px"] {
                    font-size: var(--med-font-size) !important;
                }
                
                .print-button {
                    display: none;
                }
            }
        </style>
    </head>
    <body>
        ${enteteContent}
        <div class="certificat">
            <h1></h1>
            <div class="info nom"><strong></strong> ${escapeHTML(nom)}</div>
            <div class="info prenom"><strong></strong> ${escapeHTML(prenom)}</div>           
			${formattedDateNaissance ? `<div class="info date-naissance"><strong></strong> ${escapeHTML(formattedDateNaissance)}<strong></strong></div>` : ''}
            <div class="info age"><strong>.</strong> ${escapeHTML(age)}</div>
            <div class="info today"><strong> </strong> ${escapeHTML(formattedDate)}</div> 
			
			${numero ? `<div class="info numero"><strong>numero :</strong> ${escapeHTML(numero)}</div>` : ''}
            ${poids ? `<div class="info poids"><strong>Poids :</strong> ${escapeHTML(poids)}</div>` : ''}
            <div class="medication-list">
                ${itemsContent}
            </div>
        </div>
         <div class="print-button">
            <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 10px;">
                <label for="numero-police-impression" style="font-size: 14px; font-weight: bold;">Taille police:</label>
                <input type="number" id="numero-police-impression" min="8" max="24" value="14" style="width: 80px; padding: 5px; font-size: 14px; border: 1px solid #ccc; border-radius: 4px;" onchange="updateFontSize(this.value)">
            </div>
            <button id="printButton" onclick="window.print()">Imprimer l'ordonnance</button>
        </div>
        <script>
        function updateFontSize(size) {
            document.querySelectorAll('.med-font').forEach(el => {
                el.style.fontSize = size + 'px';
            });
        }
        </script>
    </body>
    </html>`;

    const blob = new Blob([certificatContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const newWindow = window.open(url, '_blank');
    
    // Afficher une notification
    const notification = document.createElement('div');
    notification.style.cssText = 'background: #d4edda; color: #155724; padding: 10px; margin: 10px 0; border-radius: 5px; font-size: 0.85rem; position: fixed; top: 80px; right: 20px; z-index: 9999; box-shadow: 0 2px 5px rgba(0,0,0,0.2);';
    notification.innerHTML = '✅ Mode en-tête personnalisé activé';
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}
