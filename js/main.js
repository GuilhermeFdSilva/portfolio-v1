import { SysBoot } from "../components/sysBoot/bootTerminal.js";
import { SessionScreem } from "../components/sessionScreem/sessionScreem.js";
import { Taskbar } from "../components/taskbar/taskbar.js";
import { Dialog } from "../components/dialog/dialog.js";

const sysBoot = await SysBoot.getSysBoot(document.getElementById("boot-container"));
const sessionScreem = await SessionScreem.getSessionScreem(document.getElementById("session-container"));

const dialog = new Dialog(document.getElementById("desktop"));

sysBoot.startBoot();

const taskbar = await Taskbar.getTaskbar();
document.getElementById("taskbar").appendChild(taskbar);

await dialog.openDialog({ title: 'WIP', message: 'Área ainda não implementada!' });
