//heroku proxy URL to help stop corb errors
const proxyUrl = 'https://murmuring-retreat-89479.herokuapp.com/';
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
    // let targetUrl = `http://api.shoutcast.com/station/advancedsearch?mt=audio/mpeg&search=${genre}&limit=${limit}&f=json&k=${key}`;
    fetch(`https://murmuring-retreat-89479.herokuapp.com/api/genre/${genre}`, { mode: "cors" })
        .then(res => res.json())
        .then(res => {
            buildQueue(res.data)
        }).catch(error => failure());
};
//build the queue
function buildQueue(stations, genre) {
    let targetUrl = `https://murmuring-retreat-89479.herokuapp.com/api/station/`;
    console.log(stations)
    for (let i = 0; i < stations.length; i++) {
        fetch(targetUrl + stations[i].id)
            // .then((res) => res.text())
            .then(res => res.json())
            .then(responseXML => {
                let data = responseXML.data
                console.log(data)
                let oParser = new DOMParser();
                let oDOM = oParser.parseFromString(data, 'application/xml');
                try {
                    let station = {
                        name: stations[i].name,
                        genre: stations[i].genre,
                        bitRate: stations[i].br,
                        listeners: stations[i].lc,
                        logo: stations[i].logo,
                        id: stations[i].id,
                        url: oDOM.getElementsByTagName('location')[0].textContent,
                        state: 1
                    };
                    //station passed first test
                    //check to see if the station will play
                    checkAudio(station, genre);
                } catch {
                    //station failed first test, move on
                    //decrement the sum of stations
                    denomitaor--;
                }
            })
            .catch(error => console.log(error));
    }
}
function failure() {
    //alert the user there was an issue
    $('.header h2').empty();
    $('.header h2').append('nothing found!');
    $('.header h2').css('color', 'red');
    $('#searchInput').val('Search a music genre...');
    $('.header h2').fadeOut(5000);
}
//make sure the station will play
function checkAudio(station) {
    numerator++;
    renderStation(station);
    let audioElement = document.createElement('audio');
    audioElement.src = station.url;
    // audioElement.onerror = function () {
    //     //station failed the second test
    //     numerator--;
    //     denomitaor--;
    //     $(`.${station.id}`).hide();
    // }
    //render regardless then hide the corrupt stations
    $('.header h2').empty();
    //calculate the rendering process percentage
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
        shout(station.id, station.url, station.state)
    });
}
//play the clicked tile
function shout(id, url, state) {
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
