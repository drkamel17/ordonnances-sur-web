let contenuJSON = [];
let contenuOrdonnancesTypes = [];

// Simuler chrome.storage avec localStorage
const storage = {
    get: function(key, callback) {
        if (typeof key === 'string') {
            const data = localStorage.getItem(key);
            callback({ [key]: data ? JSON.parse(data) : undefined });
        } else {
            const result = {};
            Object.keys(key).forEach(k => {
                const data = localStorage.getItem(k);
                result[k] = data ? JSON.parse(data) : undefined;
            });
            callback(result);
        }
    },
    set: function(data, callback) {
        Object.keys(data).forEach(key => {
            localStorage.setItem(key, JSON.stringify(data[key]));
        });
        if (callback) callback();
    }
};

// === Chargement de la page ===
document.addEventListener("DOMContentLoaded", async () => {
    // === Ajout des écouteurs uniquement quand le DOM est prêt ===
    document.getElementById("choisir-fichier").addEventListener("click", () => {
        document.getElementById("fichier-json").click();
    });

    document.getElementById("fichier-json").addEventListener("change", handleFileChangeMedicaments);

    document.getElementById("ajouter-contenu").addEventListener("click", ajouterMedicaments);

    document.getElementById("recharger-medicaments").addEventListener("click", async () => {
        try {
            let meds = await chargerMedicaments();
            remplirListeMedicaments(meds);
            showMessage("Médicaments rechargés avec succès.", "green");
        } catch (error) {
            showMessage("Erreur lors du rechargement des médicaments.", "red");
            console.error("Erreur :", error);
        }
    });

    document.getElementById("choisir-ordonnances-type").addEventListener("click", () => {
        document.getElementById("fichier-ordonnances-type").click();
    });

    document.getElementById("fichier-ordonnances-type").addEventListener("change", handleFileChangeOrdonnancesTypes);

    document.getElementById("ajouter-ordonnances-type").addEventListener("click", ajouterOrdonnancesTypes);

    // === Exporter médicaments personnalisés ===
    document.getElementById("exporter-medicaments-personnalises").addEventListener("click", function() {
        const medsPersonnalises = JSON.parse(localStorage.getItem('medicamentsPersonnalises') || '[]');

        if (medsPersonnalises.length === 0) {
            showMessage("Aucun médicament personnalisé à exporter.", "red");
            return;
        }

        const dataStr = JSON.stringify(medsPersonnalises, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const exportFileDefaultName = 'medicaments-personnalises.json';

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();

        showMessage(`Export réussi : ${medsPersonnalises.length} médicament(s) exporté(s).`, "green");
    });

    // === Importer médicaments personnalisés ===
    const btnImporterMeds = document.getElementById("btn-importer-medicaments");
    const importMedsInput = document.getElementById("importer-medicaments-personnalises");

    if (btnImporterMeds && importMedsInput) {
        btnImporterMeds.addEventListener("click", function() {
            importMedsInput.click();
        });

        importMedsInput.addEventListener("change", function(e) {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const importedMeds = JSON.parse(e.target.result);

                    if (!Array.isArray(importedMeds)) {
                        showMessage("Format de fichier invalide. Le fichier doit contenir un tableau de médicaments.", "red");
                        return;
                    }

                    let medsPersonnalises = JSON.parse(localStorage.getItem('medicamentsPersonnalises') || '[]');
                    let nbAjoutes = 0;

                    importedMeds.forEach(med => {
                        if (typeof med === 'string' && med.trim() !== '' && !medsPersonnalises.includes(med.trim())) {
                            medsPersonnalises.push(med.trim());
                            nbAjoutes++;
                        }
                    });

                    localStorage.setItem('medicamentsPersonnalises', JSON.stringify(medsPersonnalises));

                    showMessage(`${nbAjoutes} médicament(s) importé(s) avec succès !`, "green");
                    importMedsInput.value = '';
                } catch (error) {
                    showMessage("Erreur lors de l'import : " + error.message, "red");
                }
            };
            reader.readAsText(file);
        });
    }

    // === Chargement initial ===
    try {
        let meds = await chargerMedicaments();
        remplirListeMedicaments(meds);
        chargerOrdonnancesTypes();
        showMessage("Données chargées avec succès.", "green");
    } catch (error) {
        showMessage("Erreur lors du chargement des données.", "red");
        console.error("Erreur :", error);
    }
});

// === Fonctions ===

// Gérer le fichier de médicaments
function handleFileChangeMedicaments(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            contenuJSON = JSON.parse(e.target.result);
            if (!Array.isArray(contenuJSON)) throw new Error("Le contenu n'est pas un tableau.");
            showMessage("Fichier de médicaments chargé avec succès !", "green");
        } catch {
            showMessage("Fichier JSON invalide !", "red");
        }
    };
    reader.readAsText(file);
}

// Gérer le fichier d'ordonnances types
function handleFileChangeOrdonnancesTypes(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            contenuOrdonnancesTypes = JSON.parse(e.target.result);
            if (typeof contenuOrdonnancesTypes !== "object") throw new Error();
            showMessage("Fichier d'ordonnances types chargé avec succès !", "green");
        } catch {
            showMessage("Fichier JSON invalide !", "red");
        }
    };
    reader.readAsText(file);
}

// Ajouter les médicaments au stockage
function ajouterMedicaments() {
    if (contenuJSON.length === 0) {
        showMessage("Aucun contenu à ajouter.", "red");
        return;
    }

    storage.get("medicaments", (result) => {
        let existants = result.medicaments || [];
        let fusion = Array.from(new Set([...existants, ...contenuJSON])).sort((a, b) => a.localeCompare(b));

        storage.set({ medicaments: fusion }, () => {
            localStorage.setItem("medicaments", JSON.stringify(fusion));
            remplirListeMedicaments(fusion);
            showMessage("Médicaments ajoutés avec succès !", "green");
        });
    });
}

// Charger les médicaments
async function chargerMedicaments() {
    return new Promise((resolve) => {
        storage.get("medicaments", (result) => {
            let existants = result.medicaments || [];

            fetch("medicaments.json")
                .then(res => res.json())
                .then(fichier => {
                    let locaux = JSON.parse(localStorage.getItem("medicaments")) || [];
                    let fusion = Array.from(new Set([...existants, ...fichier, ...locaux])).sort((a, b) => a.localeCompare(b));

                    storage.set({ medicaments: fusion }, () => resolve(fusion));
                })
                .catch((err) => {
                    console.error("Erreur JSON local :", err);
                    resolve(existants);
                });
        });
    });
}

// Remplir la liste HTML des médicaments
function remplirListeMedicaments(meds) {
    const liste = document.getElementById("medicaments-liste");
    liste.innerHTML = "";

    meds.forEach(med => {
        const li = document.createElement("li");
        li.textContent = med;
        li.addEventListener("click", () => alert(`Vous avez sélectionné : ${med}`));
        liste.appendChild(li);
    });

    console.log("Liste des médicaments mise à jour :", meds);
}

// Ajouter les ordonnances types
function ajouterOrdonnancesTypes() {
    if (Object.keys(contenuOrdonnancesTypes).length === 0) {
        showMessage("Aucun contenu à ajouter.", "red");
        return;
    }

    storage.get("ordonnancesTypes", (result) => {
        let existants = result.ordonnancesTypes || {};
        let fusion = { ...existants, ...contenuOrdonnancesTypes };

        storage.set({ ordonnancesTypes: fusion }, () => {
            localStorage.setItem("ordonnancesTypes", JSON.stringify(fusion));
            remplirListeOrdonnancesTypes(fusion);
            showMessage("Ordonnances types ajoutées avec succès !", "green");
        });
    });
}

// Charger les ordonnances types
function chargerOrdonnancesTypes() {
    storage.get("ordonnancesTypes", (result) => {
        let data = result.ordonnancesTypes || {};
        remplirListeOrdonnancesTypes(data);
    });
}

// === Charger fichier d'ordonnances pour ord.html ===
const chargerFichierOrdonnancesBtn = document.getElementById("charger-fichier-ordonnances");
const fichierOrdonnancesPourOrdInput = document.getElementById("fichier-ordonnances-pour-ord");

if (chargerFichierOrdonnancesBtn && fichierOrdonnancesPourOrdInput) {
    chargerFichierOrdonnancesBtn.addEventListener("click", function() {
        fichierOrdonnancesPourOrdInput.click();
    });

    fichierOrdonnancesPourOrdInput.addEventListener("change", function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);

                if (typeof data !== 'object') {
                    showMessage("Format de fichier invalide. Le fichier doit contenir un objet d'ordonnances types.", "red");
                    return;
                }

                localStorage.setItem('ordonnancesTypesPourOrd', JSON.stringify(data));

                showMessage(`Fichier chargé avec succès ! ${Object.keys(data).length} ordonnance(s) type(s) disponible(s) dans ord.html.`, "green");
                fichierOrdonnancesPourOrdInput.value = '';
            } catch (error) {
                showMessage("Erreur lors du chargement du fichier : " + error.message, "red");
            }
        };
        reader.readAsText(file);
    });
}
function remplirListeOrdonnancesTypes(data) {
    const select = document.getElementById("liste-ordonnances-types");
    select.innerHTML = '<option value="">Sélectionnez une ordonnance type</option>'; // Effacer les options existantes

    Object.keys(data).forEach(maladie => {
        const option = document.createElement("option");
        option.value = maladie;
        option.textContent = maladie;
        select.appendChild(option);
    });

    console.log("Ordonnances types chargées :", Object.keys(data));
}
// Remplir la liste HTML des ordonnances types
function remplirListeOrdonnancesTypes2(data) {
    const liste = document.getElementById("ordonnances-liste");
    liste.innerHTML = "";

    Object.keys(data).forEach(nom => {
        const li = document.createElement("li");
        li.textContent = nom;
        li.addEventListener("click", () => alert(`Vous avez sélectionné : ${nom}`));
        liste.appendChild(li);
    });

    console.log("Liste des ordonnances types mise à jour :", data);
}

function ajouterOrdonnancesTypes() {
    if (Object.keys(contenuOrdonnancesTypes).length === 0) {
        showMessage("Aucun contenu à ajouter.", "red");
        return;
    }

    storage.get("ordonnancesTypes", (result) => {
        let existants = result.ordonnancesTypes || {};  // Obtenir les ordonnances existantes
        let fusion = { ...existants, ...contenuOrdonnancesTypes };  // Fusionner les objets

        storage.set({ ordonnancesTypes: fusion }, () => {
            localStorage.setItem("ordonnancesTypes", JSON.stringify(fusion));
            remplirListeOrdonnancesTypes(fusion);  // Mettre à jour la liste
            showMessage("Ordonnances types ajoutées avec succès !", "green");
        });
    });
}


// Afficher un message à l'utilisateur
function showMessage(message, color) {
    const msg = document.getElementById("message");
    msg.textContent = message;
    msg.style.color = color;
}