const calendarContainer = document.getElementById("taskbar-calendar-container");
const containerDates = document.getElementById("container-dates");
const monthsYearField = document.getElementById("month-year");

const daysWeek = ["D", "S", "T", "Q", "Q", "S", "S"];
const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

const now = new Date();

const today = now.getDate();
const currentMonth = now.getMonth();
const currentYear = now.getFullYear();

let month = now.getMonth();
let year = now.getFullYear();

let daysInMonth = new Date(year, month + 1, 0).getDate();
let firstDay = new Date(year, month, 1).getDay();
let previousMonthDays = new Date(year, month, 0).getDate();

let visible = false;

function setDaysOfWeek () {
    daysWeek.forEach(element => {
        let dayOfWeek = document.createElement('p');
        dayOfWeek.classList.add("day", "days-week");
        dayOfWeek.textContent = element;
        containerDates.appendChild(dayOfWeek); 
    });
}

function updateDates() {
    containerDates.innerHTML = "";

    setDaysOfWeek();
    
    let textDay = firstDay == 0 ? 1 : previousMonthDays - (firstDay - 1);
    let previousDays = textDay > 1;
    let color = previousDays ? "no-day-month" : "day-month";

    for (let lines = 0; lines < 42; lines++) {
        let day = document.createElement("p");
        let span = document.createElement("span");
        day.appendChild(span);
        day.classList.add("day");
        
        if (previousDays && textDay > previousMonthDays) {
            textDay = 1;
            previousDays = false;
            color = "day-month";
        }
        
        if (!previousDays && textDay > daysInMonth) {
            textDay = 1;
            color = "no-day-month";
        }

        if (month == currentMonth && year == currentYear && textDay == today) {
            day.classList.add("today");
        }
        
        day.classList.add(color);
        span.textContent = textDay;
        containerDates.appendChild(day);
        textDay++;
    }
}

function updateMonthYear() {
    daysInMonth = new Date(year, month + 1, 0).getDate();
    firstDay = new Date(year, month, 1).getDay();
    previousMonthDays = new Date(year, month, 0).getDate();

    monthsYearField.innerText = months[month] + " - " + year;

    updateDates();
}

function plusMonth() {
    month++;

    if (month > 11) {
        month = 0;
        year++;
    }

    updateMonthYear();
}

function minusMonth() {
    month--;
    
    if (month < 0) {
        month = 11;
        year--;
    }

    updateMonthYear();
}

function setVisibility() {
    if (visible) {
        calendarContainer.style.display = "block";
    } else {
        calendarContainer.style.display = "none";
    }
}

updateMonthYear();
setVisibility();

function switchcalendarVisibility() {
    visible = !visible;

    setVisibility();

    month = now.getMonth();
    year = now.getFullYear();

    daysInMonth = new Date(year, month + 1, 0).getDate();
    firstDay = new Date(year, month, 1).getDay();
    previousMonthDays = new Date(year, month, 0).getDate();
}
