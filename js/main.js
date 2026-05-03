import { SysBoot } from "../components/sysBoot/bootTerminal.js";

import { loadTaskbar, updateTime } from "../components/taskbar/taskbar.js";

import { Dialog } from "../components/dialog/dialog.js";

const dialog = new Dialog(document.getElementById("desktop"));

let clock = null;

const sysBoot = new SysBoot(document.getElementById("boot-container"));

sysBoot.startBoot();

await loadTaskbar();
clock = document.getElementById("taskbar-clock");

updateTime(clock);

await dialog.openDialog({title: 'WIP', message: 'Área ainda não implementada!'});
