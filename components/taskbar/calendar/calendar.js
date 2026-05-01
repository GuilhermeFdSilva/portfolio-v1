/** HTML Elements */
const calendarContainer = document.getElementById("taskbar-calendar-container");
const containerDates = document.getElementById("container-dates");
const monthsYearField = document.getElementById("month-year");
const calendarButton = document.getElementById("taskbar-calendar");

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
let calendarVisible = false;

/**
 * Insert the initials of the days of the week into the calendar
 */
function setDaysOfWeek () {
    daysWeek.forEach((element, index) => {
        let dayOfWeek = document.createElement('p');
        dayOfWeek.classList.add("day-field");
        
        if (index == 0 || index == 6) {
            dayOfWeek.classList.add("weekend");
        } else {
            dayOfWeek.classList.add("week");
        }
        
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
    let color = previousDays ? "not-month-day" : "month-day";

    for (let fields = 0; fields < 42; fields++) {
        let day = document.createElement("p");
        let span = document.createElement("span");
        day.appendChild(span);
        day.classList.add("day-field");
        
        if (previousDays && textDay > previousMonthDays) {
            textDay = 1;
            previousDays = false;
            color = "month-day";
        }
        
        if (!previousDays && textDay > daysInMonth) {
            textDay = 1;
            previousDays = true;
            color = "not-month-day";
        }

        if (displayMonth == currentMonth && displayYear == currentYear && textDay == today && !previousDays) {
            day.classList.add("today");
        }

        if (fields % 7 == 0 || (fields - 6) % 7 == 0) {
            day.classList.add("weekend-day");
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
export function updateMonthYear() {
    daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
    firstDay = new Date(displayYear, displayMonth, 1).getDay();
    previousMonthDays = new Date(displayYear, displayMonth, 0).getDate();

    updateDays();
}

/**
 * Increase the display month
 */
export function plusMonth() {
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
export function minusMonth() {
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
export function setCalendarVisibility() {
    if (calendarVisible) {
        calendarContainer.style.display = "flex";
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
function switchCalendarVisibility() {
    calendarVisible = !calendarVisible;

    setCalendarVisibility();
    resetDay();
}

/**
 * Listener for the calendar access calendarButton
 */
calendarButton.addEventListener("click", (event) => {
        event.stopPropagation();
        switchCalendarVisibility();
});

/**
 * Listener to close the calendar if the user clicks elsewhere on the screen
 */
document.addEventListener("click", (event) => {
    if (!calendarContainer.contains(event.target)) {
        if (calendarVisible) {
            switchCalendarVisibility();
        }
    }
});
