export class Calendar {
    static calendarTemplateCache = null;

    constructor(calendarButton) {
        /** Regular Strings */
        this.daysWeek = ["D", "S", "T", "Q", "Q", "S", "S"];
        this.months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

        /** Current date */
        this.now = new Date();
        this.today = this.now.getDate();
        this.currentMonth = this.now.getMonth();
        this.currentYear = this.now.getFullYear();

        /** Display month, initially instantiated as the current month */
        this.displayMonth = this.currentMonth;
        this.displayYear = this.currentYear;

        /** Information for display current month */
        this.daysInMonth = new Date(this.displayYear, this.displayMonth + 1, 0).getDate();
        this.firstDay = new Date(this.displayYear, this.displayMonth, 1).getDay();
        this.previousMonthDays = new Date(this.displayYear, this.displayMonth, 0).getDate();

        /** Define the calendar visibility */
        this.calendarVisible = false;

        // HTML elements
        this.calendarContainer = null;
        this.monthsYearField = null;
        this.containerDates = null;
        this.calendarButtonUp = null;
        this.calendarButtonDown = null;
        
        this.calendarButton = calendarButton;
        this.calendarButton.addEventListener("click", (event) => {
            event.stopPropagation();
            this.switchCalendarVisibility();
        });

        document.addEventListener("click", (event) => {
            if (!this.calendarContainer.contains(event.target)) {
                if (this.calendarVisible) {
                    this.switchCalendarVisibility();
                }
            }
        });
    }

    static async loadCalendarTemplate() {
        if (Calendar.calendarTemplateCache) return Calendar.calendarTemplateCache;

        const res = await fetch("/components/taskbar/calendar/calendar.html");
        const html = await res.text();

        Calendar.calendarTemplateCache = html;
        return html;
    }

    async loadCalendar() {
        const wrapper = document.createElement("div");

        wrapper.innerHTML = await Calendar.loadCalendarTemplate();
        
        this.calendarContainer = wrapper.firstElementChild;
        this.monthsYearField = this.calendarContainer.querySelector("#month-year");
        this.containerDates = this.calendarContainer.querySelector("#container-dates");
        this.calendarButtonUp = this.calendarContainer.querySelector("#calendar-button-up");
        this.calendarButtonDown = this.calendarContainer.querySelector("#calendar-button-down");

        this.calendarButtonUp.addEventListener("click", (event) => {
            event.stopPropagation();
            this.minusMonth;
        });

        this.calendarButtonDown.addEventListener("click", (event) => {
            event.stopPropagation();
            this.plusMonth();
        });

        return this.calendarContainer;
    }

    /**
     * Insert the initials of the days of the week into the calendar
     */
    setDaysOfWeek() {
        this.daysWeek.forEach((element, index) => {
            let dayOfWeek = document.createElement('p');
            dayOfWeek.classList.add("day-field");

            if (index == 0 || index == 6) {
                dayOfWeek.classList.add("weekend");
            } else {
                dayOfWeek.classList.add("week");
            }

            dayOfWeek.textContent = element;
            this.containerDates.appendChild(dayOfWeek);
        });
    }

    /**
     * Fill in the fields for the days of the month, according to the parameters
     */
    updateDays() {
        this.monthsYearField.innerText = this.months[this.displayMonth] + " - " + this.displayYear;

        this.containerDates.innerHTML = "";

        this.setDaysOfWeek();

        let textDay = this.firstDay == 0 ? 1 : this.previousMonthDays - (this.firstDay - 1);
        let previousDays = textDay > 1;
        let color = previousDays ? "not-month-day" : "month-day";

        for (let fields = 0; fields < 42; fields++) {
            let day = document.createElement("p");
            let span = document.createElement("span");
            day.appendChild(span);
            day.classList.add("day-field");

            if (previousDays && textDay > this.previousMonthDays) {
                textDay = 1;
                previousDays = false;
                color = "month-day";
            }

            if (!previousDays && textDay > this.daysInMonth) {
                textDay = 1;
                previousDays = true;
                color = "not-month-day";
            }

            if (this.displayMonth == this.currentMonth && this.displayYear == this.currentYear && textDay == this.today && !previousDays) {
                day.classList.add("today");
            }

            if (fields % 7 == 0 || (fields - 6) % 7 == 0) {
                day.classList.add("weekend-day");
            }

            day.classList.add(color);
            span.textContent = textDay;
            this.containerDates.appendChild(day);
            textDay++;
        }
    }

    /**
     * Updates the month's information for display
     */
    updateMonthYear() {
        this.daysInMonth = new Date(this.displayYear, this.displayMonth + 1, 0).getDate();
        this.firstDay = new Date(this.displayYear, this.displayMonth, 1).getDay();
        this.previousMonthDays = new Date(this.displayYear, this.displayMonth, 0).getDate();

        this.updateDays();
    }

    /**
     * Increase the display month
     */
    plusMonth() {
        this.displayMonth++;

        if (this.displayMonth > 11) {
            this.displayMonth = 0;
            this.displayYear++;
        }

        this.updateMonthYear();
    }

    /**
     * Decreases the display month
     */
    minusMonth() {
        this.displayMonth--;

        if (this.displayMonth < 0) {
            this.displayMonth = 11;
            this.displayYear--;
        }

        this.updateMonthYear();
    }

    /**
     * Change calendar visibility
     */
    setCalendarVisibility() {
        if (this.calendarVisible) {
            this.calendarContainer.style.display = "flex";
        } else {
            this.calendarContainer.style.display = "none";
        }
    }

    /**
     * Resets the display date to the current month
     */
    resetDay() {
        this.displayMonth = this.now.getMonth();
        this.displayYear = this.now.getFullYear();

        this.updateMonthYear();
    }

    /**
     * Updates calendar visibility
     */
    switchCalendarVisibility() {
        this.calendarVisible = !this.calendarVisible;

        this.setCalendarVisibility();
        this.resetDay();
    }
}