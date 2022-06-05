<script setup lang="ts">

import { MAJOR_CHORD, MAJOR_SCALE, MINOR_CHORD, TF_CLASS, type MusicActionRelTime } from '@/lib/music/MusicConstant';
import { MusicHelper } from '@/lib/music/MusicHelper';
import { MusicPlayer } from '@/lib/music/MusicPlayer';
import { computed, ref, watch } from 'vue';
import seedrandom, { type PRNG } from 'seedrandom';
import ChordInput from './ChordInput.vue';
import { deepClone } from '@/lib/common';



function newChordInput(): {
    tf: string;
    tfClass: TF_CLASS | 'RNG';
    chordFilters: string[];
    chordValue: string[];



    filteredChords: {
        chord: string[];
        tfClass: TF_CLASS;
        tf: number;
        chordFilters: number[];
        chordFormula: number[];
        id: number;
    }[],
    randomSelectedChord?: {
        chord: string[];
        tfClass: TF_CLASS;
        tf: number;
        chordFilters: number[];
        chordFormula: number[];
        id: number;
    }
} {
    return {
        tf: 'RNG',
        chordFilters: ['0', 'RNG', 'RNG'],
        chordValue: [],
        tfClass: 'RNG',
        filteredChords: []


    }
}

const chordInputs = ref([
    newChordInput()
])

const keyNote = ref('C4');
const randSeed = ref(new Date().getTime().toString())


const allChordFormula: {
    tfClass: TF_CLASS,
    tf: number,
    chordFilters: number[],
    chordFormula: number[]
}[] = [];
// calculate all chord formula.
const tonalFunctionFormula = MusicHelper.makeTonalFunctionFormulas(true);
const allChordFilter = MusicHelper.allChordFilter(3);
tonalFunctionFormula.forEach((chordFormula, tfIdx) => {
    allChordFilter.forEach(chordFilters => {
        allChordFormula.push({
            tfClass: MusicHelper.getTfClass(tfIdx),
            tf: tfIdx,
            chordFilters: chordFilters,
            chordFormula: MusicHelper.applyChordFilter(chordFormula, chordFilters),
        })
    })
})


const allChords = computed(() => {
    const key = keyNote.value
    if (!key) return [];
    const keyNum = MusicHelper.noteToNumber(key);
    if (keyNum == null) return [];
    return allChordFormula.map((x, id) => {
        return {
            ...x,
            id,
            chord: MusicHelper.formulaToNoteNum(keyNum, x.chordFormula).map(x => MusicHelper.numberToNote(x))
        }
    })
})


function filterChord(chordInputIdx: number) {
    const {
        tfClass,
        tf,
        chordFilters,
        chordValue
    } = chordInputs.value[chordInputIdx];

    return allChords.value.filter(c => {
        if (tfClass && tfClass !== 'RNG' && tfClass !== c.tfClass) return false;
        if (tf && tf !== 'RNG' && parseInt(tf) !== c.tf) return false;
        if (chordFilters && chordFilters.find((x, i) => x !== 'RNG' && c.chordFilters[i] !== parseInt(x))) return false
        return true;
    })



}


const computeChordInputs = computed(() => {
    return chordInputs.value.map((x, i) => {
        const filteredChords = filterChord(i);
        x.filteredChords = [...filteredChords];
        if (filteredChords.length === 1) {
            x.randomSelectedChord = filteredChords[0];
            x.chordValue = x.randomSelectedChord.chord
        }
        return x
    });
})

let player: MusicPlayer;
function selectRandomChord(idx: number, rand: PRNG) {
    const ci = chordInputs.value[idx];
    if (!ci.filteredChords.length) {
        ci.randomSelectedChord = null;
        return;
    }
    ci.randomSelectedChord = ci.filteredChords[Math.abs(rand.int32()) % ci.filteredChords.length];
    ci.chordValue = ci.randomSelectedChord.chord;
}


function playOneChord(idx: number) {
    const rand = seedrandom(randSeed.value + idx.toString());
    selectRandomChord(idx, rand);

    const chordInput = chordInputs.value[idx];
    if (chordInput.randomSelectedChord) {
        player = new MusicPlayer(100);
        player.play(MusicHelper.convertToAbsTime([{
            sound: chordInput.randomSelectedChord.chord,
            length: '8n'
        }]));

    }
}

function handleOnPlay() {
    const ma: MusicActionRelTime[] = []
    chordInputs.value.forEach((c, i) => {
        const rand = seedrandom(randSeed.value + i.toString());
        selectRandomChord(i, rand);
        if (c.chordValue) {
            ma.push(
                {
                    sound: c.chordValue,
                    length: '8n'
                }
            )
        }

        ma.push(1)
    });

    player = new MusicPlayer(100);
    player.play(MusicHelper.convertToAbsTime(ma))
}

function handleOnStop() {
    player?.stop()

}

function handleAddRow() {
    chordInputs.value.push(
        newChordInput()
    )
}

function handleDeleteRow(idx: number) {
    chordInputs.value.splice(idx, 1)
}

function handleCopyRow(idx: number) {
    chordInputs.value.splice(idx, 0, deepClone(chordInputs.value[idx]))
}

function handleOnNextSeed() {
    randSeed.value = new Date().getTime().toString();
    handleOnPlay()
}
function handleResetRow(idx: number) {
    chordInputs.value.splice(idx, 1, newChordInput())
}

</script>

<template>
    <div class="container">
        <div class="input-group">
            <span class="input-group-text">Key Note</span>
            <input type="text" class="form-control" placeholder="e.g. C4" v-model="keyNote">
        </div>

    </div>
    <div class="container">
        <ChordInput v-for="(item, i) in computeChordInputs" :filtered-chords="item.filteredChords" v-model:tf="item.tf"
            v-model:chord-filters="item.chordFilters" v-model:chord-value="item.chordValue"
            v-model:tf-class="item.tfClass" @click:copy="handleCopyRow(i)" @click:play="playOneChord(i)"
            @click:reset="handleResetRow(i)" @click:delete="handleDeleteRow(i)"
            :random-selected-chord="item.randomSelectedChord">

        </ChordInput>

    </div>

    <div class="container">
        <div class="input-group input-group-sm mb-3">
            <div class="input-group-prepend">
                <button class="btn btn-outline-secondary" type="button" v-on:click="handleOnNextSeed">Next Seed</button>
            </div>
            <input type="text" v-model="randSeed" class="form-control" aria-label="Small"
                aria-describedby="inputGroup-sizing-sm">
        </div>
        <div class="btn-group" role="group">
            <button type="button" class="btn btn-dark" v-on:click="handleAddRow">Add Row</button>
            <button type="button" class="btn btn-dark" v-on:click="handleOnPlay">Play</button>
            <button type="button" class="btn btn-dark" v-on:click="handleOnStop">Stop</button>
        </div>
    </div>
    {{ chordInputs[0].chordFilters.join(',') }}
    {{ chordInputs[0].chordValue.join(',') }}


</template>

<style scoped>
</style>
