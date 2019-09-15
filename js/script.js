//initialize an empty station array
let queue = [];
//heroku proxy URL to stop corb errors
let proxyUrl = 'https://cors-anywhere.herokuapp.com/';
//my shoutcast developer key
let key = 'OVxbFpTaTgaBkwGC';
//limit of results from shoutcast
let limit = 50;
let attempt = 0;
//makes a call to the shoutcast api 
function queryGenre(args, limit) {
    let genre = args;
    let targetUrl = `http://api.shoutcast.com/station/advancedsearch?mt=audio/mpeg&search=${genre}&limit=${limit}&f=json&k=${key}`;
    fetch(proxyUrl + targetUrl)
        .then(response => response.json())
        .then(data => {
            let arr = data.response.data.stationlist
            console.log(arr.station);
            if(arr.station == null){
                attempt++;
                queryGenre(genre,limit);
            }
            else{
                attempt = 0;
                buildQueue(data,args);
            } 
        })
        .catch(error => console.error(error))
        console.log(attempt);

};
//creates an array of station objects
//and calls checkAudio(station) in the loop
function buildQueue(args, genre) {
    let targetUrl = `http://yp.shoutcast.com/sbin/tunein-station.xspf?id=`;
    let response = args.response.data.stationlist.station;
    queue = [];
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
                    queue.push(station);
                    checkAudio(station,genre);
                } catch (error) {
                    console.log(error);
                }
            })
            .catch(error => console.log(error));
    }
    console.log(queue);
}

function checkAudio(station, genre) {
    renderStation(station);
    let audioElement = document.createElement('audio');
    audioElement.src = station.url;
    audioElement.onerror = function () {
        $(`.${station.id}`).hide();
    }
}

//render the stations to the DOM
function renderStation(station) {
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
    //add an click listener to each station 
    $(`#${station.id}`).click(function () {
        station.state++;
        shout(station.id, station.url, station.state)
    });
}
//clear all other audio
//play the station and set up loading bars
function shout(id, url, state) {
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
            $('.stationState').empty();
            $(`#${id}state`).append(`
            <div class='lds-facebook'>
            <div>
            </div>
            <div>
            </div>
            <div>
            </div>
            </div>`);
        }, true)
        sounds.addEventListener('loadstart', function () {
            $('.state').empty();
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
        }, true)
    }
    else {
        sounds = document.getElementsByTagName('audio');
        for (i = 0; i < sounds.length; i++) sounds[i].remove();
    }
}
//search a genre
function searchGenre() {
    let search = (document.getElementById('searchInput').value);
    if ((search !== "") && (search !== "Search a music genre...")) {
        queryGenre(search, limit)
    } else {
        alert('SEARCH FOR A GENRE BELOW!');
        $("#searchInput").val("Search a music genre...");
    }
}
//set up click and return key listener for input
$(document).ready(function () {
    $('#searchBtn').click(function () {
        $('.searchResults').empty();
        searchGenre();
    });
    $('input').keypress(function (args) {
        if (args.which == 13) {
            $('.searchResults').empty();
            searchGenre();
        }
    });
    queryGenre(genreArray[Math.floor(Math.random() * genreArray.length)], limit);
});