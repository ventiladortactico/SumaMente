const AcusticaAudio = {
    audioContext: null,
    oscillator: null,
    gainNode: null,
    isPlaying: false,

    initAudio: function() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    },

    startContinuousTone: function(initialFrequency = 440, initialVolume = 0.1) {
        this.initAudio();
        if (this.isPlaying) return;

        this.oscillator = this.audioContext.createOscillator();
        this.gainNode = this.audioContext.createGain();

        this.oscillator.connect(this.gainNode);
        this.gainNode.connect(this.audioContext.destination);

        this.oscillator.type = 'sine';
        this.oscillator.frequency.setValueAtTime(initialFrequency, this.audioContext.currentTime);
        this.gainNode.gain.setValueAtTime(initialVolume, this.audioContext.currentTime);

        this.oscillator.start();
        this.isPlaying = true;
    },

    updateFrequency: function(frequency) {
        if (this.isPlaying && this.oscillator) {
            const safeFreq = Math.max(20, Math.min(frequency, 20000));
            this.oscillator.frequency.linearRampToValueAtTime(safeFreq, this.audioContext.currentTime + 0.05);
        }
    },

    updateVolume: function(volume) {
        if (this.isPlaying && this.gainNode) {
            const safeVolume = Math.min(Math.max(volume, 0), 0.5);
            this.gainNode.gain.linearRampToValueAtTime(safeVolume, this.audioContext.currentTime + 0.05);
        }
    },

    stopContinuousTone: function() {
        if (this.isPlaying && this.oscillator) {
            this.oscillator.stop();
            this.oscillator.disconnect();
            this.gainNode.disconnect();
            this.oscillator = null;
            this.gainNode = null;
            this.isPlaying = false;
        }
    },

    playTone: function(frequency, volume = 0.3, duration = 0.5) {
        this.initAudio();

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
};
