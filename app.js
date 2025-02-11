// Ensure Firebase is loaded
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
    document.getElementById('password-input').value = '';
}

// Ensure Firebase is loaded
if (window.firebaseApp && window.db) {
    console.log("Firebase loaded successfully in app.js");

    const db = window.db;

    // Check Firestore connection
    db.collection("events").get()
        .then(() => console.log("Firestore is connected!"))
        .catch(error => console.error("Firestore connection error:", error));

} else {
    console.error("Firebase is not initialized. Check script order in index.html");
}

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

function generateCalendar() {
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';
    document.getElementById('monthYear').innerText = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' });

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.classList.add('calendar-day', 'empty');
        calendar.appendChild(emptyCell);
    }

    // First, generate calendar days and keep a reference to them
    let dayCells = {};
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.classList.add('calendar-day');
        dayCell.innerText = day;
        dayCell.onclick = () => openEventForm(day, dayCell);
        calendar.appendChild(dayCell);
        dayCells[day] = dayCell;
    }

    // Then, retrieve events and update the calendar accordingly
    db.collection("events")
        .where("timestamp", ">=", firebase.firestore.Timestamp.fromDate(new Date(currentYear, currentMonth, 1)))
        .where("timestamp", "<", firebase.firestore.Timestamp.fromDate(new Date(currentYear, currentMonth + 1, 1)))
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const eventData = doc.data();
                const eventDay = new Date(eventData.timestamp.toDate()).getDate();
                if (dayCells[eventDay]) {
                    displayEvent(eventDay, eventData.name, eventData.time, eventData.color, eventData.description, dayCells[eventDay]);
                }
            });
        })
        .catch((error) => {
            console.error("Error fetching events:", error);
        });
}

function displayEvent(day, name, time, color, description, dayCell) {
    const eventList = document.getElementById('event-list');
    const eventItem = document.createElement('div');
    eventItem.innerText = `${new Date(currentYear, currentMonth, day).toLocaleDateString()} - ${time}: ${name} - ${description}`;
    eventItem.style.color = "black";
    eventList.appendChild(eventItem);

    // Set color on calendar day
    dayCell.style.backgroundColor = color;
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
    const eventTime = prompt("Enter event time (HH:MM AM/PM):");
    const eventDescription = prompt("Enter event description:");
    const eventColor = prompt("Enter event color (green, yellow, red, orange, blue, purple):");

    if (eventName && eventTime && eventColor) {
        const eventDate = new Date(currentYear, currentMonth, day).getTime();

        // Save to Firestore
        db.collection("events").add({
            name: eventName,
            description: eventDescription,
            color: eventColor,
            timestamp: firebase.firestore.Timestamp.fromDate(new Date(eventDate))
        }).then(() => {
            console.log("Event added successfully!");
            displayEvent(day, eventName, eventTime, eventColor, eventDescription, dayCell);
        }).catch((error) => {
            console.error("Error adding event: ", error);
        });
    }
}

db.collection("events").get()
    .then(() => console.log("Firestore is connected!"))
    .catch(error => console.error("Firestore connection error:", error));
