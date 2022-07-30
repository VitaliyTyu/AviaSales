const all = document.getElementById('all');
const zero_transfers = document.getElementById('zero_transfers');
const one_transfer = document.getElementById('one_transfer');
const two_transfers = document.getElementById('two_transfers');
const three_transfers = document.getElementById('three_transfers');
let isSortByPrice = true;
let isSortByTime = false;


try {
    getSortedTickets();
} catch (error) {
    console.log(error.message);
}

async function getTickets() {
    let options = {
        method: "GET",
        headers: {
            "Accept": "application/json"
        }
    };
    let response = await fetch('http://localhost:3000/tickets?_sort=price&_order=asc', options);
    let tickets = await response.json();

    let i = 0;
    tickets.forEach(ticket => {
        ticket.id = i;
        i++;
    });
    return tickets;
}

async function getSortedTickets() {
    let tickets = await getTickets();
    let filteredTickets = [];

    if (isSortByPrice) {
        filteredTickets = filterTickets(tickets);
    } else {
        tickets.sort((a, b) => {
            return getTicketDuration(a) - getTicketDuration(b);
        });
        filteredTickets = filterTickets(tickets);
    }

    renderTickets(filteredTickets);
}


function filterTickets(tickets) {
    let filteredTickets = [];
    if (all.checked) {
        filteredTickets = [...tickets];
    } else {
        if (zero_transfers.checked) {
            tickets.forEach(ticket => {
                if (!filteredTickets.some(elem => elem.id === ticket.id) && (ticket.segments[0].stops.length === 0 || ticket.segments[1].stops.length === 0)) {
                    filteredTickets.push(ticket);
                }
            });
        }
        if (one_transfer.checked) {
            tickets.forEach(ticket => {
                if (!filteredTickets.some(elem => elem.id === ticket.id) && (ticket.segments[0].stops.length === 1 || ticket.segments[1].stops.length === 1)) {
                    filteredTickets.push(ticket);
                }
            });
        }
        if (two_transfers.checked) {
            tickets.forEach(ticket => {
                if (!filteredTickets.some(elem => elem.id === ticket.id) && (ticket.segments[0].stops.length === 2 || ticket.segments[1].stops.length === 2)) {
                    filteredTickets.push(ticket);
                }
            });
        }
        if (three_transfers.checked) {
            tickets.forEach(ticket => {
                if (!filteredTickets.some(elem => elem.id === ticket.id) && (ticket.segments[0].stops.length === 3 || ticket.segments[1].stops.length === 3)) {
                    filteredTickets.push(ticket);
                }
            });
        }
    }

    return filteredTickets;
}

function renderTickets(tickets) {
    try {
        var myNode = document.querySelector('.tickets');
        myNode.innerHTML = '';
    } catch (error) {
        console.log(error);
    }

    for (let i = 0; i < 5; i++) {
        const element = document.createElement('div');
        element.classList.add('ticket');
        element.innerHTML = getTicketMarkup(tickets[i]);
        document.querySelector('.tickets').append(element);
    }
}

function getTicketMarkup(ticket) {
    return `<div class="ticket-wrapper">
    <div class="ticket-header">
        <div class="ticket-price">${getPriceString(ticket.price)}</div>
        <div class="company-img">
            <img src="http://pics.avs.io/99/36/${ticket.carrier}.png" alt="logo">
        </div>
    </div>

    <div class="ticket-content">
        <div class="ticket-part">
            <div class="part-name">${ticket.segments[0].origin} –
                ${ticket.segments[0].destination}</div>
            <div class="part-info">${getDate(ticket.segments[0].date,
        ticket.segments[0].duration)}</div>
        </div>
        <div class="ticket-part">
            <div class="part-name">В пути</div>
            <div class="part-info">${getDuration(ticket.segments[0].duration)}</div>
        </div>
        <div class="ticket-part">
            <div class="part-name">${getStops(ticket.segments[0].stops)}</div>
            <div class="part-info">${ticket.segments[0].stops.join(', ')}</div>
        </div>
    </div>

    <div class="ticket-content">
        <div class="ticket-part">
            <div class="part-name">${ticket.segments[1].origin} –
                ${ticket.segments[1].destination}</div>
            <div class="part-info">${getDate(ticket.segments[1].date,
            ticket.segments[1].duration)}</div>
        </div>
        <div class="ticket-part">
            <div class="part-name">В пути</div>
            <div class="part-info">${getDuration(ticket.segments[1].duration)}</div>
        </div>
        <div class="ticket-part">
            <div class="part-name">${getStops(ticket.segments[1].stops)}</div>
            <div class="part-info">${ticket.segments[1].stops.join(', ')}</div>
        </div>
    </div>
</div>
            `;
}

function getPriceString(price) {
    price = price.toString();
    return `${price.substr(0, 2)} ${price.substr(2, 5)}  Р`
}

function getDuration(duration) {
    const dHours = Math.floor((Number(duration) / 60));
    const dMin = Number(duration) - (dHours * 60);
    const durationText = `${dHours}ч ${dMin}м`;
    return durationText;
}

function getDate(date, duration) {
    var startDate = new Date(date);
    var endDate = new Date(date);
    endDate.setMinutes(endDate.getMinutes() + duration);

    return `${getTime(startDate)} - ${getTime(endDate)}`;
}

function getTime(date) {
    var hoursString = "";
    var minutesString = "";

    if (date.getUTCHours() < 10) {
        hoursString = `0${date.getUTCHours()}`;
    } else {
        hoursString = `${date.getUTCHours()}`;
    }

    if (date.getMinutes() < 10) {
        minutesString = `0${date.getMinutes()}`;
    } else {
        minutesString = `${date.getMinutes()}`;
    }

    return `${hoursString}:${minutesString}`;
}

function getStops(stops) {
    if (stops.length === 0) {
        return "Без пересадок";
    } else if (stops.length === 1) {
        return `1 пересадка`;
    } else {
        return `${stops.length} пересадки`;
    }
}


function getTicketDuration(ticket) {
    return ticket.segments[0].duration + ticket.segments[1].duration;
}


let sortByPriceButton = document.getElementById("sort_by_price");
let sortByTimeButton = document.getElementById("sort_by_time");

sortByPriceButton.onclick = () => {
    isSortByPrice = true;
    isSortByTime = false;

    getSortedTickets();

    sortByPriceButton.style.backgroundColor = "#2196F3";
    sortByPriceButton.style.color = "#fff";

    sortByTimeButton.style.backgroundColor = "#fff";
    sortByTimeButton.style.color = "#4A4A4A";

};

sortByTimeButton.onclick = () => {
    isSortByPrice = false;
    isSortByTime = true;
    getSortedTickets();

    sortByTimeButton.style.backgroundColor = "#2196F3";
    sortByTimeButton.style.color = "#fff";

    sortByPriceButton.style.backgroundColor = "#fff";
    sortByPriceButton.style.color = "#4A4A4A";

};



function resetCheckBox() {
    all.checked = true;
    zero_transfers.checked = false;
    one_transfer.checked = false;
    two_transfers.checked = false;
    three_transfers.checked = false;
}

function isChecked() {
    return all.checked ||
        zero_transfers.checked ||
        one_transfer.checked ||
        two_transfers.checked ||
        three_transfers.checked;
}

all.addEventListener('click', (event) => {
    resetCheckBox();
    getSortedTickets();
})

zero_transfers.addEventListener('click', (event) => {
    all.checked = false;
    if (!isChecked()) {
        resetCheckBox();
    }
    getSortedTickets();
})

one_transfer.addEventListener('click', (event) => {
    all.checked = false;
    if (!isChecked()) {
        resetCheckBox();
    }
    getSortedTickets();
})

two_transfers.addEventListener('click', (event) => {
    all.checked = false;
    if (!isChecked()) {
        resetCheckBox();
    }
    getSortedTickets();
})

three_transfers.addEventListener('click', (event) => {
    all.checked = false;
    if (!isChecked()) {
        resetCheckBox();
    }
    getSortedTickets();
})













