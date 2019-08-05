/*!
 *  Howler.js Radio Demo
 *  howlerjs.com
 *
 *  (c) 2013-2019, James Simpson of GoldFire Studios
 *  goldfirestudios.com
 *
 *  MIT License
 */

// Cache references to DOM elements.
var elms = ['station0', 'title0', 'live0', 'playing0',
  'station1', 'title1', 'live1', 'playing1',
  'station2', 'title2', 'live2', 'playing2',
  'station3', 'title3', 'live3', 'playing3',
  'station4', 'title4', 'live4', 'playing4',
  'station5', 'title5', 'live5', 'playing5',
  'station6', 'title6', 'live6', 'playing6',
  'station7', 'title7', 'live7', 'playing7'
];
elms.forEach(function (elm) {
  window[elm] = document.getElementById(elm);
});

/**
 * Radio class containing the state of our stations.
 * Includes all methods for playing, stopping, etc.
 * @param {Array} stations Array of objects with station details ({title, src, howl, ...}).
 */
var Radio = function (stations) {
  var self = this;

  self.stations = stations;
  self.index = 0;

  // Setup the display for each station.
  for (var i = 0; i < self.stations.length; i++) {
    window['title' + i].innerHTML = '<b>' + self.stations[i].freq + '</b> ' + self.stations[i].title;
    window['station' + i].addEventListener('click', function (index) {
      var isNotPlaying = (self.stations[index].howl && !self.stations[index].howl.playing());

      // Stop other sounds or the current one.
      radio.stop();

      // If the station isn't already playing or it doesn't exist, play it.
      if (isNotPlaying || !self.stations[index].howl) {
        radio.play(index);
      }
    }.bind(self, i));
  }
};
Radio.prototype = {
  /**
   * Play a station with a specific index.
   * @param  {Number} index Index in the array of stations.
   */
  play: function (index) {
    var self = this;
    var sound;

    index = typeof index === 'number' ? index : self.index;
    var data = self.stations[index];

    // If we already loaded this track, use the current one.
    // Otherwise, setup and load a new Howl.
    if (data.howl) {
      sound = data.howl;
    } else {
      sound = data.howl = new Howl({
        src: data.src,
        html5: true, // A live stream can only be played through HTML5 Audio.
        format: ['mp3', 'aac']
      });
    }

    // Begin playing the sound.
    sound.play();


    // Toggle the display.
    self.toggleStationDisplay(index, true);

    // Keep track of the index we are currently playing.
    self.index = index;
  },

  /**
   * Stop a station's live stream.
   */
  stop: function () {
    var self = this;

    // Get the Howl we want to manipulate.
    var sound = self.stations[self.index].howl;

    // Toggle the display.
    self.toggleStationDisplay(self.index, false);

    // Stop the sound.
    if (sound) {
      sound.unload();
    }
  },

  /**
   * Toggle the display of a station to off/on.
   * @param  {Number} index Index of the station to toggle.
   * @param  {Boolean} state true is on and false is off.
   */
  toggleStationDisplay: function (index, state) {
    var self = this;

    // Highlight/un-highlight the row.
    window['station' + index].style.backgroundColor = state ? 'rgba(255, 255, 255, 0.33)' : '';

    // Show/hide the "live" marker.
    window['live' + index].style.opacity = state ? 1 : 0;

    // Show/hide the "playing" animation.
    window['playing' + index].style.display = state ? 'block' : 'none';
  }
};


// Setup our new radio and pass in the stations.
var radio = new Radio([
  {
    freq: '(HipHop)',
    title: "Hot 108",
    src: "http://jbmedia-edge1.cdnstream.com:80/hot108",
    howl: null
  },
  {
    freq: '(HipHop)',
    title: "POWERHITZ.COM",
    src: "http://jbmedia-edge1.cdnstream.com:80/1power",
    howl: null
  },
  {
    freq: '(HipHop)',
    title: "HOT 107.1",
    src: "http://stream1.flinn.com:8000/1071FM.mp3",
    howl: null
  },
  {
    freq: '(HipHop)',
    title: "Old School",
    src: "http://streaming307.radionomy.com:80/UrbanRadio-OldSchoolRap",
    howl: null
  },
  {
    freq: '(HipHop)',
    title: "FLOW 103",
    src: "http://hestia2.cdnstream.com:80/1668_128",
    howl: null
  },
  {
    freq: '(Rock)',
    title: "HUNTER FM",
    src: "http://streaming307.radionomy.com:80/RadioHunter-TheHitzChannel",
    howl: null
  },
  {
    freq: '(Rock)',
    title: "Radio Rock 1",
    src: "http://stream.radioreklama.bg:80/radio1rock64",
    howl: null
  },
  {
    freq: '(NEWS)',
    title: "FOX News",
    src: "http://streaming314.radionomy.com:80/foxnews",
    howl: null
  },
]);
