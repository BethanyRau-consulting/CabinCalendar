// Ensure Firebase is loaded before running the script
if (window.db) {
    console.log("Firebase loaded successfully in app.js");

    const db = window.db;

    // Check Firestore Connection
    window.getDocs(window.collection(db, "events"))
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

    // ✅ Clear the event list before adding new ones
    const eventList = document.getElementById('event-list');
    eventList.innerHTML = "<h2>Events</h2>";

    // ✅ Retrieve events from Firestore with error handling
    window.getDocs(window.collection(db, "events"))
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const eventData = doc.data();
                
                // ✅ Check if timestamp exists
                if (!eventData.timestamp) {
                    console.error("Event missing timestamp:", eventData);
                    return;
                }

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

// ✅ Update `addEvent()` to Include Time, Color, and Store Data
function addEvent(day, dayCell) {
    const eventName = prompt("Enter event name:");
    const eventTime = prompt("Enter event time (HH:MM AM/PM):");
    const eventDescription = prompt("Enter event description:");
    const eventColor = prompt("Enter event color (green, yellow, red, orange, blue, purple):");

    if (eventName && eventTime && eventColor) {
        const eventDate = new Date(currentYear, currentMonth, day);

        // Store event in Firestore
        window.addDoc(window.collection(db, "events"), {
            name: eventName,
            time: eventTime,
            description: eventDescription,
            color: eventColor,
            timestamp: window.Timestamp.fromDate(eventDate)
        }).then(() => {
            console.log("Event added successfully!");
            displayEvent(day, eventName, eventTime, eventColor, eventDescription, dayCell);
        }).catch((error) => {
            console.error("Error adding event: ", error);
        });
    }
}

// ✅ Update `displayEvent()` to Show Events in Calendar and Event List
function displayEvent(day, name, time, color, description, dayCell) {
    const eventList = document.getElementById('event-list');

    // Create event entry in the list
    const eventItem = document.createElement('div');
    eventItem.innerText = `${new Date(currentYear, currentMonth, day).toLocaleDateString()} - ${time}: ${name} - ${description}`;
    eventItem.style.color = "black";
    eventList.appendChild(eventItem);

    // Apply color to calendar day
    dayCell.style.backgroundColor = color;
}
