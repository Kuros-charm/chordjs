<script setup lang="ts">
import { computed, ref, watch, type PropType } from 'vue';


const props = defineProps({
    keyNote: String,
    tf: String,
    chordFilters: Array as PropType<string[]>,
    chordValue: Array as PropType<string[]>,
    needRefresh: { type: Boolean, default: false }
})


const emit = defineEmits([
    'update:tf',
    'update:chordFilters',
    'update:chordValue',
    'click:play',
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

const computetf = computed({
    get: () => props.tf,
    set: (value: string) => {
        emit('update:tf', value);
        return value;
    }
})



</script>

<template>
    <div class="input-group mb-3">
        <select class="form-select" v-model="computetf">
            <option selected hidden>Tonic Function Class</option>
            <option value="0">I</option>
            <option value="1">II</option>
            <option value="2">III</option>
            <option value="3">IV</option>
            <option value="4">V</option>
            <option value="5">VI</option>
            <option value="6">VII</option>
        </select>
        <span class="input-group-text">Chord Filters</span>
        <select disabled class="form-select chord-filter">
            <option selected>None</option>
        </select>
        <select v-for="i in 2" class="form-select chord-filter" v-model="computeFilterValue[i]">
            <option value="0" selected>None</option>
            <option value="12">+1</option>
            <option value="-12">-1</option>
        </select>
        <input type="text" class="form-control" placeholder="Chord value" :value="computeChordValue"
            @blur="computeChordValue = ($event.target as any).value">
        <button class="btn btn-dark" type="button" @click="$emit('click:play', chordValue)">Play</button>

    </div>

</template>

<style scoped>
.chord-filter {
    max-width: 100px;
}
</style>
