const MAX_ATTEMPTS = 5;
let points         = MAX_ATTEMPTS;
let thisYear       = 0;
let total          = 0;
let game_over_text = "Bad luck!"
let success        = false

let all_songs = []
let songs     = []
let years     = []

let timerInterval = null
let timerPercent  = 100

const MIN_YEAR = 1953
const MAX_YEAR = 2023

const pointsElement      = document.getElementById( "points" )
const pointsTextElement  = document.getElementById( "pointsText" )
const guessInput         = document.getElementById( "guess" )
const guessButton        = document.getElementById( "guessButton" )
const giveUpButton       = document.getElementById( "giveUpButton" )
const nextSongButton     = document.getElementById( "nextSongButton" )
const newGameButton      = document.getElementById( "newGameButton" )
const decadeButtons      = Array.from(document.querySelectorAll( ".decadeButton" ))
const setupItems         = document.getElementById( "setup" )
const songItems          = document.getElementById( "songs" )
const totalElement       = document.getElementById("total-points")

const endGameInput   = document.getElementById( "endGameInput" )
const inGameInput    = document.getElementById( "inGameInput" )

function randomYear() {
  let random = Math.floor(Math.random() * years.length);
  return years[random]
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

async function fetchTracks() {
  if ( songs.length > 0 ) return

  const res = await fetch('./tracks.json')
  const json = await res.json()

  all_songs = [ ...json ]
}

async function nextRound() {
  success = false
  await fetchTracks()
  points = MAX_ATTEMPTS;

  if (years.length == 0) {
    addYears(true)
  }

  resetTimerInterval()
  thisYear = randomYear();

  songs = []
  game_over_text = "Bad luck! The year was " + thisYear
  all_songs.forEach( element => {
    const year     = element["year"]
    const title    = element["title"]
    const artist   = element["artist"]
    const video_id = element["video_id"]

    if ( thisYear === year )
      songs.push([title, artist, video_id])
  });

  shuffleArray( songs )
  document.getElementById('songs').innerHTML = '<div class="song song-5"><div class="title">' + songs[0][0] + '</div>\n<div class="artist">' + songs[0][1] + '</div></div>'
  console.log( {correctYear: thisYear})
  updatePointsBox()
  startGame()
  guessInput.focus()
}

function newSong() {
  guessInput.focus()
  removeSongItemClasses()

  if ( points > 1 ) {
    songItems.prepend( createNewSongItem() );
    // createYouTubeVideo();
  }

  points--
  updatePointsBox()
  updateBodyBackground( points )
  resetTimerInterval()

  if ( points === 0 ) handleGameOver()
}

function createNewSongItem() {
  const songElement = document.createElement( "div" );
  songElement.className = "song song-" + (points - 1)
  songElement.innerHTML = `<div class="title">${ songs[points][0] }</div><div class="artist">${ songs[points][1] }</div>`

  return songElement
}

function createYouTubeVideo() {
  const youtubePlayer = document.getElementById( "youtube" );
  youtubePlayer.innerHTML = `<iframe id="youtube" width="400" height="200" src="https://www.youtube.com/embed/${songs[points][2]}?&autoplay=1" frameborder="0" allowfullscreen></iframe>`
  console.log(youtubePlayer.innerHTML)
}

function resetTimerInterval() {
  timerPercent = 100
  clearInterval( timerInterval )
  timerIntervalCallback()

  if ( points <= 0 && success === false ) return
  timerInterval = setInterval( timerIntervalCallback, 10 );
}

function timerIntervalCallback() {
  if ( timerPercent < 0 && success === false ) {
    clearInterval( timerInterval )
    newSong()
    return 
  }

  if ( success === false ) {
    pointsElement.style = "background: " + pointsGradient();
    timerPercent -= 0.1;
  } else {
    pointsElement.style.background = null;
  }
}

function removeSongItemClasses() {
  let songNodes = document.getElementsByClassName("song");
  for ( const songNode of songNodes ) {
    removeClassByPrefix(songNode, "song-");
  }
  
}

function removeClassByPrefix(node, prefix) {
	var regx = new RegExp('\\b' + prefix + '[^ ]*[ ]?\\b', 'g');
	node.className = node.className.replace( regx, "" );
	return node;
}

function handleGameOver() {
  pointsTextElement.innerHTML = game_over_text;
  total = 0;
  removeSongItemClasses()
  setDisableAllElements( true )
  updateTotal(false)
  showEndGameInput()
}

function handleSuccess() {
  success = true
  var pointsNode = document.getElementById("points");
  removeSongItemClasses();
  removeClassByPrefix(pointsNode, "points-");
  document.getElementById("points").classList.add("rainbowGradient");
  total += points;
  pointsTextElement.innerHTML = `${thisYear} is right! You win ${points} point${points === 1 ? "" : "s"}!!<br />Now you have ${total} point${total === 1 ? "" : "s"}.`
  updateTotal(true)
  setDisableAllElements( true )
  showEndGameInput()
}

function handleIncorrect() {
  if ( points > 0 ) return newSong();

  resetTimerInterval()
  updatePointsBox();
  handleGameOver();
  updateBodyBackground( points )
}

function setDisableAllElements( disabled = true ) {
  guessButton.disabled  = disabled
  guessInput.disabled   = disabled
  giveUpButton.disabled   = disabled
  nextSongButton.disabled = disabled
}

function updatePointsBox() {
  const pointsClass = "points-" + points;

  addPointsClassToAlert( points )

  if ( points !== 0 ) {
    pointsTextElement.innerHTML = `For ${points} point${points === 1 ? "" : "s"}...`
  } else {
    pointsTextElement.innerHTML = game_over_text;
  }
  
}

function updateBodyBackground() {
  document.body.className = `body-${points}`
}

function constructGuess( guess ) {
  let century = document.getElementById("century").innerHTML;
  let guessYear = parseInt("" + century + guess);
  if (guessYear.toString().length == 3) {
    guessYear = parseInt("" + century + 0 + guess);
  }
  return guessYear
}

function wasGuessValid( guess ) {
  return (
    guess >= MIN_YEAR &&
    guess <= MAX_YEAR
  )
}

function displayModal( guess, year ) {
  let gap = year - guess;
  let modal = document.getElementById("modal");
  let modalText = document.getElementById("modal-text");

  if (gap < 0) {
    gap = gap * -1;
  }
  if (gap < 3) {
    modalText.innerHTML = "So close! 🔥";
  } else if (gap < 10) {
    modalText.innerHTML = "Not bad! 🤷‍♂️";
  } else {
    modalText.innerHTML = "Way off! ❄️";
  }

  modal.classList.add( "showModal" );
  setTimeout( () => { modal.classList.remove( "showModal" ) }, 800 )
}

function handleGuess() {
  if ( guessButton.disabled ) return

  let guess = +document.getElementById("guess").value
  guessInput.focus()

  guess = constructGuess(guess);
  
  if ( !wasGuessValid( guess ) ) return

  if ( guess === thisYear ) {
    handleSuccess();
  } else {
    displayModal(guess, thisYear);
    handleIncorrect();
  }

  guessInput.value = ""
}

function showEndGameInput() {
  endGameInput.classList.remove( "hidden" )
  inGameInput.classList.add( "hidden" )
}
function showInGameInput() {
  songItems.classList.remove( "hidden" )
  inGameInput.classList.remove( "hidden" )
  endGameInput.classList.add( "hidden" )
  setupItems.classList.add( "hidden" )
}

function startGame() {
  showInGameInput()
  setDisableAllElements( false )
  updatePointsBox()
  updateBodyBackground()
}

function addPointsClassToAlert( points ) {
  const className = `points-${points}` 
  pointsElement.className = `alert ${className}`
}

function pointsGradient() {
    const color = `var( --${colorFromPoints()}-bg )`
    return `linear-gradient( 90deg, ${color} 0%, ${color} ${timerPercent}%, transparent ${timerPercent}%, transparent 100% );`
}

function colorFromPoints() {
  switch ( points ) {
    case 5:
      return "blue"
    case 4:
      return "green"
    case 3:
      return "yellow"
    case 2:
      return "orange"
    case 1:
    case 0:
      return "red"
  }

  return "blue"
}

guessButton.addEventListener( "click", handleGuess )
giveUpButton.addEventListener( "click", () => {
  points = 0
  handleIncorrect()
} )
guessInput.addEventListener( "keydown", e => {
  if ( e.code === "Enter" ) handleGuess()
} )

newGameButton.addEventListener( "click", nextRound )

guessInput.addEventListener( "input", e => {
  e.target.value = e.target.value.replace( /[^0-9]/g, "" )
  detectCentury(e.target.value)
} )

nextSongButton.addEventListener( "click", handleIncorrect );

decadeButtons.map(button => button.addEventListener( "click", decadePicker ))

function decadePicker(e) {
  e.target.classList.toggle("selected");
  addYears(false)
}

function genYears(decade) {
  if (decade == 20) {
    return [2020, 2021, 2022, 2023]
  } else if (decade == 50) {
    return [1953, 1954, 1955, 1956, 1957, 1958, 1959]
  }
  let yearsArray = [];
  if (decade == 0 || decade == 10) {
    for (var i=0;i<10;i++) {
      decade = "" + decade;
      let number = "" + 20 + decade[0] + i;
      yearsArray.push(parseInt(number))
    }
    return yearsArray;
  } else {
    for (var i=0;i<10;i++) {
      decade = "" + decade;
      let number = "" + 19 + decade[0] + i;
      yearsArray.push(parseInt(number))
    }
    return yearsArray;
  }
}

function addYears(addAll) {
  years = [];
  let prefixes = [0, 50, 60, 70, 80, 90, 10, 20];
  if (addAll === true) {
    prefixes.forEach(function(e) {
      years.push(...genYears(e))
    });
  } else {
    decadeButtons.forEach(function(e) {
      let yearPrefix = parseInt(e.innerHTML.replace("s",""));
      let classes = Array.from(e.classList)
      if (classes.includes("selected")) {
        years.push(...genYears(yearPrefix))
      }
    });
  }
}

function detectCentury(guess) {
  let guessString = guess.toString();
  if (parseInt(guessString[0]) < 3) {
    document.getElementById("century").innerHTML = "20";
  } else {
    document.getElementById("century").innerHTML = "19";
  }
}

function updateTotal(win) {
  const pointsNumber = document.getElementById("total-points-number");
  pointsNumber.innerHTML = total;
  console.log(win)
  if (win === true) {
    totalElement.classList.add("result-success");
    pointsNumber.classList.add("result-success-number");
    setTimeout( () => {
      totalElement.classList.remove("result-success");
      pointsNumber.classList.remove("result-success-number");
    }, 1000)
  } else {
    totalElement.classList.add("result-fail");
    pointsNumber.classList.add("result-fail-number");
    setTimeout( () => {
      totalElement.classList.remove("result-fail");
      pointsNumber.classList.remove("result-fail-number");
    }, 1000)
  }
}