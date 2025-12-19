// App Data and State
const appData = {
    currentView: 'dashboard',
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear(),
    exercises: [
        { id: 1, name: "Morning Run", duration: 30, calories: 320, time: "Morning", date: "2025-12-17" },
        { id: 2, name: "Weight Training", duration: 45, calories: 280, time: "Evening", date: "2025-12-17" }
    ],
    meals: [
        { id: 1, name: "Oatmeal with Berries", type: "breakfast", calories: 320, time: "8:00 AM", date: "2025-12-17" },
        { id: 2, name: "Grilled Chicken Salad", type: "lunch", calories: 450, time: "12:30 PM", date: "2025-12-17" },
        { id: 3, name: "Protein Shake", type: "snacks", calories: 180, time: "4:00 PM", date: "2025-12-17" },
        { id: 4, name: "Salmon with Vegetables", type: "dinner", calories: 520, time: "7:45 PM", date: "2025-12-17" }
    ],
    stats: {
        caloriesBurned: 420,
        caloriesConsumed: 1850,
        workoutTime: 45,
        waterIntake: 2.1,
        weeklyWorkouts: 5,
        streakDays: 12,
        weightChange: -2.4
    },
    weeklyData: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        calories: [380, 420, 310, 460, 390, 420, 0],
        workouts: [1, 1, 1, 1, 1, 0, 0]
    },
    settings: {
        theme: 'light',
        calorieGoal: 2000,
        waterGoal: 2.5,
        workoutGoal: 5,
        workoutReminders: true,
        mealReminders: true,
        waterReminders: true,
        progressUpdates: true,
        userName: "Alex Johnson",
        userHeight: 165,
        userWeight: 62.5,
        userAge: 28
    },
    // Calendar tasks data
    calendarTasks: {
        "2025-12-15": { exercises: 2, meals: 3, water: 1.8, status: "completed" },
        "2025-12-16": { exercises: 1, meals: 4, water: 2.0, status: "completed" },
        "2025-12-17": { exercises: 2, meals: 4, water: 2.1, status: "completed" },
        "2025-12-18": { exercises: 0, meals: 0, water: 0, status: "pending" },
        "2025-12-19": { exercises: 0, meals: 0, water: 0, status: "pending" }
    }
};

// DOM Elements
let weeklyChart = null;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupEventListeners();
    updateDate();
    renderDashboard();
    loadSettings();
    initializeChart();
    generateCalendar(); // Initialize calendar
});

// Initialize App
function initApp() {
    // Set initial view
    switchView('dashboard');
    
    // Render initial data
    renderExercises();
    renderMeals();
    renderExerciseHistory();
    renderNutritionHistory();
    updateStats();
}

// Setup Event Listeners
function setupEventListeners() {
    // Navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            switchView(view);
        });
    });

    // Secret calendar button
    document.getElementById('secretCalendarBtn').addEventListener('click', () => {
        openModal('secretCalendarModal');
        updateTasksSummary();
    });

    // Calendar navigation
    document.getElementById('prevMonthBtn').addEventListener('click', () => {
        appData.currentMonth--;
        if (appData.currentMonth < 0) {
            appData.currentMonth = 11;
            appData.currentYear--;
        }
        generateCalendar();
    });

    document.getElementById('nextMonthBtn').addEventListener('click', () => {
        appData.currentMonth++;
        if (appData.currentMonth > 11) {
            appData.currentMonth = 0;
            appData.currentYear++;
        }
        generateCalendar();
    });

    // Add buttons
    document.getElementById('addExerciseBtn').addEventListener('click', () => openModal('exerciseModal'));
    document.getElementById('addMealBtn').addEventListener('click', () => openModal('mealModal'));
    document.getElementById('addExerciseHistoryBtn').addEventListener('click', () => openModal('exerciseModal'));
    document.getElementById('addNutritionHistoryBtn').addEventListener('click', () => openModal('mealModal'));

    // Modal close buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            closeModal(modal.id);
        });
    });

    // Close modal when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });

    // Form submissions
    document.getElementById('exerciseForm').addEventListener('submit', handleExerciseSubmit);
    document.getElementById('mealForm').addEventListener('submit', handleMealSubmit);

    // Theme selection
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', () => {
            const theme = option.dataset.theme;
            selectTheme(theme);
        });
    });

    // Settings buttons
    document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
    document.getElementById('exportDataBtn').addEventListener('click', exportData);
    document.getElementById('backupDataBtn').addEventListener('click', backupData);
    document.getElementById('resetDataBtn').addEventListener('click', () => {
        showConfirmation(
            'Reset All Data',
            'Are you sure you want to reset all your fitness data? This action cannot be undone.',
            resetData
        );
    });
    document.getElementById('restoreDefaultsBtn').addEventListener('click', restoreDefaults);

    // Settings inputs
    const settingsInputs = [
        'calorieGoal', 'waterGoal', 'workoutGoal',
        'workoutReminders', 'mealReminders', 'waterReminders', 'progressUpdates',
        'userName', 'userHeight', 'userWeight', 'userAge'
    ];
    
    settingsInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', updateSetting);
        }
    });
}

// Switch View
function switchView(view) {
    // Update active nav button
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === view);
    });

    // Update active view
    document.querySelectorAll('.content-view').forEach(viewElement => {
        viewElement.classList.toggle('active', viewElement.id === `${view}View`);
    });

    // Update app state
    appData.currentView = view;

    // Handle view-specific initialization
    if (view === 'progress') {
        updateChart();
    }
}

// Update Date Display
function updateDate() {
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    document.querySelector('#currentDate span').textContent = now.toLocaleDateString('en-US', options);
}

// Render Dashboard
function renderDashboard() {
    updateStats();
}

// Update Statistics
function updateStats() {
    document.getElementById('caloriesBurned').textContent = appData.stats.caloriesBurned;
    document.getElementById('caloriesConsumed').textContent = appData.stats.caloriesConsumed;
    document.getElementById('workoutTime').textContent = appData.stats.workoutTime;
    document.getElementById('waterIntake').textContent = appData.stats.waterIntake;
    document.getElementById('weeklyWorkouts').textContent = appData.stats.weeklyWorkouts;
    document.getElementById('streakDays').textContent = appData.stats.streakDays;
    document.getElementById('weightChange').textContent = appData.stats.weightChange;
}

// Render Exercises
function renderExercises() {
    const container = document.getElementById('exercisesList');
    const today = new Date().toISOString().split('T')[0];
    
    const todayExercises = appData.exercises.filter(ex => ex.date === today);
    
    container.innerHTML = '';
    
    if (todayExercises.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-running"></i>
                <p>No exercises logged today</p>
                <button class="btn primary-btn" id="addExerciseEmptyBtn">Add Your First Exercise</button>
            </div>
        `;
        document.getElementById('addExerciseEmptyBtn')?.addEventListener('click', () => openModal('exerciseModal'));
        return;
    }
    
    todayExercises.forEach(exercise => {
        const exerciseElement = createExerciseElement(exercise);
        container.appendChild(exerciseElement);
    });
}

// Render Exercise History
function renderExerciseHistory() {
    const container = document.getElementById('exerciseHistoryList');
    container.innerHTML = '';
    
    if (appData.exercises.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-dumbbell"></i>
                <p>No exercise history</p>
            </div>
        `;
        return;
    }
    
    // Sort by date (newest first)
    const sortedExercises = [...appData.exercises].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedExercises.forEach(exercise => {
        const exerciseElement = createExerciseElement(exercise, true);
        container.appendChild(exerciseElement);
    });
}

// Create Exercise Element
function createExerciseElement(exercise, showDate = false) {
    const div = document.createElement('div');
    div.className = 'item';
    div.dataset.id = exercise.id;
    
    let dateInfo = '';
    if (showDate) {
        const date = new Date(exercise.date);
        dateInfo = `<p>${formatDate(date)} • ${exercise.time}</p>`;
    } else {
        dateInfo = `<p>${exercise.time}</p>`;
    }
    
    div.innerHTML = `
        <div class="item-info">
            <h4>${exercise.name}</h4>
            ${dateInfo}
        </div>
        <div class="item-value">
            ${exercise.duration} min
        </div>
    `;
    
    return div;
}

// Render Meals
function renderMeals() {
    const today = new Date().toISOString().split('T')[0];
    const todayMeals = appData.meals.filter(meal => meal.date === today);
    
    // Group meals by type
    const mealsByType = {
        breakfast: todayMeals.filter(meal => meal.type === 'breakfast'),
        lunch: todayMeals.filter(meal => meal.type === 'lunch'),
        snacks: todayMeals.filter(meal => meal.type === 'snacks'),
        dinner: todayMeals.filter(meal => meal.type === 'dinner')
    };
    
    // Render each meal category
    ['breakfast', 'lunch', 'snacks', 'dinner'].forEach(type => {
        const container = document.getElementById(`${type}List`);
        const meals = mealsByType[type];
        
        container.innerHTML = '';
        
        if (meals.length === 0) {
            container.innerHTML = `
                <div class="empty-state small">
                    <i class="fas fa-utensils"></i>
                    <p>No ${type} logged</p>
                </div>
            `;
            return;
        }
        
        meals.forEach(meal => {
            const mealElement = createMealElement(meal);
            container.appendChild(mealElement);
        });
    });
}

// Render Nutrition History
function renderNutritionHistory() {
    // Group meals by type for history
    const mealsByType = {
        breakfast: appData.meals.filter(meal => meal.type === 'breakfast'),
        lunch: appData.meals.filter(meal => meal.type === 'lunch'),
        snacks: appData.meals.filter(meal => meal.type === 'snacks'),
        dinner: appData.meals.filter(meal => meal.type === 'dinner')
    };
    
    // Render each meal category history
    ['breakfast', 'lunch', 'snacks', 'dinner'].forEach(type => {
        const container = document.getElementById(`${type}HistoryList`);
        const meals = mealsByType[type];
        
        container.innerHTML = '';
        
        if (meals.length === 0) {
            container.innerHTML = `
                <div class="empty-state small">
                    <i class="fas fa-utensils"></i>
                    <p>No ${type} history</p>
                </div>
            `;
            return;
        }
        
        // Sort by date (newest first)
        const sortedMeals = [...meals].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        sortedMeals.forEach(meal => {
            const mealElement = createMealElement(meal, true);
            container.appendChild(mealElement);
        });
    });
}

// Create Meal Element
function createMealElement(meal, showDate = false) {
    const div = document.createElement('div');
    div.className = 'item';
    div.dataset.id = meal.id;
    
    let dateInfo = '';
    if (showDate) {
        const date = new Date(meal.date);
        dateInfo = `<p>${formatDate(date)} • ${meal.time}</p>`;
    } else {
        dateInfo = `<p>${meal.time}</p>`;
    }
    
    div.innerHTML = `
        <div class="item-info">
            <h4>${meal.name}</h4>
            ${dateInfo}
        </div>
        <div class="item-value">
            ${meal.calories} cal
        </div>
    `;
    
    return div;
}

// Generate Calendar - FIXED
function generateCalendar() {
    const calendarGrid = document.getElementById('calendarGrid');
    const currentMonthYear = document.getElementById('currentMonthYear');
    
    // Update month/year display
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    currentMonthYear.textContent = `${monthNames[appData.currentMonth]} ${appData.currentYear}`;
    
    // Clear previous calendar
    calendarGrid.innerHTML = '';
    
    // Add day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day calendar-day-header';
        dayElement.textContent = day;
        calendarGrid.appendChild(dayElement);
    });
    
    // Get first day of month
    const firstDay = new Date(appData.currentYear, appData.currentMonth, 1);
    const startingDay = firstDay.getDay();
    
    // Get last day of month
    const lastDay = new Date(appData.currentYear, appData.currentMonth + 1, 0);
    const totalDays = lastDay.getDate();
    
    // Get today's date
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Add empty cells for days before first day of month
    for (let i = 0; i < startingDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        calendarGrid.appendChild(emptyDay);
    }
    
    // Add days of the month
    for (let day = 1; day <= totalDays; day++) {
        const date = new Date(appData.currentYear, appData.currentMonth, day);
        const dateString = date.toISOString().split('T')[0];
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.dataset.date = dateString;
        
        // Check if this day has data
        const dayData = appData.calendarTasks[dateString];
        const hasExercises = appData.exercises.some(ex => ex.date === dateString);
        const hasMeals = appData.meals.some(meal => meal.date === dateString);
        
        // Check if it's today
        const isToday = appData.currentYear === currentYear && 
                       appData.currentMonth === currentMonth && 
                       day === today.getDate();
        
        if (isToday) {
            dayElement.classList.add('today');
        }
        
        // Check if day has data
        if (dayData || hasExercises || hasMeals) {
            dayElement.classList.add('has-data');
            
            // Determine status
            let status = 'pending';
            if (dayData) {
                status = dayData.status;
            } else if (hasExercises || hasMeals) {
                status = 'completed';
            }
            
            dayElement.classList.add(status);
            
            // Add task count if available
            let taskCount = 0;
            if (dayData) {
                taskCount = (dayData.exercises || 0) + (dayData.meals || 0);
            } else {
                taskCount = (hasExercises ? appData.exercises.filter(ex => ex.date === dateString).length : 0) +
                           (hasMeals ? appData.meals.filter(meal => meal.date === dateString).length : 0);
            }
            
            if (taskCount > 0) {
                const taskCountElement = document.createElement('div');
                taskCountElement.className = 'calendar-day-task-count';
                taskCountElement.textContent = `${taskCount} task${taskCount > 1 ? 's' : ''}`;
                dayElement.appendChild(taskCountElement);
            }
        }
        
        const dayNumber = document.createElement('div');
        dayNumber.className = 'calendar-day-number';
        dayNumber.textContent = day;
        dayElement.prepend(dayNumber);
        
        // Add click event to view day details - FIXED
        dayElement.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!dayElement.classList.contains('empty')) {
                viewDayDetails(dateString);
            }
        });
        
        calendarGrid.appendChild(dayElement);
    }
}

// View Day Details - FIXED to show correct day
function viewDayDetails(dateString) {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    const dayExercises = appData.exercises.filter(ex => ex.date === dateString);
    const dayMeals = appData.meals.filter(meal => meal.date === dateString);
    
    let message = `<strong>${formattedDate}</strong>\n\n`;
    
    if (dayExercises.length > 0) {
        message += `<strong>Exercises (${dayExercises.length}):</strong>\n`;
        dayExercises.forEach(ex => {
            message += `• ${ex.name} - ${ex.duration} min (${ex.calories} cal)\n`;
        });
        message += '\n';
    } else {
        message += "<strong>No exercises logged</strong>\n\n";
    }
    
    if (dayMeals.length > 0) {
        message += `<strong>Meals (${dayMeals.length}):</strong>\n`;
        dayMeals.forEach(meal => {
            message += `• ${meal.name} - ${meal.calories} cal (${meal.type})\n`;
        });
    } else {
        message += "<strong>No meals logged</strong>";
    }
    
    showConfirmation('Day Details', message, null);
    document.getElementById('confirmActionBtn').style.display = 'none';
}

// Update Tasks Summary
function updateTasksSummary() {
    const today = new Date().toISOString().split('T')[0];
    
    const todayExercises = appData.exercises.filter(ex => ex.date === today);
    const todayMeals = appData.meals.filter(meal => meal.date === today);
    
    document.getElementById('todayExercisesCount').textContent = todayExercises.length;
    document.getElementById('todayMealsCount').textContent = todayMeals.length;
    document.getElementById('todayWaterCount').textContent = `${appData.stats.waterIntake} L`;
}

// Initialize Chart
function initializeChart() {
    const ctx = document.getElementById('weeklyChart').getContext('2d');
    
    weeklyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: appData.weeklyData.labels,
            datasets: [
                {
                    label: 'Calories Burned',
                    data: appData.weeklyData.calories,
                    backgroundColor: '#4a6fa5',
                    borderColor: '#4a6fa5',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: document.body.classList.contains('dark-theme') ? '#ffffff' : '#000000'
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: document.body.classList.contains('dark-theme') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: document.body.classList.contains('dark-theme') ? '#ffffff' : '#000000'
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: document.body.classList.contains('dark-theme') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: document.body.classList.contains('dark-theme') ? '#ffffff' : '#000000'
                    }
                }
            }
        }
    });
}

// Update Chart
function updateChart() {
    if (weeklyChart) {
        weeklyChart.update();
    }
}

// Modal Functions
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    if (modalId === 'exerciseModal' || modalId === 'mealModal') {
        document.getElementById(modalId === 'exerciseModal' ? 'exerciseForm' : 'mealForm').reset();
    }
}

// Form Handlers
function handleExerciseSubmit(e) {
    e.preventDefault();
    
    const exercise = {
        id: Date.now(),
        name: document.getElementById('exerciseName').value,
        duration: parseInt(document.getElementById('exerciseDuration').value),
        calories: parseInt(document.getElementById('exerciseCalories').value),
        time: document.getElementById('exerciseTime').value,
        date: new Date().toISOString().split('T')[0]
    };
    
    appData.exercises.push(exercise);
    
    // Update stats
    appData.stats.caloriesBurned += exercise.calories;
    appData.stats.workoutTime += exercise.duration;
    appData.stats.weeklyWorkouts += 1;
    
    // Update weekly data for current day (Wednesday = index 2)
    appData.weeklyData.calories[2] += exercise.calories;
    appData.weeklyData.workouts[2] += 1;
    
    // Update calendar data for today
    const today = new Date().toISOString().split('T')[0];
    if (!appData.calendarTasks[today]) {
        appData.calendarTasks[today] = { exercises: 0, meals: 0, water: 0, status: "completed" };
    }
    appData.calendarTasks[today].exercises = appData.exercises.filter(ex => ex.date === today).length;
    
    // Update UI
    renderExercises();
    renderExerciseHistory();
    updateStats();
    updateChart();
    generateCalendar(); // Refresh calendar
    
    // Close modal and show notification
    closeModal('exerciseModal');
    showNotification('Exercise added successfully!');
}

function handleMealSubmit(e) {
    e.preventDefault();
    
    const meal = {
        id: Date.now(),
        name: document.getElementById('mealName').value,
        type: document.getElementById('mealType').value,
        calories: parseInt(document.getElementById('mealCalories').value),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toISOString().split('T')[0]
    };
    
    appData.meals.push(meal);
    
    // Update stats
    appData.stats.caloriesConsumed += meal.calories;
    
    // Update calendar data for today
    const today = new Date().toISOString().split('T')[0];
    if (!appData.calendarTasks[today]) {
        appData.calendarTasks[today] = { exercises: 0, meals: 0, water: 0, status: "completed" };
    }
    appData.calendarTasks[today].meals = appData.meals.filter(m => m.date === today).length;
    
    // Update UI
    renderMeals();
    renderNutritionHistory();
    updateStats();
    generateCalendar(); // Refresh calendar
    
    // Close modal and show notification
    closeModal('mealModal');
    showNotification('Meal added successfully!');
}

// Theme Functions
function selectTheme(theme) {
    appData.settings.theme = theme;
    
    // Update active theme indicator
    document.querySelectorAll('.theme-option').forEach(option => {
        option.classList.toggle('active', option.dataset.theme === theme);
    });
    
    // Apply theme to body
    document.body.className = '';
    if (theme !== 'light') {
        document.body.classList.add(`${theme}-theme`);
    }
    
    // Save theme to localStorage
    localStorage.setItem('fitTrackTheme', theme);
    
    // Update Chart colors
    if (weeklyChart) {
        const isDark = theme === 'dark';
        weeklyChart.options.scales.x.grid.color = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        weeklyChart.options.scales.y.grid.color = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        weeklyChart.options.scales.x.ticks.color = isDark ? '#ffffff' : '#000000';
        weeklyChart.options.scales.y.ticks.color = isDark ? '#ffffff' : '#000000';
        weeklyChart.options.plugins.legend.labels.color = isDark ? '#ffffff' : '#000000';
        weeklyChart.update();
    }
}

// Settings Functions
function loadSettings() {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('fitTrackTheme') || 'light';
    selectTheme(savedTheme);
    
    // Load other settings from localStorage
    const savedSettings = localStorage.getItem('fitTrackSettings');
    if (savedSettings) {
        Object.assign(appData.settings, JSON.parse(savedSettings));
    }
    
    // Apply settings to form inputs
    document.getElementById('calorieGoal').value = appData.settings.calorieGoal;
    document.getElementById('waterGoal').value = appData.settings.waterGoal;
    document.getElementById('workoutGoal').value = appData.settings.workoutGoal;
    document.getElementById('workoutReminders').checked = appData.settings.workoutReminders;
    document.getElementById('mealReminders').checked = appData.settings.mealReminders;
    document.getElementById('waterReminders').checked = appData.settings.waterReminders;
    document.getElementById('progressUpdates').checked = appData.settings.progressUpdates;
    document.getElementById('userName').value = appData.settings.userName;
    document.getElementById('userHeight').value = appData.settings.userHeight;
    document.getElementById('userWeight').value = appData.settings.userWeight;
    document.getElementById('userAge').value = appData.settings.userAge;
}

function updateSetting(e) {
    const settingId = e.target.id;
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    
    appData.settings[settingId] = value;
}

function saveSettings() {
    // Save settings to localStorage
    localStorage.setItem('fitTrackSettings', JSON.stringify(appData.settings));
    
    showNotification('Settings saved successfully!');
}

function exportData() {
    // Create a JSON blob of the data
    const dataStr = JSON.stringify({
        exercises: appData.exercises,
        meals: appData.meals,
        stats: appData.stats,
        settings: appData.settings,
        calendarTasks: appData.calendarTasks
    }, null, 2);
    
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fittrack-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showNotification('Data exported successfully!');
}

function backupData() {
    // Save current data to localStorage as backup
    localStorage.setItem('fitTrackBackup', JSON.stringify({
        exercises: appData.exercises,
        meals: appData.meals,
        stats: appData.stats,
        calendarTasks: appData.calendarTasks,
        timestamp: new Date().toISOString()
    }));
    
    showNotification('Data backed up successfully!');
}

function resetData() {
    // Reset exercise and meal data
    appData.exercises = [];
    appData.meals = [];
    appData.stats = {
        caloriesBurned: 0,
        caloriesConsumed: 0,
        workoutTime: 0,
        waterIntake: 0,
        weeklyWorkouts: 0,
        streakDays: 0,
        weightChange: 0
    };
    appData.weeklyData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        calories: [0, 0, 0, 0, 0, 0, 0],
        workouts: [0, 0, 0, 0, 0, 0, 0]
    };
    appData.calendarTasks = {};
    
    // Save to localStorage
    localStorage.setItem('fitTrackData', JSON.stringify({
        exercises: appData.exercises,
        meals: appData.meals,
        stats: appData.stats,
        weeklyData: appData.weeklyData,
        calendarTasks: appData.calendarTasks
    }));
    
    // Update UI
    renderExercises();
    renderMeals();
    renderExerciseHistory();
    renderNutritionHistory();
    updateStats();
    updateChart();
    generateCalendar();
    
    closeModal('confirmationModal');
    showNotification('All data reset successfully!');
}

function restoreDefaults() {
    showConfirmation(
        'Restore Default Settings',
        'Are you sure you want to restore all settings to their default values?',
        () => {
            // Restore default settings
            appData.settings = {
                theme: 'light',
                calorieGoal: 2000,
                waterGoal: 2.5,
                workoutGoal: 5,
                workoutReminders: true,
                mealReminders: true,
                waterReminders: true,
                progressUpdates: true,
                userName: "Alex Johnson",
                userHeight: 165,
                userWeight: 62.5,
                userAge: 28
            };
            
            // Apply settings
            loadSettings();
            selectTheme('light');
            
            closeModal('confirmationModal');
            showNotification('Default settings restored!');
        }
    );
}

// Confirmation Modal - FIXED to show HTML content
function showConfirmation(title, message, confirmCallback) {
    document.getElementById('confirmationTitle').textContent = title;
    document.getElementById('confirmationMessage').innerHTML = message.replace(/\n/g, '<br>');
    
    const confirmBtn = document.getElementById('confirmActionBtn');
    if (confirmCallback) {
        confirmBtn.style.display = 'block';
        confirmBtn.onclick = () => {
            confirmCallback();
            confirmBtn.onclick = null;
        };
    } else {
        confirmBtn.style.display = 'none';
    }
    
    openModal('confirmationModal');
}

// Notification Toast
function showNotification(message) {
    const toast = document.getElementById('notificationToast');
    const messageElement = document.getElementById('toastMessage');
    
    messageElement.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Utility Functions
function formatDate(date) {
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
    });
}

// Load data from localStorage on startup
function loadAppData() {
    const savedData = localStorage.getItem('fitTrackData');
    if (savedData) {
        const data = JSON.parse(savedData);
        appData.exercises = data.exercises || [];
        appData.meals = data.meals || [];
        appData.stats = data.stats || appData.stats;
        appData.weeklyData = data.weeklyData || appData.weeklyData;
        appData.calendarTasks = data.calendarTasks || appData.calendarTasks;
    }
}

// Save data to localStorage
function saveAppData() {
    localStorage.setItem('fitTrackData', JSON.stringify({
        exercises: appData.exercises,
        meals: appData.meals,
        stats: appData.stats,
        weeklyData: appData.weeklyData,
        calendarTasks: appData.calendarTasks
    }));
}

// Auto-save data periodically
setInterval(saveAppData, 30000); // Save every 30 seconds

// Initialize data loading
loadAppData();