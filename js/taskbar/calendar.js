/** HTML Elements */
const calendarContainer = document.getElementById("taskbar-calendar-container");
const containerDates = document.getElementById("container-dates");
const monthsYearField = document.getElementById("month-year");
const button = document.getElementById("taskbar-calendar");

/** Regular Strings */
const daysWeek = ["D", "S", "T", "Q", "Q", "S", "S"];
const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

/** Current date */
const now = new Date();
const today = now.getDate();
const currentMonth = now.getMonth();
const currentYear = now.getFullYear();

/** Display month, initially instantiated as the current month */
let displayMonth = currentMonth;
let displayYear = currentYear;

/** Information for display current month */
let daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
let firstDay = new Date(displayYear, displayMonth, 1).getDay();
let previousMonthDays = new Date(displayYear, displayMonth, 0).getDate();

/** Define the calendar visibility */
let visible = false;

/**
 * Insert the initials of the days of the week into the calendar
 */
function setDaysOfWeek () {
    daysWeek.forEach(element => {
        let dayOfWeek = document.createElement('p');
        dayOfWeek.classList.add("day", "days-week");
        dayOfWeek.textContent = element;
        containerDates.appendChild(dayOfWeek); 
    });
}

/**
 * Fill in the fields for the days of the month, according to the parameters
 */
function updateDays() {
    monthsYearField.innerText = months[displayMonth] + " - " + displayYear;

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

        if (displayMonth == currentMonth && displayYear == currentYear && textDay == today) {
            day.classList.add("today");
        }
        
        day.classList.add(color);
        span.textContent = textDay;
        containerDates.appendChild(day);
        textDay++;
    }
}

/**
 * Updates the month's information for display
 */
function updateMonthYear() {
    daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
    firstDay = new Date(displayYear, displayMonth, 1).getDay();
    previousMonthDays = new Date(displayYear, displayMonth, 0).getDate();

    updateDays();
}

/**
 * Increase the display month
 */
function plusMonth() {
    displayMonth++;

    if (displayMonth > 11) {
        displayMonth = 0;
        displayYear++;
    }

    updateMonthYear();
}

/**
 * Decreases the display month
 */
function minusMonth() {
    displayMonth--;
    
    if (displayMonth < 0) {
        displayMonth = 11;
        displayYear--;
    }

    updateMonthYear();
}

/**
 * Change calendar visibility
 */
function setVisibility() {
    if (visible) {
        calendarContainer.style.display = "block";
    } else {
        calendarContainer.style.display = "none";
    }
}

/**
 * Resets the display date to the current month
 */
function resetDay() {
    displayMonth = now.getMonth();
    displayYear = now.getFullYear();

    updateMonthYear();
}

/**
 * Updates calendar visibility
 */
function switchcalendarVisibility() {
    visible = !visible;

    setVisibility();
    resetDay();
}

/**
 * Listener for the calendar access button
 */
button.addEventListener("click", (event) => {
        event.stopPropagation();
        switchcalendarVisibility();
})

/**
 * Listener to close the calendar if the user clicks elsewhere on the screen
 */
document.addEventListener("click", (event) => {
    if (!calendarContainer.contains(event.target)) {
        if (visible) {
            switchcalendarVisibility();
        }
    }
});

/**
 * Initial calls
 */
updateMonthYear();
setVisibility();
