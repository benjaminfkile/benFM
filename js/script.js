//heroku proxy URL to stop corb errors
const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
//my shoutcast developer key
const key = 'OVxbFpTaTgaBkwGC';
//limit of results from shoutcast
const limit = 50;
//attempts at api call
let attempt = 0;
//query shoutcast
let numerator = 1;
let denomitaor = limit;
let progress = 0;
function queryGenre(genre, limit) {
    attempt++;
    if (attempt === 1) {
        $('.header h2').empty();
        //$('.header h2').css('color','green');
        $('.header h2').append(`searching...`);
        //$('.header h2').fadeOut(5000);
    } if (attempt === 2) {
        $('.header h2').empty();
        //$('.header h2').css('color','orange');
        $('.header h2').append('please be patient...');
        // $('.header h2').fadeOut(5000);
    }
    let args = genre;
    let targetUrl = `http://api.shoutcast.com/station/advancedsearch?mt=audio/mpeg&search=${genre}&limit=${limit}&f=json&k=${key}`;
    fetch(proxyUrl + targetUrl)
        .then(response => response.json())
        .then(data => {
            if (attempt < 3) {
                let arr = data.response.data.stationlist
                //use recursion to handle incomplete reponses from shoutcast
                if (arr.station == null) {
                    queryGenre(args, limit);
                }
                else {
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
    /*
    $('.header h2').empty();
    $('.header h2').append('building queue');
    */
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
                    checkAudio(station, genre);
                } catch{
                    denomitaor--;
                    //nohting to do, the station is corrupt
                    //no need to display a bad station 
                    //to a user or let them know about it
                    //move on to parse the next url
                }
            })
            .catch(error => failure());
    }

}
function failure() {
    $('.header h2').empty();
    $('.header h2').append('nothing found!');
    $('.header h2').css('color', 'red');
    $('#searchInput').val('Search a music genre...');
    $('.header h2').fadeOut(5000);
}
//make sure the station will play
function checkAudio(station) {
    renderStation(station);
    let audioElement = document.createElement('audio');
    audioElement.src = station.url;
    numerator++;
    audioElement.onerror = function () {
        numerator--;
        denomitaor--;
        $(`.${station.id}`).hide();
    }
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
    let sounds = document.getElementsByTagName('audio');
    for (i = 0; i < sounds.length; i++) sounds[i].remove();
    $('.stationState').empty();
    if (state % 2 == 0) {
        $(`.${id}`).append(`
            <audio id='aud' controls autoplay>
            <source src=${url} type='audio/mpeg'>
            </audio>`
        );
        $('audio').hide();
        sounds = document.getElementsByTagName('audio')[0];
        sounds.addEventListener('playing', function () {
            $('.header h2').empty();
            $('.header h2').append(`LIVE`);
            console.log('playing');
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
            console.log('loading');
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
            console.log('waiting');
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
    var toast = document.getElementById('snackbar');
    toast.className = 'show';
    setTimeout(function () { toast.className = toast.className.replace('show', ''); }, 2900);
    let search = (document.getElementById('searchInput').value);
    if ((search !== "") && (search !== 'Search a music genre...')) {
        queryGenre(search, limit)
    } else {
        alert('SEARCH FOR A GENRE BELOW!');
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

}
document.addEventListener('DOMContentLoaded', function () {
    initiate();
});
