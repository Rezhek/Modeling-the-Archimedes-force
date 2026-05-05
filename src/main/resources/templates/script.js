const G = 9.81;
const PI = 3.14159;
const VELOCITY = 1.0;

let forceComparisonChart, radiusDependencyChart;

// Получение ссылок на DOM-элементы
const sphereDensityInput = document.getElementById('sphereDensity');
const sphereRadiusInput = document.getElementById('sphereRadius');
const liquidDensityInput = document.getElementById('liquidDensity');
const viscosityInput = document.getElementById('viscosity');
const calcBtn = document.getElementById('calcBtn');

// Константы для шкалы колбы
const FLASK_HEIGHT_PX = 350;        // высота видимой части колбы в px
const PX_PER_METER = 400;            // соответствие пикселей метрам (из анимации)
const MAX_WATER_M = FLASK_HEIGHT_PX / PX_PER_METER; // 0.875 м
const START_LEVEL_M = 0.3;           // начальный уровень воды (h_water0)
const OVERFLOW_LEVEL_M = 0.8;        // уровень перелива (maxWaterHeightM)

// Вспомогательная функция для фильтрации ввода (только числа, пустая строка разрешена)
function validateNumberInput(e) {
    let value = e.target.value;
    value = value.replace(/[^0-9.,]/g, '').replace(/,/g, '.');
    // НЕ заменяем пустую строку на 0
    e.target.value = value;
    updateButtonState();
}

// Функция обновления состояния кнопки (активна, если все поля не пустые)
function updateButtonState() {
    const inputs = [sphereDensityInput, sphereRadiusInput, liquidDensityInput, viscosityInput];
    const allFilled = inputs.every(input => input.value.trim() !== '');
    calcBtn.disabled = !allFilled;
}

// Инициализация графиков
function initCharts() {
    forceComparisonChart = echarts.init(document.getElementById('forceComparisonChart'));
    radiusDependencyChart = echarts.init(document.getElementById('radiusDependencyChart'));
    window.addEventListener('resize', () => {
        forceComparisonChart.resize();
        radiusDependencyChart.resize();
    });
}

function updateInfoBlock() {
    const sphereDensity = parseFloat(sphereDensityInput.value) || 0;
    const sphereRadius = parseFloat(sphereRadiusInput.value) || 0;
    const liquidDensity = parseFloat(liquidDensityInput.value) || 0;

    if (sphereDensity === 0 || sphereRadius === 0 || liquidDensity === 0) {
        document.getElementById('infoState').innerHTML = '—';
        document.getElementById('infoVolume').innerHTML = '—';
        document.getElementById('infoWaterLevel').innerHTML = '—';
        return;
    }

    const V_ball = (4/3) * PI * Math.pow(sphereRadius, 3);
    const r_flask = 0.15;
    const A_flask = PI * r_flask * r_flask;
    const h_water0 = 0.3;
    const V_water0 = h_water0 * A_flask;

    let stateText = '';
    let volumeFormulaText = '';
    let waterFormulaText = '';

    // Вычисляем погружённый объём и сырой уровень воды
    let V_sub;
    if (sphereDensity >= liquidDensity) {
        stateText = 'Шар тонет';
        V_sub = V_ball;
        volumeFormulaText = `V<sub>погр</sub> = V<sub>ш</sub> = ${V_sub.toFixed(3)} м³`;
    } else {
        stateText = 'Шар плавает';
        V_sub = (sphereDensity / liquidDensity) * V_ball;
        volumeFormulaText = `V<sub>погр</sub> = <span class="frac"><span class="frac-num">ρ<sub>ш</sub></span><span class="frac-den">ρ<sub>ж</sub></span></span> · V<sub>ш</sub> = ${V_sub.toFixed(3)} м³`;
    }

    let h_water = (V_water0 + V_sub) / A_flask;
    const OVERFLOW = 0.8; // максимальный уровень воды в колбе

    if (h_water > OVERFLOW) {
        // Перелив – корректируем уровень и выводим предупреждение
        h_water = OVERFLOW;
        stateText += ' (перелив)';
        waterFormulaText = `Уровень воды достиг максимума.<br>Часть воды вытекла.`;
    } else {
        // Нормальный уровень – красивая формула с дробью
        waterFormulaText = `h<sub>воды</sub> = <span class="frac"><span class="frac-num">V<sub>воды0</sub> + V<sub>погр</sub></span><span class="frac-den">S<sub>колбы</sub></span></span> = ${h_water.toFixed(3)} м`;
    }

    document.getElementById('infoState').innerHTML = stateText;
    document.getElementById('infoVolume').innerHTML = volumeFormulaText;
    document.getElementById('infoWaterLevel').innerHTML = waterFormulaText;
}

// Основные вычисления и обновление таблицы/графиков
function calculate() {
    // Кнопка заблокирована – расчёт не выполняется (защита)
    if (calcBtn.disabled) return;

    const sphereDensity = parseFloat(sphereDensityInput.value) || 0;
    const sphereRadius = parseFloat(sphereRadiusInput.value) || 0;
    const liquidDensity = parseFloat(liquidDensityInput.value) || 0;
    const viscosity = parseFloat(viscosityInput.value) || 0;

    const volume = (4/3) * PI * Math.pow(sphereRadius, 3);
    const mass = sphereDensity * volume;
    const gravityForce = mass * G;
    const archimedesForce = liquidDensity * volume * G;
    const stokesForce = 6 * PI * viscosity * sphereRadius * VELOCITY;

    // Обновление таблицы
    document.getElementById('sphereVolume').textContent = volume.toFixed(6);
    document.getElementById('sphereMass').textContent = mass.toFixed(3);
    document.getElementById('displaySphereDensity').textContent = sphereDensity.toFixed(2);
    document.getElementById('displayLiquidDensity').textContent = liquidDensity.toFixed(2);
    document.getElementById('displayRadius').textContent = sphereRadius.toFixed(3);
    document.getElementById('displayViscosity').textContent = viscosity.toFixed(4);

    updateForceComparisonChart(gravityForce, archimedesForce, stokesForce);
    updateRadiusDependencyChart();
    updateInfoBlock();   // обновляем текстовый блок
}

// Обновление столбчатой диаграммы
function updateForceComparisonChart(gravityForce, archimedesForce, stokesForce) {
    const maxValue = Math.max(gravityForce, archimedesForce, stokesForce);
    const yAxisMax = maxValue > 0 ? Math.ceil(maxValue * 1.3) : 10;

    const option = {
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'axis',
            formatter: params => params[0].name + ': ' + params[0].value.toFixed(2) + ' Н'
        },
        grid: { left: '8%', right: '5%', bottom: '8%', top: '15%' },
        xAxis: {
            type: 'category',
            data: ['Сила тяжести', 'Сила Архимеда', 'Сила Стокса'],
            axisLabel: { fontSize: 10, color: '#aaa' },
            axisLine: { lineStyle: { color: '#3a3a4a' } }
        },
        yAxis: {
            type: 'value',
            name: 'Н',
            min: 0,
            max: yAxisMax,
            nameTextStyle: { color: '#aaa' },
            axisLabel: {
                color: '#aaa',
                formatter: val => val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val.toFixed(1)
            },
            splitLine: { lineStyle: { color: '#2a2a35' } }
        },
        series: [{
            type: 'bar',
            data: [gravityForce, archimedesForce, stokesForce].map(v => parseFloat(v.toFixed(2))),
            itemStyle: {
                color: params => ['#ff6b6b', '#4ecdc4', '#ffe66d'][params.dataIndex]
            },
            label: {
                show: true,
                position: 'top',
                formatter: params => params.value.toFixed(2) + ' Н',
                fontSize: 9,
                color: '#ddd'
            },
            barWidth: '50%'
        }]
    };
    forceComparisonChart.setOption(option, true);
}

// Обновление графика зависимости от радиуса
function updateRadiusDependencyChart() {
    const sphereDensity = parseFloat(sphereDensityInput.value) || 1000;
    const liquidDensity = parseFloat(liquidDensityInput.value) || 1000;
    const viscosity = parseFloat(viscosityInput.value) || 0.001;

    const radii = [0.05, 0.1, 0.15, 0.2, 0.25, 0.3];
    const gravityData = [];
    const archimedesData = [];
    const stokesData = [];

    radii.forEach(r => {
        const volume = (4/3) * PI * Math.pow(r, 3);
        const mass = sphereDensity * volume;
        gravityData.push(mass * G);
        archimedesData.push(liquidDensity * volume * G);
        stokesData.push(6 * PI * viscosity * r * VELOCITY);
    });

    const allValues = [...gravityData, ...archimedesData, ...stokesData];
    const maxY = Math.max(...allValues) * 1.2;

    const option = {
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'axis',
            formatter: params => {
                let result = params[0].name + '<br/>';
                params.forEach(p => {
                    result += p.marker + p.seriesName + ': ' + p.value.toFixed(2) + ' Н<br/>';
                });
                return result;
            }
        },
        legend: {
            data: ['Сила тяжести', 'Сила Архимеда', 'Сила Стокса'],
            bottom: 5,
            textStyle: { fontSize: 9, color: '#aaa' }
        },
        grid: { left: '8%', right: '5%', bottom: '22%', top: '10%' },
        xAxis: {
            type: 'category',
            data: radii.map(r => r + ' м'),
            axisLabel: { fontSize: 9, color: '#aaa' },
            axisLine: { lineStyle: { color: '#3a3a4a' } }
        },
        yAxis: {
            type: 'value',
            name: 'Н',
            min: 0,
            max: maxY,
            nameTextStyle: { color: '#aaa' },
            axisLabel: {
                color: '#aaa',
                formatter: val => val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val.toFixed(1)
            },
            splitLine: { lineStyle: { color: '#2a2a35' } }
        },
        series: [
            { name: 'Сила тяжести', type: 'line', data: gravityData, smooth: true, itemStyle: { color: '#ff6b6b' }, symbolSize: 5 },
            { name: 'Сила Архимеда', type: 'line', data: archimedesData, smooth: true, itemStyle: { color: '#4ecdc4' }, symbolSize: 5 },
            { name: 'Сила Стокса', type: 'line', data: stokesData, smooth: true, itemStyle: { color: '#ffe66d' }, symbolSize: 5 }
        ]
    };
    radiusDependencyChart.setOption(option, true);
}

// Функция поиска высоты погружения сегмента шара
function solveH(V, R) {
    if (V <= 0) return 0;
    const V_total = (4/3) * PI * Math.pow(R, 3);
    if (V >= V_total) return 2 * R;
    let low = 0, high = 2 * R;
    for (let i = 0; i < 50; i++) {
        const mid = (low + high) / 2;
        const V_mid = (PI / 3) * mid * mid * (3 * R - mid);
        if (V_mid < V) low = mid;
        else high = mid;
    }
    return (low + high) / 2;
}

// Анимация погружения и уровня воды
function startSimulation() {
    if (calcBtn.disabled) return;

    const sphereDensity = parseFloat(sphereDensityInput.value) || 1000;
    const sphereRadius = parseFloat(sphereRadiusInput.value) || 0.1;
    const liquidDensity = parseFloat(liquidDensityInput.value) || 1000;

    const V_ball = (4/3) * PI * Math.pow(sphereRadius, 3);
    const mass = sphereDensity * V_ball;

    const r_flask = 0.15;
    const A_flask = PI * r_flask * r_flask;
    const h_water0 = 0.3;
    const V_water0 = h_water0 * A_flask;
    const pxPerMeter = 400;
    const maxWaterHeightM = 0.8;

    let V_sub, h_water, bottomBallM;
    let isOverflow = false;

    if (sphereDensity > liquidDensity) {
        V_sub = V_ball;
        h_water = (V_water0 + V_ball) / A_flask;
        if (h_water > maxWaterHeightM) {
            h_water = maxWaterHeightM;
            isOverflow = true;
        }
        bottomBallM = 0;
    } else {
        V_sub = mass / liquidDensity;
        if (V_sub > V_ball) V_sub = V_ball;
        h_water = (V_water0 + V_sub) / A_flask;
        if (h_water > maxWaterHeightM) {
            h_water = maxWaterHeightM;
            isOverflow = true;
        }
        const h_sub = solveH(V_sub, sphereRadius);
        bottomBallM = h_water - h_sub;
        if (bottomBallM < 0) bottomBallM = 0;
    }

    let waterHeightPx = h_water * pxPerMeter;
    let ballBottomPx = bottomBallM * pxPerMeter;
    const maxWaterPx = 350;
    const maxBallBottomPx = 420;
    if (waterHeightPx > maxWaterPx) waterHeightPx = maxWaterPx;
    if (ballBottomPx > maxBallBottomPx) ballBottomPx = maxBallBottomPx;

    const water = document.getElementById('waterLevel');
    const ball = document.getElementById('ball');
    const overflowArrows = document.getElementById('overflowArrows');

    // Сброс анимаций
    ball.style.transition = 'none';
    water.style.transition = 'none';
    water.style.height = '120px';
    ball.style.bottom = '400px';
    ball.style.filter = 'none';
    overflowArrows.classList.remove('active');
    void water.offsetHeight;

    // Падение шара к поверхности
    ball.style.transition = 'bottom 1.5s ease-in-out';
    ball.style.bottom = '120px';

    // Подъём воды и окончательное погружение
    setTimeout(() => {
        water.style.transition = 'height 1.5s ease-in-out';
        ball.style.transition = 'bottom 1.5s ease-in-out, filter 1.5s ease-in-out';
        water.style.height = waterHeightPx + 'px';
        ball.style.bottom = ballBottomPx + 'px';

        if (isOverflow) overflowArrows.classList.add('active');
        else overflowArrows.classList.remove('active');

        const ballDiameterPx = 80;
        const submergedPx = Math.max(0, waterHeightPx - ballBottomPx);
        let fraction = Math.min(1, submergedPx / ballDiameterPx);
        if (fraction < 0) fraction = 0;

        if (fraction > 0.01) {
            ball.style.filter = `brightness(${1 - fraction * 0.5}) saturate(${1 - fraction * 0.3}) hue-rotate(${fraction * 15}deg)`;
        } else {
            ball.style.filter = 'none';
        }
    }, 1500);
}

// Общий обработчик (расчёт + анимация)
function calculateAndSimulate() {
    if (calcBtn.disabled) return;
    calculate();
    startSimulation();
}

// Создание белой шкалы на колбе
function createScale() {
    const wrapper = document.getElementById('scaleWrapper');
    if (!wrapper) return;

    // Очищаем
    wrapper.innerHTML = '';
    const scaleDiv = document.createElement('div');
    scaleDiv.className = 'scale';

    // Генерируем значения от 0 до MAX_WATER_M с шагом 0.05
    const step = 0.05;
    const values = [];
    for (let val = 0; val <= MAX_WATER_M + 0.001; val += step) {
        values.push(parseFloat(val.toFixed(3)));
    }
    // Убеждаемся, что последнее значение равно MAX_WATER_M (0.875)
    if (Math.abs(values[values.length-1] - MAX_WATER_M) > 0.01) {
        values.push(MAX_WATER_M);
    }

    values.forEach(value => {
        const item = document.createElement('div');
        item.className = 'scale-item';

        const tick = document.createElement('div');
        tick.className = 'scale-tick';

        const label = document.createElement('span');
        label.className = 'scale-label';
        // Отображаем с одним десятичным знаком, но для 0.875 покажем как 0.88 или 0.875
        let displayValue = value.toFixed(2);
        if (value === MAX_WATER_M) displayValue = value.toFixed(3); // 0.875
        label.textContent = displayValue + ' м';

        // Выделение начального уровня и уровня перелива
        if (Math.abs(value - START_LEVEL_M) < 0.005) {
            label.classList.add('highlight');
        }
        if (Math.abs(value - OVERFLOW_LEVEL_M) < 0.005) {
            label.classList.add('highlight');
        }

        item.appendChild(tick);
        item.appendChild(label);
        scaleDiv.appendChild(item);
    });

    wrapper.appendChild(scaleDiv);
}

// Добавление слушателей событий
function bindEvents() {
    sphereDensityInput.addEventListener('input', validateNumberInput);
    sphereRadiusInput.addEventListener('input', validateNumberInput);
    liquidDensityInput.addEventListener('input', validateNumberInput);
    viscosityInput.addEventListener('input', validateNumberInput);
    calcBtn.addEventListener('click', calculateAndSimulate);
    // Первоначальное состояние кнопки
    updateButtonState();
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    initCharts();
    bindEvents();
    createScale();          // создаём шкалу колбы
    calculate();           // запускаем расчёт начальных значений
});