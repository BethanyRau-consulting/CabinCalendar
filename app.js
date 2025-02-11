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

    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.classList.add('calendar-day');
        dayCell.innerText = day;
        dayCell.onclick = () => addEvent(day, dayCell);
        calendar.appendChild(dayCell);
    }
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
    const eventTime = prompt("Enter event time:");
    const eventColor = prompt("Enter event color (green, yellow, red, orange, blue, purple):");
    if (eventName && eventTime && eventColor) {
        const eventList = document.getElementById('event-list');
        const eventItem = document.createElement('div');
        eventItem.innerText = `${new Date(currentYear, currentMonth, day).toLocaleDateString()} - ${eventTime}: ${eventName}`;
        eventItem.style.color = "black";
        eventList.appendChild(eventItem);
        dayCell.style.backgroundColor = eventColor;
    }
}
