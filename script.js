
const qwertyChars = "QWERTYUIOPASDFGHJKLZXCVBNM";

const abcChars    = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const encodeMap = {};
const decodeMap = {};

for (let i = 0; i < qwertyChars.length; i++) {
    encodeMap[qwertyChars[i]] = abcChars[i];
    decodeMap[abcChars[i]] = qwertyChars[i];
}


function encode(text) {
    return text
        .toUpperCase()
        .split('') 
        .map(ch => encodeMap[ch] || ch) 
        .join(''); 
}


function decode(code) {
    return code
        .toUpperCase()
        .split('')
        .map(ch => decodeMap[ch] || ch)
        .join('');
}


const inputText = document.getElementById('inputText');
const outputText = document.getElementById('outputText');
const outputLabel = document.getElementById('outputLabel');
const machineState = document.getElementById('machineState');
const depthReadout = document.getElementById('depthReadout');
const btnEncode = document.getElementById('btnEncode');
const btnDecode = document.getElementById('btnDecode');
const btnCopy = document.getElementById('btnCopy');
const btnExample = document.getElementById('btnExample');
const btnSwap = document.getElementById('btnSwap');
const btnClear = document.getElementById('btnClear');
const exampleText = "Sepertinya ekspresi dalam tulisan memang ditakdirkan untuk menafsirkan dirinya sendiri";

let activeMode = 'hide';
let copyFeedbackTimer;
let swapFeedbackTimer;
let outputPulseTimer;
let transformationTimer;
let depth = 0;

const transformationDuration = 420;

const modeConfig = {
    hide: {
        labelText: 'Teks yang hanya dimengerti oleh teks itu sendiri.',
        transform: encode
    },
    interpret: {
        labelText: 'Teks yang bisa kamu interpretasikan.',
        transform: decode
    }
};

function setCopyButtonText(text) {
    btnCopy.textContent = text;
}

function resetCopyButton(delay = 0) {
    window.clearTimeout(copyFeedbackTimer);

    if (delay > 0) {
        copyFeedbackTimer = window.setTimeout(() => {
            setCopyButtonText('Copy');
        }, delay);
        return;
    }

    setCopyButtonText('Copy');
}

function setSwapButtonText(text) {
    btnSwap.textContent = text;
}

function resetSwapButton(delay = 0) {
    window.clearTimeout(swapFeedbackTimer);

    if (delay > 0) {
        swapFeedbackTimer = window.setTimeout(() => {
            setSwapButtonText('⇄ Tukar');
        }, delay);
        return;
    }

    setSwapButtonText('⇄ Tukar');
}

function updateUI() {
    const isHideMode = activeMode === 'hide';

    btnEncode.classList.toggle('is-active', isHideMode);
    btnDecode.classList.toggle('is-active', !isHideMode);
    btnEncode.setAttribute('aria-checked', String(isHideMode));
    btnDecode.setAttribute('aria-checked', String(!isHideMode));
}

function setMode(mode) {
    activeMode = mode;
    updateUI();
}

function setMachineState(state) {
    window.clearTimeout(transformationTimer);

    const normalizedState = state.toLowerCase();
    machineState.dataset.state = normalizedState;
    machineState.innerHTML = `<span class="state-mark" aria-hidden="true"></span>STATE: ${normalizedState.toUpperCase()}`;
}

function updateDepthReadout() {
    depthReadout.textContent = `DEPTH: ${String(depth).padStart(2, '0')}`;
}

function presentTransformation() {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion) {
        setMachineState('DORMANT');
        return;
    }

    setMachineState('TRANSMUTING');
    transformationTimer = window.setTimeout(() => {
        setMachineState('DORMANT');
    }, transformationDuration);
}

function setOutput(value, labelText = outputLabel.innerText) {
    window.clearTimeout(outputPulseTimer);

    outputText.value = value;
    outputLabel.innerText = labelText;
    outputText.classList.toggle('is-empty', !value);
    outputText.classList.toggle('has-output', Boolean(value));
    btnCopy.classList.toggle('is-ready', Boolean(value));
    resizeTextarea(outputText);

    if (value) {
        outputText.classList.add('is-fresh');
        outputPulseTimer = window.setTimeout(() => {
            outputText.classList.remove('is-fresh');
        }, 650);
    } else {
        outputText.classList.remove('is-fresh');
    }
}

function resizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 240)}px`;
}

function scrollOutputIntoView() {
    if (!window.matchMedia('(max-width: 640px)').matches) {
        return;
    }

    outputText.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function processText() {
    const teksInput = inputText.value;

    if (!teksInput.trim()) {
        inputText.focus();
        inputText.classList.add('needs-input');
        window.setTimeout(() => {
            inputText.classList.remove('needs-input');
        }, 650);
        return;
    }

    const config = modeConfig[activeMode];
    setOutput(config.transform(teksInput), config.labelText);

    if (activeMode === 'hide') {
        depth = Math.min(depth + 1, 99);
    } else {
        depth = 0;
    }

    updateDepthReadout();
    presentTransformation();
    scrollOutputIntoView();
}

btnEncode.addEventListener('click', () => {
    setMode('hide');
    processText();
});
btnDecode.addEventListener('click', () => {
    setMode('interpret');
    processText();
});

inputText.addEventListener('input', () => resizeTextarea(inputText));

async function copyOutput() {
    const teksOutput = outputText.value;

    if (!teksOutput) {
        setCopyButtonText('Kosong');
        resetCopyButton(1200);
        return;
    }

    try {
        await navigator.clipboard.writeText(teksOutput);
    } catch (error) {
        outputText.focus();
        outputText.select();
        document.execCommand('copy');
        outputText.setSelectionRange(outputText.value.length, outputText.value.length);
    }

    setCopyButtonText('Copied');
    resetCopyButton(1200);
}

btnCopy.addEventListener('click', copyOutput);

btnExample.addEventListener('click', () => {
    inputText.value = exampleText;
    resizeTextarea(inputText);
    inputText.focus();
    inputText.setSelectionRange(inputText.value.length, inputText.value.length);
});

btnSwap.addEventListener('click', () => {
    if (!outputText.value) {
        setSwapButtonText('Masih kosong');
        resetSwapButton(1200);
        return;
    }

    inputText.value = outputText.value;
    resizeTextarea(inputText);
    inputText.focus();
    inputText.setSelectionRange(inputText.value.length, inputText.value.length);
    setSwapButtonText('Dipindah');
    resetSwapButton(1200);
});

btnClear.addEventListener('click', () => {
    inputText.value = '';
    resizeTextarea(inputText);
    setOutput('', 'Teks yang hanya dimengerti oleh teks itu sendiri :)');
    setMachineState('DORMANT');
    resetCopyButton();
    resetSwapButton();
    inputText.focus();
});

setOutput('');
resizeTextarea(inputText);
setMachineState('DORMANT');
updateDepthReadout();
updateUI();

function initMusCustomCursor() {
    const mediaQuery = window.matchMedia('(hover: none), (pointer: coarse)');
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (mediaQuery.matches || reducedMotionQuery.matches) {
        return;
    }

    const root = document.documentElement;
    const dot = document.createElement('div');
    const ring = document.createElement('div');
    const interactiveSelector = 'a, button, input, textarea, select, summary, [role="button"], [data-cursor="hover"]';
    const textSelector = 'input, textarea, [contenteditable="true"], p, span, h1, h2, h3, h4, h5, h6, label, li, blockquote, code, pre';
    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;
    let ringX = pointerX;
    let ringY = pointerY;
    let rafId = null;

    dot.className = 'mus-cursor-dot';
    ring.className = 'mus-cursor-ring';
    document.body.append(dot, ring);
    root.classList.add('mus-custom-cursor-enabled');

    function render() {
        ringX += (pointerX - ringX) * 0.18;
        ringY += (pointerY - ringY) * 0.18;

        dot.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0) translate(-50%, -50%) scale(var(--mus-cursor-dot-scale, 1))`;
        ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%) scale(var(--mus-cursor-ring-scale, 1))`;
        rafId = window.requestAnimationFrame(render);
    }

    function setVisibility(isVisible) {
        dot.classList.toggle('is-visible', isVisible);
        ring.classList.toggle('is-visible', isVisible);
    }

    function updatePointer(event) {
        pointerX = event.clientX;
        pointerY = event.clientY;

        if (!dot.classList.contains('is-visible')) {
            ringX = pointerX;
            ringY = pointerY;
            setVisibility(true);
        }

        const target = event.target;
        const isHoverTarget = target instanceof Element && target.closest(interactiveSelector);
        const isTextTarget = target instanceof Element && target.closest(textSelector);

        dot.classList.toggle('mus-cursor-hover', Boolean(isHoverTarget));
        ring.classList.toggle('mus-cursor-hover', Boolean(isHoverTarget));
        root.classList.toggle('mus-cursor-over-text', Boolean(isTextTarget));
    }

    function pressCursor() {
        dot.classList.add('mus-cursor-click');
        ring.classList.add('mus-cursor-click');
    }

    function releaseCursor() {
        dot.classList.remove('mus-cursor-click');
        ring.classList.remove('mus-cursor-click');
    }

    document.addEventListener('pointermove', updatePointer, { passive: true });
    document.addEventListener('pointerdown', pressCursor, { passive: true });
    document.addEventListener('pointerup', releaseCursor, { passive: true });
    document.addEventListener('pointercancel', releaseCursor, { passive: true });
    document.addEventListener('mouseleave', () => {
        setVisibility(false);
        root.classList.remove('mus-cursor-over-text');
    });
    window.addEventListener('blur', () => {
        setVisibility(false);
        releaseCursor();
    });

    render();

    window.addEventListener('beforeunload', () => {
        if (rafId) {
            window.cancelAnimationFrame(rafId);
        }
    });
}

initMusCustomCursor();
