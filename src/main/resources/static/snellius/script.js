(function() {
    const canvas = document.getElementById('opticsCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2.0;
    const centerY = canvas.height / 2.0;
    const rayLength = 250.0;

    let currentLang = 'ru';
    let isErrorMode = false;
    let isTypingReport = false; // Блокировка кнопок во время печати
    //TODO установить погрешность для прибора с классом точночсти
    let systematicError = 0.5;
    let measurements = [];
    let maxExperiments = 5;     // По умолчанию храним 5 последних опытов
    let currentT = 2.78;        // t для n=5, P=0.95
    let currentP = 0.95;

    const dictionary = {
        en: {
            title: "OptiLab Simulator",
            med1: "Medium 1 (n₁)",
            med2: "Medium 2 (n₂)",
            angle: "Incidence Angle",
            result: "Measured Angle",
            reflect: "TOTAL REFLECTION",
            notebook: "Laboratory Log",
            saveBtn: "Record Result",
            reportBtn: "Generate Report",
            device: "Measuring Device:",
            report: {
                init: "▶ REPORT INITIALIZATION...",
                sample: "Sample",
                mean: "1. Mean value:",
                deviation: "2. Std Deviation:",
                coeff: "3. Student's coeff:",
                randErr: "4. Random error:",
                systErr: "5. Systematic error:",
                totalErr: "6. Total error:",
                conclusion: "CONCLUSION:"
            }
        },
        ru: {
            title: "OptiLab",
            med1: "Среда 1 (n₁)",
            med2: "Среда 2 (n₂)",
            angle: "Угол падения",
            result: "Измеренный угол",
            reflect: "ПОЛНОЕ ОТРАЖЕНИЕ",
            notebook: "Лабораторный журнал",
            saveBtn: "Записать результат",
            reportBtn: "Сгенерировать отчет",
            device: "Измерительный прибор:",
            report: {
                init: "▶ ИНИЦИАЛИЗАЦИЯ ОТЧЕТА...",
                sample: "Выборка",
                mean: "1. Среднее значение:",
                deviation: "2. Среднеквадратичное отклонение:",
                coeff: "3. Табличный коэффициент:",
                randErr: "4. Случайная погрешность:",
                systErr: "5. Систематическая погрешность:",
                totalErr: "6. Полная погрешность:",
                conclusion: "ВЫВОД:"
            }
        },
        de: {
            title: "OptiLab Simulator",
            med1: "Medium 1 (n₁)",
            med2: "Medium 2 (n₂)",
            angle: "Einfallswinkel",
            result: "Gemessener Winkel",
            reflect: "TOTALREFLEXION",
            notebook: "Laborbuch",
            saveBtn: "Ergebnis запис",
            reportBtn: "Bericht erstellen",
            device: "Messgerät:",
            report: {
                init: "▶ BERICHT-INITIALISIERUNG...",
                sample: "Stichprobe",
                mean: "1. Mittelwert:",
                deviation: "2. Standardabweichung:",
                coeff: "3. Student-Faktor:",
                randErr: "4. Zufälliger Fehler:",
                systErr: "5. Systematischer Fehler:",
                totalErr: "6. Gesamtfehler:",
                conclusion: "FAZIT:"
            }
        }
    };

    const studentData = {
        probabilities: [0.5, 0.6, 0.7, 0.8, 0.9, 0.95, 0.98, 0.99, 0.995, 0.999],
        values: {
            2: [1.00, 1.38, 1.96, 3.08, 6.31, 12.71, 31.82, 63.66, 127.3, 636.6],
            3: [0.82, 1.06, 1.39, 1.89, 2.92, 4.30, 6.96, 9.92, 14.09, 31.60],
            4: [0.76, 0.98, 1.25, 1.64, 2.35, 3.18, 4.54, 5.84, 7.45, 12.92],
            5: [0.74, 0.94, 1.19, 1.53, 2.13, 2.78, 3.75, 4.60, 5.60, 8.61],
            6: [0.73, 0.92, 1.16, 1.48, 2.01, 2.57, 3.36, 4.03, 4.77, 6.87],
            7: [0.71, 0.90, 1.13, 1.44, 1.94, 2.45, 3.14, 3.71, 4.32, 5.96],
            8: [0.71, 0.89, 1.11, 1.41, 1.89, 2.36, 3.00, 3.50, 4.03, 5.41],
            9: [0.70, 0.88, 1.10, 1.40, 1.86, 2.31, 2.90, 3.36, 3.83, 5.04],
            10: [0.70, 0.88, 1.09, 1.38, 1.83, 2.26, 2.82, 3.25, 3.69, 4.78]
        }
    };

    function updateSystematicError() {
        const select = document.getElementById('systErrorSelect');
        systematicError = parseFloat(select.value) / 2;

        document.getElementById('divisionValue').innerText =
            `Текущая погрешность прибора (Δsyst): ±${systematicError}°`;

        measurements = [];

        const calcDiv = document.getElementById('errorCalculations');
        calcDiv.innerHTML = `<p style="color: #ffa500;">Прибор изменен. Данные сброшены. Требуются новые замеры.</p>`;

        updateNotebookUI();
        updateSimulation();
    }

    function selectT(t, p, n) {
        currentT = t; currentP = p; maxExperiments = n;

        // LIFO алгоритм: если опытов больше нового лимита, отсекаем старые
        while(measurements.length > maxExperiments) measurements.shift();

        document.getElementById('errorCalculations').innerHTML = `<p>Установлена выборка: n=${n}</p><p>Ждем генерации отчета...</p>`;
        updateNotebookUI();
        closeStudentTable();
    }

    function saveExperiment() {
        if (isTypingReport) return;
        const val = parseFloat(document.getElementById('resultValue').innerText);
        if (isNaN(val) || val === -1) return;

        measurements.push(Number((val + Math.random()).toFixed(2)));

        if (measurements.length > maxExperiments) {
            measurements.shift();
        }

        updateNotebookUI();
    }

    function updateNotebookUI() {
        const logContainer = document.getElementById('experimentLogs');
        if (measurements.length === 0) {
            logContainer.innerHTML = "<i>Записей пока нет...</i>";
            document.getElementById('reportBtn').style.display = 'none';
            return;
        }

        let html = measurements.map((m, i) => `Замер [${i+1}/${maxExperiments}]: ${m}°`).join('<br>');
        logContainer.innerHTML = html;

        if (measurements.length > 1) {
            document.getElementById('reportBtn').style.display = 'block';
        }
    }

    // Эффект печатной машинки
    async function generateReport() {
        if (measurements.length < 2 || isTypingReport) return;
        isTypingReport = true;

        const d = dictionary[currentLang].report; // Сокращение для удобства
        const calcDiv = document.getElementById('errorCalculations');
        calcDiv.innerHTML = '<div id="typewriterText" class="typewriter-style"></div>';
        const tw = document.getElementById('typewriterText');

        const n = measurements.length;
        const sum = measurements.reduce((a, b) => a + b, 0);
        const avg = sum / n;
        const variance = measurements.reduce((sum, m) => sum + Math.pow(m - avg, 2), 0) / (n - 1);
        const S = Math.sqrt(variance);
        const standardError = S / Math.sqrt(n);
        const deltaStat = currentT * standardError;
        const totalError = Math.sqrt(Math.pow(systematicError, 2) + Math.pow(deltaStat, 2));

        const reportLines = [
            `${d.init}`,
            `${d.sample}: n = ${n}`,
            `-------------------------`,
            `${d.mean}`,
            `   θ_ср = Σθi / n = ${avg.toFixed(2)}°`,
            `${d.deviation}`,
            `   S = ${S.toFixed(3)}°`,
            `${d.coeff}`,
            `   t(n=${n}, P=${currentP}) = ${currentT}`,
            `${d.randErr}`,
            `   Δθ_rand = t * S_x = ${deltaStat.toFixed(3)}°`,
            `${d.systErr}`,
            `   Δθ_syst = ${systematicError}°`,
            `${d.totalErr}`,
            `   Δθ = √(Δ_syst² + Δ_rand²) = ${totalError.toFixed(2)}°`,
            `-------------------------`,
            `${d.conclusion}`,
            `θ = ${avg.toFixed(2)} ± ${totalError.toFixed(2)}°`
        ];

        let fullText = "";
        for (let i = 0; i < reportLines.length; i++) {
            let line = reportLines[i];
            for (let j = 0; j < line.length; j++) {
                fullText += line[j];
                tw.innerText = fullText;
                await new Promise(r => setTimeout(r, 15));
            }
            fullText += "\n";
            tw.innerText = fullText;
            await new Promise(r => setTimeout(r, 300));

            const notebook = document.getElementById('notebook');
            notebook.scrollTop = notebook.scrollHeight;
        }
        isTypingReport = false;
    }

    function updateSimulation() {
        const angleSlider = document.getElementById('angleSlider');
        const n1Select = document.getElementById('n1Select');
        const n2Select = document.getElementById('n2Select');
        if (!angleSlider || !n1Select || !n2Select) return;

        const angleInDeg = parseFloat(angleSlider.value);
        const n1 = parseFloat(n1Select.value);
        const n2 = parseFloat(n2Select.value);

        document.getElementById('noteN1').innerText = n1;
        document.getElementById('noteN2').innerText = n2;

        const angleInRad = (angleInDeg * Math.PI) / 180;
        const sinOut = (n1 * Math.sin(angleInRad)) / n2;

        let angleOutDeg;
        let visualAngleOut;

        if (Math.abs(sinOut) <= 1.0) {
            angleOutDeg = (Math.asin(sinOut) * 180) / Math.PI;
            visualAngleOut = angleOutDeg;

            if (isErrorMode) {
                // Генерируем случайную ошибку для имитации "глаза"
                const noise = -1.0 + (Math.random() * 2.0);
                let displayValue = angleOutDeg + systematicError + noise;
                document.getElementById('resultValue').innerText = displayValue.toFixed(2);
            } else {
                document.getElementById('resultValue').innerText = angleOutDeg.toFixed(2);
            }
        } else {
            angleOutDeg = -1;
            visualAngleOut = -1;
            document.getElementById('resultValue').innerText = dictionary[currentLang].reflect;
        }

        draw(angleInDeg, visualAngleOut, n1, n2);
    }

    function draw(angleInDeg, angleOutDeg, n1, n2) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = getColorForIndex(n1);
        ctx.fillRect(0, 0, canvas.width, centerY);
        ctx.fillStyle = getColorForIndex(n2);
        ctx.fillRect(0, centerY, canvas.width, canvas.height);

        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.setLineDash([2]);
        ctx.beginPath();
        ctx.moveTo(centerX, 0);
        ctx.lineTo(centerX, canvas.height);
        ctx.stroke();
        ctx.setLineDash([]);

        const inRad = (angleInDeg * Math.PI) / 180;
        const startX = centerX - Math.sin(inRad) * rayLength;
        const startY = centerY - Math.cos(inRad) * rayLength;

        ctx.lineWidth = 3;
        ctx.strokeStyle = '#ff0000';
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(centerX, centerY);
        ctx.stroke();

        if (angleOutDeg === -1) {
            ctx.strokeStyle = '#00ffff';
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            const reflectX = centerX + Math.sin(inRad) * rayLength;
            const reflectY = centerY - Math.cos(inRad) * rayLength;
            ctx.lineTo(reflectX, reflectY);
            ctx.stroke();
        } else {
            const outRad = (angleOutDeg * Math.PI) / 180;
            const endX = centerX + Math.sin(outRad) * rayLength;
            const endY = centerY + Math.cos(outRad) * rayLength;

            // Визуализация неопределенности в режиме лаборатории
            if (isErrorMode) {
                ctx.save();
                ctx.strokeStyle = 'rgba(0, 255, 255, 0.15)'; // Размытый конус неопределенности
                ctx.lineWidth = 18;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(endX, endY);
                ctx.stroke();
                ctx.restore();

                // Легкое "дрожание" основного луча
                let jitter = (Math.random() - 0.5) * 0.05;
                const jitterX = centerX + Math.sin(outRad + jitter) * rayLength;
                const jitterY = centerY + Math.cos(outRad + jitter) * rayLength;

                ctx.strokeStyle = '#00ffff';
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(jitterX, jitterY);
                ctx.stroke();
            } else {
                ctx.strokeStyle = '#00ffff';
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(endX, endY);
                ctx.stroke();
            }
        }
    }

    function toggleErrorMode() {
        const notebook = document.getElementById('notebook');
        isErrorMode = document.getElementById('errorToggle').checked;
        document.getElementById('studentBtn').style.display = isErrorMode ? 'block' : 'none';
        
        if (notebook) {
            if (isErrorMode) {
                notebook.classList.add('active');
                notebook.style.display = 'block';
            } else {
                notebook.classList.remove('active');
                // Wait for transition to finish before hiding if needed, 
                // but since we use max-width: 0 it should be fine.
                setTimeout(() => {
                    if (!isErrorMode) notebook.style.display = 'none';
                }, 400);
            }
        }
        
        document.getElementById('saveBtn').style.display = isErrorMode ? 'block' : 'none';

        if(!isErrorMode) {
            document.getElementById('reportBtn').style.display = 'none';
            measurements = []; // Очищаем данные при выходе из режима
            updateNotebookUI();
        }
        updateSimulation();
    }

    function changeLanguage() {
        currentLang = document.getElementById('langSwitcher').value;
        const d = dictionary[currentLang];

        // Обновление текстовых узлов [cite: 259, 260]
        document.getElementById('mainTitle').innerText = d.title;
        document.getElementById('notebookTitle').innerText = d.notebook;
        document.getElementById('labelMed1').innerText = d.med1;
        document.getElementById('labelMed2').innerText = d.med2;
        document.getElementById('labelResult').innerText = d.result;
        document.getElementById('saveBtn').innerText = d.saveBtn;
        document.getElementById('reportBtn').innerText = d.reportBtn;
        document.getElementById('labelDevice').innerText = d.device;

        // Обновление метки угла (сохраняя span с числом)
        const angleLabel = document.getElementById('labelAngle');
        angleLabel.childNodes[0].textContent = d.angle + ": ";

        updateSimulation();
    }

    function syncAngle() {
        document.getElementById('angleValue').innerText = document.getElementById('angleSlider').value;
        updateSimulation();
    }

    function getColorForIndex(n) {
        if (n <= 1.0) return 'rgba(20, 25, 35, 0.4)';      // Воздух (почти прозрачный темный)
        if (n <= 1.33) return 'rgba(20, 80, 120, 0.5)';    // Вода (глубокий синий)
        if (n <= 1.5) return 'rgba(40, 100, 100, 0.6)';    // Стекло/Кварц (бирюзово-зеленоватый)
        if (n <= 1.8) return 'rgba(60, 70, 140, 0.6)';     // Сапфир/Флинтглас (фиолетово-синий)
        return 'rgba(150, 230, 255, 0.4)';                 // Алмаз (светлый льдисто-голубой)
    }

    function openStudentTable() {
        const tableEl = document.getElementById('studentTableDisplay');
        let html = `<tr><th style="border:1px solid #ddd; padding:5px; background:#f4f4f4;">n \\ P</th>`;
        studentData.probabilities.forEach(p => html += `<th style="border:1px solid #ddd; padding:5px; background:#f4f4f4;">${p}</th>`);
        html += `</tr>`;
        for (let n = 2; n <= 10; n++) {
            html += `<tr><td style="font-weight:bold; border:1px solid #ddd; background:#f4f4f4;">${n}</td>`;
            studentData.values[n].forEach((val, idx) => {
                html += `<td onclick="selectT(${val}, ${studentData.probabilities[idx]}, ${n})" 
                        style="border:1px solid #ddd; padding:5px; cursor:pointer;" 
                        onmouseover="this.style.background='#00ffff44'" 
                        onmouseout="this.style.background='transparent'">${val}</td>`;
            });
            html += `</tr>`;
        }
        tableEl.innerHTML = html;
        document.getElementById('studentModal').style.display = 'flex';
    }

    function closeStudentTable() {
        document.getElementById('studentModal').style.display = 'none';
    }

    // Expose functions to window for HTML event handlers
    window.updateSystematicError = updateSystematicError;
    window.selectT = selectT;
    window.saveExperiment = saveExperiment;
    window.generateReport = generateReport;
    window.updateSimulation = updateSimulation;
    window.toggleErrorMode = toggleErrorMode;
    window.changeLanguage = changeLanguage;
    window.syncAngle = syncAngle;
    window.openStudentTable = openStudentTable;
    window.closeStudentTable = closeStudentTable;

    updateSimulation();
})();
