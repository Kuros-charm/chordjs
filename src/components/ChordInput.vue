<script setup lang="ts">
import { MAJOR_SCALE, TF_CLASS, TF_CLASS_MAP } from '@/lib/music/MusicConstant';
import { MusicHelper } from '@/lib/music/MusicHelper';
import { computed, ref, watch, type PropType } from 'vue';


const props = defineProps({
    keyNote: String,
    filteredChords: Array as PropType<{
        chord: string[];
        tfClass: TF_CLASS;
        tf: number;
        chordFilters: number[];
        chordFormula: number[];
    }[]>,
    tf: String,
    tfClass: String as PropType<TF_CLASS | 'RNG'>,
    chordFilters: Array as PropType<string[]>,
    chordValue: Array as PropType<string[]>,
    noteFilter: String,
    randomSelectedChord: Object as PropType<{
        chord: string[];
        tfClass: TF_CLASS;
        tf: number;
        chordFilters: number[];
        chordFormula: number[];
    }>,
    isOverrideChordValue: Boolean



})


const emit = defineEmits([
    'update:tf',
    'update:tfClass',
    'update:chordFilters',
    'update:chordValue',
    'update:noteFilter',
    'click:play',
    'click:delete',
    'click:copy',
    'click:reset',
    'update',
])

const computeFilterValue = computed({
    get: () => props.chordFilters,
    set: (value: string[]) => {
        const newV = value;
        emit('update:chordFilters', newV);
        return newV;

    }
})

const computeChordValue = computed({
    get: () => (props.chordValue || []).join(', '),
    set: (value: string) => {
        const newV = (value || '').split(',').map(x => x.trim()).filter(x => x);
        emit('update:chordValue', newV);
        return newV;

    }
});

const computeTf = computed({
    get: () => props.tf || '',
    set: (value: string) => {
        emit('update:tf', value);
        return value;
    }
})

const computeTfClass = computed({
    get: () => props.tfClass || null,
    set: (value: TF_CLASS | 'RNG') => {
        emit('update:tfClass', value);
        return value;
    }
});

const computeNoteFilter = computed({
    get: () => props.noteFilter,
    set: (value: string) => {
        emit('update:noteFilter', value);
        return value;
    }
});



const tfClassOptions = [
    { value: TF_CLASS.TONIC, description: 'Tonic' },
    { value: TF_CLASS.SUBDOMINANT, description: 'SubDominant' },
    { value: TF_CLASS.DOMINANT, description: 'Dominant' }
]

const allTF = [
    { value: "0", description: 'I' },
    { value: "1", description: 'II' },
    { value: "2", description: 'III' },
    { value: "3", description: 'IV' },
    { value: "4", description: 'V' },
    { value: "5", description: 'VI' },
    { value: "6", description: 'VII' },
]

const chordFilterOpts = [
    { value: "0", description: 'None' },
    { value: "12", description: '+1' },
    { value: "-12", description: '-1' },

]

const computedTfOptions = computed(() => {
    return allTF.filter(opt => props.filteredChords.find(c => c.tf === (parseInt(opt.value))))
})

const computedRandTfClassText = computed(() => {
    if (props.randomSelectedChord) {
        return `R (${tfClassOptions.find(opt => opt.value === props.randomSelectedChord.tfClass).description})`
    }
    return `Random`
});

const computedRandTfText = computed(() => {
    if (props.randomSelectedChord) {
        return `R (${allTF.find(opt => parseInt(opt.value) === props.randomSelectedChord.tf).description})`
    }
    return `Random`
});

const computedRandChordFilterTexts = computed(() => {
    if (props.randomSelectedChord) {
        return props.randomSelectedChord.chordFilters.map(x => `R (${chordFilterOpts.find(opt => parseInt(opt.value) === x).description})`);
    }
    return ['0', `Random`, `Random`]
})

const computedTfClassOpt = computed(() => {
    return tfClassOptions.filter(opt => props.filteredChords.find(c => c.tfClass === (opt.value)))

})

const computedNoteFilterOpt = computed(() => {
    if (props.keyNote) {
        return [{
            value: '',
            description: ''
        }, ...MusicHelper.formulaToNoteNum(MusicHelper.noteToNumber(props.keyNote), MAJOR_SCALE).map((noteNum, i) => {
            return {
                value: MusicHelper.noteNumToKey(noteNum),
                description: `${MusicHelper.noteNumToKey(noteNum)} (${i + 1})`
            }
        }).filter(x => props.filteredChords.find(c => c.chord.find(cc => cc.includes(x.value))))]
    }
    return []
})


</script>

<template>
    <div class="input-group mb-3">
        <button class="btn btn-dark" type="button" @click="$emit('click:delete')">Del</button>
        <button class="btn btn-dark" type="button" @click="$emit('click:copy')">Copy</button>
        <button class="btn btn-dark" type="button" @click="$emit('click:reset')">Reset</button>


        <select class="form-select" v-model="computeTfClass">
            <option selected value="RNG">{{ computedRandTfClassText }}</option>
            <option v-for="opt in computedTfClassOpt" :value="opt.value">{{ opt.description }}</option>
        </select>
        <select class="form-select" v-model="computeTf">
            <option selected value="RNG">{{ computedRandTfText }}</option>
            <option v-for="opt in computedTfOptions" :value="opt.value">{{ opt.description }}</option>
        </select>
        <!-- <span class="input-group-text">Chord Filters</span>
        <select disabled class="form-select chord-filter">
            <option selected>None</option>
        </select> -->
        <select v-for="i in 2" class="form-select chord-filter" v-model="computeFilterValue[i]">
            <option value="RNG" selected>{{ computedRandChordFilterTexts[i] }}</option>
            <option v-for="opt in chordFilterOpts" :value="opt.value">{{ opt.description }}</option>

        </select>
        <select class="form-select" v-model="computeNoteFilter">
            <option v-for="opt in computedNoteFilterOpt" :value="opt.value">{{ opt.description }}</option>
        </select>
        <input type="text" class="form-control" :class="{ 'bg-warning': isOverrideChordValue }"
            placeholder="Chord value" :value="computeChordValue"
            @blur="computeChordValue = ($event.target as any).value">
        <button class="btn btn-dark" type="button" @click="$emit('click:play')">Play</button>

    </div>

</template>

<style scoped>
.chord-filter {
    max-width: 100px;
}
</style>
