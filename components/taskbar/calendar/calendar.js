export class Calendar {
    static calendar = null;
    static calendarButton = null;
    static calendarVisible = false;

    static daysWeek = ["D", "S", "T", "Q", "Q", "S", "S"];
    static months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    static now = new Date();
    static today = Calendar.now.getDate();
    static currentMonth = Calendar.now.getMonth();
    static currentYear = Calendar.now.getFullYear();

    static displayMonth = Calendar.currentMonth;
    static displayYear = Calendar.currentYear;

    static daysInMonth = new Date(Calendar.displayYear, Calendar.displayMonth + 1, 0).getDate();
    static firstDay = new Date(Calendar.displayYear, Calendar.displayMonth, 1).getDay();
    static previousMonthDays = new Date(Calendar.displayYear, Calendar.displayMonth, 0).getDate();

    static calendarContainer = null;
    static monthsYearField = null;
    static containerDates = null;
    static calendarButtonUp = null;
    static calendarButtonDown = null;

    static async configureInstance(calendarButton) {
        if (Calendar.calendar) {
            return Calendar.calendar;
        }

        Calendar.calendar = await this.#loadCalendar();

        Calendar.calendarButton = calendarButton;

        Calendar.calendarButton.addEventListener("click", (event) => {
            event.stopPropagation();
            this.#switchCalendarVisibility();
        });

        document.addEventListener("click", (event) => {
            if (Calendar.calendarVisible && !Calendar.calendar.contains(event.target) && event.target !== Calendar.calendarButton) {
                event.stopPropagation();
                this.#switchCalendarVisibility();
            }
        });

        document.addEventListener("keydown", (event) => {
            if (Calendar.calendarVisible && event.key == "Escape") {
                event.stopPropagation();
                this.#switchCalendarVisibility();
            }
        });

        this.calendarButtonUp.addEventListener("click", (event) => {
            event.stopPropagation();
            this.#minusMonth();
        });

        this.calendarButtonDown.addEventListener("click", (event) => {
            event.stopPropagation();
            this.#plusMonth();
        });

        return Calendar.calendar;
    }

    static getInstance() {
        if (!Calendar.calendarButton) {
            throw new Error("Calendar instance not created yet");
        }

        return Calendar.calendarButton;
    }

    static async #loadCalendarTemplate() {
        const res = await fetch("/components/taskbar/calendar/calendar.html");
        const html = await res.text();

        return html;
    }

    static async #loadCalendar() {
        const wrapper = document.createElement("div");

        wrapper.innerHTML = await Calendar.#loadCalendarTemplate();

        this.calendarContainer = wrapper.firstElementChild;
        this.monthsYearField = this.calendarContainer.querySelector("#month-year");
        this.containerDates = this.calendarContainer.querySelector("#container-dates");
        this.calendarButtonUp = this.calendarContainer.querySelector("#calendar-button-up");
        this.calendarButtonDown = this.calendarContainer.querySelector("#calendar-button-down");

        return this.calendarContainer;
    }

    /**
     * Insert the initials of the days of the week into the calendar
     */
    static #setDaysOfWeek() {
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
    static #updateDays() {
        this.monthsYearField.innerText = this.months[this.displayMonth] + " - " + this.displayYear;

        this.containerDates.innerHTML = "";

        this.#setDaysOfWeek();

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
    static #updateMonthYear() {
        this.daysInMonth = new Date(this.displayYear, this.displayMonth + 1, 0).getDate();
        this.firstDay = new Date(this.displayYear, this.displayMonth, 1).getDay();
        this.previousMonthDays = new Date(this.displayYear, this.displayMonth, 0).getDate();

        this.#updateDays();
    }

    /**
     * Increase the display month
     */
    static #plusMonth() {
        this.displayMonth++;

        if (this.displayMonth > 11) {
            this.displayMonth = 0;
            this.displayYear++;
        }

        this.#updateMonthYear();
    }

    /**
     * Decreases the display month
     */
    static #minusMonth() {
        this.displayMonth--;

        if (this.displayMonth < 0) {
            this.displayMonth = 11;
            this.displayYear--;
        }

        this.#updateMonthYear();
    }

    /**
     * Change calendar visibility
     */
    static #switchCalendarVisibility() {
        this.calendarVisible = !this.calendarVisible;

        if (this.calendarVisible) {
            this.calendarContainer.style.display = "flex";
            this.#resetDay();
        } else {
            this.calendarContainer.style.display = "none";
        }
    }

    /**
     * Resets the display date to the current month
     */
    static #resetDay() {
        this.displayMonth = this.now.getMonth();
        this.displayYear = this.now.getFullYear();

        this.#updateMonthYear();
    }
}