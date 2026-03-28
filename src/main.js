document.addEventListener('DOMContentLoaded', () => {
    const display = document.getElementById('display');
    const keys = document.querySelectorAll('.key');
    const clearButton = document.getElementById('clearButton');
    
    let dialString = ''; //visible numbers typed out
    let audioCtx = null;
    let oscillators = []; //2 current oscs
    let gainNode = null; //audio control
    let currentOscGain = null; //used to prevent popping
    let isRinging = false;

    const dtmfMap = {
        '1': [697, 1209], '2': [697, 1336], '3': [697, 1477], 'A': [697, 1633],
        '4': [770, 1209], '5': [770, 1336], '6': [770, 1477], 'B': [770, 1633],
        '7': [852, 1209], '8': [852, 1336], '9': [852, 1477], 'C': [852, 1633],
        '*': [941, 1209], '0': [941, 1336], '#': [941, 1477], 'D': [941, 1633]
    };

    function initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            gainNode = audioCtx.createGain();
            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); //audio control, prevent clipping
            gainNode.connect(audioCtx.destination);
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    function playTone(freqs, rampTime = 0.0015) {
        initAudio();
        stopTone();

        currentOscGain = audioCtx.createGain();
        currentOscGain.gain.setValueAtTime(0, audioCtx.currentTime); //prevent initial pop
        currentOscGain.gain.setTargetAtTime(1, audioCtx.currentTime, rampTime);
        currentOscGain.connect(gainNode);

        freqs.forEach(freq => {
            const osc = audioCtx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            osc.connect(currentOscGain);
            osc.start();
            oscillators.push(osc);
        });
    }

    function stopTone() {
        if (currentOscGain) {
            currentOscGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.002);
        }
        
        oscillators.forEach(osc => {
            //delay the actual stop by 0.1s so the fade out has time to complete
            osc.stop(audioCtx.currentTime + 0.1);
        });
        oscillators = []; //empty osc list
    }

    function triggerRing() {
        if (isRinging) return;
        isRinging = true;
        display.innerText = 'DIALING...';

        //delay before the ringing sound starts
        setTimeout(() => {
            display.innerText = 'RINGING...';
            playTone([440, 480], 0.1);//smoother ramp for ringing

            setTimeout(() => {
                stopTone();
                display.innerText = 'CALL ENDED';
                
                setTimeout(() => {
                    dialString = '';
                    isRinging = false;
                    display.innerText = 'READY';
                }, 2000);
            }, 3000);
        }, 1000);
    }

    keys.forEach(key => {
        const val = key.getAttribute('data-note');
        
        //mouse and touch events for responsiveness
        const handleStart = (e) => {
            if (isRinging) return;
            e.preventDefault();
            
            if (dialString.length < 10) {
                updateDisplay(val);
                if (dtmfMap[val]) {
                    playTone(dtmfMap[val]);
                }
            }
        };

        const handleEnd = (e) => {
            if (isRinging) return;
            e.preventDefault();
            stopTone();
            
            if (dialString.length === 10) {
                triggerRing();
            }
        };

        key.addEventListener('mousedown', handleStart);
        key.addEventListener('mouseup', handleEnd);
        key.addEventListener('mouseleave', handleEnd);

        key.addEventListener('touchstart', handleStart);
        key.addEventListener('touchend', handleEnd);
    });

    clearButton.addEventListener('click', () => {
        if (isRinging) return;
        dialString = '';
        display.innerText = 'READY';
    });

    function updateDisplay(val) {
        if (dialString.length >= 10) return; //deploy

        if (display.innerText === 'READY' || display.innerText === 'CALL ENDED') {
            dialString = val;
        } else {
            dialString += val;
        }
        
        display.innerText = dialString;
    }
});