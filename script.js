const MAX_ATTEMPTS = 5;
let points = MAX_ATTEMPTS;
let thisYear = 0;
let total = 0;
let game_over_text = "Bad luck!"

let all_songs   = []
let songs       = []

const MIN_YEAR = 1953
const MAX_YEAR = 2023

const pointsElement  = document.getElementById( "points")
const guessInput     = document.getElementById( "guess" )
const guessButton    = document.getElementById( "guessButton" )
const giveUpButton   = document.getElementById( "giveUpButton" )
const nextSongButton = document.getElementById( "nextSongButton" )
const newGameButton  = document.getElementById( "newGameButton" )
const songItems      = document.getElementById( "songs" )

const endGameInput   = document.getElementById( "endGameInput" )
const inGameInput    = document.getElementById( "inGameInput" )

function randomYear() {
    let random = Math.floor(Math.random() * (MAX_YEAR - MIN_YEAR) + MIN_YEAR)
    return random
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
    await fetchTracks()

    thisYear = randomYear();
    songs = []
    game_over_text = "Bad luck! The year was " + thisYear
    all_songs.forEach( element => {
        const year = element["year"]
        const title = element["title"]
        const artist = element["artist"]

        if ( thisYear === year )
            songs.push([title, artist])
    });

    shuffleArray( songs )
    document.getElementById('songs').innerHTML = '<div class="song song-5"><div class="title">' + songs[0][0] + '</div>\n<div class="artist">' + songs[0][1] + '</div></div>'
    console.log( {correctYear: thisYear})
    updatePointsBox()
    startGame()
}

guessInput.addEventListener( "input", e => {
    e.target.value = e.target.value.replace( /[^0-9]/g, "" )
} )

nextSongButton.addEventListener( "click", handleIncorrect );

function newSong() {
    guessInput.focus()
    removeSongItemClasses()

    if ( points > 1 )
        songItems.prepend( createNewSongItem() );

    points--
    updatePointsBox()

    if ( points === 0 ) handleGameOver()
}

function createNewSongItem() {
    const songElement = document.createElement( "div" )
    songElement.className = "song song-" + (points - 1)
    songElement.innerHTML = `<div class="title">${ songs[points][0] }</div><div class="artist">${ songs[points][1] }</div>`

    return songElement
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
    pointsElement.innerHTML = game_over_text;
    total = 0;
    removeSongItemClasses()
    setDisableAllElements( true )
    showEndGameInput()
}

function handleSuccess() {
    var pointsNode = document.getElementById("points");
    removeClassByPrefix(pointsNode, "points-");
    document.getElementById("points").classList.add("rainbowGradient");
    total += points;
    pointsElement.innerHTML = `${thisYear} is right! You win ${points} point${points === 1 ? "" : "s"}!!<br />Now you have ${total} point${total === 1 ? "" : "s"}.`
    setDisableAllElements( true )
    showEndGameInput()
}

function handleIncorrect() {
    if ( points > 0 ) return newSong();
    updatePointsBox();
    handleGameOver();
    updateBodyBackground( points )
}

function setDisableAllElements( disabled = true ) {
    guessButton.disabled    = disabled
    guessInput.disabled     = disabled
    giveUpButton.disabled   = disabled
    nextSongButton.disabled = disabled
}

function updatePointsBox() {
    const pointsClass = "points-" + points;

    addPointsClassToAlert( points )

    if ( points !== 0 ) {
        pointsElement.innerHTML = `For ${points} point${points === 1 ? "" : "s"}...`
    }
    else {
        pointsElement.innerHTML = game_over_text;
    }
    
}

function updateBodyBackground() {
    document.body.className = `body-${points}`
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

    const guess = +document.getElementById("guess").value
    guessInput.focus()
    
    if ( !wasGuessValid( guess ) ) return

    if ( guess === thisYear ) {
        handleSuccess();
    }
    else {
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
    inGameInput.classList.remove( "hidden" )
    endGameInput.classList.add( "hidden" )
}

function startGame() {
    points   = MAX_ATTEMPTS
    showInGameInput()
    setDisableAllElements( false )
    updatePointsBox()
    updateBodyBackground()
}

function addPointsClassToAlert( points ) {
    const className = `points-${points}` 
    pointsElement.className = `alert ${className}`
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

// entrypoint
nextRound() 
