var stream = "http://stream.dedyn.io:8000/dsbmradio.opus";
var limit = 15;
var proxyUrl = "https://cors-anywhere.herokuapp.com/"

function parseUrl(args) {
    var targetUrl = `http://yp.shoutcast.com/sbin/tunein-station.xspf?id=`;
    var x = new XMLHttpRequest();
    x.open("GET", proxyUrl + targetUrl + args, true);
    x.onreadystatechange = function () {
        if (x.readyState == 4 && x.status == 200) {
            var doc = x.responseXML;
            console.log(doc);
            var url = doc.getElementsByTagName("location")[0].textContent;
            console.log(url);
            //stream = url;
            renderPayer(url);

        }
    };
    x.send(null);
    console.log(args);
    //console.log(proxyUrl + targetUrl + args);
}

function renderPayer(args) {
    $(".player").empty();
    $(".player").append(`  <audio controls autoplay>
<source src=${args} type="audio/mpeg">
Your browser does not support the audio element.
</audio>
`);
}
function queryShoutcast() {

        var q = $(".query:text").val();
        var targetUrl = `http://api.shoutcast.com/station/advancedsearch?mt=audio/mpeg&search=${q}&limit=${limit}&f=json&k=OVxbFpTaTgaBkwGC`;
        fetch(proxyUrl + targetUrl)
            .then(response => response.json())
            .then(responseJson => renderStations(responseJson))
            .catch(error => alert('Something went wrong. Try again later. getPosition(args)'));
        //console.log(q);  
}
function renderStations(args) {
    $(".stations").empty();
    for (let i = 0; i < args.response.data.stationlist.station.length; i++) {
        $(".stations").append(`<div class="s">`);
        $(".stations").append(`<div class="${args.response.data.stationlist.station[i].id}" onclick="parseUrl(this.className)">${args.response.data.stationlist.station[i].name}`);
        //$(".stations").append(`<h3>${args.response.data.stationlist.station[i].name}</h3>`);
        $(".stations").append(`</div>`);
        $(".stations").append(`<div/>`);
    }
}
//queryShoutcast();
//parseUrl("1570578");
