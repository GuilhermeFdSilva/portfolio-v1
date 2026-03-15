const containerDates = document.getElementById("container-dates");

const daysWeek = ["D", "S", "T", "Q", "Q", "S", "S"];

const now = new Date();

const today = now.getDate();
const currentMonth = now.getMonth();
const currentYear = now.getFullYear();

let month = now.getMonth();
let year = now.getFullYear();

let daysInMonth = new Date(year, month + 1, 0).getDate();
let firstDay = new Date(year, month, 1).getDay();

function plusMonth() {
    month++;

    if (month > 11) {
        month = 0;
        year++;
    }
}

function minusMonth() {
    month--;

    if (month < 0) {
        month = 11;
        year--;
    }
}
