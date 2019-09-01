//the queu
var queu = [];
//heroku proxy
var proxyUrl = "https://cors-anywhere.herokuapp.com/"
//my dev key
var key = "OVxbFpTaTgaBkwGC"
//limit of results returned
var limit = 25;
//called first, get search results from shoutcast
function queryGenre(genre, limit) {
    if ((genre !== "Search...") && (genre !== "")) {
        var targetUrl = `http://api.shoutcast.com/station/advancedsearch?mt=audio/mpeg&search=${genre}&limit=${limit}&f=json&k=${key}`;
        fetch(proxyUrl + targetUrl)
            .then(response => response.json())
            .then(responseJson => buildQueu(responseJson))
            .catch(error => alert("NOTHING FOUND, TRY AGAIN"));
    } else {
        alert("SEARCH FOR A GENRE BELOW!");
    }
}
//called second, builds an array of station objects
function buildQueu(args) {
    queu = [];
    var response = args.response.data.stationlist.station;
    for (let i = 0; i < response.length; i++) {
        queu.push({
            name: response[i].name,
            genre: response[i].genre,
            currentTrack: response[i].ct,
            bitRate: response[i].br,
            listeners: response[i].lc,
            logo: response[i].logo,
            id: response[i].id
        });
    }
    renderStations(queu);
}
//called third, renders dom elements and listeners and empties old elements
function renderStations(args) {
    $(".searchResults").empty();
    for (let i = 0; i < args.length; i++) {
        $(".searchResults").append(
            `<div class="${args[i].id}" onclick="parseUrl(this.className)">
                <h1>${args[i].name}
                </h1>
                <img src="${args[i].logo}" alt="Not Found" onerror=this.src="headphones.png">
                <ul>
                <li>Genre: ${args[i].genre}</li>
                <li>${args[i].bitRate} bps</li>
                <li>Listeners: ${args[i].listeners}</li>
                <li>Now Playing: ${args[i].currentTrack}</li>
                </ul>
                </div>`);
    }
}
function parseUrl(args) {
    var targetUrl = `http://yp.shoutcast.com/sbin/tunein-station.xspf?id=`;

    fetch(proxyUrl + targetUrl + args, { mode: 'cors' })
        .then(response => response.text())
        .then(responseXML => {
            // console.log(responseXML);
            let oParser = new DOMParser();
            let oDOM = oParser.parseFromString(responseXML, "application/xml");
            // console.log(oDOM);
            let url;
            try {
                url = oDOM.getElementsByTagName("location")[0].textContent
            } catch{
                alert("STATION UNAVAILABLE");
                $(`.${args}`).remove();
            }
            renderPlayer(url, args);
        });
}
function renderPlayer(url, id) {
    renderStations(queu);
    $(`.${id}`).append(`
            <audio id="aud" controls="controls">
            <source src=${url} type="audio/mpeg">
            </audio>`);
    const audio = document.querySelector('audio');
    
    audio.oncanplay = (event) => {
        console.log("success");
        success(id);
    };
    audio.onerror = (event) => {
        console.log("error");
    };
    audio.onabort = (event) => {
        console.log("abort");
    };
    audio.onstalled = (event) => {
        console.log("stalled");
    };
    audio.onsuspend = (event) => {
        console.log("suspend");
    };
}
function success(args) {
    $("audio").trigger("play");
    $(".load").empty();

}
//function that searches genres
function searchGenre() {
    //scroll back to top on new search
    $(".searchResults").animate({ scrollTop: 0 }, 1000);
    var search = (document.getElementById("searchInput").value);
    queryGenre(search, limit)
}
//wait to add listeners (do i need to wait?)
$(document).ready(function () {
    $("#searchBtn").click(function () { searchGenre() });
    $("input").keypress(function (e) {
        if (e.which == 13) {
            searchGenre();
        }
    });
});