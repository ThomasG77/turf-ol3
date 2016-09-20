(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.turf || (g.turf = {})).meta = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Iterate over coordinates in any GeoJSON object, similar to
 * Array.forEach.
 *
 * @param {Object} layer any GeoJSON object
 * @param {Function} callback a method that takes (value)
 * @param {boolean=} excludeWrapCoord whether or not to include
 * the final coordinate of LinearRings that wraps the ring in its iteration.
 * @example
 * var point = { type: 'Point', coordinates: [0, 0] };
 * coordEach(point, function(coords) {
 *   // coords is equal to [0, 0]
 * });
 */
function coordEach(layer, callback, excludeWrapCoord) {
    var i, j, k, g, l, geometry, stopG, coords,
        geometryMaybeCollection,
        wrapShrink = 0,
        isGeometryCollection,
        isFeatureCollection = layer.type === 'FeatureCollection',
        isFeature = layer.type === 'Feature',
        stop = isFeatureCollection ? layer.features.length : 1;

  // This logic may look a little weird. The reason why it is that way
  // is because it's trying to be fast. GeoJSON supports multiple kinds
  // of objects at its root: FeatureCollection, Features, Geometries.
  // This function has the responsibility of handling all of them, and that
  // means that some of the `for` loops you see below actually just don't apply
  // to certain inputs. For instance, if you give this just a
  // Point geometry, then both loops are short-circuited and all we do
  // is gradually rename the input until it's called 'geometry'.
  //
  // This also aims to allocate as few resources as possible: just a
  // few numbers and booleans, rather than any temporary arrays as would
  // be required with the normalization approach.
    for (i = 0; i < stop; i++) {

        geometryMaybeCollection = (isFeatureCollection ? layer.features[i].geometry :
        (isFeature ? layer.geometry : layer));
        isGeometryCollection = geometryMaybeCollection.type === 'GeometryCollection';
        stopG = isGeometryCollection ? geometryMaybeCollection.geometries.length : 1;

        for (g = 0; g < stopG; g++) {
            geometry = isGeometryCollection ?
            geometryMaybeCollection.geometries[g] : geometryMaybeCollection;
            coords = geometry.coordinates;

            wrapShrink = (excludeWrapCoord &&
                (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon')) ?
                1 : 0;

            if (geometry.type === 'Point') {
                callback(coords);
            } else if (geometry.type === 'LineString' || geometry.type === 'MultiPoint') {
                for (j = 0; j < coords.length; j++) callback(coords[j]);
            } else if (geometry.type === 'Polygon' || geometry.type === 'MultiLineString') {
                for (j = 0; j < coords.length; j++)
                    for (k = 0; k < coords[j].length - wrapShrink; k++)
                        callback(coords[j][k]);
            } else if (geometry.type === 'MultiPolygon') {
                for (j = 0; j < coords.length; j++)
                    for (k = 0; k < coords[j].length; k++)
                        for (l = 0; l < coords[j][k].length - wrapShrink; l++)
                            callback(coords[j][k][l]);
            } else {
                throw new Error('Unknown Geometry Type');
            }
        }
    }
}
module.exports.coordEach = coordEach;

/**
 * Reduce coordinates in any GeoJSON object into a single value,
 * similar to how Array.reduce works. However, in this case we lazily run
 * the reduction, so an array of all coordinates is unnecessary.
 *
 * @param {Object} layer any GeoJSON object
 * @param {Function} callback a method that takes (memo, value) and returns
 * a new memo
 * @param {*} memo the starting value of memo: can be any type.
 * @param {boolean=} excludeWrapCoord whether or not to include
 * the final coordinate of LinearRings that wraps the ring in its iteration.
 * @return {*} combined value
 */
function coordReduce(layer, callback, memo, excludeWrapCoord) {
    coordEach(layer, function (coord) {
        memo = callback(memo, coord);
    }, excludeWrapCoord);
    return memo;
}
module.exports.coordReduce = coordReduce;

/**
 * Iterate over property objects in any GeoJSON object, similar to
 * Array.forEach.
 *
 * @param {Object} layer any GeoJSON object
 * @param {Function} callback a method that takes (value)
 * @example
 * var point = { type: 'Feature', geometry: null, properties: { foo: 1 } };
 * propEach(point, function(props) {
 *   // props is equal to { foo: 1}
 * });
 */
function propEach(layer, callback) {
    var i;
    switch (layer.type) {
    case 'FeatureCollection':
        for (i = 0; i < layer.features.length; i++) {
            callback(layer.features[i].properties);
        }
        break;
    case 'Feature':
        callback(layer.properties);
        break;
    }
}
module.exports.propEach = propEach;

/**
 * Reduce properties in any GeoJSON object into a single value,
 * similar to how Array.reduce works. However, in this case we lazily run
 * the reduction, so an array of all properties is unnecessary.
 *
 * @param {Object} layer any GeoJSON object
 * @param {Function} callback a method that takes (memo, coord) and returns
 * a new memo
 * @param {*} memo the starting value of memo: can be any type.
 * @return {*} combined value
 */
function propReduce(layer, callback, memo) {
    propEach(layer, function (prop) {
        memo = callback(memo, prop);
    });
    return memo;
}
module.exports.propReduce = propReduce;

/**
 * Iterate over features in any GeoJSON object, similar to
 * Array.forEach.
 *
 * @param {Object} layer any GeoJSON object
 * @param {Function} callback a method that takes (value)
 * @example
 * var feature = { type: 'Feature', geometry: null, properties: {} };
 * featureEach(feature, function(feature) {
 *   // feature == feature
 * });
 */
function featureEach(layer, callback) {
    if (layer.type === 'Feature') {
        callback(layer);
    } else if (layer.type === 'FeatureCollection') {
        for (var i = 0; i < layer.features.length; i++) {
            callback(layer.features[i]);
        }
    }
}
module.exports.featureEach = featureEach;

/**
 * Get all coordinates from any GeoJSON object, returning an array of coordinate
 * arrays.
 * @param {Object} layer any GeoJSON object
 * @return {Array<Array<Number>>} coordinate position array
 */
function coordAll(layer) {
    var coords = [];
    coordEach(layer, function (coord) {
        coords.push(coord);
    });
    return coords;
}
module.exports.coordAll = coordAll;

},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy5udm0vdmVyc2lvbnMvbm9kZS92Ni4yLjIvbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvdHVyZi1tZXRhL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogSXRlcmF0ZSBvdmVyIGNvb3JkaW5hdGVzIGluIGFueSBHZW9KU09OIG9iamVjdCwgc2ltaWxhciB0b1xuICogQXJyYXkuZm9yRWFjaC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gbGF5ZXIgYW55IEdlb0pTT04gb2JqZWN0XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBhIG1ldGhvZCB0aGF0IHRha2VzICh2YWx1ZSlcbiAqIEBwYXJhbSB7Ym9vbGVhbj19IGV4Y2x1ZGVXcmFwQ29vcmQgd2hldGhlciBvciBub3QgdG8gaW5jbHVkZVxuICogdGhlIGZpbmFsIGNvb3JkaW5hdGUgb2YgTGluZWFyUmluZ3MgdGhhdCB3cmFwcyB0aGUgcmluZyBpbiBpdHMgaXRlcmF0aW9uLlxuICogQGV4YW1wbGVcbiAqIHZhciBwb2ludCA9IHsgdHlwZTogJ1BvaW50JywgY29vcmRpbmF0ZXM6IFswLCAwXSB9O1xuICogY29vcmRFYWNoKHBvaW50LCBmdW5jdGlvbihjb29yZHMpIHtcbiAqICAgLy8gY29vcmRzIGlzIGVxdWFsIHRvIFswLCAwXVxuICogfSk7XG4gKi9cbmZ1bmN0aW9uIGNvb3JkRWFjaChsYXllciwgY2FsbGJhY2ssIGV4Y2x1ZGVXcmFwQ29vcmQpIHtcbiAgICB2YXIgaSwgaiwgaywgZywgbCwgZ2VvbWV0cnksIHN0b3BHLCBjb29yZHMsXG4gICAgICAgIGdlb21ldHJ5TWF5YmVDb2xsZWN0aW9uLFxuICAgICAgICB3cmFwU2hyaW5rID0gMCxcbiAgICAgICAgaXNHZW9tZXRyeUNvbGxlY3Rpb24sXG4gICAgICAgIGlzRmVhdHVyZUNvbGxlY3Rpb24gPSBsYXllci50eXBlID09PSAnRmVhdHVyZUNvbGxlY3Rpb24nLFxuICAgICAgICBpc0ZlYXR1cmUgPSBsYXllci50eXBlID09PSAnRmVhdHVyZScsXG4gICAgICAgIHN0b3AgPSBpc0ZlYXR1cmVDb2xsZWN0aW9uID8gbGF5ZXIuZmVhdHVyZXMubGVuZ3RoIDogMTtcblxuICAvLyBUaGlzIGxvZ2ljIG1heSBsb29rIGEgbGl0dGxlIHdlaXJkLiBUaGUgcmVhc29uIHdoeSBpdCBpcyB0aGF0IHdheVxuICAvLyBpcyBiZWNhdXNlIGl0J3MgdHJ5aW5nIHRvIGJlIGZhc3QuIEdlb0pTT04gc3VwcG9ydHMgbXVsdGlwbGUga2luZHNcbiAgLy8gb2Ygb2JqZWN0cyBhdCBpdHMgcm9vdDogRmVhdHVyZUNvbGxlY3Rpb24sIEZlYXR1cmVzLCBHZW9tZXRyaWVzLlxuICAvLyBUaGlzIGZ1bmN0aW9uIGhhcyB0aGUgcmVzcG9uc2liaWxpdHkgb2YgaGFuZGxpbmcgYWxsIG9mIHRoZW0sIGFuZCB0aGF0XG4gIC8vIG1lYW5zIHRoYXQgc29tZSBvZiB0aGUgYGZvcmAgbG9vcHMgeW91IHNlZSBiZWxvdyBhY3R1YWxseSBqdXN0IGRvbid0IGFwcGx5XG4gIC8vIHRvIGNlcnRhaW4gaW5wdXRzLiBGb3IgaW5zdGFuY2UsIGlmIHlvdSBnaXZlIHRoaXMganVzdCBhXG4gIC8vIFBvaW50IGdlb21ldHJ5LCB0aGVuIGJvdGggbG9vcHMgYXJlIHNob3J0LWNpcmN1aXRlZCBhbmQgYWxsIHdlIGRvXG4gIC8vIGlzIGdyYWR1YWxseSByZW5hbWUgdGhlIGlucHV0IHVudGlsIGl0J3MgY2FsbGVkICdnZW9tZXRyeScuXG4gIC8vXG4gIC8vIFRoaXMgYWxzbyBhaW1zIHRvIGFsbG9jYXRlIGFzIGZldyByZXNvdXJjZXMgYXMgcG9zc2libGU6IGp1c3QgYVxuICAvLyBmZXcgbnVtYmVycyBhbmQgYm9vbGVhbnMsIHJhdGhlciB0aGFuIGFueSB0ZW1wb3JhcnkgYXJyYXlzIGFzIHdvdWxkXG4gIC8vIGJlIHJlcXVpcmVkIHdpdGggdGhlIG5vcm1hbGl6YXRpb24gYXBwcm9hY2guXG4gICAgZm9yIChpID0gMDsgaSA8IHN0b3A7IGkrKykge1xuXG4gICAgICAgIGdlb21ldHJ5TWF5YmVDb2xsZWN0aW9uID0gKGlzRmVhdHVyZUNvbGxlY3Rpb24gPyBsYXllci5mZWF0dXJlc1tpXS5nZW9tZXRyeSA6XG4gICAgICAgIChpc0ZlYXR1cmUgPyBsYXllci5nZW9tZXRyeSA6IGxheWVyKSk7XG4gICAgICAgIGlzR2VvbWV0cnlDb2xsZWN0aW9uID0gZ2VvbWV0cnlNYXliZUNvbGxlY3Rpb24udHlwZSA9PT0gJ0dlb21ldHJ5Q29sbGVjdGlvbic7XG4gICAgICAgIHN0b3BHID0gaXNHZW9tZXRyeUNvbGxlY3Rpb24gPyBnZW9tZXRyeU1heWJlQ29sbGVjdGlvbi5nZW9tZXRyaWVzLmxlbmd0aCA6IDE7XG5cbiAgICAgICAgZm9yIChnID0gMDsgZyA8IHN0b3BHOyBnKyspIHtcbiAgICAgICAgICAgIGdlb21ldHJ5ID0gaXNHZW9tZXRyeUNvbGxlY3Rpb24gP1xuICAgICAgICAgICAgZ2VvbWV0cnlNYXliZUNvbGxlY3Rpb24uZ2VvbWV0cmllc1tnXSA6IGdlb21ldHJ5TWF5YmVDb2xsZWN0aW9uO1xuICAgICAgICAgICAgY29vcmRzID0gZ2VvbWV0cnkuY29vcmRpbmF0ZXM7XG5cbiAgICAgICAgICAgIHdyYXBTaHJpbmsgPSAoZXhjbHVkZVdyYXBDb29yZCAmJlxuICAgICAgICAgICAgICAgIChnZW9tZXRyeS50eXBlID09PSAnUG9seWdvbicgfHwgZ2VvbWV0cnkudHlwZSA9PT0gJ011bHRpUG9seWdvbicpKSA/XG4gICAgICAgICAgICAgICAgMSA6IDA7XG5cbiAgICAgICAgICAgIGlmIChnZW9tZXRyeS50eXBlID09PSAnUG9pbnQnKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soY29vcmRzKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZ2VvbWV0cnkudHlwZSA9PT0gJ0xpbmVTdHJpbmcnIHx8IGdlb21ldHJ5LnR5cGUgPT09ICdNdWx0aVBvaW50Jykge1xuICAgICAgICAgICAgICAgIGZvciAoaiA9IDA7IGogPCBjb29yZHMubGVuZ3RoOyBqKyspIGNhbGxiYWNrKGNvb3Jkc1tqXSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGdlb21ldHJ5LnR5cGUgPT09ICdQb2x5Z29uJyB8fCBnZW9tZXRyeS50eXBlID09PSAnTXVsdGlMaW5lU3RyaW5nJykge1xuICAgICAgICAgICAgICAgIGZvciAoaiA9IDA7IGogPCBjb29yZHMubGVuZ3RoOyBqKyspXG4gICAgICAgICAgICAgICAgICAgIGZvciAoayA9IDA7IGsgPCBjb29yZHNbal0ubGVuZ3RoIC0gd3JhcFNocmluazsgaysrKVxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soY29vcmRzW2pdW2tdKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZ2VvbWV0cnkudHlwZSA9PT0gJ011bHRpUG9seWdvbicpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGogPSAwOyBqIDwgY29vcmRzLmxlbmd0aDsgaisrKVxuICAgICAgICAgICAgICAgICAgICBmb3IgKGsgPSAwOyBrIDwgY29vcmRzW2pdLmxlbmd0aDsgaysrKVxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsID0gMDsgbCA8IGNvb3Jkc1tqXVtrXS5sZW5ndGggLSB3cmFwU2hyaW5rOyBsKyspXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soY29vcmRzW2pdW2tdW2xdKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIEdlb21ldHJ5IFR5cGUnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbm1vZHVsZS5leHBvcnRzLmNvb3JkRWFjaCA9IGNvb3JkRWFjaDtcblxuLyoqXG4gKiBSZWR1Y2UgY29vcmRpbmF0ZXMgaW4gYW55IEdlb0pTT04gb2JqZWN0IGludG8gYSBzaW5nbGUgdmFsdWUsXG4gKiBzaW1pbGFyIHRvIGhvdyBBcnJheS5yZWR1Y2Ugd29ya3MuIEhvd2V2ZXIsIGluIHRoaXMgY2FzZSB3ZSBsYXppbHkgcnVuXG4gKiB0aGUgcmVkdWN0aW9uLCBzbyBhbiBhcnJheSBvZiBhbGwgY29vcmRpbmF0ZXMgaXMgdW5uZWNlc3NhcnkuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGxheWVyIGFueSBHZW9KU09OIG9iamVjdFxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgYSBtZXRob2QgdGhhdCB0YWtlcyAobWVtbywgdmFsdWUpIGFuZCByZXR1cm5zXG4gKiBhIG5ldyBtZW1vXG4gKiBAcGFyYW0geyp9IG1lbW8gdGhlIHN0YXJ0aW5nIHZhbHVlIG9mIG1lbW86IGNhbiBiZSBhbnkgdHlwZS5cbiAqIEBwYXJhbSB7Ym9vbGVhbj19IGV4Y2x1ZGVXcmFwQ29vcmQgd2hldGhlciBvciBub3QgdG8gaW5jbHVkZVxuICogdGhlIGZpbmFsIGNvb3JkaW5hdGUgb2YgTGluZWFyUmluZ3MgdGhhdCB3cmFwcyB0aGUgcmluZyBpbiBpdHMgaXRlcmF0aW9uLlxuICogQHJldHVybiB7Kn0gY29tYmluZWQgdmFsdWVcbiAqL1xuZnVuY3Rpb24gY29vcmRSZWR1Y2UobGF5ZXIsIGNhbGxiYWNrLCBtZW1vLCBleGNsdWRlV3JhcENvb3JkKSB7XG4gICAgY29vcmRFYWNoKGxheWVyLCBmdW5jdGlvbiAoY29vcmQpIHtcbiAgICAgICAgbWVtbyA9IGNhbGxiYWNrKG1lbW8sIGNvb3JkKTtcbiAgICB9LCBleGNsdWRlV3JhcENvb3JkKTtcbiAgICByZXR1cm4gbWVtbztcbn1cbm1vZHVsZS5leHBvcnRzLmNvb3JkUmVkdWNlID0gY29vcmRSZWR1Y2U7XG5cbi8qKlxuICogSXRlcmF0ZSBvdmVyIHByb3BlcnR5IG9iamVjdHMgaW4gYW55IEdlb0pTT04gb2JqZWN0LCBzaW1pbGFyIHRvXG4gKiBBcnJheS5mb3JFYWNoLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBsYXllciBhbnkgR2VvSlNPTiBvYmplY3RcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIGEgbWV0aG9kIHRoYXQgdGFrZXMgKHZhbHVlKVxuICogQGV4YW1wbGVcbiAqIHZhciBwb2ludCA9IHsgdHlwZTogJ0ZlYXR1cmUnLCBnZW9tZXRyeTogbnVsbCwgcHJvcGVydGllczogeyBmb286IDEgfSB9O1xuICogcHJvcEVhY2gocG9pbnQsIGZ1bmN0aW9uKHByb3BzKSB7XG4gKiAgIC8vIHByb3BzIGlzIGVxdWFsIHRvIHsgZm9vOiAxfVxuICogfSk7XG4gKi9cbmZ1bmN0aW9uIHByb3BFYWNoKGxheWVyLCBjYWxsYmFjaykge1xuICAgIHZhciBpO1xuICAgIHN3aXRjaCAobGF5ZXIudHlwZSkge1xuICAgIGNhc2UgJ0ZlYXR1cmVDb2xsZWN0aW9uJzpcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGxheWVyLmZlYXR1cmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhsYXllci5mZWF0dXJlc1tpXS5wcm9wZXJ0aWVzKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICBjYXNlICdGZWF0dXJlJzpcbiAgICAgICAgY2FsbGJhY2sobGF5ZXIucHJvcGVydGllcyk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbn1cbm1vZHVsZS5leHBvcnRzLnByb3BFYWNoID0gcHJvcEVhY2g7XG5cbi8qKlxuICogUmVkdWNlIHByb3BlcnRpZXMgaW4gYW55IEdlb0pTT04gb2JqZWN0IGludG8gYSBzaW5nbGUgdmFsdWUsXG4gKiBzaW1pbGFyIHRvIGhvdyBBcnJheS5yZWR1Y2Ugd29ya3MuIEhvd2V2ZXIsIGluIHRoaXMgY2FzZSB3ZSBsYXppbHkgcnVuXG4gKiB0aGUgcmVkdWN0aW9uLCBzbyBhbiBhcnJheSBvZiBhbGwgcHJvcGVydGllcyBpcyB1bm5lY2Vzc2FyeS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gbGF5ZXIgYW55IEdlb0pTT04gb2JqZWN0XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBhIG1ldGhvZCB0aGF0IHRha2VzIChtZW1vLCBjb29yZCkgYW5kIHJldHVybnNcbiAqIGEgbmV3IG1lbW9cbiAqIEBwYXJhbSB7Kn0gbWVtbyB0aGUgc3RhcnRpbmcgdmFsdWUgb2YgbWVtbzogY2FuIGJlIGFueSB0eXBlLlxuICogQHJldHVybiB7Kn0gY29tYmluZWQgdmFsdWVcbiAqL1xuZnVuY3Rpb24gcHJvcFJlZHVjZShsYXllciwgY2FsbGJhY2ssIG1lbW8pIHtcbiAgICBwcm9wRWFjaChsYXllciwgZnVuY3Rpb24gKHByb3ApIHtcbiAgICAgICAgbWVtbyA9IGNhbGxiYWNrKG1lbW8sIHByb3ApO1xuICAgIH0pO1xuICAgIHJldHVybiBtZW1vO1xufVxubW9kdWxlLmV4cG9ydHMucHJvcFJlZHVjZSA9IHByb3BSZWR1Y2U7XG5cbi8qKlxuICogSXRlcmF0ZSBvdmVyIGZlYXR1cmVzIGluIGFueSBHZW9KU09OIG9iamVjdCwgc2ltaWxhciB0b1xuICogQXJyYXkuZm9yRWFjaC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gbGF5ZXIgYW55IEdlb0pTT04gb2JqZWN0XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBhIG1ldGhvZCB0aGF0IHRha2VzICh2YWx1ZSlcbiAqIEBleGFtcGxlXG4gKiB2YXIgZmVhdHVyZSA9IHsgdHlwZTogJ0ZlYXR1cmUnLCBnZW9tZXRyeTogbnVsbCwgcHJvcGVydGllczoge30gfTtcbiAqIGZlYXR1cmVFYWNoKGZlYXR1cmUsIGZ1bmN0aW9uKGZlYXR1cmUpIHtcbiAqICAgLy8gZmVhdHVyZSA9PSBmZWF0dXJlXG4gKiB9KTtcbiAqL1xuZnVuY3Rpb24gZmVhdHVyZUVhY2gobGF5ZXIsIGNhbGxiYWNrKSB7XG4gICAgaWYgKGxheWVyLnR5cGUgPT09ICdGZWF0dXJlJykge1xuICAgICAgICBjYWxsYmFjayhsYXllcik7XG4gICAgfSBlbHNlIGlmIChsYXllci50eXBlID09PSAnRmVhdHVyZUNvbGxlY3Rpb24nKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGF5ZXIuZmVhdHVyZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGxheWVyLmZlYXR1cmVzW2ldKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbm1vZHVsZS5leHBvcnRzLmZlYXR1cmVFYWNoID0gZmVhdHVyZUVhY2g7XG5cbi8qKlxuICogR2V0IGFsbCBjb29yZGluYXRlcyBmcm9tIGFueSBHZW9KU09OIG9iamVjdCwgcmV0dXJuaW5nIGFuIGFycmF5IG9mIGNvb3JkaW5hdGVcbiAqIGFycmF5cy5cbiAqIEBwYXJhbSB7T2JqZWN0fSBsYXllciBhbnkgR2VvSlNPTiBvYmplY3RcbiAqIEByZXR1cm4ge0FycmF5PEFycmF5PE51bWJlcj4+fSBjb29yZGluYXRlIHBvc2l0aW9uIGFycmF5XG4gKi9cbmZ1bmN0aW9uIGNvb3JkQWxsKGxheWVyKSB7XG4gICAgdmFyIGNvb3JkcyA9IFtdO1xuICAgIGNvb3JkRWFjaChsYXllciwgZnVuY3Rpb24gKGNvb3JkKSB7XG4gICAgICAgIGNvb3Jkcy5wdXNoKGNvb3JkKTtcbiAgICB9KTtcbiAgICByZXR1cm4gY29vcmRzO1xufVxubW9kdWxlLmV4cG9ydHMuY29vcmRBbGwgPSBjb29yZEFsbDtcbiJdfQ==
