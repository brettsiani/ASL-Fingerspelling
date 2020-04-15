
            
            
        /* Global Engine */
var _correctImagePath = "images/yay.gif";
var _tryAgainImagePath = "images/tryagain.gif";
var _replayImagePath = "images/replay.png";
var _currentWord = "";
var _currentLetterOffset;
var _score = 0;
var _signsPerSecond = 3; // Default
var _activeTimeout; 
var _letterLimit;
var _isShowingWord = false;



        /* LOADING ASL ALPHABET IMAGES */
function imagePathForLetter(letter)
{
    if (!letter)
        letter = "blank";
    return "images/" + letter + ".gif";
}

var _preloadedImages = [];
function preloadImage(imagePath)
{
    var image = new Image();
    src = imagePath;
    _preloadedImages.push(image);
}

function preloadImages()
{
    preloadImage(imagePathForLetter(""));
    for (var x = 0; x < 26; x++) {
        var letter = String.fromCharCode('a'.charCodeAt(0) + x);
        preloadImage(imagePathForLetter(letter));
        preloadImage(imagePathForLetter(letter + letter)); // This is for aa.gif, bb.gif, etc.
    }
    preloadImage(_correctImagePath);
    preloadImage(_tryAgainImagePath);
    preloadImage(_replayImagePath);
}

        /* REPLAY BUTTON IMAGE */
function setupReplayButton()
{
    $("#letter_image").click(replayWordClick);
    $("#letter_image").addClass("clickable");
}

function clearReplayButton()
{
    $('#letter_image').unbind('click');
    $("#letter_image").removeClass("clickable");
}

function setLetterImage(imagePath)
{
    if (imagePath == _replayImagePath)// Layering
        setupReplayButton();
    else
        clearReplayButton();
    $("#letter_image").attr("src", imagePath);
}

function setDisplayedLetter(letter)
{
    setLetterImage(imagePathForLetter(letter));
}

        /* SHOWING RANDOM AND STOP WORDS */
function stopShowingWord()
{
    setDisplayedLetter("");
    doneShowingWord();
}

function reachedWordEnd()
{
    setLetterImage(_replayImagePath);
    doneShowingWord();
}

function randomIntInRange(low, high)
{
    var range = high - low + 1;
    return low + Math.floor(Math.random() * range);
}

function randomWord()
{
    return words[randomIntInRange(0, words.length)];
}
        
function fetchWord(letterLimit)
{
    var triesLeft = 1000;
    var word;
    while (triesLeft--) {
        word = randomWord();
        if (word.length <= letterLimit)
            return word.toLowerCase(); // Lowercase only.
    }
}
            
function advanceToNextWord()
{
    _currentWord = fetchWord(_letterLimit); // Check for lowercase.
}

function isShowingWord()
{
    return _isShowingWord;
}

function doneShowingWord()
{
    window.clearTimeout(_activeTimeout);
    _activeTimeout = 0;
    _isShowingWord = false;
}

function currentWord()
{
    return _currentWord;
}

        /* FUNCTION OF NEW WORD AND REVEAL WORD */
function newWord()
{
    hideRevealedAnswer();
    clearAnswer();
    advanceToNextWord();
    showWordFromBeginning();
}

function showWordFromBeginning() // Clear the screen
{
    if (isShowingWord()) { 
        stopShowingWord();
        _activeTimeout = window.setTimeout(showWordFromBeginning, 200); // Blank screen speed
        return;
    }
    _currentLetterOffset = 0;
    showLetter();
}

function newWordClick(event)
{
    newWord();
    if (_gaq)
        _gaq.push(['_trackEvent', 'Buttons', 'New Word']);
}

function replayWordClick(event)
{
    replayWord();
    if (_gaq)
        _gaq.push(['_trackEvent', 'Buttons', 'Replay Word']);
}

function replayWord()
{
    showWordFromBeginning();
}

function hideRevealedAnswer()
{
    $('#reveal_answer_button').show();
    $('#reveal_answer_div').hide();
}

function revealAnswerClick(event)
{
    $('#reveal_answer_button').hide();
    $('#reveal_answer_div').show();
    $('#reveal_answer_div').text(currentWord());
    if (_gaq)
        _gaq.push(['_trackEvent', 'Buttons', 'Reveal Answer']);
}


function currentLetterName()
{
    var previousLetter = currentWord().charAt(_currentLetterOffset - 1);
    var currentLetter = currentWord().charAt(_currentLetterOffset);
    if (previousLetter == currentLetter) {
        return previousLetter + currentLetter; // In case for two same letters in a row 
    }
    return currentLetter;
}


    /* //Either show the next letter, or stop the word after the delay.
      Key off the current letter, as we want the end blank to function
    as a letter so that if someone hits "new word" right as a word is
    finishing it will pause a little extra for clarity. */

function showLetter()
{
    _isShowingWord = true;
    setDisplayedLetter(currentLetterName());
    var nextAction = currentLetterName() ? showLetter : reachedWordEnd;
    _currentLetterOffset++;
    _activeTimeout = window.setTimeout(nextAction, msPerLetter(_signsPerSecond));
}

function currentAnswer()
{
    return $('#answer_input').val().toLowerCase();
}

function clearAnswer()
{
    $('#answer_input').val("");
}

            /* CHECK ANSWER AND SCORE */
function checkAnswer()
{
    stopShowingWord();
    if (currentAnswer() == currentWord()) {
        setLetterImage(_correctImagePath);
        _activeTimeout = window.setTimeout(newWord, 2000); // Correct time length
        _score = _score+1;
        document.getElementById('scoretxt').innerHTML = _score+'';
    } else {
        setLetterImage(_tryAgainImagePath);
        _activeTimeout = window.setTimeout(replayWord, 2000); // Try again time length
        _score = _score - 1;
        document.getElementById('scoretxt').innerHTML = _score+'';
    }
    clearAnswer();
    if (_gaq)
        _gaq.push(['_trackEvent', 'Buttons', 'Check Word']);
}

function msPerLetter(signsPerSecond)
{
    return 1000 / signsPerSecond;
}

        /* SPEED LABEL CONTROL */
function speedLabelForSignsPerSecond(signsPerSecond)
{
    if (signsPerSecond <= 1)
        return "slow";
    if (signsPerSecond <= 2)
        return "medium";
    if (signsPerSecond <= 4)
        return "fast";
    return "Deaf";
}
        /* SPEED CONTROL FUNCTION */
function setSignsPerSecond(newSPS)
{
    if (_signsPerSecond == newSPS) //Ignore clicks to the same speed twice.
        return;
    _signsPerSecond = newSPS;
    replayWord();
}

function updateSpeedClick(newSPS)
{
    setSignsPerSecond(newSPS);
    if (_gaq)
        _gaq.push(['_trackEvent', 'Buttons', 'Set Speed']);
}

function setLetterLimit(letterLimit)
{
    if (_letterLimit == letterLimit) //Ignore clicks to the same letter limit twice.
        return;
    _letterLimit = letterLimit;
    newWord();
}

function updateLetterLimitClick(event)
{
    setLetterLimit(event.target.value);
    if (_gaq)
        _gaq.push(['_trackEvent', 'Buttons', 'Set Letter Limit']);
}

        /* SPEED SLIDER SETUP */
function setupSpeedSlider()
{
    function setSpeed(newSPS) {
        showSpeed(newSPS);
        updateSpeedClick(newSPS);
    }

    function showSpeed(newSPS) {
        var speedText = newSPS + " sign";
        if (newSPS > 1)
            speedText += "s";
        speedText += " per second (" + speedLabelForSignsPerSecond(newSPS) + ")";
        $("#speed_value").text(speedText);
    }

    $("#speed_slider").slider({
        min: .5,
        max: 5,
        step: .5,
        value: _signsPerSecond,
        slide: function(event, ui) { showSpeed(ui.value); },
        stop: function(event, ui) { setSpeed(ui.value); }
    });
    showSpeed(_signsPerSecond);
}

            /* LOADING PAGE (DOM) jQUERY */
window.onload = function() {
    $('#answer_input').keypress(function(event) {
        if (event.keyCode != '13') //Enter key.
            return;
        if (currentAnswer()) {
            checkAnswer();
            $('#answer_input').focus(); //Dont let the answer field to lose focus.
        } else {
            replayWord(); //If no entry, assume the word to be replayed.
        }
        event.preventDefault();
    });

    $('#check_answer_button').click(checkAnswer);
    $('#replay_word_button').click(replayWordClick);
    $('#new_word_button').click(newWordClick);
    $('#reveal_answer_button').click(revealAnswerClick);
    $('#answer_input').focus();
    $('#letter_limit_4').click(); //Click the speed/letter limit before adding event handling/tracking
    setLetterLimit(4); //Starts a new word
    $('input[name=letter_limit]').click(updateLetterLimitClick);

    setupSpeedSlider();

}
preloadImages();