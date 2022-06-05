import type { PRNG } from "seedrandom";
import { Time } from "tone";
import { CHORD_PROGRESSION_WHITELIST, DIMINISHED_CHORD, HARMONIC_MINOR_SCALE, MAJOR_CHORD, MAJOR_SCALE, MAJOR_TONAL_FUNCTIONS, MIDI_FLAT_NAMES, MIDI_NUM_NAMES, MINOR_CHORD, MINOR_TONAL_FUNCTIONS, TF_CLASS, TF_CLASS_MAP, type MusicActionAbsTime, type MusicActionRelTime, type MusicSound } from "./MusicConstant";

export class MusicHelper {

    static noteToNumber(note: string) {
        let result = MIDI_NUM_NAMES.indexOf(note);
        if (result === -1) {
            result = MIDI_FLAT_NAMES.indexOf(note);
        }
        if (result === -1) {
            return null;
        }
        return result
    }

    static numberToNote(idx: number) {
        return MIDI_NUM_NAMES[idx];
    }

    static formulaToNoteNum(keyNumber: number, formula: number[]) {
        return formula.map(relativeIdx => relativeIdx + keyNumber);
    }
    static notesNumToFormula(notes: number[]) {
        return notes.map(n => {
            return n - notes[0]
        })
    }


    static convertToAbsTime(actions: MusicActionRelTime[]): MusicActionAbsTime[] {
        let toneTime = 0;
        const absTimeActions: MusicActionAbsTime[] = [];
        actions.forEach(a => {
            if (typeof a === 'number') { // is pause
                toneTime += a;
            } else {
                a = a as MusicSound;
                absTimeActions.push(
                    {
                        time: toneTime,
                        musicSound: a
                    }
                )
            }
        })
        return absTimeActions
    }

    static makeTonalFunction(keyNumber: number, isMajor: boolean) {
        const tfFormula = this.makeTonalFunctionFormulas(isMajor);
        return tfFormula.map(chordFormula => this.formulaToNoteNum(keyNumber, chordFormula));
    }
    static makeTonalFunctionFormulas(isMajor: boolean) {
        const tonalFunctions = isMajor ? MAJOR_TONAL_FUNCTIONS : MINOR_TONAL_FUNCTIONS;
        const scale = isMajor ? MAJOR_SCALE : HARMONIC_MINOR_SCALE
        return scale.map((n, i) => {
            const chordType = tonalFunctions[i];
            if (chordType === 'M') {
                return MAJOR_CHORD.map(x => x + n)
            }
            if (chordType === 'm') {
                return MINOR_CHORD.map(x => x + n)
            }
            if (chordType === 'd') {
                return DIMINISHED_CHORD.map(x => x + n)
            }
        })
    }
    static allChordFilter(size: number) {
        if (size === 1) {
            return [[0]]; // first note always 0
        } else {
            const previousChordFilters = this.allChordFilter(size - 1);
            let result: number[][] = [];
            previousChordFilters.forEach(x => {
                result.push([...x, 0]);
                result.push([...x, 12]);
                result.push([...x, -12]);
            })
            return result
        }
    }



    static randomChordFilter(size: number, rand: PRNG) {
        return new Array(size).fill(0).map((n, i) => {
            const randNum = Math.abs(rand.int32()) % 3;
            if (i === 0) {
                return 0
            }
            if (randNum === 0) {
                return 0 // no change
            }
            if (randNum === 1) {
                return 12
            }
            if (randNum === 2) {
                return -12
            }
        })
    }

    static applyChordFilter(chord: number[], chordFilter: number[]) {
        return chord.map((x, i) => x + (chordFilter[i] ?? 0))
    }

    static randomizeChord(chord: number[], rand: PRNG) {
        const chrodFilter = this.randomChordFilter(chord.length, rand);
        return chord.map((x, i) => x + chrodFilter[i]);
    }

    static getTfClass(tfIdx: number) {
        return (Object.keys(TF_CLASS_MAP) as TF_CLASS[]).find(k => {
            return TF_CLASS_MAP[k].includes(tfIdx)
        })
    }
}