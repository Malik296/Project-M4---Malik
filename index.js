window.addEventListener('load', startApplication);
let inputList;

// Хранители обектов выбранных валют
let leftValyutData;
let rightValyutData;


let leftList;
let rightList;

// Старт приложения
function startApplication() {
    leftList = document.querySelectorAll('.left-list li');
    rightList = document.querySelectorAll('.right-list li');

    // Добавление слушателя инпутам
    inputList = document.querySelectorAll('.input-container-div input');
    inputList[0].addEventListener('input', firstInput);
    inputList[1].addEventListener('input', secondInput);

    // Добавление слушателя кнопки позиции
    let chanceButton = document.querySelector('.position-button');
    chanceButton.addEventListener('click', chancePosition);

    // Вызов фукции для добавление слушателя для основного списка валют
    addListenerForList(leftList, rightList);

    // Слушатели для стрелки вападающего списка
    let arrowDownLeft = leftList[4].querySelector('.select-span')
    arrowDownLeft.addEventListener('click', openCurrenciesDiv);

    let arrowDownRight = rightList[4].querySelector('.select-span')
    arrowDownRight.addEventListener('click', openCurrenciesDiv);

    // Добавление слушателей для валют с выпадающего списка
    setListenerForValyutaTypes();
}

function addListenerForList(leftList, rightList) {
    let addListener = (list) => {
        list.forEach(element => {
            element.addEventListener('click', () => {
                let elements = element.parentNode.children;

                for (let i = 0; i < elements.length; i++) {
                    elements[i].classList.remove('active-list');
                }
                element.classList.add('active-list');
                getValutasData();
            })
        });
    }
    addListener(leftList);
    addListener(rightList);

    getValutasData();
}
//=========================================================================================

// Определения выбранных валют и обновления данных
function getValutasData() {
    let leftList = document.querySelectorAll('.left-list li');
    let rightList = document.querySelectorAll('.right-list li');

    let leftValType = findValType(leftList);
    let rightValType = findValType(rightList);

    updateData(leftValType, rightValType);
}

/*********************************************************************************** */

// Функция для получения данных с URL
function updateData(firstUrl, secondUrl) {
    let urls = [
        `https://api.ratesapi.io/api/latest?base=${firstUrl}&symbols=${secondUrl}`,
        `https://api.ratesapi.io/api/latest?base=${secondUrl}&symbols=${firstUrl}`
    ];

    let requests = urls.map(url => fetch(url));
    document.querySelector('#load-div').style.display = 'flex';

    Promise.all(requests)
        .then(responses => {
            Promise.all([responses[0].json(), responses[1].json()])
                .then(datas => {
                    leftValyutData = datas[0];
                    rightValyutData = datas[1];

                    chanceBottomInfo(inputList[0]);
                    chanceBottomInfo(inputList[1]);

                    setDataToInput(inputList[1], inputList[0].value, leftValyutData.rates);
                });
        })
        .catch(() => alert('Что-то пошло не так'))
        .finally(respons => document.querySelector('#load-div').style.display = 'none');
}

/*********************************************************************************** */
// Функция для определеия выбранной валюты из списка
function findValType(listLi) {
    let vlt = '';

    listLi.forEach((element) => {
        if (element.classList.contains('active-list')) {
            vlt = element.children[0].innerText;
        }
    });
    return vlt;
}


//==========================================================================================================

// Функция для записи результата в инпут
function setDataToInput(input, correctInput, getRate) {
    if (correctInput == 0) {
        input.value = '';
    } else {
        input.value = (correctInput * getRate[Object.keys(getRate)[0]]).toFixed(2);
    }
}

// Вызов первого инпута
function firstInput(e) {
    let element = e.target;
    let str = element.value;

    let correctInput = checkCorrectImput(str);
    let setCorretct = () => {
        let getRate = leftValyutData.rates;

        e.target.value = correctInput;
        setDataToInput(inputList[1], correctInput, getRate);
    }

    setTimeout(setCorretct, 70);
}

// Вызов второго инпута
function secondInput(e) {
    let element = e.target;
    let str = element.value;

    let correctInput = checkCorrectImput(str);
    let setCorretct = () => {
        e.target.value = correctInput;
        let getRate = rightValyutData.rates;

        setDataToInput(inputList[0], correctInput, getRate);
    }
    setTimeout(setCorretct, 70);
}


// Проверка и корректировка введенных данных
function checkCorrectImput(str) {
    let finalAmount = '';
    let dot = true;

    for (let i = 0; i < str.length; i++) {
        if (i == 0 && (str[i] == '.' || str[i] == ',')) {
            finalAmount += ''
        } else if ((str[i] == '.' || str[i] == ',') && dot) {
            finalAmount += str[i];
            dot = false;
        } else if (!isNaN(str[i])) {
            finalAmount += str[i];
        }
    }
    return finalAmount.replace(',', '.');
}

//=======================================================================


// Переключатель валют
function chancePosition() {
    for (let i = 0; i < leftList.length; i++) {
        let firstelEmetClass = leftList[i].className;
        let secondEmetClass = rightList[i].className;

        leftList[i].className = '';
        rightList[i].className = '';

        if (secondEmetClass != '') {
            leftList[i].classList.add(secondEmetClass);
        }
        if (firstelEmetClass != '') {
            rightList[i].classList.add(firstelEmetClass);
        }
    }

    let val = leftList[4].children[0].innerText;

    leftList[4].children[0].innerText = rightList[4].children[0].innerText;
    rightList[4].children[0].innerText = val;

    let copyData = { ...leftValyutData };
    leftValyutData = '';
    leftValyutData = { ...rightValyutData };
    rightValyutData = '';
    rightValyutData = copyData;
    setDataToInput(inputList[1], inputList[0].value, leftValyutData.rates);

    chanceBottomInfo(inputList[0]);
    chanceBottomInfo(inputList[1]);
}

//==================================================================================

function chanceBottomInfo(input) {
    let container = input.parentNode;
    let childContainer = container.children;
    if (childContainer[1].classList.contains('left-p')) {
        let getRate = leftValyutData.rates;
        childContainer[1].innerText = `1 ${leftValyutData.base} = ${getRate[Object.keys(getRate)[0]]} ${Object.keys(getRate)[0]}`;
    } else {
        let getRate = rightValyutData.rates;
        childContainer[1].innerText = `1 ${rightValyutData.base} = ${getRate[Object.keys(getRate)[0]]} ${Object.keys(getRate)[0]}`;
    }
}

//================================================================================

// Функция выпадающяго списка
function openCurrenciesDiv(e) {
    e.preventDefault();
    if (e.target.classList.contains('arrow-active')) {
        closeCurrenciesDivTime();
        return null;
    }

    e.target.classList.add('arrow-active')
    let valyutaListContainer = document.querySelector('.valyuta-list-container');
    valyutaListContainer.classList.add('hidden');

    let closeValyutasDiv = () => {
        valyutaListContainer.classList.remove('hidden');
        e.target.classList.remove('arrow-active');
        document.removeEventListener('click', closeCurrenciesDivTime, true);
    }

    let closeCurrenciesDivTime = () => {
        setTimeout(closeValyutasDiv, 50);
    }
    document.addEventListener('click', closeCurrenciesDivTime, true);
}

//=================================================================================

function setListenerForValyutaTypes() {
    let popupValList = document.querySelectorAll('.valyuta-type-div');

    popupValList.forEach((valyuta) => {
        valyuta.addEventListener('click', setValToMainList);
    })
}

// Вставка выбранной валюты в основной список
function setValToMainList(event) {
    let typeCont = event.target.parentNode;
    let type = typeCont.querySelector('.valyuta-type');
    console.log(type.innerText);

    let leftSelect = leftList[4].querySelector('.select-span').classList;

    if (leftSelect.contains('arrow-active')) {
        leftList[4].children[0].innerText = type.innerText;
    } else {
        rightList[4].children[0].innerText = type.innerText;
    }

    getValutasData();
}