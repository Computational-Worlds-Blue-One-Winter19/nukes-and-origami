//--------------
// Audio Object
//--------------
const introAudio = {
  buffer: {},
  compatibility: {},
  files: [

    // 'https://forestmist.org/share/web-audio-api-demo/audio/beat.wav',
    './audio/Intro_Redone.mp3',
    'https://storage.googleapis.com/nukes-and-origami/static/Game_Loop_v.15.wav',
  ],
  loop: [
    false,
    true,
  ],
  stop: false,
  proceed: true,
  source_loop: {},
  source_once: {},
};

const bossAudio = {
  buffer: {},
  compatibility: {},
  files: [

    // 'https://forestmist.org/share/web-audio-api-demo/audio/beat.wav',
    './audio/Boss_Intro_Redone.mp3',
    './audio/Boss_loop_Redone.mp3',
    // 'beat.wav'
  ],
  loop: [
    false,
    true,
  ],
  stop: false,
  proceed: true,
  source_loop: {},
  source_once: {},
};

function generateAudioObject(introFile, loopFile) {
  return {
    buffer: {},
    compatibility: {},
    files: [

      // 'https://forestmist.org/share/web-audio-api-demo/audio/beat.wav',
      introFile,
      loopFile,
    // 'beat.wav'
    ],
    loop: [
      false,
      true,
    ],
    stop: false,
    proceed: true,
    source_loop: {},
    source_once: {},
  };
}

//-----------------
// Audio Functions
//-----------------
function findSync(audio, n) {
  let first = 0;
  let current = 0;
  let offset = 0;

  // Find the audio source with the earliest startTime to sync all others to
  // for (const i in audio.source_loop) {
  //   current = audio.source_loop[i]._startTime;
  //   if (current > 0) {
  //     if (current < first || first === 0) {
  //       first = current;
  //     }
  //   }
  // }

  for (let index = 0; index < audio.source_loop.length; index += 1) {
    current = audio.source_loop[i]._startTime;
    if (current > 0) {
      if (current < first || first === 0) {
        first = current;
      }
    }
  }

  if (audio.context.currentTime > first) {
    offset = (audio.context.currentTime - first) % audio.buffer[n].duration;
  }

  return offset;
}

function stopAudio(audio, n) {
  if (audio.source_loop[n]._playing) {
    audio.source_loop[n][audio.compatibility.stop](0);
    audio.source_loop[n]._playing = false;
    audio.source_loop[n]._startTime = 0;
    if (audio.compatibility.start === 'noteOn') {
      audio.source_once[n][audio.compatibility.stop](0);
    }
  }
}

function playAudio(audio, n) {
  if (audio.source_loop[n]._playing) {
    stopAudio(audio, n);
  } else {
    audio.source_loop[n] = audio.context.createBufferSource();
    audio.source_loop[n].buffer = audio.buffer[n];
    audio.source_loop[n].loop = audio.loop[n - 1];
    // Gain Nodes allow us to control the volume
    const gainNode = audio.context.createGain();
    gainNode.gain.value = 0.07; // setting it to 10%
    gainNode.connect(audio.context.destination);
    audio.source_loop[n].connect(gainNode);

    if (_.keys(audio.source_loop).length > 1) {
      console.log('Adding the on end callback');
      audio.source_loop[n].onended = () => {
        if (!audio.stop) {
          playAudio(audio, 2);
        }
      };
    } else {
      console.log('Length less than one');
    }


    const offset = findSync(audio, n);
    audio.source_loop[n]._startTime = audio.context.currentTime;

    if (audio.compatibility.start === 'noteOn') {
      /*
      The depreciated noteOn() function does not support offsets.
      Compensate by using noteGrainOn() with an offset to play once
      and then schedule a noteOn() call to loop after that.
      */
      audio.source_once[n] = audio.context.createBufferSource();
      audio.source_once[n].buffer = audio.buffer[n];
      audio.source_once[n].connect(audio.context.destination);
      // currentTime, offset, duration
      audio.source_once[n].noteGrainOn(0, offset, audio.buffer[n].duration - offset);
      /*
        Note about the third parameter of noteGrainOn().
        If your sound is 10 seconds long, your offset 5 and duration 5 then you'll
        get what you expect.
        If your sound is 10 seconds long, your offset 5 and duration 10 then the
        sound will play from the start instead of the offset.
      */

      // Now queue up our looping sound to start immediatly after the source_once audio plays.
      audio.source_loop[n][audio.compatibility.start](audio.context.currentTime + (audio.buffer[n].duration - offset));
    } else {
      audio.source_loop[n][audio.compatibility.start](0, offset);
    }

    audio.source_loop[n]._playing = true;
  }
}

//-----------------------------
// Check Web Audio API Support
//-----------------------------
function download(audio) {
  try {
    // More info at http://caniuse.com/#feat=audio-api
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    audio.context = new window.AudioContext();
  } catch (e) {
    audio.proceed = false;
    alert('Web Audio API not supported in this browser.');
  }

  if (audio.proceed) {
    //---------------
    // Compatibility
    //---------------
    // (function () {
    let start = 'start';
    let stop = 'stop';
    const buffer = audio.context.createBufferSource();

    if (typeof buffer.start !== 'function') {
      start = 'noteOn';
    }
    audio.compatibility.start = start;

    if (typeof buffer.stop !== 'function') {
      stop = 'noteOff';
    }
    audio.compatibility.stop = stop;
    // }());

    //-------------------------------
    // Setup Audio Files and Buttons
    //-------------------------------
    for (const a in audio.files) {
      // (function () {
      const i = parseInt(a) + 1;
      const req = new XMLHttpRequest();
      req.open('GET', audio.files[i - 1], true); // array starts with 0 hence the -1
      // req.withCredentials = true;
      req.responseType = 'arraybuffer';
      console.log('Making the requests');
      req.onload = () => {
        audio.context.decodeAudioData(
          req.response,
          (buffer) => {
            audio.buffer[i] = buffer;
            audio.source_loop[i] = {};
            audio.source_loop[i]._playing = false;
            console.log('Got a response');
            // var button = document.getElementById('button-loop-' + i);
            // button.addEventListener('click', function(e) {
            //     e.preventDefault();
            //     audio.play(this.value);
            // });
          },
          () => {
            console.log(`Error decoding audio "${audio.files[i - 1]}".`);
          },
        );
      };
      req.send();
      // }());
    }
  }
}

download(introAudio);
download(bossAudio);


// ---- START HOWLER Sound related function

function crossfadedLoop(enteringInstance, leavingInstance, soundLevel) {
  const volume = soundLevel;
  const crossfadeDuration = 1000;

  // Get the sound duration in ms from the Howler engine
  const soundDuration = Math.floor(enteringInstance._duration * 1000);


  // Fade in entering instance
  const audio = enteringInstance.pos(10).play();
  enteringInstance.fade(0, volume, crossfadeDuration);

  // Wait for the audio end to fade out entering instance
  // white fading in leaving instance
  setTimeout(() => {
    enteringInstance.fade(volume, 0, crossfadeDuration);
    crossfadedLoop(leavingInstance, enteringInstance);
  }, soundDuration - crossfadeDuration);
}

/**
 * Helper to build similar instances
 * @param {String} urls The source path for the audio files
 * @param {Function} onload Call back method for then the sound is loaded
 */
function createHowlerInstance(urls, onload) {
  return new Howl({
    src: urls,
    loop: false,
    volume: 0,
    onload,
  });
}

function playLoop(soundObject) {
  // Create "slave" instance. This instance is meant
  // to be played after the first one is done.
  soundObject.instances.push(createHowlerInstance(['./audio/Game_Loop_v.1.ogg']));

  // Create "master" instance. The onload function passed to
  // the singleton creator will coordinate the crossfaded loop
  soundObject.instances.push(createHowlerInstance(['./audio/Game_Loop_v.1.ogg'], () => {
    crossfadedLoop(soundObject.instances[1], soundObject.instances[0], soundObject.volume);
  }));
}

function pauseLoop(soundObject) {
  for (let i = 0; i < soundObject.instances.length; i++) {
    soundObject.instances[i].pause();
  }
}

// ---- END Sound related function
