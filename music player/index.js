console.log("hello");
let folders = ["CS", "LNCs", "NCS"];
let currentsong = new Audio();
let songs;
let currfolder;

// this function converts sec into min:sec formate

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = minutes.toString().padStart(2, "0");
  const formattedSeconds = remainingSeconds.toString().padStart(2, "0");
  /* 1. padStart(2, '0') means "pad the string with '0' until its length is 2".
 2. If the string is already 2 characters or longer, no padding is added.
 3. If the string is shorter than 2 characters, 0 is added to the start until it is 2 characters long.*/

  return `${formattedMinutes}:${formattedSeconds}`;
}

// fetching songs and prints in songlist
async function getsongs(folder) {
  currfolder = folder;
  let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a"); // a because song links are stored in a href
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index]; // element store the 'a' of inder 0 and check its link ends with .mp3 link is accessed using href

    // [1]gives string after /song/ if [0] then give string wrong string
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  // printing song names and using for of loop to print the song name
  //  isko getsongs me isley dala taki card pe click krne k badh songs load ho jaaye
  let songUl = document
    .querySelector(".songlist")
    .getElementsByTagName("ul")[0];
  songUl.innerHTML = "";
  for (const song of songs) {
    songUl.innerHTML =
      songUl.innerHTML +
      `<li> <img class="invert" src="music.svg" alt="">
                         <div class="info">
                             <div>${song.replaceAll("%20", " ")}</div>
                             <div> Ramesh</div>
                         </div>
                         <div class="playnow">
                             <span>Play now</span>
                             <img class="invert" src="play.svg" alt="">
                         </div>
                     </li>`;
    // replace %20 with space
  }

  // attach eventlistener to each song
  Array.from(
    document.querySelector(".songlist").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", () => {
      console.log(e.querySelector(".info").firstElementChild.innerHTML);
      playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
      // If track has extra spaces, it might result in an incorrect URL like /songs/ song name , which could lead to a 404 error because the actual file name might be /songs/song name.
      // The trim() method removes any leading and trailing whitespace from the string, ensuring that the track variable contains the correct song name without any extra spaces.
    });
  });

  return songs;
}

// function for album display using js we also did it using html
async function displayalbums() {
  let a = await fetch(`http://127.0.0.1:5500/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchor = div.getElementsByTagName("a");

  console.log(`here` + anchor[1].href);

  let cardcontainer = document.getElementById("cardcontainer");
  let array = Array.from(anchor);

  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    if (e.href.includes("/songs")) {
      let folder = e.href.split("/").slice(-2)[1];
      console.log(folder);
      try {
        let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
        let response = await a.json();

        let child = document.createElement("div");
        child.className = "card";
        child.dataset.folder = folder;
        child.innerHTML = `
          <div class="play">
            <img src="play_circle.svg" alt="">
          </div>
          <img src="/songs/${folder}/img.jpg" alt="">
          <h2>${response.title}</h2>
          <p>${response.description}</p>
        `;
        cardcontainer.appendChild(child);
      } catch (err) {
        console.log(`Error fetching info for folder ${folder}:`, err);
      }
    }
  }

  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`);
    });
  });
}

const playmusic = (track, pause = false) => {
  currentsong.src = `/${currfolder}/` + track; //folder where all the song files are stored +file name of the song
  currentsong.play();
  document.querySelector(".songinfo").innerHTML = track;
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
  if (!pause) {
    // default condition pause is false so not false is true
    currentsong.play();
    play.src = "pause.svg"; // if its outside the default play icon will show instead of pause
  }
};

// Directory Path: /songs/
// Track Parameter: song1.mp3
// Full URL: /songs/song1.mp3

async function main() {
  // getting the list of songs on console
  songs = await getsongs("songs/NCS");
  console.log(songs);
  displayalbums();
  playmusic(songs[0], true);

  // Attach event listener to play next and previous
  play.addEventListener("click", () => {
    if (currentsong.paused) {
      currentsong.play();
      play.src = "pause.svg";
    } else {
      currentsong.pause();
      play.src = "play.svg";
    }
  });
  // for timeupdate
  currentsong.addEventListener("timeupdate", () => {
    console.log(currentsong.duration, currentsong.currentTime);
    document.querySelector(".songtime").innerHTML = `${formatTime(currentsong.currentTime)}/  ${formatTime(currentsong.duration)}`;

    document.querySelector(".circle").style.left =(currentsong.currentTime / currentsong.duration) * 100 + "%";
  });

  // event listener for seekbar

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    // console.log(e.target.getBoundingClientRect());
    /* 1. The Element.getBoundingClientRect() method returns a DOMRect object providing information 
about the size of an element and its position relative to the viewport.
2. offsetX is the horizontal coordinate of the mouse pointer relative to the target element
 when the event was triggered.
 3. e.target.getBoundingClientRect(), you're getting the dimensions and position of the element that
  triggered the event.This is useful for calculating positions and dimensions relative to the element.
 */
    document.querySelector(".circle").style.left = percent + "%";
    currentsong.currentTime = (currentsong.duration * percent) / 100;
  });

  // eventlistener for hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  document
    .querySelector(".cross")
    .firstElementChild.addEventListener("click", () => {
      document.querySelector(".left").style.left = "-150%";
    });

  // event listener for prev and next btn

  document.getElementById("prev").addEventListener("click", () => {
    console.log("prev clicked");
    console.log(currentsong);
    // console.log(currentsong.src.split("/").slice(-1));
    // song scr ko / se split kiya fir last wala mp3 part(-1) slice out krliya [0] song index
    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);

    console.log(songs, index);

    if (index - 1 >= 0) {
      playmusic(songs[index - 1]);
    }
  });

  // event listener for prev and next btn

  document.getElementById("next").addEventListener("click", () => {
    console.log("next clicked");
    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);

    if (index + 1 < songs.length) {
      playmusic(songs[index + 1]);
    }
  });

  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      console.log(e, e.target, e.target.value);
      currentsong.volume = parseInt(e.target.value) / 100;

      // The parseInt() function parses a string argument and returns an integer of the specified
    });

  // loading different songs on clicking different albums
  // currentTarget ko use kiya target ki jhaga kyuki target se catrd har element individually select hora tha
  // ex: h5 p. so currentTarget se  poora card ek single element click hoga
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`);
      playmusic(songs[0])
    });
  });

  // event listener for mute
  document.querySelector(".volume>img").addEventListener("click", (e) => {
    console.log(e.target);
    console.log(e.target.src);
    // let mt=e.target.src
    // console.log(mt);
    if (e.target.src.includes("volume.svg")) {
      e.target.src=e.target.src.replaceAll("volume.svg","mute.svg"); // String immutable hoti hai
      currentsong.volume = 0;
      document.querySelector(".range").getElementsByTagName("input")[0].value=0
    } 
    else {
      e.target.src=e.target.src.replaceAll("mute.svg","volume.svg");
      currentsong.volume = 0.9
      document.querySelector(".range").getElementsByTagName("input")[0].value=50;

    }
  });
}

main();
