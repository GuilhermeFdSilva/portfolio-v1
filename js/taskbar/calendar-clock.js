/** HTML Elements */
const clock = document.getElementById("taskbar-clock");

/** Adjust the time to the desired format */
function timeFormat(date) {
    let hours = date?.getHours();
    let minutes = date?.getMinutes();

    hours = hours.toString().padStart(2, "0");
    minutes = minutes.toString().padStart(2, "0");

    return hours + ":" + minutes
}

/** Updates the time regularly */
function updateTime() {
    const dateTime = new Date();
    const formattedTime = timeFormat(dateTime);

    clock.innerText = formattedTime;

    setTimeout(updateTime, 1000);
}

/** Initial calls */
updateTime();
