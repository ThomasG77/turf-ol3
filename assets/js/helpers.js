var geojsonToFeatures = function geojsonToFeatures(fc, options) {
  var options = options || {};
  // Declare a formatter to read GeoJSON
  var format = new ol.format.GeoJSON();

  // Read GeoJSON features
  var features = format.readFeatures(fc, options);
  return features;
};

var generateRandomPts = function generateRandomPts(ext, num) {
  // Function inspired by the code from
  // http://swingley.appspot.com/maps/olpts
  var newpts = [];
  // calc map width and height
  var width = ext[2] - ext[0],
     height = ext[3] - ext[1];
  // generate "random" points within the map's extent
  // Caution: we do not care about projection, e.g Spherical Mercator here
  for (var i = 0; i < num; i++) {
    var randx = Math.random(),
        randy = Math.random();
    var x = ext[0] + (randx * width),
        y = ext[1] + (randy * height);
    newpts.push(turf.point([x, y]));
  }
  var fcrandom = turf.featurecollection(newpts);
  return fcrandom;
};

// Playground using fetch API
// For the demo purpose, we don't want to use OpenLayers 3
// to make call to geojson files here
var fetchJSON = function(url) {
  return fetch(url).then(function(response) {
      return response.json();
    }).then(function(json) {
      return json;
    }).catch(function(ex) {
      console.log('parsing failed', ex);
    });
};
