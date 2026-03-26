document.addEventListener('DOMContentLoaded', () => {
    const display = document.getElementById('display');
    const keys = document.querySelectorAll('.key');
    const clearButton = document.getElementById('clearButton');
    
    let dialString = '';

    keys.forEach(key => {
        key.addEventListener('mousedown', () => {
            const val = key.getAttribute('data-note');
            updateDisplay(val);
        });
    });

    clearButton.addEventListener('click', () => {
        dialString = '';
        display.innerText = 'READY';
    });

    function updateDisplay(val) {
        if (display.innerText === 'READY') {
            dialString = val;
        } else {
            dialString += val;
        }
        
        // Keep display to last 12 digits for visual clarity
        if (dialString.length > 12) {
            display.innerText = '...' + dialString.slice(-11);
        } else {
            display.innerText = dialString;
        }
    }
});
