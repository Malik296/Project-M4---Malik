window.addEventListener('load', activateChartButton);

const _YEARS = 10;
const _MONTHS = 12;
const _DAYS = 30;

let leftListChart;
let rightListChart;

let constDateType;

let leftCurrency;
let rightCurrency;

let dataObjectArray = [];

function activateChartButton() {
    let chartButton = document.querySelector('.type-container-div img');
    chartButton.addEventListener('click', runfunction);
}

function runfunction() {
    let chartBackground = document.querySelector('.chart-background-div');
    chartBackground.className += ' visible-chart fadeIn';
    chartBackground.firstElementChild.className += ' flipInX';

    document.addEventListener('click', closeChartPopup, true);

    leftListChart = document.querySelectorAll('.left-list li');
    rightListChart = document.querySelectorAll('.right-list li');

    leftCurrency = findValTypeChart(leftListChart);
    rightCurrency = findValTypeChart(rightListChart);

    let dateList = document.querySelectorAll('.list-chart-div li');
    addListenerToList(dateList);

    setUrlToFetch(30);
}

function closeChartPopup(event) {
    if (event.target.matches('rect') || event.target.matches('path') || event.target.matches('li') || event.target.matches('circle')) {
        // alert('??????????');
    } else {
        closeChartDiv();
        document.removeEventListener('click', closeChartPopup, true);
    }
}

function closeChartDiv() {
    chanceToDefaulActiveButton()

    setTimeout(() => {
        let chartBackground = document.querySelector('.chart-background-div');
        chartBackground.classList.remove('visible-chart', 'fadeIn');
        chartBackground.firstElementChild.classList.remove('flipInX');
    
        let dateList = document.querySelectorAll('.list-chart-div li');
        removeListenerToList(dateList);
    },0);
}

function addListenerToList(list) {
    list.forEach(element => {
        element.addEventListener('click', getDateType);
    })
}

function removeListenerToList(list) {
    list.forEach(element => {
        element.removeEventListener('click', getDateType);
    })
}

function getDateType(e) {
    chanceActiveButton(e);
    constDateType = '';
    let dateType = e.target.innerText;
    let loopType;
    if (dateType == 'Год') {
        constDateType = 'year';
        loopType = _YEARS;
    } else if (dateType == 'Месяц') {
        constDateType = 'month';
        loopType = _MONTHS;
    } else {
        constDateType = 'days';
        loopType = _DAYS;
    }

    setUrlToFetch(loopType);
}

function chanceActiveButton(event) {
    let liElements = event.target.parentNode.children;

    for (let i = 0; i < liElements.length; i++) {
        liElements[i].classList.remove('active-list');
    }
    event.target.classList.add('active-list');
}

function chanceToDefaulActiveButton() {
    let dateList = document.querySelectorAll('.list-chart-div li');
    for (let i = 0; i < dateList.length; i++) {
        dateList[i].classList.remove('active-list');
    }
    dateList[2].classList.add('active-list');
}

async function setUrlToFetch(loopType) {
    dataObjectArray = [];

    let copyDate = constDateType;
    let d = new Date();

    for (let i = 0; i < loopType; i++) {
        // let dateForUrl = createrDateForUrl(d);
        let yyyy;;
        let mm;
        let dd;
        if (constDateType == 'month') {
            d.setMonth(d.getMonth() - 1);
            yyyy = d.getFullYear();
            mm = d.getMonth() + 1;
            dd = '01';
        } else if (constDateType == 'year') {
            d.setFullYear(d.getFullYear() - 1);
            yyyy = d.getFullYear();
            mm = '01';
            dd = '01';
        } else {
            d.setDate(d.getDate() - 1);
            yyyy = d.getFullYear();
            mm = d.getMonth() + 1;
            dd = d.getDate();
        }
        await fetch(`https://api.ratesapi.io/api/${yyyy}-${mm}-${dd}?base=${leftCurrency}&symbols=${rightCurrency}`)
            .then(result => result.json())
            .then(data => dataObjectArray.push(data));
    }
    console.log(dataObjectArray);
    preparationDataForLaunch()
}

function preparationDataForLaunch() {
    // Load the Visualization API and the corechart package.
    google.charts.load('current', { 'packages': ['corechart'] });

    // Set a callback to run when the Google Visualization API is loaded.
    google.charts.setOnLoadCallback(drawChart);
}

function findValTypeChart(listLi) {
    let vlt = '';

    listLi.forEach((element) => {
        if (element.classList.contains('active-list')) {
            vlt = element.children[0].innerText;
        }
    });
    return vlt;
}

function correctorDate(dataObj) {
    if (constDateType == 'month') {
        let arrDate = dataObj.split('-')

        const date = new Date(arrDate[0], arrDate[1] - 1, arrDate[2]);
        const month = date.toLocaleString('default', { month: 'long' });
        return month;
    } else if (constDateType == 'year') {
        let yearSlice = dataObj.slice(0, 4);
        return yearSlice;
    } else {
        let daySlice = dataObj.slice(8, 10);
        return daySlice;
    }
}

// Callback that creates and populates a data table,
// instantiates the pie chart, passes in the data and
// draws it.
function drawChart() {

    let arrayData = [];
    dataObjectArray.forEach((dataObj) => {
        let corectDate = correctorDate(dataObj.date);
        arrayData.push([corectDate, dataObj.rates[Object.keys(dataObj.rates)[0]]]);
    })

    arrayData.reverse();

    arrayData.unshift(['Дата', 'Курс']);

    // Create the data table.
    var data = google.visualization.arrayToDataTable(
        arrayData
    );

    // Set chart options
    var options = {
        title: 'Company Performance',
        animation: {
            startup: true,
            duration: 1000,
            easing: 'out',
        },
        hAxis: { title: constDateType, titleTextStyle: { color: '#333' } },
        vAxis: { minValue: 0 }
    };

    // var options_fullStacked = {
    //     isStacked: 'relative',
    //     height: 300,
    //     legend: { position: 'top', maxLines: 3 },
    //     vAxis: {
    //         minValue: 0,
    //         ticks: [0, .3, .6, .9, 1]
    //     }
    // };

    // Instantiate and draw our chart, passing in some options.
    var chart = new google.visualization.AreaChart(document.getElementById('chart_div'));
    chart.draw(data, options);
}