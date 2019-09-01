//initialize an empty station array
let queue = [];
//heroku proxy URL to stop corb errors
let proxyUrl = "https://cors-anywhere.herokuapp.com/";
//my shoutcast developer key
let key = "OVxbFpTaTgaBkwGC";
//limit of results from shoutcast
let limit = 30;
/*
query ShoutCast with params passed from 
searchGenre(genre,limit)
*/
function queryGenre(genre, limit) {
    if ((genre !== "Search...") && (genre !== "")) {
        let targetUrl = `http://api.shoutcast.com/station/advancedsearch?mt=audio/mpeg&search=${genre}&limit=${limit}&f=json&k=${key}`;
        fetch(proxyUrl + targetUrl)
            .then(response => response.json())
            .then(responseJson => buildQueue(responseJson))
            .catch(error => alert("NOTHING FOUND, TRY AGAIN"));
    } else {
        alert("SEARCH FOR A GENRE BELOW!");
    };
};
//build an array with station objects from the response
function buildQueue(args) {
    let targetUrl = `http://yp.shoutcast.com/sbin/tunein-station.xspf?id=`;
    let response = args.response.data.stationlist.station;
    queue = [];
    $(".searchResults").empty();
    for (let i = 0; i < response.length; i++) {
        fetch(proxyUrl + targetUrl + response[i].id, { mode: 'cors' })
            .then((res) => res.text())
            .then(responseXML => {
                let oParser = new DOMParser();
                let oDOM = oParser.parseFromString(responseXML, "application/xml");
                try {
                    let station = {
                        name: response[i].name,
                        genre: response[i].genre,
                        currentTrack: response[i].ct,
                        bitRate: response[i].br,
                        listeners: response[i].lc,
                        logo: response[i].logo,
                        id: response[i].id,
                        url: oDOM.getElementsByTagName("location")[0].textContent
                    };
                    queue.push(station);
                    checkAudio(station);
                } catch{
                    console.log("INVALID RESPONSE");
                }
            });
    }
}
/*
render an html5 audio player to the DOM and test if
if the stream can play, if so call renderStation(station) and 
render the the new <div></div> to the DOM
*/
function checkAudio(station) {
    $(".audioTest").empty();
    $(".audioTest").append(`
    <audio id="aud">
    <source src=${station.url} type="audio/mpeg">
    </audio>`);
    const audio = document.querySelector('audio');
    audio.onloadedmetadata = (event) => {
        renderStation(station);
    };
}
//apend the html elements to the DOM call by call
function renderStation(station) {
    $(".searchResults").append(
        `<div class="${station.id}" id="${station.id}">
                <h1>${station.name}
                </h1>
                <img src="${station.logo}" alt="Not Found" onerror=this.src="headphones.png">
                <ul>
                <li>Genre: ${station.genre}</li>
                <li>${station.bitRate} bps</li>
                <li>Listeners: ${station.listeners}</li>
                <li>Now Playing: ${station.currentTrack}</li>
                </ul>
                </div>`);
    let id = station.id;
    let url = station.url;
    $(`#${station.id}`).click(function () {
        shout(id, url)
    });
}
//finally play the stream on user click
function shout(id, url) {
    $(".nowPlaying").empty()
    $(`.${id}`).append(`
        <div class="nowPlaying">
        <audio controls autoplay>
        <source src=${url} type="audio/mpeg">
        </audio>
        </div>`
    );
}
/*
scroll the contents of the .searchResults div in the html file
back to the top and get the new search results from the DOM
call queryGenre with params "search" and "limit"
*/
function searchGenre() {
    $(".searchResults").animate({ scrollTop: 0 }, 1000);
    let search = (document.getElementById("searchInput").value);
    queryGenre(search, limit)
}
/*
add search button listener and key #13 listener then
call searchGenre() on #13 keypress or button click
*/
$(document).ready(function () {
    $("#searchBtn").click(function () { searchGenre() });
    $("input").keypress(function (args) {
        if (args.which == 13) {
            searchGenre();
        }
    });
});