import { startBoot } from "../components/sysBoot/bootTerminal.js";
import { loadTaskbar, updateTime } from "../components/taskbar/taskbar.js";
import { openDialog } from "../components/dialog/dialog.js";    

const restartButton = document.getElementById("restart-button");

const calendarUp = document.getElementById("calendar-button-up");
const calendarDown = document.getElementById("calendar-button-down");

let clock = null;

startBoot();

await loadTaskbar();
clock = document.getElementById("taskbar-clock");

updateTime(clock);

openDialog({title: 'WIP', message: 'Área ainda não implementada!'});
