import { startBoot } from "./components/sysBoot/bootTerminal.js";
import { setStartMenuVisibility } from "./js/taskbar/start_menu.js";
import { updateTime } from "./js/taskbar/calendar-clock.js";
import { updateMonthYear, setCalendarVisibility, plusMonth, minusMonth } from "./js/taskbar/calendar.js";
import { openDialog } from "./components/dialog/dialog.js";

const restartButton = document.getElementById("restart-button");

const calendarUp = document.getElementById("calendar-button-up");
const calendarDown = document.getElementById("calendar-button-down");

startBoot();

restartButton.addEventListener("click", startBoot);

setStartMenuVisibility();

updateTime();

updateMonthYear();
setCalendarVisibility();
calendarUp.addEventListener("click", minusMonth);
calendarDown.addEventListener("click", plusMonth);


openDialog({title: 'WIP', message: 'Área ainda não implementada!'});
