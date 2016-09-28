var geojsonToFeatures = function geojsonToFeatures(fc, options) {
  var options = options || {};
  // Declare a formatter to read GeoJSON
  var format = new ol.format.GeoJSON();

  // Read GeoJSON features
  var features = format.readFeatures(fc, options);
  return features;
};
