//the queu
let queue = [];
//heroku proxy
let proxyUrl = "https://cors-anywhere.herokuapp.com/";
//my dev key
let key = "OVxbFpTaTgaBkwGC";
//limit of results returned
let limit = 50;
//called first, get search results from shoutcast
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

function buildQueue(args) {
    var targetUrl = `http://yp.shoutcast.com/sbin/tunein-station.xspf?id=`;
    var response = args.response.data.stationlist.station;
    queue = [];

    $(".searchResults").empty();
    for (let i = 0; i < response.length; i++) {
        fetch(proxyUrl + targetUrl + response[i].id, { mode: 'cors' })
            .then((res) => res.text())
            .then(responseXML => {
                //console.log(responseXML);
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
                    //renderStation(station)
                    checkAudio(station);

                } catch{
                    console.log("INVALID RESPONSE");
                }
            });

    }
}
function checkAudio(station) {
    $(".audioTest").empty();
    $(".audioTest").append(`
    <audio id="aud" controls="controls">
    <source src=${station.url} type="audio/mpeg">
    </audio>`);
    const audio = document.querySelector('audio');
    audio.oncanplay = (event) => {
        console.log("success");
        renderStation(station);
    };

}
function renderStation(station) {
    //console.log(station.url);
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
        play(id, url)
    });
}
function play(id, url) {
    //console.log(id);
    //console.log(url);
    $(".nowPlaying").remove();
    $(`.${id}`).append(`
        <div class="nowPlaying">
        <audio controls="controls" autoplay>
        <source src=${url} type="audio/mpeg">
        </audio>
        </div>`
    );
}
// queryGenre("edm", lim);

function searchGenre() {
    //scroll back to top on new search
    $(".searchResults").animate({ scrollTop: 0 }, 1000);
    let search = (document.getElementById("searchInput").value);
    queryGenre(search, limit)
}

$(document).ready(function () {
    $("#searchBtn").click(function () { searchGenre() });
    $("input").keypress(function (e) {
        if (e.which == 13) {
            searchGenre();
        }
    });
});
