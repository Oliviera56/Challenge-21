document.addEventListener('DOMContentLoaded', function () {
    const habitForm = document.getElementById('habitForm');
    const habitStatus = document.getElementById('habitStatus');
    let habitData = loadHabitData();

    function loadHabitData() {
        return JSON.parse(localStorage.getItem('habitData')) || [];
    }

    function saveHabitData(data) {
        localStorage.setItem('habitData', JSON.stringify(data));
    }

    habitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const habitName = document.getElementById('habitName').value.trim();
        const habitType = document.getElementById('habitType').value;
        if (habitName === '') return;

        const newHabit = { name: habitName, type: habitType, status: 'En cours' };
        habitData.push(newHabit);
        saveHabitData(habitData);
        createHabitElement(newHabit);
        document.getElementById('habitName').value = '';
    });

    function createHabitElement(habit) {
        const habitDiv = document.createElement('div');
        habitDiv.textContent = `${habit.type === 'prendre' ? 'Prendre' : 'Perdre'} l'habitude : ${habit.name}`;
        habitStatus.appendChild(habitDiv);
    }

    // Charger les habitudes au démarrage
    habitData.forEach(createHabitElement);
});
