import { SysBoot } from "../components/sysBoot/bootTerminal.js";

import { Taskbar } from "../components/taskbar/taskbar.js";

import { Dialog } from "../components/dialog/dialog.js";

const dialog = new Dialog(document.getElementById("desktop"));

const sysBoot = new SysBoot(document.getElementById("boot-container"));

sysBoot.startBoot();

const taskbar = await Taskbar.getTaskbar();
document.getElementById("taskbar").appendChild(taskbar);

await dialog.openDialog({ title: 'WIP', message: 'Área ainda não implementada!' });
