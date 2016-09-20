# TODO

* distance sample: take the "Centre ville" Nantes neighbourhood center and use modify to move a point to see how far we are from the "Centre ville"
* nearest sample: use the same POI points and it's where you click that launch the nearest function call.
* centroid sample: take the center of each Nantes neighbourhood and put them in a new layer
* center sample: in truth it's the center of gravity (barycentre in maths)
* square: set a max extent on the demo. Demo can failed because with sync, sometimes out of bounds and failed assertion.
* concave: issue when some hundred points (too slow, browser go down)
* buffer: can be slow (issue already in Turf main tracker)

* plugin simplestyle for OpenLayers 3 See https://github.com/mapbox/mapbox.js/blob/5799ab238c2cd4e8126ae1dc577cd802f916e40d/src/simplestyle.js and

* Change MapQuest tiles to Hydda (see below excerpt for Leaflet)

var Hydda_Full = L.tileLayer('http://{s}.tile.openstreetmap.se/hydda/full/{z}/{x}/{y}.png', {
  minZoom: 0,
  maxZoom: 18,
  attribution: 'Tiles courtesy of <a href="http://openstreetmap.se/" target="_blank">OpenStreetMap Sweden</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
});

* General: use ol.FeatureOverlay instead of full layers when drawing http://openlayers.org/en/v3.0.0/apidoc/ol.FeatureOverlay.html

forEachFeatureIntersectingExtent to get element within an extent
getClosestFeatureToCoordinate equivalent to nearest
jsts "flat" buffer
midpoint exists also in OpenLayers 3 > ol.Sphere.prototype.midpoint and ol.geom.LineString.prototype.getFlatMidpoint

## Status

* AGGREGATION
  * [x] collect
* MEASUREMENT
  * [x] along
  * [x] area
  * [x] bboxPolygon
  * [ ] bearing
  * [x] center
  * [x] centroid
  * [ ] destination
  * [x] distance
  * [x] envelope
  * [x] lineDistance
  * [x] midpoint
  * [x] pointOnSurface
  * [x] square
* TRANSFORMATION
  * [x] bezier
  * [x] buffer
  * [x] concave
  * [x] convex
  * [x] difference
  * [x] intersect
  * [x] simplify
  * [x] union
* MISC
  * [x] combine
  * [x] explode
  * [x] flip
  * [x] kinks
  * [x] lineSlice
  * [x] pointOnLine
* HELPER
  * [x] featureCollection
  * [x] feature
  * [x] lineString
  * [x] multiLineString
  * [x] point
  * [x] polygon
  * [x] multiPoint
  * [x] multiPolygon
  * [x] geometryCollection
* DATA
  * [x] random
  * [x] sample
* INTERPOLATION
  * [x] isolines
  * [ ] planepoint
  * [ ] tin
* JOINS
  * [x] inside
  * [x] tag
* GRIDS
  * [x] hexGrid
  * [x] pointGrid
  * [ ] squareGrid
  * [ ] triangleGrid
  * [x] within
* CLASSIFICATION
  * [x] nearest
* META
  * [ ] propEach (1) (turf-meta)
  * [ ] coordEach (1) (turf-meta)
  * [ ] coordReduce (1) (turf-meta)
  * [ ] featureEach (1) (turf-meta)
  * [ ] getCoord (1) (turf-invariant => wrong in the doc?)
* ASSERTIONS
  * [ ] featureOf (1) (turf-invariant)
  * [ ] collectionOf (1) (turf-invariant)
  * [x] bbox
  * [ ] circle (1) (turf-circle => wrong in the doc?)
  * [ ] geojsonType (1) (turf-invariant)
  * [ ] propReduce (1) (turf-meta => wrong in the doc?)
  * [ ] coordAll (1) (turf-meta => wrong in the doc?)
  * [x] tesselate

(1) Not in default turf.min.js