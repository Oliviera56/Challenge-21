document.addEventListener('DOMContentLoaded', function () {
    const routineForm = document.getElementById('routineForm');
    const missionsContainer = document.getElementById('missionsContainer');
    const openAddMissionModalBtn = document.getElementById('openAddMissionModalBtn');
    const missionModal = document.getElementById('missionModal');
    const closeModalSpan = missionModal.querySelector('.close');
    const missionForm = document.getElementById('missionForm');

    const routineNameDisplay = document.getElementById('routineNameDisplay');
    const editRoutineNameBtn = document.getElementById('editRoutineNameBtn');
    const routineNameEditContainer = document.getElementById('routineNameEditContainer');
    const routineNameInput = document.getElementById('routineNameInput');
    const saveRoutineNameBtn = document.getElementById('saveRoutineNameBtn');
    const routineNameError = document.getElementById('routineNameError');

    const missionNameInput = document.getElementById('missionName');
    const missionNameError = document.getElementById('missionNameError');
    const missionTimeInput = document.getElementById('missionTime');
    const missionTimeError = document.getElementById('missionTimeError');

    // Variables pour la modale de confirmation de suppression
    const confirmDeleteModal = document.getElementById('confirmDeleteModal');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const closeConfirmModalSpan = confirmDeleteModal.querySelector('.close-confirm-modal');
    let missionToDeleteIndex = null;

    // Bouton pour supprimer la routine
    const deleteRoutineBtn = document.getElementById('deleteRoutineBtn');

    let missions = [];
    let isEditing = false;
    let editingIndex = null;

    // Indicateur pour savoir si l'utilisateur a réorganisé les missions
    let userHasReordered = false;

    // Fonction pour trier les missions par heure (du plus tôt au plus tard)
    function sortMissionsByTime() {
        missions.sort((a, b) => {
            return a.time.localeCompare(b.time);
        });
    }

    // Fonction pour afficher les missions dans le container
    function displayMissions() {
        missionsContainer.innerHTML = '<h2>Missions</h2>';

        missions.forEach((mission, index) => {
            const missionDiv = document.createElement('div');
            missionDiv.classList.add('mission');
            missionDiv.innerHTML = `
                <span class="handle"><i class="fas fa-grip-vertical"></i></span>
                <span>${index + 1}. ${mission.name} - ${mission.time}</span>
                <div class="mission-buttons">
                    <button type="button" class="editMissionBtn" data-index="${index}">
                        <i class="fas fa-edit"></i> Modifier
                    </button>
                    <button type="button" class="deleteMissionBtn" data-index="${index}">
                        <i class="fas fa-trash-alt"></i> Supprimer
                    </button>
                </div>
            `;
            missionsContainer.appendChild(missionDiv);
        });

        initializeSortable();
    }

    // Fonction pour ouvrir la modal
    function openModal(edit = false, index = null) {
        missionModal.style.display = 'block';
        if (edit && index !== null) {
            isEditing = true;
            editingIndex = index;
            missionNameInput.value = missions[index].name;
            missionTimeInput.value = missions[index].time;
            document.getElementById('modalTitle').textContent = 'Modifier une Mission';
        } else {
            isEditing = false;
            editingIndex = null;
            missionForm.reset();
            clearErrors();
            document.getElementById('modalTitle').textContent = 'Ajouter une Mission';
        }
    }

    // Fonction pour fermer la modal
    function closeModal() {
        missionModal.style.display = 'none';
        isEditing = false;
        editingIndex = null;
        missionForm.reset();
        clearErrors();
    }

    // Fonction pour ouvrir la modale de confirmation de suppression
    function openConfirmDeleteModal(index) {
        missionToDeleteIndex = index;
        confirmDeleteModal.style.display = 'block';
    }

    // Fonction pour fermer la modale de confirmation de suppression
    function closeConfirmDeleteModal() {
        confirmDeleteModal.style.display = 'none';
        missionToDeleteIndex = null;
    }

    // Fonction pour effacer les messages d'erreur
    function clearErrors() {
        routineNameError.style.display = 'none';
        missionNameError.style.display = 'none';
        missionTimeError.style.display = 'none';
    }

    // Gestionnaire d'ouverture de la modal
    openAddMissionModalBtn.addEventListener('click', () => {
        openModal();
    });

    // Gestionnaire de fermeture de la modal
    closeModalSpan.addEventListener('click', closeModal);

    // Gestionnaire de clic en dehors de la modal pour fermer
    window.addEventListener('click', function (event) {
        if (event.target == missionModal) {
            closeModal();
        }
        if (event.target == confirmDeleteModal) {
            closeConfirmDeleteModal();
        }
    });

    // Gestionnaire de fermeture de la modale de confirmation
    closeConfirmModalSpan.addEventListener('click', closeConfirmDeleteModal);

    // Gestionnaire pour le bouton "Annuler" de la modale de confirmation
    cancelDeleteBtn.addEventListener('click', closeConfirmDeleteModal);

    // Gestionnaire pour le bouton "Supprimer" de la modale de confirmation
    confirmDeleteBtn.addEventListener('click', function () {
        if (missionToDeleteIndex !== null) {
            missions.splice(missionToDeleteIndex, 1);
            autoSaveMissions();
            displayMissions();
            closeConfirmDeleteModal();
            saveRoutine(); // Sauvegarder la routine après suppression
        }
    });

    // Gestionnaire pour modifier le nom de la routine
    editRoutineNameBtn.addEventListener('click', function () {
        routineNameDisplay.style.display = 'none';
        editRoutineNameBtn.style.display = 'none';
        routineNameEditContainer.style.display = 'flex';
        routineNameInput.value = routineNameDisplay.textContent;
    });

    // Gestionnaire pour enregistrer le nouveau nom de la routine
    saveRoutineNameBtn.addEventListener('click', function () {
        const newName = routineNameInput.value.trim();
        if (newName === '') {
            routineNameError.textContent = 'Le nom de la routine est requis.';
            routineNameError.style.display = 'block';
            return;
        } else {
            routineNameError.style.display = 'none';
        }

        routineNameDisplay.textContent = newName;
        routineNameDisplay.style.display = 'block';
        editRoutineNameBtn.style.display = 'block';
        routineNameEditContainer.style.display = 'none';

        saveRoutine(); // Sauvegarder la routine avec le nouveau nom
    });

    // Fonction de sauvegarde automatique des missions
    function autoSaveMissions() {
        localStorage.setItem('missions', JSON.stringify(missions));
        localStorage.setItem('userHasReordered', JSON.stringify(userHasReordered));
    }

    // Fonction pour sauvegarder la routine
    function saveRoutine() {
        const routineName = routineNameDisplay.textContent.trim();

        if (routineName === '') {
            routineNameError.textContent = 'Le nom de la routine est requis.';
            routineNameError.style.display = 'block';
            return;
        } else {
            routineNameError.style.display = 'none';
        }

        // Construire l'objet routineData
        const routineData = { name: routineName, days: [] };
        for (let i = 1; i <= 21; i++) {
            routineData.days.push({ day: i, missions: [...missions] });
        }

        localStorage.setItem('routine', JSON.stringify(routineData));
        localStorage.setItem('routineName', routineName);
    }

    // Sauvegarde automatique à intervalles réguliers (toutes les 30 secondes)
    setInterval(() => {
        autoSaveMissions();
        saveRoutine();
    }, 30000);

    // Gestionnaire d'ajout ou de modification de mission
    missionForm.addEventListener('submit', function (event) {
        event.preventDefault();
        clearErrors();

        const missionName = missionNameInput.value.trim();
        const missionTime = missionTimeInput.value;

        let valid = true;

        if (missionName === '') {
            missionNameError.textContent = 'Le nom de la mission est requis.';
            missionNameError.style.display = 'block';
            valid = false;
        }

        if (missionTime === '') {
            missionTimeError.textContent = 'L\'heure de la mission est requise.';
            missionTimeError.style.display = 'block';
            valid = false;
        }

        if (!valid) return;

        if (isEditing && editingIndex !== null) {
            missions[editingIndex] = { name: missionName, time: missionTime };
            if (!userHasReordered) {
                sortMissionsByTime();
            }
        } else {
            missions.push({ name: missionName, time: missionTime });
            if (!userHasReordered) {
                sortMissionsByTime();
            }
        }

        autoSaveMissions();
        displayMissions();
        closeModal();
        saveRoutine(); // Sauvegarder la routine après ajout ou modification
    });

    // Gestion des clics sur les boutons Edit et Delete des missions
    missionsContainer.addEventListener('click', function (event) {
        if (event.target.closest('.editMissionBtn')) {
            const index = event.target.closest('.editMissionBtn').getAttribute('data-index');
            openModal(true, index);
        }

        if (event.target.closest('.deleteMissionBtn')) {
            const index = event.target.closest('.deleteMissionBtn').getAttribute('data-index');
            openConfirmDeleteModal(index);
        }
    });

    // Fonction pour initialiser SortableJS
    function initializeSortable() {
        if (missionsContainer.sortable) {
            missionsContainer.sortable.destroy();
        }

        new Sortable(missionsContainer, {
            animation: 150,
            handle: '.handle',
            ghostClass: 'dragging',
            onEnd: function (evt) {
                userHasReordered = true; // L'utilisateur a réorganisé les missions
                const newMissions = [];
                const missionElements = missionsContainer.querySelectorAll('.mission');

                missionElements.forEach(missionEl => {
                    const index = parseInt(missionEl.querySelector('.editMissionBtn').getAttribute('data-index'));
                    newMissions.push(missions[index]);
                });

                missions = newMissions;
                autoSaveMissions();
                displayMissions();
                saveRoutine(); // Sauvegarder la routine après réorganisation
            }
        });
    }

    // Charger les missions depuis localStorage
    function loadMissions() {
        const storedMissions = JSON.parse(localStorage.getItem('missions')) || [];
        missions = storedMissions;

        // Charger l'indicateur de réorganisation depuis le localStorage
        const storedUserHasReordered = JSON.parse(localStorage.getItem('userHasReordered'));
        userHasReordered = storedUserHasReordered || false;

        // Charger le nom de la routine depuis le localStorage
        const storedRoutineName = localStorage.getItem('routineName') || 'Nom de la routine';
        routineNameDisplay.textContent = storedRoutineName;

        // Si l'utilisateur n'a pas réorganisé, trier par heure
        if (!userHasReordered) {
            sortMissionsByTime();
        }

        displayMissions();
    }

    loadMissions();

    // Gestionnaire pour le bouton "Supprimer la routine"
    deleteRoutineBtn.addEventListener('click', function () {
        if (confirm('Voulez-vous vraiment supprimer cette routine ?')) {
            localStorage.removeItem('routine');
            localStorage.removeItem('missions');
            localStorage.removeItem('userHasReordered');
            localStorage.removeItem('routineName');
            missions = [];
            userHasReordered = false;
            routineNameDisplay.textContent = 'Nom de la routine';
            displayMissions();
            alert('Routine supprimée avec succès.');
        }
    });
});
