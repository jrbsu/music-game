const MAX_ATTEMPTS = 5;
let song_array = [];
let points = MAX_ATTEMPTS;
let thisYear = 0;
let total = 0;
let game_over_text = "Game over YEAR!"


const MIN_YEAR = 1953
const MAX_YEAR = 2023

const pointsElement  = document.getElementById( "points")
const guessInput     = document.getElementById( "guess" )
const guessButton    = document.getElementById( "guessButton" )
const giveUpButton   = document.getElementById( "giveUpButton" )
const nextSongButton = document.getElementById( "nextSongButton" )

function randomYear() {
    let random = Math.floor(Math.random() * (MAX_YEAR - MIN_YEAR) + MIN_YEAR);
    return random
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

fetch('./tracks.json')
    .then(response => {
        return response.json();
    })
    .then(json => {
        song_array = [];
        thisYear = randomYear();
        json.forEach(function(element) {
            let year = element["year"]
            let title = element["title"]
            let artist = element["artist"]
            if (thisYear == year) {
                song_array.push([title, artist])
            }
        });
        shuffleArray(song_array);
        document.getElementById('songs').innerHTML = '<div class="song"><div class="title">' + song_array[0][0] + '</div>\n<div class="artist">' + song_array[0][1] + '</div></div>';
        console.log( {correctYear: thisYear});
        updatePointsBox()
    });

document.getElementById( "guess" ).addEventListener( "input", e => {
    e.target.value = e.target.value.replace( /[^0-9]/g, "" )
} )

nextSongButton.addEventListener('click', newSong);

function newSong() {
    if ( points === 0 ) return

    if ( points > 1 )
    {
        const newSong = document.createElement('div');
        newSong.className = "song";
        newSong.innerHTML = '<div class="title">' + song_array[points][0] + '</div>\n<div class="artist">' + song_array[points][1] + '</div>';
        document.getElementById('songs').appendChild(newSong);
    }
    points--
    updatePointsBox()
}

function removeClassByPrefix(node, prefix) {
	var regx = new RegExp('\\b' + prefix + '[^ ]*[ ]?\\b', 'g');
	node.className = node.className.replace( regx, "" );
	return node;
}

function handleGameOver() {
    pointsElement.innerHTML = game_over_text;
    setDisableAllElements( true )
}

function handleSuccess() {
    var pointsNode = document.getElementById("points");
    removeClassByPrefix(pointsNode, "points-");
    document.getElementById("points").classList.add("rainbowGradient");
    pointsElement.innerHTML = `You win ${points} points!!`
    total += points;
    setDisableAllElements( true )
}

function handleIncorrect() {
    if ( points > 0 ) return newSong();
    updatePointsBox();
    handleGameOver();
}

function setDisableAllElements( disabled = true ) {
    guessButton.disabled    = disabled
    guessInput.disabled     = disabled
    giveUpButton.disabled   = disabled
    nextSongButton.disabled = disabled
}

function updatePointsBox() {
    const pointsClass = "points-" + points;

    pointsElement.classList.remove( "points-" + (points + 1) );
    pointsElement.classList.add( pointsClass );

    if ( points !== 0 ) {
        pointsElement.innerHTML = `For ${points} points...`
    }
    else {
        pointsElement.innerHTML = game_over_text;
    }
    
}

function wasGuessValid( guess ) {
    return (
        guess >= MIN_YEAR &&
        guess <= MAX_YEAR
    )
}

function handleGuess() {
    if ( guessButton.disabled ) return

    const guess = +document.getElementById("guess").value
    
    if ( !wasGuessValid( guess ) ) return

    if ( guess === thisYear )
        handleSuccess();
    else
        handleIncorrect();

    guessInput.value = ""

}

guessButton.addEventListener( "click", handleGuess )
giveUpButton.addEventListener( "click", () => {
    points = 0
    handleIncorrect()
} )
guessInput.addEventListener( "keydown", e => {
    if ( e.code === "Enter" ) handleGuess()
} )