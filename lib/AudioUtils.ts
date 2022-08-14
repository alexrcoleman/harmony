const context = typeof AudioContext !== "undefined" ? new AudioContext() : null;
export function playNote(frequency: number, delay = 0) {
  if (!context) {
    return;
  }
  setTimeout(() => {
    for (let r of [4, 5, 6]) {
      const o = context.createOscillator();
      const g = context.createGain();
      o.type = "sine";
      o.connect(g);
      o.frequency.value = (frequency * r) / 4;
      g.connect(context.destination);
      o.start(0);
      g.gain.value = 0.2;
      g.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 1);
    }
  }, delay);
}
