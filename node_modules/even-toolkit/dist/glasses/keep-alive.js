let audioCtx = null;
let oscillator = null;
let lockPromise = null;
export function activateKeepAlive(lockName = 'evenglass_keep_alive') {
    try {
        audioCtx = new AudioContext();
        oscillator = audioCtx.createOscillator();
        oscillator.frequency.value = 1;
        const gain = audioCtx.createGain();
        gain.gain.value = 0.001;
        oscillator.connect(gain);
        gain.connect(audioCtx.destination);
        oscillator.start();
    }
    catch { /* ignore */ }
    if (navigator.locks) {
        lockPromise = navigator.locks.request(lockName, () => {
            return new Promise(() => { });
        });
    }
}
export function deactivateKeepAlive() {
    oscillator?.stop();
    audioCtx?.close();
    oscillator = null;
    audioCtx = null;
    lockPromise = null;
}
//# sourceMappingURL=keep-alive.js.map