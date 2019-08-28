//the quei
var queu = [];
//heroku
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
//called on the click of the class in searchResults
//the onlcick methods were added recursivly in the 
//renderStations() method
function parseUrl(args) {
    var targetUrl = `http://yp.shoutcast.com/sbin/tunein-station.xspf?id=`;
    var x = new XMLHttpRequest();
    x.open("GET", proxyUrl + targetUrl + args, true);
    x.onreadystatechange = function () {
        if (x.readyState == 4 && x.status == 200) {
            var doc = x.responseXML;
            if (doc !== null) {
                try {
                    var url = doc.getElementsByTagName("location")[0].textContent;
                } catch{
                }
            } else {
                $(`.${args}`).remove();
            }
            renderPlayer(url, args);
            //console.log(args);
        }
    };
    x.send(null);
}
//renders the html5 audio player and calls the renderStations()
//method once more to remove the old html5 audio players
function renderPlayer(url, id) {
    renderStations(queu);
    $(`.${id}`).append(`  <audio controls autoplay>
<source src=${url} type="audio/mpeg">
Your browser does not support the audio element.
</audio>
`);
   //console.log(id);
}
//wait to add listeners (do i need to wait?)
$(document).ready(function () {
    document.getElementById("searchBtn").addEventListener("click", function () { searchGenre() });
    $("input").keypress(function (e) {
        if (e.which == 13) {
            searchGenre();
        }
    });
});
//simple function that searches genres
function searchGenre() {
    var search = (document.getElementById("searchInput").value);
    queryGenre(search, limit)
}






