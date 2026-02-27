
let currentQuestion = {
    num1: 0,
    num2: 0,
    operator: '+',
    answer: 0,
    text: '',
    type: 'basic'
};

let gameMode = 'random';
let currentLevel = 'paud';
let currentScore = 0;
let wrongAttempts = 0;
let currentSessionCount = 0;
let correctCount = 0;
const TOTAL_SESSION_QUESTIONS = 10;

const levelConfigs = {
    'paud': { min: 1, max: 10, ops: ['+'] },
    'sd12': { min: 1, max: 20, ops: ['+', '-', '+', '-'] },
    'sd34': { min: 5, max: 50, ops: ['*', '*', '+', '-', '*'] },
    'sd56': { min: 10, max: 100, ops: ['*', '/', '*', '/'] }
};

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');

    if (screenId === 'home-screen') {
        currentScore = 0;
        currentSessionCount = 0;
        correctCount = 0;
        hideHint();
    }
}

function startGame(level) {
    currentLevel = level;
    gameMode = 'random';
    currentScore = 0;
    currentSessionCount = 0;
    correctCount = 0;
    updateScoreDisplay();
    nextQuestion();
    showScreen('game-screen');
}

function startCustomGame() {
    const num1 = parseInt(document.getElementById('custom-num1').value);
    const num2 = parseInt(document.getElementById('custom-num2').value);
    const op = document.getElementById('custom-operator').value;

    if (isNaN(num1) || isNaN(num2)) {
        alert("Jangan lupa isi angkanya ya! 😊");
        return;
    }

    if (num1 > 500 || num2 > 500) {
        alert("Wah, angkanya terlalu besar! Maksimal 500 ya Ayah/Bunda. 😊");
        return;
    }

    gameMode = 'custom';
    currentQuestion = {
        num1: num1,
        num2: num2,
        operator: op,
        answer: calculate(num1, num2, op),
        type: 'basic'
    };

    currentSessionCount = 0;
    displayQuestion();
    showScreen('game-screen');
}

function nextQuestion() {
    currentSessionCount++;
    if (currentSessionCount > TOTAL_SESSION_QUESTIONS) {
        showResults();
        return;
    }

    wrongAttempts = 0;
    hideHint();
    updateProgress();
    generateQuestion();
    displayQuestion();
}

function generateQuestion() {
    const config = levelConfigs[currentLevel];


    if (currentLevel === 'sd56' && Math.random() > 0.4) {
        generateSpecialQuestion();
        return;
    }

    let n1 = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
    let n2 = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
    let op = config.ops[Math.floor(Math.random() * config.ops.length)];

    if (op === '-') if (n1 < n2) [n1, n2] = [n2, n1];
    if (op === '/') {

        if (currentLevel !== 'sd56' && currentLevel !== 'sd34') {
            let ans = Math.floor(Math.random() * 10) + 1;
            n2 = Math.floor(Math.random() * 9) + 1;
            n1 = ans * n2;
        }
    }

    let answer = calculate(n1, n2, op);

    // Filter hasil
    const maxAllowed = (currentLevel === 'paud') ? 10 : 500;

    // Syarat: Jangan sampai hasil desimal di bawah 1.0 (misal 0.5)
    if (answer > maxAllowed || answer < 0 || (op === '/' && answer < 1 && answer !== 0)) {
        return generateQuestion();
    }

    currentQuestion = { num1: n1, num2: n2, operator: op, answer: answer, type: 'basic' };
}

function generateSpecialQuestion() {
    const types = ['fraction', 'geometry', 'story', 'percent', 'volume', 'scale', 'data'];
    const type = types[Math.floor(Math.random() * types.length)];

    if (type === 'fraction') {
        const denom = Math.floor(Math.random() * 8) + 2;
        const n1 = Math.floor(Math.random() * (denom - 1)) + 1;
        const n2 = Math.floor(Math.random() * (denom - n1 - 1)) + 1;
        currentQuestion = {
            num1: n1, num2: n2, denom: denom,
            text: `Berapa hasil dari ${n1}/${denom} + ${n2}/${denom} ?`,
            answer: (n1 + n2) / denom,
            simpleAns: `${n1 + n2}/${denom}`,
            type: 'fraction'
        };
    } else if (type === 'geometry') {
        const side = Math.floor(Math.random() * 15) + 2;
        currentQuestion = {
            num1: side,
            text: `Berapa luas persegi yang sisinya ${side} cm?`,
            answer: side * side,
            type: 'geometry'
        };
    } else if (type === 'percent') {
        const base = (Math.floor(Math.random() * 5) + 1) * 100;
        const percents = [10, 20, 25, 50];
        const p = percents[Math.floor(Math.random() * percents.length)];
        currentQuestion = {
            num1: p, num2: base,
            text: `Berapakah ${p}% dari ${base}?`,
            answer: (p / 100) * base,
            type: 'percent'
        };
    } else if (type === 'volume') {
        const p = Math.floor(Math.random() * 10) + 2;
        const l = Math.floor(Math.random() * 5) + 2;
        const t = Math.floor(Math.random() * 5) + 2;
        currentQuestion = {
            num1: p, num2: l, num3: t,
            text: `Berapa volume balok dengan panjang ${p}, lebar ${l}, dan tinggi ${t}?`,
            answer: p * l * t,
            type: 'volume'
        };
    } else if (type === 'scale') {
        const mapDist = Math.floor(Math.random() * 10) + 1;
        const scale = (Math.floor(Math.random() * 5) + 1) * 100;
        currentQuestion = {
            num1: mapDist, num2: scale,
            text: `Jarak peta ${mapDist} cm. Skala 1:${scale}. Berapa jarak sebenarnya (dalam cm)?`,
            answer: mapDist * scale,
            type: 'scale'
        };
    } else if (type === 'data') {
        const d1 = Math.floor(Math.random() * 20) + 10;
        const d2 = Math.floor(Math.random() * 20) + 10;
        const d3 = Math.floor(Math.random() * 20) + 10;
        currentQuestion = {
            text: `Berapa rata-rata (mean) dari data: ${d1}, ${d2}, dan ${d3}?`,
            answer: Math.round(((d1 + d2 + d3) / 3) * 100) / 100,
            type: 'data'
        };
    } else {
        const items = ['Apel 🍎', 'Permen 🍬', 'Buku 📚'];
        const item = items[Math.floor(Math.random() * items.length)];
        const price = (Math.floor(Math.random() * 5) + 1) * 1000;
        const qty = Math.floor(Math.random() * 5) + 2;
        currentQuestion = {
            answer: price * qty,
            text: `Harga 1 ${item} adalah Rp${price}. Kalau beli ${qty}, berapa total harganya?`,
            type: 'story'
        };
    }
}

function calculate(n1, n2, op) {
    let res = 0;
    switch (op) {
        case '+': res = n1 + n2; break;
        case '-': res = n1 - n2; break;
        case '*': res = n1 * n2; break;
        case '/': res = n1 / n2; break;
    }
    return Math.round(res * 100) / 100; 
}

function displayQuestion() {
    const opSymbol = { '+': '+', '-': '-', '*': '×', '/': '÷' };
    let text = '';

    if (currentQuestion.type === 'basic') {
        text = `${currentQuestion.num1} ${opSymbol[currentQuestion.operator]} ${currentQuestion.num2} = ?`;
    } else {
        text = currentQuestion.text;
    }

    document.getElementById('question-text').innerText = text;
    document.getElementById('question-count').innerText = `Soal ${currentSessionCount} / ${TOTAL_SESSION_QUESTIONS}`;
    const input = document.getElementById('answer-input');
    input.value = '';
    input.focus();
}

function checkAnswer() {
    let val = document.getElementById('answer-input').value.trim();
    if (val === '') return;

    // koma desimal
    val = val.replace(',', '.');

    let userInput;
    if (val.includes('/')) {
        const parts = val.split('/');
        if (parts.length === 2) {
            userInput = parseFloat(parts[0]) / parseFloat(parts[1]);
        }
    } else {
        userInput = parseFloat(val);
    }

    if (isNaN(userInput)) return;

    const correctAns = currentQuestion.answer;

    // Toleransi desimal
    let isCorrect = Math.abs(userInput - correctAns) < 0.01;


    if (!isCorrect && currentLevel === 'sd56') {
        const correctStr = correctAns.toString();
        const userStr = userInput.toString();

        if (correctStr.startsWith(userStr) && userStr.length >= 3) {
            isCorrect = true;
        }
    }

    if (isCorrect) {
        handleFeedback(true);
        currentScore += 10;
        correctCount++;
        updateScoreDisplay();
        setTimeout(nextQuestion, 1500);
    } else {
        handleFeedback(false);
        wrongAttempts++;
        if (wrongAttempts >= 1) showHint();
    }
}

function skipQuestion() {
    nextQuestion();
}

function exitGame() {
    if (confirm("Yakin ingin berhenti sekarang? Progresmu belum disimpan lho. 😊")) {
        showScreen('home-screen');
    }
}

function showResults() {
    showScreen('result-screen');
    document.getElementById('final-score').innerText = currentScore;
    document.getElementById('correct-count').innerText = correctCount;
    const accuracy = Math.round((correctCount / TOTAL_SESSION_QUESTIONS) * 100);
    document.getElementById('accuracy-percent').innerText = `${accuracy}%`;
}

function handleFeedback(isCorrect) {
    const id = isCorrect ? 'feedback-correct' : 'feedback-wrong';
    const el = document.getElementById(id);
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 1200);
}

function updateScoreDisplay() {
    document.getElementById('score-display').innerText = `Skor: ${currentScore}`;
}

function updateProgress() {
    const percent = ((currentSessionCount - 1) / TOTAL_SESSION_QUESTIONS) * 100;
    document.getElementById('progress-bar').style.width = `${percent}%`;
}

function showHint() {
    const hintText = getHint();
    document.getElementById('hint-text').innerHTML = hintText;
    document.getElementById('hint-container').classList.add('show');
}

function hideHint() {
    document.getElementById('hint-container').classList.remove('show');
}

function getHint() {
    const { num1, num2, operator, type, denom, simpleAns } = currentQuestion;

    if (type === 'fraction') return `Tips: Kalau penyebutnya (bawah) sama, kamu tinggal jumlahkan pembilangnya (atas) saja! Hasilnya adalah ${simpleAns}`;
    if (type === 'geometry') return `Tips: Luas persegi itu Sisi dikali Sisi, jadi ${num1} x ${num1}.`;
    if (type === 'story') return `Tips: Kalikan harga 1 barang dengan jumlahnya ya! ✨`;
    if (type === 'percent') return `Tips: ${num1}% dari ${num2} sama dengan (${num1}/100) x ${num2}. Coba bagi dulu dengan 100!`;
    if (type === 'volume') return `Tips: Volume balok adalah Panjang x Lebar x Tinggi. Jadi ${num1} x ${num2} x ${num3}.`;
    if (type === 'scale') return `Tips: Jarak sebenarnya adalah Jarak Peta dikali Skala. Jadi ${num1} x ${num2}.`;
    if (type === 'data') return `Tips: Rata-rata adalah (Jumlah Data) dibagi (Banyak Data). Dijumlahkan dulu ya!`;

    switch (operator) {
        case '+': return `Bayangkan kamu punya ${num1} 🍎 dan dapat lagi ${num2} 🍎. Coba hitung semuanya!`;
        case '-': return `Kamu punya ${num1} 🍬, terus dimakan ${num2} tinggal berapa ya?`;
        case '*':
            const multFormula = Array(Math.min(num1, 10)).fill(num2).join(' + ') + (num1 > 10 ? ' ...' : '');
            return `Ini sama saja dengan menjumlahkan ${num2} sebanyak ${num1} kali.<br><span class="formula">${multFormula}</span>`;
        case '/':
            if (num1 % num2 === 0) {
                return `Berapa kali kamu bisa mengurangi ${num1} dengan ${num2} sampai habis?`;
            } else {
                return `Hasilnya mungkin berkoma ya! Coba bagi ${num1} dengan ${num2}. Tips: Jika sisa, tambahkan 0 dan koma. 😊`;
            }
        default: return "Ayo coba lagi, kamu pasti bisa! ✨";
    }
}

document.getElementById('answer-input')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') checkAnswer();
});
