document.addEventListener("DOMContentLoaded", function () {
  const audioPlayer = document.getElementById("audio-player");
  const playPauseButton = document.getElementById("play-pause-button");
  const prevButton = document.getElementById("previous-btn");
  const nextButton = document.getElementById("next-btn");
  const seekSlider = document.getElementById("seek-slider");
  const currentTimeIndicator = document.getElementById("current-time");
  const durationDisplay = document.getElementById("duration");
  const muteButton = document.getElementById("mute-button");
  const volumeSlider = document.getElementById("volume-slider");
  const repeatButton = document.getElementById("repeat-btn");

  const songsPath = "audio/albums/"
  const streamUrls = [
    songsPath + "pop/JONY\ -\ Без\ тебя\ я\ не\ я/outputlist_mpegts.m3u8",
    songsPath + "hip-hop/drake/outputlist.m3u8",
    // Add more URLs for different HLS streams as needed
  ];

  let currentStreamIndex = 0;
  let isPlaying = false; // To track the player's playing state
  let repeatMode = 0; // To track the repeat button state: 0 = off, 1 = repeat one, 2 = repeat all

  // Function to load and play the current stream
  function loadStream() {
    const currentStreamUrl = streamUrls[currentStreamIndex];
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(currentStreamUrl);
      hls.attachMedia(audioPlayer);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        // HLS stream is ready, so enable player controls
        playPauseButton.addEventListener("click", togglePlayPause);
        prevButton.addEventListener("click", playPreviousStream);
        nextButton.addEventListener("click", playNextStream);
        seekSlider.addEventListener("input", updateSeek);
        audioPlayer.addEventListener("timeupdate", updateTime);
        audioPlayer.addEventListener("durationchange", updateDuration);
        muteButton.addEventListener("click", toggleMute);
        volumeSlider.addEventListener("input", updateVolume);
        repeatButton.addEventListener("click", toggleRepeat);

        updateRepeatButton();
        if (isPlaying) {
          audioPlayer.play(); // Autoplay the new stream if it was playing before
        }
      });
    } else if (audioPlayer.canPlayType("application/vnd.apple.mpegurl")) {
      // For Safari, use native HLS support if available
      audioPlayer.src = currentStreamUrl;
      audioPlayer.addEventListener("loadedmetadata", function () {
        // HLS stream is ready, so enable player controls
        playPauseButton.addEventListener("click", togglePlayPause);
        prevButton.addEventListener("click", playPreviousStream);
        nextButton.addEventListener("click", playNextStream);
        seekSlider.addEventListener("input", updateSeek);
        audioPlayer.addEventListener("timeupdate", updateTime);
        audioPlayer.addEventListener("durationchange", updateDuration);
        muteButton.addEventListener("click", toggleMute);
        volumeSlider.addEventListener("input", updateVolume);
        repeatButton.addEventListener("click", toggleRepeat);

        updateRepeatButton();
        if (isPlaying) {
          audioPlayer.play(); // Autoplay the new stream if it was playing before
        }
      });
    } else {
      alert("HLS is not supported in this browser.");
    }
  }

  // Load and play the initial stream
  loadStream();

  function togglePlayPause() {
    if (audioPlayer.paused) {
      audioPlayer.play();
      playPauseButton.innerHTML = "<span class='material-icons md-36'>pause</span>";
      isPlaying = true;
    } else {
      audioPlayer.pause();
      playPauseButton.innerHTML = "<span class='material-icons md-36'>play_arrow</span>";
      isPlaying = false;
    }
  }

  function playPreviousStream() {
    if (audioPlayer.currentTime > 5) {
      audioPlayer.currentTime = 0;
      // repeatCurrentStream();
    } else {
      currentStreamIndex = (currentStreamIndex - 1 + streamUrls.length) % streamUrls.length;
      loadStream();
    }
  }

  function playNextStream() {
    currentStreamIndex = (currentStreamIndex + 1) % streamUrls.length;
    loadStream();
  }

  function updateSeek() {
    const seekTime = (audioPlayer.duration * (seekSlider.value / 100)).toFixed(2);
    audioPlayer.currentTime = seekTime;
  }

  function updateTime() {
    const currentTime = audioPlayer.currentTime.toFixed(2);
    currentTimeIndicator.textContent = formatTime(currentTime);
    seekSlider.value = (audioPlayer.currentTime / audioPlayer.duration) * 100;
  }

  function updateDuration() {
    const duration = audioPlayer.duration.toFixed(2);
    durationDisplay.textContent = formatTime(duration);
  }

  function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  function toggleMute() {
    audioPlayer.muted = !audioPlayer.muted;
    muteButton.innerHTML = audioPlayer.muted
      ? "<span class='material-icons'>volume_off</span>"
      : "<span class='material-icons'>volume_up</span>";
  }

  function updateVolume() {
    audioPlayer.volume = volumeSlider.value / 100;
  }

  function toggleRepeat() {
    repeatMode = (repeatMode + 1) % 3; // Cycle between 0, 1, and 2
    updateRepeatButton();
  }

  function updateRepeatButton() {
    switch (repeatMode) {
      case 0: // Repeat off
        repeatButton.innerHTML = "<span class='material-icons'>repeat</span>";
        repeatButton.style.color = "#909090";
        break;

      case 1: // Repeat all
        repeatButton.innerHTML = "<span class='material-icons'>repeat</span>";
        repeatButton.style.color = "#fcc800";
        break;

      case 2: // Repeat one
        repeatButton.innerHTML = "<span class='material-icons'>repeat_one</span>";
        repeatButton.style.color = "#fcc800";
        break;

    }
  }

  // Event listener for the "ended" event of the audio player when in "Repeat one" mode
  function repeatCurrentStream() {
    audioPlayer.currentTime = 0; // Repeat the current track by setting currentTime to 0
    if (isPlaying) {
      audioPlayer.play(); // Resume to play audio stream if it was playing before
    }
  }

  // Function to play the next track in "Repeat all" mode when current track ends
  audioPlayer.addEventListener("ended", function () {
    if (repeatMode === 1 && streamUrls.length > 1) {
      playNextStream();
    } else if (repeatMode === 2) {
      repeatCurrentStream();
    }
  });
});
