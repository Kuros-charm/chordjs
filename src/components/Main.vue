<script setup lang="ts">

import { MAJOR_CHORD, MAJOR_SCALE, MINOR_CHORD, type MusicActionRelTime } from '@/lib/music/MusicConstant';
import { MusicHelper } from '@/lib/music/MusicHelper';
import { MusicPlayer } from '@/lib/music/MusicPlayer';
import { ref } from 'vue';
import seedrandom from 'seedrandom';

let player: MusicPlayer;

const randSeed = ref(new Date().toLocaleString());


const chordProgressionText = ref('')


const chrodTexts = ref([])


function handleOnNextSeed() {
  randSeed.value = new Date().toLocaleString()
  handleOnPlay()
}

function handleOnPlay() {
  const key = 'G3';
  const isMajor = true;
  const bassline = [7, 6, 5, 4, 3, 2, 1, 4];
  const rand = seedrandom(randSeed.value);

  const keyNum = MusicHelper.noteToNumber(key);
  const basslineFormula = bassline.map(b => {
    const rmd = b % 7;
    const q = b < 0 ? Math.ceil(b / 7) : Math.floor(b / 7);
    return MAJOR_SCALE[rmd] + q * 12
  })
  const basslineNotes = MusicHelper.formulaToNotes(keyNum - 12, basslineFormula)

  let tonalFunction = MusicHelper.makeTonalFunction(keyNum, isMajor);
  tonalFunction = MusicHelper.randomizeTonalFunction(tonalFunction, rand)

  const chordProgressionFormula = MusicHelper.generateChordProgression(basslineNotes, tonalFunction, rand)

  chordProgressionText.value = chordProgressionFormula.map(x => x + 1).join(', ')

  chrodTexts.value = chordProgressionFormula.map(f => {
    const chord = tonalFunction[f];
    //const chordNums = chord.map(x => MusicHelper.noteToNumber(x));
    // firstNum = chordNums[0];
    //return `${f + 1}: ${chordNums.map(x => x - firstNum).join(', ')}`;
    return `${f + 1}: ${chord.join(', ')}`;
  })



  //const chordProgressionFormula = [0, 4, 5, 0, 3, 0, 1, 4];


  const musicActions: MusicActionRelTime[] = [];
  chordProgressionFormula.forEach((f, i) => {

    const sortedTonalFunction = [...tonalFunction[f]].sort((a, b) => MusicHelper.noteToNumber(a) - MusicHelper.noteToNumber(b))

    // musicActions.push({
    //   sound: MusicHelper.numberToNote(MusicHelper.noteToNumber(sortedTonalFunction[0]) - 12),
    //   length: '4n'
    // })


    // musicActions.push({
    //   sound: sortedTonalFunction,
    //   length: '4n'
    // })
    musicActions.push({
      sound: basslineNotes[i],
      length: '4n'
    })
    //musicActions.push(1) // delay



    const finger = [0, 1, 2, 1];
    finger.forEach(fg => {
      musicActions.push({
        sound: (sortedTonalFunction)[fg],
        length: '8n'
      })
      musicActions.push(0.25) // delay
    })



  })
  player = new MusicPlayer(100);
  player.play(MusicHelper.convertToAbsTime(musicActions))
}

function handleOnStop() {
  player?.stop()
}

</script>

<template>
  <div class="input-group input-group-sm mb-3">
    <div class="input-group-prepend">
      <button class="btn btn-outline-secondary" type="button" v-on:click="handleOnNextSeed">Next Seed</button>
    </div>
    <input type="text" v-model="randSeed" class="form-control" aria-label="Small"
      aria-describedby="inputGroup-sizing-sm">
  </div>
  <div class="btn-group" role="group" aria-label="Basic example">
    <button type="button" class="btn btn-dark" v-on:click="handleOnPlay">Play</button>
    <button type="button" class="btn btn-dark" v-on:click="handleOnStop">Stop</button>
  </div>
  <div class="input-group input-group-sm mb-3">
    <div class="input-group-prepend">
      <span class="input-group-text" id="inputGroup-sizing-sm">Generated Chord Progression</span>
    </div>
    <input type="text" v-model="chordProgressionText" class="form-control" aria-label="Small" readonly
      aria-describedby="inputGroup-sizing-sm">
  </div>

  <div>----</div>


  <div v-for="(item, index) in chrodTexts" class=" input-group input-group-sm mb-3">
    <div class="input-group-prepend">
      <span class="input-group-text" id="inputGroup-sizing-sm">Generated Chord</span>
    </div>
    <input type="text" v-model="chrodTexts[index]" class="form-control" aria-label="Small" readonly
      aria-describedby="inputGroup-sizing-sm">
  </div>


</template>

<style scoped>
</style>
