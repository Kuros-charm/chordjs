<script setup lang="ts">

import { MAJOR_CHORD, MAJOR_SCALE, MINOR_CHORD, type MusicActionRelTime } from '@/lib/music/MusicConstant';
import { MusicHelper } from '@/lib/music/MusicHelper';
import { MusicPlayer } from '@/lib/music/MusicPlayer';
import { ref } from 'vue';
import seedrandom from 'seedrandom';

let player: MusicPlayer;

let randSeed = ref(new Date().toLocaleString());

function handleOnNextSeed() {
  randSeed.value = new Date().toLocaleString()
}

function handleOnPlay() {
  const rand = seedrandom(randSeed.value);

  const tonalFunction = MusicHelper.makeRandomTonalFunction(MusicHelper.noteToNumber('G3'), true, rand);
  const chordProgressionFormula = [0, 4, 5, 0, 3, 0, 1, 4];
  const bassline = [7, 6, 5, 4, 3, 2, 1, 4];
  const basslineFormula = bassline.map(b => MAJOR_SCALE[b])

  const basslineNotes = MusicHelper.formulaToNotes(MusicHelper.noteToNumber('G2'), basslineFormula)

  const musicActions: MusicActionRelTime[] = [];
  chordProgressionFormula.forEach((f, i) => {

    const sortedTonalFunction = [...tonalFunction[f]].sort((a, b) => MusicHelper.noteToNumber(a) - MusicHelper.noteToNumber(b))

    musicActions.push({
      sound: MusicHelper.numberToNote(MusicHelper.noteToNumber(sortedTonalFunction[0]) - 12),
      length: '4n'
    })


    musicActions.push({
      sound: tonalFunction[f],
      length: '4n'
    })
    // musicActions.push({
    //   sound: basslineNotes[i],
    //   length: '4n'
    // })
    musicActions.push(1) // delay



    // const finger = [0, 1, 2, 1];
    // finger.forEach(fg => {
    //   musicActions.push({
    //     sound: (sortedTonalFunction)[fg],
    //     length: '8n'
    //   })
    //   musicActions.push(0.25) // delay
    // })



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


</template>

<style scoped>
</style>
