//heroku proxy URL to stop corb errors
const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
//my shoutcast developer key
const key = 'OVxbFpTaTgaBkwGC';
//limit of results from shoutcast
const limit = 50;
//attempts at api call
let attempt = 0;
//numerator of progress
let numerator = 0;
//denominator of progress
let denomitaor = limit;
//progress is converted to a percentage on station load
let progress = 0;
//query shoutcast
function queryGenre(genre, limit) {
    attempt++;
    if (attempt === 1) {
        //let user know its searching
        $('.header h2').empty();
        $('.header h2').append(`searching...`);
        //let the user know to be patient
    } if (attempt === 2) {
        $('.header h2').empty();
        $('.header h2').append('please be patient...');

    }
    //create a variable to hold the value of genre
    //for recursion bellow
    let args = genre;
    //url passed to SHOUTcast
    let targetUrl = `http://api.shoutcast.com/station/advancedsearch?mt=audio/mpeg&search=${genre}&limit=${limit}&f=json&k=${key}`;
    fetch(proxyUrl + targetUrl)
        .then(response => response.json())
        .then(data => {
            //try 3 times before giving up
            if (attempt < 3) {
                let arr = data.response.data.stationlist
                //use recursion to handle incomplete reponses from shoutcast
                if (arr.station == null) {
                    //if the response is null, call this method again
                    queryGenre(args, limit);
                }
                else {
                    //if not, builQueue()
                    buildQueue(data, genre);
                }
                //try and handle bad search requests
                // such as  queryGenre(safsafsd, limit)
            } else {
                failure();
                $('.landing').show();
                $('.sk-circle').hide();
            }
        })
        .catch(error => failure());
};
//build the queue
function buildQueue(args, genre) {
    let targetUrl = `http://yp.shoutcast.com/sbin/tunein-station.xspf?id=`;
    let response = args.response.data.stationlist.station;
    for (let i = 0; i < response.length; i++) {
        fetch(proxyUrl + targetUrl + response[i].id, { mode: 'cors' })
            .then((res) => res.text())
            .then(responseXML => {
                let oParser = new DOMParser();
                let oDOM = oParser.parseFromString(responseXML, 'application/xml');
                try {
                    let station = {
                        name: response[i].name,
                        genre: response[i].genre,
                        bitRate: response[i].br,
                        listeners: response[i].lc,
                        logo: response[i].logo,
                        id: response[i].id,
                        url: oDOM.getElementsByTagName('location')[0].textContent,
                        state: 1
                    };
                    //check to see if the station will play
                    checkAudio(station, genre);
                } catch{
                    //decrement the sum of stations
                    denomitaor--;
                }
            })
            .catch(error => failure());
    }
}
function failure() {
    //alert the use there was an issue
    $('.header h2').empty();
    $('.header h2').append('nothing found!');
    $('.header h2').css('color', 'red');
    $('#searchInput').val('Search a music genre...');
    $('.header h2').fadeOut(5000);
}
//make sure the station will play
function checkAudio(station) {
    //station passed first test
    numerator++;
    renderStation(station);
    let audioElement = document.createElement('audio');
    audioElement.src = station.url;
    audioElement.onerror = function () {
        //station failed the second
        numerator--;
        denomitaor--;
        $(`.${station.id}`).hide();
    }
    //render regardless then hide the corrupt stations
    $('.header h2').empty();
    progress = (numerator / denomitaor) * 100
    $('.header h2').append(`${progress.toFixed(2)}%`);
    if (progress === 100) {
        $('.header h2').empty();
    }
}
//render the stations to the DOM
function renderStation(station) {
    $('.sk-circle').hide();
    $('.landing').hide();
    $('.logo').hide();
    $('.searchResults').append(`
                    <div class='${station.id}' id='${station.id}'>
                    <h1>${station.name}
                    </h1>
                    <img src=${station.logo} alt='Not Found' onerror=this.src='./res/headphones.png'>
                    <ul>
                    <li>Genre: ${station.genre}</li>
                    <li>${station.bitRate} kbps</li>
                    <li>Listeners: ${station.listeners}</li>
                    </ul>
                    <div class='stationState' id='${station.id}state'>
                    </div>
                    </div>`
    );
    $(`#${station.id}`).click(function () {
        station.state++;
        $('.header h2').empty();
        shout(station.id, station.url, station.state, station.name)
    });
}
//play the clicked tile
function shout(id, url, state, name) {
    //remove all other sounds
    let sounds = document.getElementsByTagName('audio');
    for (i = 0; i < sounds.length; i++) sounds[i].remove();
    $('.stationState').empty();
    //all states start at one, if state is divisible by two
    //the station is on, else it is off
    //each time a station is clicked its state is incremented by one
    if (state % 2 == 0) {
        $(`.${id}`).append(`
            <audio id='aud' controls autoplay>
            <source src=${url} type='audio/mpeg'>
            </audio>`
        );
        $('audio').hide();
        //add listeners to know when the station plays, loading or waiting for network
        sounds = document.getElementsByTagName('audio')[0];
        sounds.addEventListener('playing', function () {
            $('.header h2').empty();
            $('.header h2').append(`LIVE`);
            $(`#${id}state`).empty();
            $(`#${id}state`).append(`
            <div class='lds-facebook'>
            <div>
            </div>
            <div>
            </div>
            <div>
            </div>
            </div>`);
        }, true);
        sounds.addEventListener('loadstart', function () {
            $('.header h2').empty();
            $('.header h2').append(`Connecting...`);
            $(`#${id}state`).empty();
            $(`#${id}state`).append(`
            <div class='lds-ellipsis'>
            <div>
            </div>
            <div>
            </div>
            <div>
            </div>
            <div>
            </div>
            </div>`);
        }, true);
        sounds.addEventListener('waiting', function () {
            $('.header h2').empty();
            $('.header h2').append('Waiting for network...');
            $(`#${id}state`).empty();
            $(`#${id}state`).append(`
            <div class='lds-ellipsis'>
            <div>
            </div>
            <div>
            </div>
            <div>
            </div>
            <div>
            </div>
            </div>`);
        }, true);
    }
    //if state is an odd number, stop the playback
    else {
        sounds = document.getElementsByTagName('audio');
        for (i = 0; i < sounds.length; i++) sounds[i].remove();
    }
}
//set up the queryGenre function for arguments
function searchGenre() {
    attempt = 0;
    numerator = 0
    denomitaor = limit;
    let search = (document.getElementById('searchInput').value);
    //make sure isn't an empty field
    if ((search !== "") && (search !== 'Search a music genre...')) {
        queryGenre(search, limit)
        var toast = document.getElementById('snackbar');
        toast.className = 'show';
        setTimeout(function () { toast.className = toast.className.replace('show', ''); }, 2900);
    } else {
        $('#searchInput').val('Search a music genre...');
        $('.sk-circle').hide();
    }
}
//add listeners and remove loading circle
function initiate() {
    $('.header h2').empty();
    $('.sk-circle').hide();
    $('#searchBtn').click(function () {
        attempt = 0;
        $('.landing').show();
        $('.searchResults').empty();
        $('.sk-circle').show();
        $('.logo').show();
        searchGenre();
    });
    $('input').keypress(function (args) {
        attempt = 0;
        if (args.which == 13) {
            $('.landing').show();
            $('.searchResults').empty();
            $('.sk-circle').show();
            $('.logo').show();
            searchGenre();
        }
    });
    $('input').click(function (args) {
        attempt = 0;
        $('#searchInput').val('');
        
    });
}
//wait for dom to load before initiate()
document.addEventListener('DOMContentLoaded', function () {
    initiate();
});
