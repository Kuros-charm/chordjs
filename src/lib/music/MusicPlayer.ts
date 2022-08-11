import { Part, PolySynth, Synth, Transport } from "tone";
import type { MusicActionAbsTime } from "./MusicConstant";



export class MusicPlayer {

    piano: PolySynth;
    constructor(public tempo: number) {
        this.piano = new PolySynth(Synth, {
            "volume": -8,
            "oscillator": {
                "partials": [1, 2, 5],
            },
            "portamento": 0.005
        }).toDestination();
    }

    play(musicActions: MusicActionAbsTime[]) {
        this.stop();
        const part = new Part(((time, value) => {
            // the value is an object which contains both the note and the velocity
            this.piano.triggerAttackRelease(value.musicSound.sound, value.musicSound.length, time);
        }), musicActions).start(0);
        Transport.bpm.value = this.tempo;
        Transport.start();

    }
    stop() {
        Transport.stop();
        Transport.cancel(0);
    }



}