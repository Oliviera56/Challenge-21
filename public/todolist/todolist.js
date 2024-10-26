document.addEventListener('DOMContentLoaded', function () {
    const tasksUl = document.getElementById('tasks');
    const taskInput = document.getElementById('newTask');
    const addTaskButton = document.getElementById('addTask');
    const progressBar = document.getElementById('progressBar');

    console.log("Page chargée, démarrage du script.");

    // Charger l'état des tâches depuis le Local Storage
    function loadTaskStatus() {
        const loadedTasks = JSON.parse(localStorage.getItem('taskStatus'));
        if (!Array.isArray(loadedTasks)) {
            console.warn("Données corrompues dans le localStorage, réinitialisation.");
            return [];
        }
        return loadedTasks;
    }

    // Sauvegarder l'état des tâches dans le Local Storage
    function saveTaskStatus(tasks) {
        localStorage.setItem('taskStatus', JSON.stringify(tasks));
    }

    // Initialiser les tâches depuis le Local Storage
    let taskStatus = loadTaskStatus();

    // Fonction pour créer un élément de tâche
    function createTaskElement(task, index) {
        const taskLi = document.createElement('li');
        taskLi.classList.add('task-item');

        // Bouton Valider (la tâche elle-même)
        const leftDiv = document.createElement('div');
        leftDiv.classList.add('task-left');

        // Texte cliquable pour modifier la tâche
        const taskText = document.createElement('span');
        taskText.textContent = task.text;
        taskText.classList.add('editable-task-text'); // Classe pour le CSS d'animation du texte

        // Zone de modification du texte
        taskText.addEventListener('click', function (e) {
            e.stopPropagation(); // Empêche la propagation pour ne pas activer la validation de la tâche

            // Création du champ de texte pour la modification
            const inputEdit = document.createElement('input');
            inputEdit.type = 'text';
            inputEdit.classList.add('task-edit-input'); // Classe pour gérer l'animation
            inputEdit.value = task.text;

            // Centrer l'input et ajuster sa taille
            inputEdit.style.width = `${taskText.offsetWidth}px`;

            // Remplacer le texte par le champ de texte
            leftDiv.replaceChild(inputEdit, taskText);

            // Focus automatique sur le champ de texte
            inputEdit.focus();

            // Ajuster dynamiquement la taille de l'input
            inputEdit.addEventListener('input', function () {
                const tempSpan = document.createElement('span');
                tempSpan.style.visibility = 'hidden';
                tempSpan.style.position = 'absolute';
                tempSpan.style.fontSize = '16px';
                tempSpan.style.fontFamily = 'Inter, sans-serif';
                tempSpan.textContent = inputEdit.value || inputEdit.placeholder;

                document.body.appendChild(tempSpan);

                // Ajuster la largeur selon la taille du texte
                inputEdit.style.width = `${tempSpan.offsetWidth + 20}px`;

                document.body.removeChild(tempSpan);
            });

            // Valider la modification au clic sur Entrée ou à la perte du focus
            inputEdit.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') {
                    finishEdit();
                }
            });

            inputEdit.addEventListener('blur', function () {
                finishEdit();
            });

            function finishEdit() {
                task.text = inputEdit.value.trim();
                taskText.textContent = task.text;
                leftDiv.replaceChild(taskText, inputEdit);
                saveTaskStatus(taskStatus);
            }
        });

        leftDiv.appendChild(taskText);

        // Bouton Supprimer
        const rightDiv = document.createElement('div');
        rightDiv.classList.add('task-right');
        rightDiv.innerHTML = '<i class="fas fa-trash"></i>'; // Icône poubelle

        // Ajout d'écouteur d'événements pour valider ou supprimer les tâches
        leftDiv.addEventListener('click', function () {
            task.completed = !task.completed;
            saveTaskStatus(taskStatus);
            taskLi.classList.toggle('completed', task.completed);
            updateProgressBar();
        });

        rightDiv.addEventListener('click', function () {
            // Suppression de la tâche
            taskStatus.splice(index, 1);
            saveTaskStatus(taskStatus); // Mettre à jour le localStorage après la suppression
            taskLi.remove();
            updateTaskList(); // Mettre à jour la liste après suppression
            updateProgressBar(); // Mettre à jour la barre de progression
        });

        // Ajouter les éléments dans la tâche
        taskLi.appendChild(leftDiv); // Texte de la tâche (avec validation)
        taskLi.appendChild(rightDiv); // Bouton Supprimer
        tasksUl.appendChild(taskLi);

        if (task.completed) {
            taskLi.classList.add('completed');
        }
    }

    // Ajouter une nouvelle tâche
    function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText === '') {
            alert("Veuillez entrer une tâche valide.");
            return;
        }

        const newTask = { text: taskText, completed: false };
        taskStatus.push(newTask);
        saveTaskStatus(taskStatus);
        createTaskElement(newTask, taskStatus.length - 1);
        taskInput.value = ''; // Réinitialiser le champ d'entrée
        updateProgressBar();
    }

    // Fonction pour mettre à jour la liste des tâches après suppression
    function updateTaskList() {
        tasksUl.innerHTML = ''; // Vider la liste des tâches affichée
        taskStatus.forEach((task, index) => {
            createTaskElement(task, index); // Recréer les éléments visuels pour chaque tâche
        });
    }

    // Ajout de la tâche au clic sur le bouton
    addTaskButton.addEventListener('click', addTask);

    // Ajout de la tâche en appuyant sur "Entrée"
    taskInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    // Mettre à jour la barre de progression
    function updateProgressBar() {
        const totalTasks = taskStatus.length;
        const completedTasks = taskStatus.filter(task => task.completed).length;
        const progressPercentage = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;
        progressBar.style.width = `${progressPercentage}%`;
        progressBar.textContent = `${Math.round(progressPercentage)}%`;

        // Cacher la barre de progression si elle est à 0%
        if (progressPercentage === 0) {
            progressBar.style.display = 'none';
        } else {
            progressBar.style.display = 'flex';
        }
    }

    // Charger les tâches au démarrage
    taskStatus.forEach((task, index) => {
        createTaskElement(task, index);
    });
    updateProgressBar();
});
