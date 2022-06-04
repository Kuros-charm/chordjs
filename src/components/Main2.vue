<script setup lang="ts">

import { MAJOR_CHORD, MAJOR_SCALE, MINOR_CHORD, type MusicActionRelTime } from '@/lib/music/MusicConstant';
import { MusicHelper } from '@/lib/music/MusicHelper';
import { MusicPlayer } from '@/lib/music/MusicPlayer';
import { computed, ref, watch } from 'vue';
import seedrandom from 'seedrandom';
import ChordInput from './ChordInput.vue';



const chordInputs = ref([
    {
        tf: "1",
        chordFilters: ['0', '12', '0'],
        chordValue: []
    }
])

const keyNote = ref('C4')

// watch([chordInputs, keyNote], () => {
//     updateChordValue();

// }, {
//     deep: true
// })

const computeChordInputs = computed({
    get: () => {
        const value = chordInputs.value
        try {
            const key = keyNote.value
            if (!key) return value;
            const isMajor = true;
            const keyNum = MusicHelper.noteToNumber(key);
            if (keyNum == null) return value;
            let tonalFunction = MusicHelper.makeTonalFunction(keyNum, isMajor);
            return chordInputs.value.map(x => {
                if (x.tf) {
                    const chord = tonalFunction[parseInt(x.tf)];
                    let chordNum = chord.map(n => MusicHelper.noteToNumber(n));
                    chordNum = MusicHelper.applyChordFilter(chordNum, x.chordFilters.map(x => +x) || []);
                    x.chordValue = chordNum.map(x => MusicHelper.numberToNote(x));
                }
                return x
            });

        } catch (e) { }


        return chordInputs.value


    },
    set: (value: any[]) => {
        const newV = value;
        //emit('update:chordFilters', newV);
        return newV;

    }
})

let player: MusicPlayer;
function playChord(chord: string[]) {
    if (!chord?.length) return;
    player = new MusicPlayer(100);
    player.play(MusicHelper.convertToAbsTime([{
        sound: chord,
        length: '8n'
    }]))
}

function handleOnPlay() {
    // chordInputs.value = chordInputs.value.map(x => {
    //     x.chordFilters = x.chordFilters.map(x => -1 * x);
    //     x.chordValue = ['x', 'y']
    //     return x
    // })

}

function handleOnStop() {
    player?.stop()

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
        <ChordInput v-for="(item, i) in computeChordInputs" :key-note="keyNote" v-model:tf="item.tf"
            v-model:chord-filters="item.chordFilters" v-model:chord-value="item.chordValue" @click:play="playChord">
        </ChordInput>

    </div>

    <div class="container">
        <div class="btn-group" role="group">
            <button type="button" class="btn btn-dark" v-on:click="handleOnPlay">Play</button>
            <button type="button" class="btn btn-dark" v-on:click="handleOnStop">Stop</button>
        </div>
    </div>
    {{ chordInputs[0].chordFilters.join(',') }}
    {{ chordInputs[0].chordValue.join(',') }}


</template>

<style scoped>
</style>
