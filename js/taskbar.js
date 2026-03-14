const startButton = document.getElementById("taskbaer-start-button");
const caledar = document.getElementById("taskbar-calendar");
const clock = document.getElementById("taskbar-clock");

function timeFormat(date) {
    let hours = date?.getHours();
    let minutes = date?.getMinutes();

    hours = hours.toString().padStart(2, "0");
    minutes = minutes.toString().padStart(2, "0");

    return hours + ":" + minutes
}

function updateTime() {
    const dateTime = new Date();
    const formattedTime = timeFormat(dateTime);

    clock.innerText = formattedTime;

    setTimeout(updateTime, 1000);
}

updateTime();
