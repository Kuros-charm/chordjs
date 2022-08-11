import type { PRNG } from "seedrandom";
import { Time } from "tone";
import { DIMINISHED_CHORD, HARMONIC_MINOR_SCALE, MAJOR_CHORD, MAJOR_SCALE, MAJOR_TONAL_FUNCTIONS, MIDI_FLAT_NAMES, MIDI_NUM_NAMES, MINOR_CHORD, MINOR_TONAL_FUNCTIONS, type MusicActionAbsTime, type MusicActionRelTime, type MusicSound } from "./MusicConstant";

export class MusicHelper {

    static noteToNumber(note: string) {
        let result = MIDI_NUM_NAMES.indexOf(note);
        if (result === -1) {
            result = MIDI_FLAT_NAMES.indexOf(note);
        }
        return result
    }

    static numberToNote(idx: number) {
        return MIDI_NUM_NAMES[idx];
    }

    static addPitchNumber(notes: string[], firstPitch = '4') {
        // assume first note is the lowest, add pitch number
        const firstNoteIdx = this.noteToNumber(notes[0] + firstPitch);

        return notes.map(n => {
            const findFn = (note: string, idx: number) => {
                if (idx < firstNoteIdx) {
                    return false;
                }
                if (note.replace(/[0-9]/, '') !== n) {
                    return false;
                }
                return true;
            }
            let result = MIDI_NUM_NAMES.find(findFn);
            if (!result) {
                result = MIDI_FLAT_NAMES.find(findFn)
            }
            return result
        })


    }

    static formulaToNotes(keyNumber: number, formula: number[]) {
        return formula.map(relativeIdx => {
            const indexMIDI = relativeIdx + keyNumber;
            return this.numberToNote(indexMIDI)
        })
    }
    static notesToFormula(notes: string[]) {
        return notes.map(n => {
            return this.noteToNumber(n) - this.noteToNumber(notes[0])
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
        const tonalFunctions = isMajor ? MAJOR_TONAL_FUNCTIONS : MINOR_TONAL_FUNCTIONS;
        const rootNotes = this.formulaToNotes(keyNumber, isMajor ? MAJOR_SCALE : HARMONIC_MINOR_SCALE);
        return rootNotes.map((n, i) => {
            const chordType = tonalFunctions[i];
            if (chordType === 'M') {
                return this.formulaToNotes(this.noteToNumber(n), MAJOR_CHORD);
            }
            if (chordType === 'm') {
                return this.formulaToNotes(this.noteToNumber(n), MINOR_CHORD);
            }
            if (chordType === 'd') {
                return this.formulaToNotes(this.noteToNumber(n), DIMINISHED_CHORD);
            }
        })
    }

    static makeRandomTonalFunction(keyNumber: number, isMajor: boolean, rand: PRNG) {
        const tonalFunctions = isMajor ? MAJOR_TONAL_FUNCTIONS : MINOR_TONAL_FUNCTIONS;
        const rootNotes = this.formulaToNotes(keyNumber, isMajor ? MAJOR_SCALE : HARMONIC_MINOR_SCALE);
        return rootNotes.map((n, i) => {
            const chordType = tonalFunctions[i];
            if (chordType === 'M') {
                return this.formulaToNotes(this.noteToNumber(n), this.randomizeChord(MAJOR_CHORD, rand));
            }
            if (chordType === 'm') {
                return this.formulaToNotes(this.noteToNumber(n), this.randomizeChord(MINOR_CHORD, rand));
            }
            if (chordType === 'd') {
                return this.formulaToNotes(this.noteToNumber(n), this.randomizeChord(DIMINISHED_CHORD, rand));
            }
        })
    }



    static randomizeChord(chrod: number[], rand: PRNG) {
        const addRandomOctiveToNote = (noteNumber: number) => {
            const randNum = rand.int32();
            if ((randNum % 3) === 0) {
                return noteNumber // no change
            }
            if ((randNum % 3) === 1) {
                return noteNumber + 12
            }
            if ((randNum % 3) === 2) {
                return noteNumber - 12
            }
        }
        return chrod.map((x, i) => i === 0 ? x : addRandomOctiveToNote(x))
    }

}