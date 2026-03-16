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

function updateDates() {
    
}

function updateMonthYear() {
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

updateMonthYear();
