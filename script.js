var map;
var marker;
var infowindow;

// notes are being save to loca storage,
// on page reload, get them and store in local variable
var notesFromLocalStorage = JSON.parse(localStorage.getItem("notes")) || [];

// search result
function showResult(str) {
  var matches = notesFromLocalStorage.filter(function (n) {
    if (n) {
      return n.name.indexOf(str) >= 0 || n.note.indexOf(str) >= 0;
    }
  });
  if (str.length == 0 || !matches.length) {
    document.getElementById("livesearch").innerHTML = "";
    document.getElementById("livesearch").style.border = "0px";
    return;
  }

  if (matches.length) {
    var respText = "";
    matches = matches.forEach(function (m) {
      respText += "<li><a href='#' onClick='focusMarkerByLatLng(" + m.lat + "," + m.lng + ")'>Name: " + m.name + "<br /><span>Note: " + m.note + "</span></a></li>";
    });
    document.getElementById("livesearch").innerHTML = respText;
    document.getElementById("livesearch").style.border = "1px solid #A5ACB2";
  }
}

function initMap() {
  var islamabad = { lat: 33.6844, lng: 73.0479 };
  map = new google.maps.Map(document.getElementById('map'), {
    center: islamabad,
    zoom: 18
  });

  for (var i = 0; i < notesFromLocalStorage.length; i++) {
    var noteTemp = notesFromLocalStorage[i];
    var latLngTemp = new google.maps.LatLng(noteTemp.lat, noteTemp.lng);
    var markerTemp = new google.maps.Marker({
      position: latLngTemp,
      map: map,
      label: noteTemp.id.toString(),
      animation: google.maps.Animation.DROP

    });
    markerTemp.info = new google.maps.InfoWindow({
      content: "Name: <b>" + noteTemp.name + "</b></br>" +
      "Note: <i>" + noteTemp.note + "</i>"
    });
    markerTemp.info.open(map, markerTemp);

  }

  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      map.setCenter(pos);
    }, function() {
      handleLocationError(true);
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false);
  }

  function handleLocationError(browserHasGeolocation) {
    alert(browserHasGeolocation ?
      'Error: The Geolocation service failed.' :
      'Error: Your browser doesn\'t support geolocation.');
  }

  infowindow = new google.maps.InfoWindow({
    content: document.getElementById('form')
  });

  google.maps.event.addListener(map, 'click', function (event) {
    marker = new google.maps.Marker({
      position: event.latLng,
      map: map,
      label: notesFromLocalStorage.length + 1 + "",
      animation: google.maps.Animation.DROP
    });

    marker.info = new google.maps.InfoWindow({
      content: ""
    });
    infowindow.open(map, marker);

  });
}

// focus on marker selected by search
function focusMarkerByLatLng(lat, lng) {
  document.getElementById("livesearch").innerHTML = "";
  document.getElementById("livesearch").style.border = "0px";
  document.getElementById("search").value = "";

  map.panTo({ lat: lat, lng: lng });
  if (map.getZoom() < 15 || map.getZoom() > 21) map.setZoom(18);
}

function cancelSave() {
  marker.setMap(null);
}

// save onto local storage
function saveData() {
  var nameText = document.getElementById('name').value;
  var noteText = document.getElementById('note').value;

  if (!nameText.length || !noteText.length) {
    alert("Enter a name and note to save");
    return;
  }

  document.getElementById('name').value = "";
  document.getElementById('note').value = "";

  var latlng = marker.getPosition();

  var note = {
    name: nameText,
    note: noteText,
    lat: latlng.lat(),
    lng: latlng.lng(),
    id: notesFromLocalStorage.length + 1
  };

  notesFromLocalStorage.push(note);
  localStorage.setItem("notes", JSON.stringify(notesFromLocalStorage));

  infowindow.close();
  marker.info.open(map, marker);
  marker.info.setContent("Name: <b>" + nameText + "</b></br>" +
    "Note: <i>" + noteText + "</i>");
}