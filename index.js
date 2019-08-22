var stream = "http://stream.dedyn.io:8000/dsbmradio.opus";
var limit = 50;
var proxyUrl = "https://cors-anywhere.herokuapp.com/"

function parseUrl(args) {
    var targetUrl = `http://yp.shoutcast.com/sbin/tunein-station.xspf?id=`;
    var x = new XMLHttpRequest();
    x.open("GET", proxyUrl + targetUrl + args, true);
    x.onreadystatechange = function () {
        if (x.readyState == 4 && x.status == 200) {
            var doc = x.responseXML;
            console.log(doc);
            try {
                var url = doc.getElementsByTagName("location")[0].textContent;
            } catch{
                alert("Sorry this station is not available right now");
            }
            console.log(url);
            //stream = url;
            renderPlayer(url);
        }
    };
    x.send(null);
    console.log(`station id: ${args}`);
    console.log(proxyUrl + targetUrl + args);
}
function renderPlayer(args) {
    $(".player").empty();
    $(".player").append(`  <audio controls autoplay>
<source src=${args} type="audio/mpeg">
Your browser does not support the audio element.
</audio>
`);
}
function queryGenre(args) {
    var targetUrl = `http://api.shoutcast.com/station/advancedsearch?mt=audio/mpeg&search=${args}&limit=${limit}&f=json&k=OVxbFpTaTgaBkwGC`;
    fetch(proxyUrl + targetUrl)
        .then(response => response.json())
        .then(responseJson => renderStations(responseJson))
        .catch(error => alert('queryGenre()'));
    //console.log(q);  
}
function renderStations(args) {
    $(".stations").empty();
    for (let i = 0; i < args.response.data.stationlist.station.length; i++) {
        $(".stations").append(
            `<div class="${args.response.data.stationlist.station[i].id}" onclick="parseUrl(this.className)">
            <h1>${args.response.data.stationlist.station[i].name}</h1>
            <object data="${args.response.data.stationlist.station[i].logo}" type="image/png">
            <img src="headphones.png" alt="Stack Overflow logo and icons and such">
          </object>
            <ul><li>${args.response.data.stationlist.station[i].ct}</li></ul>
            <div/>`);
    }

}
function getGenres() {
    var targetUrl = "http://api.shoutcast.com/genre/primary?k=OVxbFpTaTgaBkwGC&f=json"
    fetch(proxyUrl + targetUrl)
        .then(response => response.json())
        .then(responseJson => renderGenres(responseJson))
        .catch(error => alert("getGenres()"))
}
function renderGenres(args) {
    for (let i = 0; i < args.response.data.genrelist.genre.length; i++) {
        //console.log(args.response.data.genrelist.genre[i].name);
        $("#genreSearch").append(`<li><div class="${args.response.data.genrelist.genre[i].name}" onclick=queryGenre(this.className),drop()>${args.response.data.genrelist.genre[i].name}`);
        $("#genreSearch").append(`</div></li>`);

    }
    
}
/*************************css stuff***********************************/
function drop() {
    document.getElementById("genreSearch").classList.toggle("show");
}

function burger(x) {
    x.classList.toggle("change");
}
function filterFunction() {
    var input, filter, ul, li, a, i;
    input = document.getElementById("input");
    filter = input.value.toUpperCase();
    div = document.getElementById("genreSearch");
    a = div.getElementsByTagName("li");
    for (i = 0; i < a.length; i++) {
        txtValue = a[i].textContent || a[i].innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            a[i].style.display = "";
        } else {
            a[i].style.display = "none";
        }
    }
}
queryGenre("alternative")
getGenres();

