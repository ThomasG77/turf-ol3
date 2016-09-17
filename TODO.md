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

Remains

* [Measurement](measurement/README.md)
    * [bearing](measurement/bearing.md)
    * [destination](measurement/destination.md)
* [Interpolation](interpolation/README.md)
    * [tin](interpolation/tin.md)
    * [grid](interpolation/grid.md)
    * [hex](interpolation/hex.md)
    * [planepoint](interpolation/planepoint.md)
    * [isolines](interpolation/isolines.md)
    * [isobands](interpolation/isobands.md)
* [Classification](classification/README.md)
    * [quantile](classification/quantile.md)
    * [jenks](classification/jenks.md)
    * [reclass](classification/reclass.md)
* [Aggregation](aggregation/aggregation.md)
    * [average](aggregation/average.md)
    * [median](aggregation/median.md)
    * [sum](aggregation/sum.md)
    * [min](aggregation/min.md)
    * [max](aggregation/max.md)
    * [count](aggregation/count.md)
    * [deviation](aggregation/deviation.md)
    * [variance](aggregation/variance.md)
    * [aggregate](aggregation/aggregate.md)
* [Transformation](transformation/README.md)
    * [simplify](transformation/simplify.md)
    * [merge](transformation/merge.md)
    * [intersect](transformation/intersect.md)
    * [erase](transformation/erase.md)
    * [donuts](transformation/donuts.md)
* [Misc](misc/README.md)
    * [combine](misc/combine.md)
    * [isClockwise](misc/isClockwise.md)



* [Measurement](measurement/README.md)
    * [distance](measurement/distance.md)
    * [distance](measurement/area.md)
    * [nearest](measurement/nearest.md)
    * [bboxPolygon](measurement/bboxPolygon.md)
    * [envelope](measurement/envelope.md)
    * [extent](measurement/extent.md)
    * [square](measurement/square.md)
    * [size](measurement/size.md)
    * [center](measurement/center.md)
    * [centroid](measurement/centroid.md)
    * [point-on-surface](measurement/pointOnSurface.md)
    * [midpoint](measurement/midpoint.md)
    * [bearing](measurement/bearing.md)
    * [destination](measurement/destination.md)
    * [lineDistance](measurement/lineDistance.md)
    * [along](measurement/along.md)
* [Interpolation](interpolation/README.md)
    * [tin](interpolation/tin.md)
    * [grid](interpolation/grid.md)
    * [hex](interpolation/hex.md)
    * [planepoint](interpolation/planepoint.md)
    * [isolines](interpolation/isolines.md)
    * [isobands](interpolation/isobands.md)
* [Classification](classification/README.md)
    * [quantile](classification/quantile.md)
    * [jenks](classification/jenks.md)
    * [reclass](classification/reclass.md)
* [Aggregation](aggregation/aggregation.md)
    * [average](aggregation/average.md)
    * [median](aggregation/median.md)
    * [sum](aggregation/sum.md)
    * [min](aggregation/min.md)
    * [max](aggregation/max.md)
    * [count](aggregation/count.md)
    * [deviation](aggregation/deviation.md)
    * [variance](aggregation/variance.md)
    * [aggregate](aggregation/aggregate.md)
* [Transformation](transformation/README.md)
    * [buffer](transformation/buffer.md)
    * [bezier](transformation/bezier.md)
    * [simplify](transformation/simplify.md)
    * [union](transformation/union.md)
    * [merge](transformation/merge.md)
    * [intersect](transformation/intersect.md)
    * [erase](transformation/erase.md)
    * [donuts](transformation/donuts.md)
    * [convex](transformation/convex.md)
    * [concave](transformation/concave.md)
* [Misc](misc/README.md)
    * [flip](misc/flip.md)
    * [explode](misc/explode.md)
    * [combine](misc/combine.md)
    * [isClockwise](misc/isClockwise.md)
    * [kinks](misc/kinks.md)
