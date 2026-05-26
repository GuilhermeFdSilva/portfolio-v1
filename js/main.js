import { SysBoot } from "../components/sysBoot/bootTerminal.js";

import { Taskbar } from "../components/taskbar/taskbar.js";

import { Dialog } from "../components/dialog/dialog.js";

import { SessionScreem } from "../components/sessionScreem/sessionScreem.js";

const dialog = new Dialog(document.getElementById("desktop"));

const sysBoot = new SysBoot(document.getElementById("boot-container"));

sysBoot.startBoot();

const sessionScreem = await SessionScreem.getSessionScreem();
await document.body.appendChild(sessionScreem);

if (true) {
    

    const taskbar = await Taskbar.getTaskbar();
    document.getElementById("taskbar").appendChild(taskbar);

    await dialog.openDialog({title: 'WIP', message: 'Área ainda não implementada!'});
}
