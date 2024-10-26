// routine.js

// Déclaration de routineData en dehors pour une portée globale
let routineData;

// Événement déclenché lorsque le contenu du DOM est entièrement chargé
document.addEventListener('DOMContentLoaded', function () {
    const routineGrid = document.getElementById('routineGrid');
    const resetButton = document.getElementById('resetButton');

    // Récupérer les données de routine à partir du localStorage
    let storedData = localStorage.getItem('routine');

    if (storedData) {
        // Si des données existent, les parser
        try {
            routineData = JSON.parse(storedData);
        } catch (e) {
            console.error('Erreur lors du parsing des données de routine :', e);
            // Si le parsing échoue, initialiser les données par défaut
            routineData = initializeDefaultRoutineData();
            localStorage.setItem('routine', JSON.stringify(routineData));
        }
    } else {
        // Aucune donnée dans le localStorage, initialiser les données par défaut
        routineData = initializeDefaultRoutineData();
        localStorage.setItem('routine', JSON.stringify(routineData));
    }

    // Afficher les cases pour chaque jour
    routineData.days.forEach((dayData, index) => {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('routine-day');
        dayDiv.style.setProperty('--delay', index); // Ajout pour l'animation

        // Ajouter un attribut data-day-index pour une identification unique
        dayDiv.setAttribute('data-day-index', index);

        // Ajouter le titre du jour
        const dayTitle = document.createElement('h2');
        dayTitle.textContent = `Jour ${dayData.day}`;
        dayDiv.appendChild(dayTitle);

        // Ajouter un élément pour afficher le pourcentage
        const percentageSpan = document.createElement('span');
        percentageSpan.classList.add('day-percentage');
        dayDiv.appendChild(percentageSpan);

        // Mettre à jour le pourcentage du jour
        updateDayPercentage(dayData, index);

        // Rendre chaque case cliquable pour ouvrir les missions
        dayDiv.addEventListener('click', function () {
            openFullScreen(dayDiv, index);
        });

        // Ajouter également un écouteur pour les appareils tactiles
        dayDiv.addEventListener('touchstart', function () {
            openFullScreen(dayDiv, index);
        });

        routineGrid.appendChild(dayDiv);
    });

    // Mise à jour du pourcentage global
    updateGlobalPercentage();

    // Ajout de l'écouteur pour le bouton de réinitialisation
    if (resetButton) {
        resetButton.addEventListener('click', function () {
            if (confirm('Voulez-vous vraiment réinitialiser toutes les tâches ?')) {
                resetAllTasks();
            }
        });
    }
});

// Fonction pour initialiser les données de routine par défaut
function initializeDefaultRoutineData() {
    let defaultData = { days: [] };
    for (let i = 1; i <= 21; i++) {
        defaultData.days.push({
            day: i,
            missions: [
                { name: "Mission 1", time: "08:00", status: "neutral" },
                { name: "Mission 2", time: "12:00", status: "neutral" },
                { name: "Mission 3", time: "18:00", status: "neutral" }
            ]
        });
    }
    return defaultData;
}

// Fonction pour afficher la case en plein écran avec les missions spécifiques du jour
function openFullScreen(dayDiv, dayIndex) {
    // Créer une nouvelle page en plein écran
    const fullScreenDiv = document.createElement('div');
    fullScreenDiv.classList.add('full-screen');

    // Empêcher le défilement de la page en arrière-plan
    document.body.style.overflow = 'hidden';

    // Récupérer les missions spécifiques pour le jour sélectionné
    const dayMissions = routineData.days[dayIndex].missions;
    if (!dayMissions || dayMissions.length === 0) {
        fullScreenDiv.innerHTML = `<h2>Jour ${routineData.days[dayIndex].day}</h2><p>Aucune mission pour ce jour.</p>`;
    } else {
        // Récupérer et afficher les missions
        let missionsHtml = dayMissions.map((mission, index) => {
            let missionClass = '';
            if (mission.status === 'completed') {
                missionClass = 'validated';
            } else if (mission.status === 'failed') {
                missionClass = 'failed';
            }
            return `
                <div class="mission-item ${missionClass}" data-index="${index}" data-day-index="${dayIndex}" style="--delay: ${index}">
                    <h3>${mission.name}</h3>
                    <p>Heure : ${mission.time}</p>
                </div>
            `;
        }).join('');

        fullScreenDiv.innerHTML = `
            <h2>Jour ${routineData.days[dayIndex].day}</h2>
            <div class="missions-container">${missionsHtml}</div>
        `;
    }

    document.body.appendChild(fullScreenDiv);

    // Gérer les interactions avec les missions pour ce jour spécifique
    fullScreenDiv.querySelectorAll('.mission-item').forEach(item => {
        // Détection du survol pour déterminer la partie validée ou échouée
        item.addEventListener('mousemove', function (e) {
            const midPoint = this.offsetWidth / 2;
            if (e.clientX < this.getBoundingClientRect().left + midPoint) {
                this.classList.add('hover-validated');
                this.classList.remove('hover-failed');
            } else {
                this.classList.add('hover-failed');
                this.classList.remove('hover-validated');
            }
        });

        // Détection des mouvements tactiles pour les appareils mobiles
        item.addEventListener('touchmove', function (e) {
            const touch = e.touches[0];
            const midPoint = this.offsetWidth / 2;
            if (touch.clientX < this.getBoundingClientRect().left + midPoint) {
                this.classList.add('hover-validated');
                this.classList.remove('hover-failed');
            } else {
                this.classList.add('hover-failed');
                this.classList.remove('hover-validated');
            }
        });

        // Réinitialiser les classes lors du retrait du curseur
        item.addEventListener('mouseleave', function () {
            this.classList.remove('hover-validated');
            this.classList.remove('hover-failed');
        });

        // Événement de clic pour changer le statut de la mission
        item.addEventListener('click', function () {
            const missionIndex = parseInt(this.getAttribute('data-index'), 10);
            const dayIdx = parseInt(this.getAttribute('data-day-index'), 10);
            const currentStatus = routineData.days[dayIdx].missions[missionIndex].status;

            // Si la souris est sur la partie gauche (valider)
            if (this.classList.contains('hover-validated')) {
                if (currentStatus === 'completed') {
                    // Remettre à neutre
                    routineData.days[dayIdx].missions[missionIndex].status = 'neutral';
                    this.classList.remove('validated');
                } else {
                    // Marquer comme complété
                    routineData.days[dayIdx].missions[missionIndex].status = 'completed';
                    this.classList.add('validated');
                    this.classList.remove('failed');
                }
            }
            // Si la souris est sur la partie droite (échouer)
            else if (this.classList.contains('hover-failed')) {
                if (currentStatus === 'failed') {
                    // Remettre à neutre
                    routineData.days[dayIdx].missions[missionIndex].status = 'neutral';
                    this.classList.remove('failed');
                } else {
                    // Marquer comme échoué
                    routineData.days[dayIdx].missions[missionIndex].status = 'failed';
                    this.classList.add('failed');
                    this.classList.remove('validated');
                }
            }

            // Sauvegarder les changements dans le localStorage
            localStorage.setItem('routine', JSON.stringify(routineData));

            // Mettre à jour le pourcentage du jour
            updateDayPercentage(routineData.days[dayIdx], dayIdx);

            // Mettre à jour le pourcentage global
            updateGlobalPercentage();
        });

        // Gestion des interactions tactiles pour les appareils mobiles
        item.addEventListener('touchend', function () {
            this.classList.remove('hover-validated');
            this.classList.remove('hover-failed');
        });
    });

    // Ajouter un événement pour fermer le plein écran en cliquant en dehors des missions
    fullScreenDiv.addEventListener('click', function (e) {
        if (e.target === fullScreenDiv) {
            document.body.removeChild(fullScreenDiv);
            // Rétablir le défilement de la page en arrière-plan
            document.body.style.overflow = '';
        }
    });
}

// Fonction pour calculer le pourcentage de progression d'un jour
function calculateDayProgress(missions) {
    const totalMissions = missions.length;
    const completedMissions = missions.filter(mission => mission.status === 'completed').length;

    // Calcul du pourcentage de tâches réussies pour le jour
    const dayProgress = (completedMissions / totalMissions) * 100;

    return parseFloat(dayProgress.toFixed(1)); // Un chiffre après la virgule
}

// Fonction pour mettre à jour le pourcentage d'un jour
function updateDayPercentage(dayData, dayIndex) {
    const dayDiv = document.querySelector(`.routine-day[data-day-index="${dayIndex}"]`);
    if (dayDiv) {
        const percentageSpan = dayDiv.querySelector('.day-percentage');

        const progress = calculateDayProgress(dayData.missions);

        percentageSpan.textContent = `${progress}%`;
    }
}

// Fonction pour mettre à jour le pourcentage global
function updateGlobalPercentage() {
    const successArray = []; // Tableau pour stocker les "1" (succès) et les "0" (échecs)

    routineData.days.forEach(day => {
        day.missions.forEach(mission => {
            if (mission.status === 'completed') {
                successArray.push(1);
            } else if (mission.status === 'failed') {
                successArray.push(0);
            }
            // Si le statut est "neutral", on ne l'inclut pas dans le calcul
        });
    });

    const globalProgressBarContainer = document.getElementById('globalProgressContainer');
    const globalProgressBar = globalProgressBarContainer.querySelector('.progress');
    const globalPercentageSpan = document.getElementById('globalPercentage');

    if (successArray.length === 0) {
        // Aucun progrès
        globalProgressBar.style.width = '0%';
        if (globalPercentageSpan) {
            globalPercentageSpan.textContent = '0.0%';
        }
    } else {
        let globalProgress;

        // Calculer le pourcentage de "1" par rapport au total des "1" et "0"
        const totalTasks = successArray.length;
        const totalSuccess = successArray.filter(val => val === 1).length;
        globalProgress = (totalSuccess / totalTasks) * 100;

        globalProgress = parseFloat(globalProgress.toFixed(1)); // Un chiffre après la virgule

        // Afficher la barre de progression globale
        globalProgressBar.style.width = `${globalProgress}%`;

        if (globalPercentageSpan) {
            globalPercentageSpan.textContent = `${globalProgress}%`;
        }
    }

    // La barre de progression globale reste toujours visible
    if (globalProgressBarContainer) {
        globalProgressBarContainer.style.display = 'block';
    }
}

// Fonction pour réinitialiser toutes les tâches à l'état "neutral"
function resetAllTasks() {
    // Parcourir toutes les tâches et les remettre à l'état "neutral"
    routineData.days.forEach(day => {
        day.missions.forEach(mission => {
            mission.status = 'neutral';
        });
    });

    // Sauvegarder les changements dans le localStorage
    localStorage.setItem('routine', JSON.stringify(routineData));

    // Mettre à jour les pourcentages pour chaque jour
    routineData.days.forEach((dayData, index) => {
        updateDayPercentage(dayData, index);
    });

    // Mettre à jour le pourcentage global
    updateGlobalPercentage();

    // Mettre à jour l'affichage des missions si la page des missions est ouverte
    const missionItems = document.querySelectorAll('.mission-item');
    missionItems.forEach(item => {
        item.classList.remove('validated', 'failed');
    });
}
