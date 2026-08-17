// bilan.js - Demande de Bilan Biologique
// Le bouton "Générer et Imprimer" remplit la zone d'impression et déclenche window.print()

(function () {
    'use strict';

    var BILANS = [];

    var selectedExams = [];
    var activeIndex = -1;

    function loadBilanListe() {
        var url;
        try { url = chrome.runtime.getURL('bilan/bilan_liste.json'); } catch(e) {}
        if (!url) url = 'bilan_liste.json';
        fetch(url).then(function(r) { return r.json(); }).then(function(data) {
            BILANS = data;
        }).catch(function() {});
    }

    document.addEventListener('DOMContentLoaded', function () {
        loadBilanListe();
        loadPatientInfo();
        restoreSavedState();
        renderTags();
        initFormatButtons();

        var bilanInput = document.getElementById('bilanInput');
        bilanInput.addEventListener('input', onInput);
        bilanInput.addEventListener('keydown', onKeydown);
        bilanInput.addEventListener('focus', onInput);
        document.addEventListener('click', function (e) {
            if (!e.target.closest('.input-wrapper')) document.getElementById('autocompleteList').style.display = 'none';
        });

        document.getElementById('btnGenererDemande').addEventListener('click', imprimerDemande);
        loadBilanTypes();

        // Fermer le menu si on clique ailleurs
        document.addEventListener('click', function (e) {
            if (!e.target.closest('.bilan-type-dropdown')) {
                document.getElementById('bilanTypeMenu').classList.remove('open');
            }
        });

        // Modal enregistrer bilan type
        document.getElementById('btnEnregistrerType').addEventListener('click', openSaveTypeModal);
        document.getElementById('modalTypeCancel').addEventListener('click', closeSaveTypeModal);
        document.getElementById('modalTypeConfirm').addEventListener('click', confirmSaveType);
        document.getElementById('modalTypeOverlay').addEventListener('click', function(e) {
            if (e.target === e.currentTarget) closeSaveTypeModal();
        });
        document.getElementById('inputTypeNom').addEventListener('keydown', function(e) {
            if (e.key === 'Enter') { e.preventDefault(); confirmSaveType(); }
            if (e.key === 'Escape') closeSaveTypeModal();
        });

        // Après fermeture de la page : tout réinitialiser
        window.addEventListener('beforeunload', resetForm);
    });

    // ── Format buttons ──
    function initFormatButtons() {
        var btnAvec = document.getElementById('formatAvecEntete');
        var btnSans = document.getElementById('formatSansEntete');
        var saved = localStorage.getItem('certificatFormat') || 'avecEntete';
        updateFormatUI(saved);
        if (btnAvec) btnAvec.addEventListener('click', function () { localStorage.setItem('certificatFormat', 'avecEntete'); updateFormatUI('avecEntete'); });
        if (btnSans) btnSans.addEventListener('click', function () { localStorage.setItem('certificatFormat', 'sansEntete'); updateFormatUI('sansEntete'); });
    }

    function updateFormatUI(format) {
        var btnAvec = document.getElementById('formatAvecEntete');
        var btnSans = document.getElementById('formatSansEntete');
        if (format === 'avecEntete') {
            if (btnAvec) { btnAvec.classList.add('active'); btnAvec.style.borderColor = '#1976d2'; btnAvec.style.background = '#e3f2fd'; }
            if (btnSans) { btnSans.classList.remove('active'); btnSans.style.borderColor = '#ccc'; btnSans.style.background = '#fff'; }
        } else {
            if (btnSans) { btnSans.classList.add('active'); btnSans.style.borderColor = '#1976d2'; btnSans.style.background = '#e3f2fd'; }
            if (btnAvec) { btnAvec.classList.remove('active'); btnAvec.style.borderColor = '#ccc'; btnAvec.style.background = '#fff'; }
        }
    }

    // ── Autocomplete ──
    function normalizeText(s) {
        return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
    }

    function onInput() {
        var bilanInput = document.getElementById('bilanInput');
        var autocompleteList = document.getElementById('autocompleteList');
        var val = bilanInput.value.trim();
        var norm = normalizeText(val);
        if (norm.length === 0) { showSuggestions(BILANS.slice(0, 20)); return; }
        var results = BILANS.filter(function (b) {
            return normalizeText(b.name).indexOf(norm) !== -1 || normalizeText(b.cat).indexOf(norm) !== -1;
        }).slice(0, 15);
        showSuggestions(results);
    }

    function showSuggestions(results) {
        activeIndex = -1;
        var bilanInput = document.getElementById('bilanInput');
        var autocompleteList = document.getElementById('autocompleteList');
        var html = '';
        results.forEach(function (item, i) {
            html += '<div class="autocomplete-item" data-index="' + i + '" data-name="' + escapeAttr(item.name) + '">'
                + escapeHTML(item.name) + '<span class="category">' + escapeHTML(item.cat) + '</span></div>';
        });
        if (bilanInput.value.trim().length > 0 && selectedExams.indexOf(bilanInput.value.trim()) === -1) {
            html += '<div class="custom-hint">+ Ajouter "' + escapeHTML(bilanInput.value.trim()) + '" comme examen personnalisé</div>';
        }
        autocompleteList.innerHTML = html;
        autocompleteList.style.display = html ? 'block' : 'none';
        autocompleteList.querySelectorAll('.autocomplete-item').forEach(function (el) {
            el.addEventListener('click', function () { addExam(el.getAttribute('data-name')); });
        });
        var custom = autocompleteList.querySelector('.custom-hint');
        if (custom) custom.addEventListener('click', function () { addExam(bilanInput.value.trim()); });
    }

    function onKeydown(e) {
        var bilanInput = document.getElementById('bilanInput');
        var autocompleteList = document.getElementById('autocompleteList');
        var items = autocompleteList.querySelectorAll('.autocomplete-item');
        if (!items.length) {
            if (e.key === 'Enter') { e.preventDefault(); var val = bilanInput.value.trim(); if (val) addExam(val); }
            return;
        }
        if (e.key === 'ArrowDown') { e.preventDefault(); activeIndex = Math.min(activeIndex + 1, items.length - 1); highlightItem(items); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); activeIndex = Math.max(activeIndex - 1, 0); highlightItem(items); }
        else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeIndex >= 0 && items[activeIndex]) addExam(items[activeIndex].getAttribute('data-name'));
            else { var val = bilanInput.value.trim(); if (val) addExam(val); }
        }
        else if (e.key === 'Escape') { autocompleteList.style.display = 'none'; }
    }

    function highlightItem(items) {
        items.forEach(function (el, i) { el.classList.toggle('active', i === activeIndex); });
        if (items[activeIndex]) items[activeIndex].scrollIntoView({ block: 'nearest' });
    }

    function addExam(name) {
        name = (name || '').trim();
        if (!name) return;
        if (selectedExams.indexOf(name) !== -1) {
            document.getElementById('bilanInput').value = '';
            document.getElementById('autocompleteList').style.display = 'none';
            return;
        }
        selectedExams.push(name);
        document.getElementById('bilanInput').value = '';
        document.getElementById('autocompleteList').style.display = 'none';
        renderTags();
    }

    function removeExam(index) { selectedExams.splice(index, 1); renderTags(); }

    function renderTags() {
        var tagsArea = document.getElementById('tagsArea');
        var html = '';
        selectedExams.forEach(function (name, i) {
            html += '<span class="tag">' + escapeHTML(name) + ' <span class="remove" data-index="' + i + '">&times;</span></span>';
        });
        tagsArea.innerHTML = html;
        tagsArea.querySelectorAll('.remove').forEach(function (btn) {
            btn.addEventListener('click', function () { removeExam(parseInt(btn.getAttribute('data-index'), 10)); });
        });
    }

    // ── Bilan Type ──
    var allBilanTypes = [];

    function loadBilanTypes() {
        var custom = [];
        try {
            var raw = localStorage.getItem('bilanTypesCustom');
            if (raw) custom = JSON.parse(raw);
        } catch(e) {}
        var deleted = [];
        try {
            var rawDel = localStorage.getItem('bilanTypesDeleted');
            if (rawDel) deleted = JSON.parse(rawDel);
        } catch(e) {}

        var url;
        try { url = chrome.runtime.getURL('bilan/bilan_types.json'); } catch(e) {}
        if (!url) url = 'bilan_types.json';
        fetch(url).then(function(r) { return r.json(); }).then(function(data) {
                allBilanTypes = [];
                data.forEach(function(t) {
                    if (deleted.indexOf(t.label) === -1) allBilanTypes.push({ label: t.label, exams: t.exams, source: 'json' });
                });
                custom.forEach(function(t) { allBilanTypes.push({ label: t.label, exams: t.exams, source: 'custom' }); });
                populateBilanTypeMenu();
            }).catch(function() {
                allBilanTypes = [];
                custom.forEach(function(t) { allBilanTypes.push({ label: t.label, exams: t.exams, source: 'custom' }); });
                populateBilanTypeMenu();
            });
    }

    function populateBilanTypeMenu() {
        var menu = document.getElementById('bilanTypeMenu');
        var btn = document.getElementById('btnBilanType');
        allBilanTypes.sort(function(a, b) { return a.label.localeCompare(b.label, 'fr'); });
        menu.innerHTML = '';
        allBilanTypes.forEach(function(t, idx) {
            var div = document.createElement('div');
            div.className = 'bilan-type-item';
            var actions = '<span class="bt-actions">' +
                '<i class="fas fa-pen bt-icon bt-edit" data-idx="' + idx + '" title="Modifier"></i>' +
                '<i class="fas fa-trash bt-icon bt-delete" data-idx="' + idx + '" title="Supprimer"></i>' +
                '</span>';
            div.innerHTML = actions + '<strong>' + escapeHTML(t.label) + '</strong><div class="bt-exams">' + t.exams.map(escapeHTML).join(', ') + '</div>';
            div.addEventListener('click', function(e) {
                if (e.target.closest('.bt-icon')) return;
                t.exams.forEach(function(exam) {
                    if (selectedExams.indexOf(exam) === -1) selectedExams.push(exam);
                });
                renderTags();
                menu.classList.remove('open');
            });
            menu.appendChild(div);
        });
        menu.querySelectorAll('.bt-delete').forEach(function(icon) {
            icon.addEventListener('click', function(e) {
                e.stopPropagation();
                var i = parseInt(icon.getAttribute('data-idx'), 10);
                deleteBilanType(i);
            });
        });
        menu.querySelectorAll('.bt-edit').forEach(function(icon) {
            icon.addEventListener('click', function(e) {
                e.stopPropagation();
                var i = parseInt(icon.getAttribute('data-idx'), 10);
                openEditTypeModal(i);
            });
        });
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            menu.classList.toggle('open');
        });
    }

    function deleteBilanType(idx) {
        var t = allBilanTypes[idx];
        if (!confirm('Supprimer le bilan type « ' + t.label + ' » ?')) return;
        if (t.source === 'custom') {
            var custom = [];
            try { custom = JSON.parse(localStorage.getItem('bilanTypesCustom') || '[]'); } catch(e) {}
            var found = -1;
            custom.forEach(function(c, i) { if (c.label === t.label) found = i; });
            if (found !== -1) custom.splice(found, 1);
            localStorage.setItem('bilanTypesCustom', JSON.stringify(custom));
        } else {
            // Type du JSON : marquer comme supprimé
            var deleted = [];
            try { deleted = JSON.parse(localStorage.getItem('bilanTypesDeleted') || '[]'); } catch(e) {}
            if (deleted.indexOf(t.label) === -1) deleted.push(t.label);
            localStorage.setItem('bilanTypesDeleted', JSON.stringify(deleted));
        }
        allBilanTypes.splice(idx, 1);
        populateBilanTypeMenu();
    }

    function openEditTypeModal(idx) {
        var t = allBilanTypes[idx];
        selectedExams = t.exams.slice();
        renderTags();
        document.getElementById('inputTypeNom').value = t.label;
        document.getElementById('modalExamsList').value = t.exams.join(', ');
        document.getElementById('modalTypeOverlay').classList.add('open');
        document.getElementById('modalTypeOverlay').setAttribute('data-edit-idx', idx);
        document.getElementById('inputTypeNom').focus();
    }

    function openSaveTypeModal() {
        if (selectedExams.length === 0) {
            alert('Ajoutez des examens avant d\'enregistrer un bilan type.');
            return;
        }
        document.getElementById('inputTypeNom').value = '';
        document.getElementById('modalExamsList').value = selectedExams.join(', ');
        document.getElementById('modalTypeOverlay').classList.add('open');
        document.getElementById('modalTypeOverlay').removeAttribute('data-edit-idx');
        document.getElementById('inputTypeNom').focus();
    }

    function closeSaveTypeModal() {
        document.getElementById('modalTypeOverlay').classList.remove('open');
        document.getElementById('modalTypeOverlay').removeAttribute('data-edit-idx');
    }

    function confirmSaveType() {
        var nom = document.getElementById('inputTypeNom').value.trim();
        if (!nom) { document.getElementById('inputTypeNom').focus(); return; }
        var examsRaw = document.getElementById('modalExamsList').value.trim();
        var exams = examsRaw.split(',').map(function(s) { return s.trim(); }).filter(function(s) { return s.length > 0; });
        if (exams.length === 0) { alert('Ajoutez au moins un examen.'); return; }
        var overlay = document.getElementById('modalTypeOverlay');
        var editIdx = overlay.getAttribute('data-edit-idx');

        if (editIdx !== null && editIdx !== undefined && editIdx !== '') {
            // Mode édition
            var i = parseInt(editIdx, 10);
            var old = allBilanTypes[i];
            allBilanTypes[i] = { label: nom, exams: exams, source: old.source === 'json' ? 'json' : 'custom' };
            // Mettre à jour localStorage
            var custom = [];
            try { custom = JSON.parse(localStorage.getItem('bilanTypesCustom') || '[]'); } catch(e) {}
            if (old.source === 'json') {
                custom.push({ label: nom, exams: exams });
            } else {
                var found = -1;
                custom.forEach(function(c, ci) { if (c.label === old.label) found = ci; });
                if (found !== -1) custom[found] = { label: nom, exams: exams };
                else custom.push({ label: nom, exams: exams });
            }
            localStorage.setItem('bilanTypesCustom', JSON.stringify(custom));
        } else {
            // Mode création
            var custom2 = [];
            try { custom2 = JSON.parse(localStorage.getItem('bilanTypesCustom') || '[]'); } catch(e) {}
            custom2.push({ label: nom, exams: exams });
            localStorage.setItem('bilanTypesCustom', JSON.stringify(custom2));
            allBilanTypes.push({ label: nom, exams: exams, source: 'custom' });
        }
        populateBilanTypeMenu();
        closeSaveTypeModal();
    }

    function restoreSavedState() {
        try {
            var raw = localStorage.getItem('demandeBilan');
            if (!raw) return;
            var data = JSON.parse(raw);
            if (Array.isArray(data.exams)) selectedExams = data.exams;
            if (data.notes) document.getElementById('notesBilan').value = data.notes;
        } catch (e) { }
    }

    // ── Infos patient / polyclinique ──
    function loadPatientInfo() {
        var nom = localStorage.getItem('nom') || '';
        var prenom = localStorage.getItem('prenom') || '';
        var age = localStorage.getItem('age') || '';
        var dateNaissance = localStorage.getItem('dateNaissance') || '';
        var numero = localStorage.getItem('numero') || '';
        var poids = localStorage.getItem('poids') || localStorage.getItem('poidsInput') || '';
        var polyclinique = localStorage.getItem('polyclinique') || '';
        var docteur = localStorage.getItem('docteur') || '';
        var polyEl = document.getElementById('polyDisplay');
        if (polyEl) polyEl.textContent = polyclinique + (docteur ? '\nDr ' + docteur : '');
        var patientEl = document.getElementById('patientDisplay');
        if (patientEl) {
            var html = '';
            html += '<span><strong>Nom :</strong> <span class="info-editable" data-key="nom">' + escapeHTML(nom) + ' ' + escapeHTML(prenom) + '</span></span>';
            html += '<span><strong>Né(e) le :</strong> <span class="info-editable" data-key="dateNaissance">' + escapeHTML(dateNaissance) + '</span></span>';
            html += '<span><strong>Âge :</strong> <span class="info-editable" data-key="age">' + escapeHTML(age) + '</span></span>';
            html += '<span><strong>N° :</strong> <span class="info-editable" data-key="numero">' + escapeHTML(numero) + '</span></span>';
            html += '<span><strong>Poids :</strong> <span class="info-editable" data-key="poids">' + escapeHTML(poids) + ' kg</span></span>';
            html += '<span><strong>Date :</strong> <span class="info-editable" data-key="dateImprime">' + formatCurrentDate() + '</span></span>';
            patientEl.innerHTML = html;
            patientEl.querySelectorAll('.info-editable').forEach(function(el) {
                el.setAttribute('contenteditable', 'true');
                el.addEventListener('blur', function() { savePatientField(el); });
                el.addEventListener('focus', function() {
                    var range = document.createRange();
                    range.selectNodeContents(el);
                    var sel = window.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(range);
                });
            });
        }
    }

    function savePatientField(el) {
        var key = el.getAttribute('data-key');
        var val = el.textContent.trim();
        if (key === 'nom') {
            var parts = val.split(' ');
            var prenom = parts.pop();
            var nom = parts.join(' ');
            localStorage.setItem('nom', nom);
            localStorage.setItem('prenom', prenom);
        } else if (key === 'dateNaissance') {
            localStorage.setItem('dateNaissance', val);
        } else if (key === 'age') {
            localStorage.setItem('age', val);
        } else if (key === 'numero') {
            localStorage.setItem('numero', val);
        } else if (key === 'poids') {
            localStorage.setItem('poids', val.replace(/\s*kg\s*$/, '').trim());
        } else if (key === 'dateImprime') {
            localStorage.setItem('dateImprime', val);
        }
    }

    // ── Helpers ──
    function escapeHTML(str) { return str ? str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') : ''; }
    function escapeAttr(str) { return escapeHTML(str).replace(/'/g, '&#39;'); }
    function formatCurrentDate() {
        var d = new Date();
        return [String(d.getDate()).padStart(2, '0'), String(d.getMonth() + 1).padStart(2, '0'), d.getFullYear()].join('/');
    }

    // ── En-tête officiel (même code que certificat.js) ──
    function generateHeaderHTML() {
        var polyclinique = localStorage.getItem('polyclinique') || '';
        var polycliniqueAr = localStorage.getItem('polyclinique-ar') || '';
        return '<div id="head" style="border: 1px solid #000; padding: 10px; margin-bottom: 20px;">'
            + '<table style="width: 100%;"><tbody>'
            + '<tr><td colspan="4"><div style="text-align:center;font-size:12px;">REPUBLIQUE ALGERIENNE DEMOCRATIQUE ET POPULAIRE</div></td></tr>'
            + '<tr><td colspan="4"><div style="text-align:center;font-size:12px;">MINISTERE DE LA SANTE</div></td></tr>'
            + '<tr>'
            + '<td colspan="2"><div style="width:100%;font-size:12px;white-space:pre-wrap;">' + escapeHTML(polyclinique) + '</div></td>'
            + '<td colspan="2" style="text-align:right;"><div style="text-align:right;width:100%;font-size:12px;white-space:pre-wrap;" class="arabic-text">' + escapeHTML(polycliniqueAr) + '</div></td>'
            + '</tr></tbody></table></div>';
    }

    // ── Imprimer : remplir printZone puis window.print() ──
    function imprimerDemande() {
        var notes = document.getElementById('notesBilan').value.trim();
        if (!selectedExams.length && !notes) { alert('Veuillez ajouter au moins un examen ou un motif.'); return; }

        var fontSize = document.getElementById('fontSize').value || '14';
        var patient = {
            nom: localStorage.getItem('nom') || '',
            prenom: localStorage.getItem('prenom') || '',
            age: localStorage.getItem('age') || '',
            dateNaissance: localStorage.getItem('dateNaissance') || '',
            numero: localStorage.getItem('numero') || '',
            poids: localStorage.getItem('poids') || localStorage.getItem('poidsInput') || ''
        };
        var docteur = localStorage.getItem('docteur') || '';
        var avecEntete = localStorage.getItem('certificatFormat') === 'avecEntete';

        var enteteHTML = avecEntete ? generateHeaderHTML() : '<div style="height: 200px;"></div>';

        var nbCols = selectedExams.length > 20 ? 3 : selectedExams.length > 10 ? 2 : 1;
        var examsHTML = '';
        selectedExams.forEach(function (e) {
            examsHTML += '<div style="padding:3px 0;border-bottom:1px solid #eee;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">☐ ' + escapeHTML(e) + '</div>';
        });

        var motifHTML = notes
            ? '<textarea id="motifObservations" style="width:90%;min-height:80px;padding:10px;border:1px solid #ddd;border-radius:4px;font-size:' + fontSize + 'px;">' + escapeHTML(notes) + '</textarea>'
            : '<textarea id="motifObservations" style="width:90%;min-height:80px;padding:10px;border:1px solid #ddd;border-radius:4px;font-size:' + fontSize + 'px;" placeholder="Motif / Observations..."></textarea>';

        var infosPatient = ''
            + '<div class="info nom"><strong>Nom :</strong> ' + escapeHTML(patient.nom) + '</div>'
            + '<div class="info prenom"><strong>Prénom :</strong> ' + escapeHTML(patient.prenom) + '</div>'
            + '<div class="info date-naissance"><strong>Date de naissance :</strong> ' + escapeHTML(patient.dateNaissance) + (patient.age ? ' (' + escapeHTML(patient.age) + ')' : '') + '</div>'
            + '<div class="info today"><strong>La date :</strong> ' + (localStorage.getItem('dateImprime') || formatCurrentDate()) + '</div>'
            + '<div class="info numero"><strong>Numéro :</strong> ' + escapeHTML(patient.numero) + '</div>'
            + (patient.poids ? '<div class="info poids"><strong>Poids :</strong> ' + escapeHTML(patient.poids) + '</div>' : '')
            + '<div class="info barcode"><svg id="barcode" data-numero="' + escapeHTML(patient.numero || '0') + '"></svg></div>';

        document.getElementById('printZone').innerHTML = enteteHTML
            + '<div class="certificat">'
            + infosPatient
            + '<div class="demande-content" style="padding:5px;">'
            + '<h1 style="text-align:center;color:#333;text-decoration:underline;font-size:' + fontSize + 'px;margin-top:80px;">Demande de Bilan Biologique</h1>'
            + '<p style="font-size:' + fontSize + 'px;font-weight:bold;color:#333;">Veuillez effectuer les examens suivants :</p>'
            + '<div id="examsList" style="column-count:' + nbCols + ';column-gap:20px;font-size:' + fontSize + 'px;">' + examsHTML + '</div>'
            + '<div style="margin-top:20px;"><p style="font-size:' + fontSize + 'px;font-weight:bold;color:#333;">Motif / Observations :</p>' + motifHTML + '</div>'
            + '<p style="text-align:right;margin-top:30px;margin-right:60px;font-size:' + fontSize + 'px;"><strong>Signature :</strong><br><br>' + (docteur ? '<span style="font-size:' + fontSize + 'px;">Dr ' + escapeHTML(docteur) + '</span>' : '') + '</p>'
            + '</div></div>';

        // Barcode
        try {
            var svg = document.querySelector('#printZone #barcode');
            if (svg && typeof JsBarcode !== 'undefined') {
                JsBarcode(svg, svg.getAttribute('data-numero'), { format: 'CODE128', displayValue: true, height: 30, fontSize: 12 });
            }
        } catch (e) { }

        window.print();
    }

    // ── Réinitialiser après impression ──
    function resetForm() {
        selectedExams = [];
        renderTags();
        document.getElementById('notesBilan').value = '';
        document.getElementById('bilanInput').value = '';
        document.getElementById('fontSize').value = '14';
        document.getElementById('printZone').innerHTML = '';
        localStorage.removeItem('demandeBilan');
    }

})();
