let CurrentSong = new Audio();
let songs = [];

// ----------- HELPERS -------------
function getFileName(path) {
  return path.substring(path.lastIndexOf("/") + 1);
}

function getCover(track) {
  return `cover/${track.replace(".mp3", ".jpg")}`;
}

function displayName(track) {
  return track.replace(".mp3", "").replaceAll("-", " ");
}

function updateUI(track) {
  sname.innerHTML = displayName(track);
  mainCover.src = getCover(track);
}

function playMusic(track) {
  CurrentSong.src = `Songs/${track}`;
  CurrentSong.play();
  play.src = "images/pause.svg";
  updateUI(track);
}

function Timing(seconds) {
  let m = Math.floor(seconds / 60);
  let s = Math.floor(seconds % 60);
  if (s < 10) s = "0" + s;
  return `${m}:${s}`;
}

// ----------- LOAD SONGS (NETLIFY SAFE) -------------
async function getSongs() {
  let res = await fetch("songs.json"); // ← working on Netlify
  let list = await res.json();
  return list;
}

// ----------- MAIN APP -------------
async function main() {
  songs = await getSongs();
  let songsUL = document.querySelector(".list ul");

  // Populate list
  songs.forEach((song) => {
    songsUL.innerHTML += `
        <li>
            <div style="display:flex;align-items:center;">
                <img class="cover" src="${getCover(
                  song
                )}" width="50" height="50">
                <p style="color:white;">${displayName(song)}</p>
            </div>
            <p class = "plu">PLAY NOW <img style="filter: invert(1); width:20px" src="images/play.svg"></p>
        </li>`;
  });

  // Clicking a song
  Array.from(document.querySelectorAll(".list li")).forEach((li, index) => {
    li.addEventListener("click", () => {
      playMusic(songs[index]);
    });
  });

  CurrentSong.addEventListener("timeupdate", () => {
    if (!CurrentSong.duration) return;
    circle.style.left =
      (CurrentSong.currentTime / CurrentSong.duration) * 100 + "%";
    time.innerHTML = `${Timing(CurrentSong.currentTime)} / ${Timing(
      CurrentSong.duration
    )}`;
  });

  if (!CurrentSong.src) {
    updateUI(songs[0]);
  }

  // Play / Pause
  play.addEventListener("click", () => {
    if (!CurrentSong.src) {
      playMusic(songs[0]);
      return;
    }
    if (CurrentSong.paused) {
      CurrentSong.play();
      play.src = "images/pause.svg";
    } else {
      CurrentSong.pause();
      play.src = "images/play.svg";
    }
  });
  
  document.addEventListener("keydown", (e) => {
    if (e.key === " ") {
      e.preventDefault();
      if (!CurrentSong.src) {
        playMusic(songs[0]);
        return;
      }
      if (CurrentSong.paused) {
        CurrentSong.play();
        play.src = "images/pause.svg";
      } else {
        CurrentSong.pause();
        play.src = "images/play.svg";
      }
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      let current = getFileName(CurrentSong.src);
      let idx = songs.indexOf(current);
      if (idx === -1) return;

      let nextIndex = idx === songs.length - 1 ? 0 : idx + 1;
      playMusic(songs[nextIndex]);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      let current = getFileName(CurrentSong.src);
      let idx = songs.indexOf(current);
      if (idx === -1) return;

      let prevIndex = idx === 0 ? songs.length - 1 : idx - 1;
      playMusic(songs[prevIndex]);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      let newVol = Math.min(1, CurrentSong.volume + 0.05);
      CurrentSong.volume = newVol;
      volumeSlider.value = newVol;
      updateVolumeIcon(newVol);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      let newVol = Math.max(0, CurrentSong.volume - 0.05);
      CurrentSong.volume = newVol;
      volumeSlider.value = newVol;
      updateVolumeIcon(newVol);
    }
  });

  // Previous
  prev.addEventListener("click", () => {
    let current = getFileName(CurrentSong.src);
    let idx = songs.indexOf(current);
    if (idx === -1) return;

    let prevIndex = idx === 0 ? songs.length - 1 : idx - 1;
    playMusic(songs[prevIndex]);
  });

  // Next
  next.addEventListener("click", () => {
    let current = getFileName(CurrentSong.src);
    let idx = songs.indexOf(current);
    if (idx === -1) return;

    let nextIndex = idx === songs.length - 1 ? 0 : idx + 1;
    playMusic(songs[nextIndex]);
  });

  CurrentSong.addEventListener("ended", () => {
    let current = getFileName(CurrentSong.src);
    let idx = songs.indexOf(current);
    if (idx === -1) return;

    let nextIndex = (idx + 1) % songs.length;
    playMusic(songs[nextIndex]);
  });

  // Volume
  volumeSlider.addEventListener("input", function () {
    CurrentSong.volume = this.value;
    vol.src =
      this.value == 0
        ? "images/volumeoff.svg"
        : this.value < 0.5
        ? "images/vollow.svg"
        : "images/volume.svg";
  });

  vol.addEventListener("click", () => {
    if (CurrentSong.volume == 0) {
      CurrentSong.volume = 1;
      volumeSlider.value = 1;
      vol.src = "images/volume.svg";
    } else {
      CurrentSong.volume = 0;
      volumeSlider.value = 0;
      vol.src = "images/volumeoff.svg";
    }
  });

  // Seek
  const seekbar = document.querySelector(".seekbar");
  const circle = document.querySelector(".circle");

  seekbar.addEventListener("click", (e) => {
    let percent = e.offsetX / seekbar.clientWidth;
    CurrentSong.currentTime = percent * CurrentSong.duration;
  });

  // Sidebar
  const ham = document.querySelector(".ham");
  const Bleft = document.querySelector(".Bleft");
  const cross = document.querySelector(".cros");

  ham.addEventListener("click", () => {
    Bleft.classList.toggle("show");
  });

  cross.addEventListener("click", () => {
    Bleft.classList.remove("show");
  });

  document.querySelectorAll(".list li").forEach((li) => {
    li.addEventListener("click", () => {
      Bleft.classList.remove("show");
    });
  });
}

main();
