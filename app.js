// Ensure Firebase is loaded before running the script
if (window.firebaseApp && window.db) {
    console.log("Firebase loaded successfully in app.js");

    const db = window.db;

    // Check Firestore Connection
    db.collection("events").get()
        .then(() => console.log("Firestore is connected!"))
        .catch(error => console.error("Firestore connection error:", error));
} else {
    console.error("Firebase is not initialized. Check script order in index.html");
}

// Global variables for calendar
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

function checkPassword() {
    const password = document.getElementById('password-input').value;
    if (password === 'password') {
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
        generateCalendar();
    } else {
        alert('Incorrect password');
    }
}

function logout() {
    document.getElementById('login-page').style.display = 'block';
    document.getElementById('main-content').style.display = 'none';
    document.getElementById('password-input').value = ''; // Clear password input
}

function generateCalendar() {
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';
    document.getElementById('monthYear').innerText = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' });

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    let dayCells = {};
    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.classList.add('calendar-day', 'empty');
        calendar.appendChild(emptyCell);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.classList.add('calendar-day');
        dayCell.innerText = day;
        dayCell.onclick = () => addEvent(day, dayCell);
        calendar.appendChild(dayCell);
        dayCells[day] = dayCell;
    }

    // Retrieve events from Firestore
    db.collection("events")
        .where("timestamp", ">=", window.Timestamp.fromDate(new Date(currentYear, currentMonth, 1)))
        .where("timestamp", "<", window.Timestamp.fromDate(new Date(currentYear, currentMonth + 1, 1)))
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const eventData = doc.data();
                const eventDay = new Date(eventData.timestamp.toDate()).getDate();
                if (dayCells[eventDay]) {
                    displayEvent(eventDay, eventData.name, eventData.color, dayCells[eventDay]);
                }
            });
        })
        .catch((error) => {
            console.error("Error fetching events:", error);
        });
}

function prevMonth() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    generateCalendar();
}

function nextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    generateCalendar();
}

function addEvent(day, dayCell) {
    const eventName = prompt("Enter event name:");
    const eventColor = prompt("Enter event color (green, yellow, red, orange, blue, purple):");

    if (eventName && eventColor) {
        const eventDate = new Date(currentYear, currentMonth, day).getTime();

        db.collection("events").add({
            name: eventName,
            color: eventColor,
            timestamp: window.Timestamp.fromDate(new Date(eventDate))
        }).then(() => {
            console.log("Event added successfully!");
            displayEvent(day, eventName, eventColor, dayCell);
        }).catch((error) => {
            console.error("Error adding event: ", error);
        });
    }
}

function displayEvent(day, name, color, dayCell) {
    dayCell.style.backgroundColor = color;
}
