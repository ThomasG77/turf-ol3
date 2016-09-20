(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.turf || (g.turf = {})).circle = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var destination = require('turf-destination');
var helpers = require('turf-helpers');
var polygon = helpers.polygon;


/**
 * Takes a {@link Point} and calculates the circle polygon given a radius in degrees, radians, miles, or kilometers; and steps for precision.
 *
 * @name circle
 * @param {Feature<Point>} center center point
 * @param {number} radius radius of the circle
 * @param {number} steps number of steps
 * @param {String} [units=kilometers] miles, kilometers, degrees, or radians
 * @returns {Feature<Polygon>} circle polygon
 * @example
 * var center = {
 *   "type": "Feature",
 *   "properties": {
 *     "marker-color": "#0f0"
 *   },
 *   "geometry": {
 *     "type": "Point",
 *     "coordinates": [-75.343, 39.984]
 *   }
 * };
 * var radius = 5;
 * var steps = 10;
 * var units = 'kilometers';
 *
 * var circle = turf.circle(center, radius, steps, units);
 *
 * var result = {
 *   "type": "FeatureCollection",
 *   "features": [center, circle]
 * };
 *
 * //=result
 */
module.exports = function (center, radius, steps, units) {
    steps = steps || 64;
    var coordinates = [];

    for (var i = 0; i < steps; i++) {
        coordinates.push(destination(center, radius, i * 360 / steps, units).geometry.coordinates);
    }

    coordinates.push(coordinates[0]);

    return polygon([coordinates]);
};

},{"turf-destination":2,"turf-helpers":3}],2:[function(require,module,exports){
//http://en.wikipedia.org/wiki/Haversine_formula
//http://www.movable-type.co.uk/scripts/latlong.html
var getCoord = require('turf-invariant').getCoord;
var helpers = require('turf-helpers');
var point = helpers.point;
var distanceToRadians = helpers.distanceToRadians;

/**
 * Takes a {@link Point} and calculates the location of a destination point given a distance in degrees, radians, miles, or kilometers; and bearing in degrees. This uses the [Haversine formula](http://en.wikipedia.org/wiki/Haversine_formula) to account for global curvature.
 *
 * @name destination
 * @param {Feature<Point>} from starting point
 * @param {number} distance distance from the starting point
 * @param {number} bearing ranging from -180 to 180
 * @param {String} [units=kilometers] miles, kilometers, degrees, or radians
 * @returns {Feature<Point>} destination point
 * @example
 * var point = {
 *   "type": "Feature",
 *   "properties": {
 *     "marker-color": "#0f0"
 *   },
 *   "geometry": {
 *     "type": "Point",
 *     "coordinates": [-75.343, 39.984]
 *   }
 * };
 * var distance = 50;
 * var bearing = 90;
 * var units = 'miles';
 *
 * var destination = turf.destination(point, distance, bearing, units);
 * destination.properties['marker-color'] = '#f00';
 *
 * var result = {
 *   "type": "FeatureCollection",
 *   "features": [point, destination]
 * };
 *
 * //=result
 */
module.exports = function (from, distance, bearing, units) {
    var degrees2radians = Math.PI / 180;
    var radians2degrees = 180 / Math.PI;
    var coordinates1 = getCoord(from);
    var longitude1 = degrees2radians * coordinates1[0];
    var latitude1 = degrees2radians * coordinates1[1];
    var bearing_rad = degrees2radians * bearing;

    var radians = distanceToRadians(distance, units);

    var latitude2 = Math.asin(Math.sin(latitude1) * Math.cos(radians) +
        Math.cos(latitude1) * Math.sin(radians) * Math.cos(bearing_rad));
    var longitude2 = longitude1 + Math.atan2(Math.sin(bearing_rad) *
        Math.sin(radians) * Math.cos(latitude1),
        Math.cos(radians) - Math.sin(latitude1) * Math.sin(latitude2));

    return point([radians2degrees * longitude2, radians2degrees * latitude2]);
};

},{"turf-helpers":3,"turf-invariant":4}],3:[function(require,module,exports){
/**
 * Wraps a GeoJSON {@link Geometry} in a GeoJSON {@link Feature}.
 *
 * @name feature
 * @param {Geometry} geometry input geometry
 * @param {Object} properties properties
 * @returns {FeatureCollection} a FeatureCollection of input features
 * @example
 * var geometry = {
 *      "type": "Point",
 *      "coordinates": [
 *        67.5,
 *        32.84267363195431
 *      ]
 *    }
 *
 * var feature = turf.feature(geometry);
 *
 * //=feature
 */
function feature(geometry, properties) {
    return {
        type: 'Feature',
        properties: properties || {},
        geometry: geometry
    };
}

module.exports.feature = feature;

/**
 * Takes coordinates and properties (optional) and returns a new {@link Point} feature.
 *
 * @name point
 * @param {number[]} coordinates longitude, latitude position (each in decimal degrees)
 * @param {Object=} properties an Object that is used as the {@link Feature}'s
 * properties
 * @returns {Feature<Point>} a Point feature
 * @example
 * var pt1 = turf.point([-75.343, 39.984]);
 *
 * //=pt1
 */
module.exports.point = function (coordinates, properties) {
    if (!Array.isArray(coordinates)) throw new Error('Coordinates must be an array');
    if (coordinates.length < 2) throw new Error('Coordinates must be at least 2 numbers long');
    return feature({
        type: 'Point',
        coordinates: coordinates.slice()
    }, properties);
};

/**
 * Takes an array of LinearRings and optionally an {@link Object} with properties and returns a {@link Polygon} feature.
 *
 * @name polygon
 * @param {Array<Array<Array<number>>>} coordinates an array of LinearRings
 * @param {Object=} properties a properties object
 * @returns {Feature<Polygon>} a Polygon feature
 * @throws {Error} throw an error if a LinearRing of the polygon has too few positions
 * or if a LinearRing of the Polygon does not have matching Positions at the
 * beginning & end.
 * @example
 * var polygon = turf.polygon([[
 *  [-2.275543, 53.464547],
 *  [-2.275543, 53.489271],
 *  [-2.215118, 53.489271],
 *  [-2.215118, 53.464547],
 *  [-2.275543, 53.464547]
 * ]], { name: 'poly1', population: 400});
 *
 * //=polygon
 */
module.exports.polygon = function (coordinates, properties) {

    if (!coordinates) throw new Error('No coordinates passed');

    for (var i = 0; i < coordinates.length; i++) {
        var ring = coordinates[i];
        if (ring.length < 4) {
            throw new Error('Each LinearRing of a Polygon must have 4 or more Positions.');
        }
        for (var j = 0; j < ring[ring.length - 1].length; j++) {
            if (ring[ring.length - 1][j] !== ring[0][j]) {
                throw new Error('First and last Position are not equivalent.');
            }
        }
    }

    return feature({
        type: 'Polygon',
        coordinates: coordinates
    }, properties);
};

/**
 * Creates a {@link LineString} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name lineString
 * @param {Array<Array<number>>} coordinates an array of Positions
 * @param {Object=} properties an Object of key-value pairs to add as properties
 * @returns {Feature<LineString>} a LineString feature
 * @throws {Error} if no coordinates are passed
 * @example
 * var linestring1 = turf.lineString([
 *	[-21.964416, 64.148203],
 *	[-21.956176, 64.141316],
 *	[-21.93901, 64.135924],
 *	[-21.927337, 64.136673]
 * ]);
 * var linestring2 = turf.lineString([
 *	[-21.929054, 64.127985],
 *	[-21.912918, 64.134726],
 *	[-21.916007, 64.141016],
 * 	[-21.930084, 64.14446]
 * ], {name: 'line 1', distance: 145});
 *
 * //=linestring1
 *
 * //=linestring2
 */
module.exports.lineString = function (coordinates, properties) {
    if (!coordinates) {
        throw new Error('No coordinates passed');
    }
    return feature({
        type: 'LineString',
        coordinates: coordinates
    }, properties);
};

/**
 * Takes one or more {@link Feature|Features} and creates a {@link FeatureCollection}.
 *
 * @name featureCollection
 * @param {Feature[]} features input features
 * @returns {FeatureCollection} a FeatureCollection of input features
 * @example
 * var features = [
 *  turf.point([-75.343, 39.984], {name: 'Location A'}),
 *  turf.point([-75.833, 39.284], {name: 'Location B'}),
 *  turf.point([-75.534, 39.123], {name: 'Location C'})
 * ];
 *
 * var fc = turf.featureCollection(features);
 *
 * //=fc
 */
module.exports.featureCollection = function (features) {
    return {
        type: 'FeatureCollection',
        features: features
    };
};

/**
 * Creates a {@link Feature<MultiLineString>} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name multiLineString
 * @param {Array<Array<Array<number>>>} coordinates an array of LineStrings
 * @param {Object=} properties an Object of key-value pairs to add as properties
 * @returns {Feature<MultiLineString>} a MultiLineString feature
 * @throws {Error} if no coordinates are passed
 * @example
 * var multiLine = turf.multiLineString([[[0,0],[10,10]]]);
 *
 * //=multiLine
 *
 */
module.exports.multiLineString = function (coordinates, properties) {
    if (!coordinates) {
        throw new Error('No coordinates passed');
    }
    return feature({
        type: 'MultiLineString',
        coordinates: coordinates
    }, properties);
};

/**
 * Creates a {@link Feature<MultiPoint>} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name multiPoint
 * @param {Array<Array<number>>} coordinates an array of Positions
 * @param {Object=} properties an Object of key-value pairs to add as properties
 * @returns {Feature<MultiPoint>} a MultiPoint feature
 * @throws {Error} if no coordinates are passed
 * @example
 * var multiPt = turf.multiPoint([[0,0],[10,10]]);
 *
 * //=multiPt
 *
 */
module.exports.multiPoint = function (coordinates, properties) {
    if (!coordinates) {
        throw new Error('No coordinates passed');
    }
    return feature({
        type: 'MultiPoint',
        coordinates: coordinates
    }, properties);
};


/**
 * Creates a {@link Feature<MultiPolygon>} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name multiPolygon
 * @param {Array<Array<Array<Array<number>>>>} coordinates an array of Polygons
 * @param {Object=} properties an Object of key-value pairs to add as properties
 * @returns {Feature<MultiPolygon>} a multipolygon feature
 * @throws {Error} if no coordinates are passed
 * @example
 * var multiPoly = turf.multiPolygon([[[[0,0],[0,10],[10,10],[10,0],[0,0]]]);
 *
 * //=multiPoly
 *
 */
module.exports.multiPolygon = function (coordinates, properties) {
    if (!coordinates) {
        throw new Error('No coordinates passed');
    }
    return feature({
        type: 'MultiPolygon',
        coordinates: coordinates
    }, properties);
};

/**
 * Creates a {@link Feature<GeometryCollection>} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name geometryCollection
 * @param {Array<{Geometry}>} geometries an array of GeoJSON Geometries
 * @param {Object=} properties an Object of key-value pairs to add as properties
 * @returns {Feature<GeometryCollection>} a geometrycollection feature
 * @example
 * var pt = {
 *     "type": "Point",
 *       "coordinates": [100, 0]
 *     };
 * var line = {
 *     "type": "LineString",
 *     "coordinates": [ [101, 0], [102, 1] ]
 *   };
 * var collection = turf.geometrycollection([[0,0],[10,10]]);
 *
 * //=collection
 */
module.exports.geometryCollection = function (geometries, properties) {
    return feature({
        type: 'GeometryCollection',
        geometries: geometries
    }, properties);
};

var factors = {
    miles: 3960,
    nauticalmiles: 3441.145,
    degrees: 57.2957795,
    radians: 1,
    inches: 250905600,
    yards: 6969600,
    meters: 6373000,
    metres: 6373000,
    kilometers: 6373,
    kilometres: 6373
};

/*
 * Convert a distance measurement from radians to a more friendly unit.
 *
 * @name radiansToDistance
 * @param {number} distance in radians across the sphere
 * @param {string=kilometers} units: one of miles, nauticalmiles, degrees, radians,
 * inches, yards, metres, meters, kilometres, kilometers.
 * @returns {number} distance
 */
module.exports.radiansToDistance = function (radians, units) {
    var factor = factors[units || 'kilometers'];
    if (factor === undefined) {
        throw new Error('Invalid unit');
    }
    return radians * factor;
};

/*
 * Convert a distance measurement from a real-world unit into radians
 *
 * @name distanceToRadians
 * @param {number} distance in real units
 * @param {string=kilometers} units: one of miles, nauticalmiles, degrees, radians,
 * inches, yards, metres, meters, kilometres, kilometers.
 * @returns {number} radians
 */
module.exports.distanceToRadians = function (distance, units) {
    var factor = factors[units || 'kilometers'];
    if (factor === undefined) {
        throw new Error('Invalid unit');
    }
    return distance / factor;
};

/*
 * Convert a distance measurement from a real-world unit into degrees
 *
 * @name distanceToRadians
 * @param {number} distance in real units
 * @param {string=kilometers} units: one of miles, nauticalmiles, degrees, radians,
 * inches, yards, metres, meters, kilometres, kilometers.
 * @returns {number} degrees
 */
module.exports.distanceToDegrees = function (distance, units) {
    var factor = factors[units || 'kilometers'];
    if (factor === undefined) {
        throw new Error('Invalid unit');
    }
    return (distance / factor) * 57.2958;
};

},{}],4:[function(require,module,exports){
/**
 * Unwrap a coordinate from a Feature with a Point geometry, a Point
 * geometry, or a single coordinate.
 *
 * @param {*} obj any value
 * @returns {Array<number>} a coordinate
 */
function getCoord(obj) {
    if (Array.isArray(obj) &&
        typeof obj[0] === 'number' &&
        typeof obj[1] === 'number') {
        return obj;
    } else if (obj) {
        if (obj.type === 'Feature' &&
            obj.geometry &&
            obj.geometry.type === 'Point' &&
            Array.isArray(obj.geometry.coordinates)) {
            return obj.geometry.coordinates;
        } else if (obj.type === 'Point' &&
            Array.isArray(obj.coordinates)) {
            return obj.coordinates;
        }
    }
    throw new Error('A coordinate, feature, or point geometry is required');
}

/**
 * Enforce expectations about types of GeoJSON objects for Turf.
 *
 * @alias geojsonType
 * @param {GeoJSON} value any GeoJSON object
 * @param {string} type expected GeoJSON type
 * @param {string} name name of calling function
 * @throws {Error} if value is not the expected type.
 */
function geojsonType(value, type, name) {
    if (!type || !name) throw new Error('type and name required');

    if (!value || value.type !== type) {
        throw new Error('Invalid input to ' + name + ': must be a ' + type + ', given ' + value.type);
    }
}

/**
 * Enforce expectations about types of {@link Feature} inputs for Turf.
 * Internally this uses {@link geojsonType} to judge geometry types.
 *
 * @alias featureOf
 * @param {Feature} feature a feature with an expected geometry type
 * @param {string} type expected GeoJSON type
 * @param {string} name name of calling function
 * @throws {Error} error if value is not the expected type.
 */
function featureOf(feature, type, name) {
    if (!name) throw new Error('.featureOf() requires a name');
    if (!feature || feature.type !== 'Feature' || !feature.geometry) {
        throw new Error('Invalid input to ' + name + ', Feature with geometry required');
    }
    if (!feature.geometry || feature.geometry.type !== type) {
        throw new Error('Invalid input to ' + name + ': must be a ' + type + ', given ' + feature.geometry.type);
    }
}

/**
 * Enforce expectations about types of {@link FeatureCollection} inputs for Turf.
 * Internally this uses {@link geojsonType} to judge geometry types.
 *
 * @alias collectionOf
 * @param {FeatureCollection} featurecollection a featurecollection for which features will be judged
 * @param {string} type expected GeoJSON type
 * @param {string} name name of calling function
 * @throws {Error} if value is not the expected type.
 */
function collectionOf(featurecollection, type, name) {
    if (!name) throw new Error('.collectionOf() requires a name');
    if (!featurecollection || featurecollection.type !== 'FeatureCollection') {
        throw new Error('Invalid input to ' + name + ', FeatureCollection required');
    }
    for (var i = 0; i < featurecollection.features.length; i++) {
        var feature = featurecollection.features[i];
        if (!feature || feature.type !== 'Feature' || !feature.geometry) {
            throw new Error('Invalid input to ' + name + ', Feature with geometry required');
        }
        if (!feature.geometry || feature.geometry.type !== type) {
            throw new Error('Invalid input to ' + name + ': must be a ' + type + ', given ' + feature.geometry.type);
        }
    }
}

module.exports.geojsonType = geojsonType;
module.exports.collectionOf = collectionOf;
module.exports.featureOf = featureOf;
module.exports.getCoord = getCoord;

},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy5udm0vdmVyc2lvbnMvbm9kZS92Ni4yLjIvbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvdHVyZi1jaXJjbGUvaW5kZXguanMiLCJub2RlX21vZHVsZXMvdHVyZi1kZXN0aW5hdGlvbi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy90dXJmLWhlbHBlcnMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvdHVyZi1pbnZhcmlhbnQvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25VQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgZGVzdGluYXRpb24gPSByZXF1aXJlKCd0dXJmLWRlc3RpbmF0aW9uJyk7XG52YXIgaGVscGVycyA9IHJlcXVpcmUoJ3R1cmYtaGVscGVycycpO1xudmFyIHBvbHlnb24gPSBoZWxwZXJzLnBvbHlnb247XG5cblxuLyoqXG4gKiBUYWtlcyBhIHtAbGluayBQb2ludH0gYW5kIGNhbGN1bGF0ZXMgdGhlIGNpcmNsZSBwb2x5Z29uIGdpdmVuIGEgcmFkaXVzIGluIGRlZ3JlZXMsIHJhZGlhbnMsIG1pbGVzLCBvciBraWxvbWV0ZXJzOyBhbmQgc3RlcHMgZm9yIHByZWNpc2lvbi5cbiAqXG4gKiBAbmFtZSBjaXJjbGVcbiAqIEBwYXJhbSB7RmVhdHVyZTxQb2ludD59IGNlbnRlciBjZW50ZXIgcG9pbnRcbiAqIEBwYXJhbSB7bnVtYmVyfSByYWRpdXMgcmFkaXVzIG9mIHRoZSBjaXJjbGVcbiAqIEBwYXJhbSB7bnVtYmVyfSBzdGVwcyBudW1iZXIgb2Ygc3RlcHNcbiAqIEBwYXJhbSB7U3RyaW5nfSBbdW5pdHM9a2lsb21ldGVyc10gbWlsZXMsIGtpbG9tZXRlcnMsIGRlZ3JlZXMsIG9yIHJhZGlhbnNcbiAqIEByZXR1cm5zIHtGZWF0dXJlPFBvbHlnb24+fSBjaXJjbGUgcG9seWdvblxuICogQGV4YW1wbGVcbiAqIHZhciBjZW50ZXIgPSB7XG4gKiAgIFwidHlwZVwiOiBcIkZlYXR1cmVcIixcbiAqICAgXCJwcm9wZXJ0aWVzXCI6IHtcbiAqICAgICBcIm1hcmtlci1jb2xvclwiOiBcIiMwZjBcIlxuICogICB9LFxuICogICBcImdlb21ldHJ5XCI6IHtcbiAqICAgICBcInR5cGVcIjogXCJQb2ludFwiLFxuICogICAgIFwiY29vcmRpbmF0ZXNcIjogWy03NS4zNDMsIDM5Ljk4NF1cbiAqICAgfVxuICogfTtcbiAqIHZhciByYWRpdXMgPSA1O1xuICogdmFyIHN0ZXBzID0gMTA7XG4gKiB2YXIgdW5pdHMgPSAna2lsb21ldGVycyc7XG4gKlxuICogdmFyIGNpcmNsZSA9IHR1cmYuY2lyY2xlKGNlbnRlciwgcmFkaXVzLCBzdGVwcywgdW5pdHMpO1xuICpcbiAqIHZhciByZXN1bHQgPSB7XG4gKiAgIFwidHlwZVwiOiBcIkZlYXR1cmVDb2xsZWN0aW9uXCIsXG4gKiAgIFwiZmVhdHVyZXNcIjogW2NlbnRlciwgY2lyY2xlXVxuICogfTtcbiAqXG4gKiAvLz1yZXN1bHRcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY2VudGVyLCByYWRpdXMsIHN0ZXBzLCB1bml0cykge1xuICAgIHN0ZXBzID0gc3RlcHMgfHwgNjQ7XG4gICAgdmFyIGNvb3JkaW5hdGVzID0gW107XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ZXBzOyBpKyspIHtcbiAgICAgICAgY29vcmRpbmF0ZXMucHVzaChkZXN0aW5hdGlvbihjZW50ZXIsIHJhZGl1cywgaSAqIDM2MCAvIHN0ZXBzLCB1bml0cykuZ2VvbWV0cnkuY29vcmRpbmF0ZXMpO1xuICAgIH1cblxuICAgIGNvb3JkaW5hdGVzLnB1c2goY29vcmRpbmF0ZXNbMF0pO1xuXG4gICAgcmV0dXJuIHBvbHlnb24oW2Nvb3JkaW5hdGVzXSk7XG59O1xuIiwiLy9odHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0hhdmVyc2luZV9mb3JtdWxhXG4vL2h0dHA6Ly93d3cubW92YWJsZS10eXBlLmNvLnVrL3NjcmlwdHMvbGF0bG9uZy5odG1sXG52YXIgZ2V0Q29vcmQgPSByZXF1aXJlKCd0dXJmLWludmFyaWFudCcpLmdldENvb3JkO1xudmFyIGhlbHBlcnMgPSByZXF1aXJlKCd0dXJmLWhlbHBlcnMnKTtcbnZhciBwb2ludCA9IGhlbHBlcnMucG9pbnQ7XG52YXIgZGlzdGFuY2VUb1JhZGlhbnMgPSBoZWxwZXJzLmRpc3RhbmNlVG9SYWRpYW5zO1xuXG4vKipcbiAqIFRha2VzIGEge0BsaW5rIFBvaW50fSBhbmQgY2FsY3VsYXRlcyB0aGUgbG9jYXRpb24gb2YgYSBkZXN0aW5hdGlvbiBwb2ludCBnaXZlbiBhIGRpc3RhbmNlIGluIGRlZ3JlZXMsIHJhZGlhbnMsIG1pbGVzLCBvciBraWxvbWV0ZXJzOyBhbmQgYmVhcmluZyBpbiBkZWdyZWVzLiBUaGlzIHVzZXMgdGhlIFtIYXZlcnNpbmUgZm9ybXVsYV0oaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9IYXZlcnNpbmVfZm9ybXVsYSkgdG8gYWNjb3VudCBmb3IgZ2xvYmFsIGN1cnZhdHVyZS5cbiAqXG4gKiBAbmFtZSBkZXN0aW5hdGlvblxuICogQHBhcmFtIHtGZWF0dXJlPFBvaW50Pn0gZnJvbSBzdGFydGluZyBwb2ludFxuICogQHBhcmFtIHtudW1iZXJ9IGRpc3RhbmNlIGRpc3RhbmNlIGZyb20gdGhlIHN0YXJ0aW5nIHBvaW50XG4gKiBAcGFyYW0ge251bWJlcn0gYmVhcmluZyByYW5naW5nIGZyb20gLTE4MCB0byAxODBcbiAqIEBwYXJhbSB7U3RyaW5nfSBbdW5pdHM9a2lsb21ldGVyc10gbWlsZXMsIGtpbG9tZXRlcnMsIGRlZ3JlZXMsIG9yIHJhZGlhbnNcbiAqIEByZXR1cm5zIHtGZWF0dXJlPFBvaW50Pn0gZGVzdGluYXRpb24gcG9pbnRcbiAqIEBleGFtcGxlXG4gKiB2YXIgcG9pbnQgPSB7XG4gKiAgIFwidHlwZVwiOiBcIkZlYXR1cmVcIixcbiAqICAgXCJwcm9wZXJ0aWVzXCI6IHtcbiAqICAgICBcIm1hcmtlci1jb2xvclwiOiBcIiMwZjBcIlxuICogICB9LFxuICogICBcImdlb21ldHJ5XCI6IHtcbiAqICAgICBcInR5cGVcIjogXCJQb2ludFwiLFxuICogICAgIFwiY29vcmRpbmF0ZXNcIjogWy03NS4zNDMsIDM5Ljk4NF1cbiAqICAgfVxuICogfTtcbiAqIHZhciBkaXN0YW5jZSA9IDUwO1xuICogdmFyIGJlYXJpbmcgPSA5MDtcbiAqIHZhciB1bml0cyA9ICdtaWxlcyc7XG4gKlxuICogdmFyIGRlc3RpbmF0aW9uID0gdHVyZi5kZXN0aW5hdGlvbihwb2ludCwgZGlzdGFuY2UsIGJlYXJpbmcsIHVuaXRzKTtcbiAqIGRlc3RpbmF0aW9uLnByb3BlcnRpZXNbJ21hcmtlci1jb2xvciddID0gJyNmMDAnO1xuICpcbiAqIHZhciByZXN1bHQgPSB7XG4gKiAgIFwidHlwZVwiOiBcIkZlYXR1cmVDb2xsZWN0aW9uXCIsXG4gKiAgIFwiZmVhdHVyZXNcIjogW3BvaW50LCBkZXN0aW5hdGlvbl1cbiAqIH07XG4gKlxuICogLy89cmVzdWx0XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGZyb20sIGRpc3RhbmNlLCBiZWFyaW5nLCB1bml0cykge1xuICAgIHZhciBkZWdyZWVzMnJhZGlhbnMgPSBNYXRoLlBJIC8gMTgwO1xuICAgIHZhciByYWRpYW5zMmRlZ3JlZXMgPSAxODAgLyBNYXRoLlBJO1xuICAgIHZhciBjb29yZGluYXRlczEgPSBnZXRDb29yZChmcm9tKTtcbiAgICB2YXIgbG9uZ2l0dWRlMSA9IGRlZ3JlZXMycmFkaWFucyAqIGNvb3JkaW5hdGVzMVswXTtcbiAgICB2YXIgbGF0aXR1ZGUxID0gZGVncmVlczJyYWRpYW5zICogY29vcmRpbmF0ZXMxWzFdO1xuICAgIHZhciBiZWFyaW5nX3JhZCA9IGRlZ3JlZXMycmFkaWFucyAqIGJlYXJpbmc7XG5cbiAgICB2YXIgcmFkaWFucyA9IGRpc3RhbmNlVG9SYWRpYW5zKGRpc3RhbmNlLCB1bml0cyk7XG5cbiAgICB2YXIgbGF0aXR1ZGUyID0gTWF0aC5hc2luKE1hdGguc2luKGxhdGl0dWRlMSkgKiBNYXRoLmNvcyhyYWRpYW5zKSArXG4gICAgICAgIE1hdGguY29zKGxhdGl0dWRlMSkgKiBNYXRoLnNpbihyYWRpYW5zKSAqIE1hdGguY29zKGJlYXJpbmdfcmFkKSk7XG4gICAgdmFyIGxvbmdpdHVkZTIgPSBsb25naXR1ZGUxICsgTWF0aC5hdGFuMihNYXRoLnNpbihiZWFyaW5nX3JhZCkgKlxuICAgICAgICBNYXRoLnNpbihyYWRpYW5zKSAqIE1hdGguY29zKGxhdGl0dWRlMSksXG4gICAgICAgIE1hdGguY29zKHJhZGlhbnMpIC0gTWF0aC5zaW4obGF0aXR1ZGUxKSAqIE1hdGguc2luKGxhdGl0dWRlMikpO1xuXG4gICAgcmV0dXJuIHBvaW50KFtyYWRpYW5zMmRlZ3JlZXMgKiBsb25naXR1ZGUyLCByYWRpYW5zMmRlZ3JlZXMgKiBsYXRpdHVkZTJdKTtcbn07XG4iLCIvKipcbiAqIFdyYXBzIGEgR2VvSlNPTiB7QGxpbmsgR2VvbWV0cnl9IGluIGEgR2VvSlNPTiB7QGxpbmsgRmVhdHVyZX0uXG4gKlxuICogQG5hbWUgZmVhdHVyZVxuICogQHBhcmFtIHtHZW9tZXRyeX0gZ2VvbWV0cnkgaW5wdXQgZ2VvbWV0cnlcbiAqIEBwYXJhbSB7T2JqZWN0fSBwcm9wZXJ0aWVzIHByb3BlcnRpZXNcbiAqIEByZXR1cm5zIHtGZWF0dXJlQ29sbGVjdGlvbn0gYSBGZWF0dXJlQ29sbGVjdGlvbiBvZiBpbnB1dCBmZWF0dXJlc1xuICogQGV4YW1wbGVcbiAqIHZhciBnZW9tZXRyeSA9IHtcbiAqICAgICAgXCJ0eXBlXCI6IFwiUG9pbnRcIixcbiAqICAgICAgXCJjb29yZGluYXRlc1wiOiBbXG4gKiAgICAgICAgNjcuNSxcbiAqICAgICAgICAzMi44NDI2NzM2MzE5NTQzMVxuICogICAgICBdXG4gKiAgICB9XG4gKlxuICogdmFyIGZlYXR1cmUgPSB0dXJmLmZlYXR1cmUoZ2VvbWV0cnkpO1xuICpcbiAqIC8vPWZlYXR1cmVcbiAqL1xuZnVuY3Rpb24gZmVhdHVyZShnZW9tZXRyeSwgcHJvcGVydGllcykge1xuICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdGZWF0dXJlJyxcbiAgICAgICAgcHJvcGVydGllczogcHJvcGVydGllcyB8fCB7fSxcbiAgICAgICAgZ2VvbWV0cnk6IGdlb21ldHJ5XG4gICAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMuZmVhdHVyZSA9IGZlYXR1cmU7XG5cbi8qKlxuICogVGFrZXMgY29vcmRpbmF0ZXMgYW5kIHByb3BlcnRpZXMgKG9wdGlvbmFsKSBhbmQgcmV0dXJucyBhIG5ldyB7QGxpbmsgUG9pbnR9IGZlYXR1cmUuXG4gKlxuICogQG5hbWUgcG9pbnRcbiAqIEBwYXJhbSB7bnVtYmVyW119IGNvb3JkaW5hdGVzIGxvbmdpdHVkZSwgbGF0aXR1ZGUgcG9zaXRpb24gKGVhY2ggaW4gZGVjaW1hbCBkZWdyZWVzKVxuICogQHBhcmFtIHtPYmplY3Q9fSBwcm9wZXJ0aWVzIGFuIE9iamVjdCB0aGF0IGlzIHVzZWQgYXMgdGhlIHtAbGluayBGZWF0dXJlfSdzXG4gKiBwcm9wZXJ0aWVzXG4gKiBAcmV0dXJucyB7RmVhdHVyZTxQb2ludD59IGEgUG9pbnQgZmVhdHVyZVxuICogQGV4YW1wbGVcbiAqIHZhciBwdDEgPSB0dXJmLnBvaW50KFstNzUuMzQzLCAzOS45ODRdKTtcbiAqXG4gKiAvLz1wdDFcbiAqL1xubW9kdWxlLmV4cG9ydHMucG9pbnQgPSBmdW5jdGlvbiAoY29vcmRpbmF0ZXMsIHByb3BlcnRpZXMpIHtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoY29vcmRpbmF0ZXMpKSB0aHJvdyBuZXcgRXJyb3IoJ0Nvb3JkaW5hdGVzIG11c3QgYmUgYW4gYXJyYXknKTtcbiAgICBpZiAoY29vcmRpbmF0ZXMubGVuZ3RoIDwgMikgdGhyb3cgbmV3IEVycm9yKCdDb29yZGluYXRlcyBtdXN0IGJlIGF0IGxlYXN0IDIgbnVtYmVycyBsb25nJyk7XG4gICAgcmV0dXJuIGZlYXR1cmUoe1xuICAgICAgICB0eXBlOiAnUG9pbnQnLFxuICAgICAgICBjb29yZGluYXRlczogY29vcmRpbmF0ZXMuc2xpY2UoKVxuICAgIH0sIHByb3BlcnRpZXMpO1xufTtcblxuLyoqXG4gKiBUYWtlcyBhbiBhcnJheSBvZiBMaW5lYXJSaW5ncyBhbmQgb3B0aW9uYWxseSBhbiB7QGxpbmsgT2JqZWN0fSB3aXRoIHByb3BlcnRpZXMgYW5kIHJldHVybnMgYSB7QGxpbmsgUG9seWdvbn0gZmVhdHVyZS5cbiAqXG4gKiBAbmFtZSBwb2x5Z29uXG4gKiBAcGFyYW0ge0FycmF5PEFycmF5PEFycmF5PG51bWJlcj4+Pn0gY29vcmRpbmF0ZXMgYW4gYXJyYXkgb2YgTGluZWFyUmluZ3NcbiAqIEBwYXJhbSB7T2JqZWN0PX0gcHJvcGVydGllcyBhIHByb3BlcnRpZXMgb2JqZWN0XG4gKiBAcmV0dXJucyB7RmVhdHVyZTxQb2x5Z29uPn0gYSBQb2x5Z29uIGZlYXR1cmVcbiAqIEB0aHJvd3Mge0Vycm9yfSB0aHJvdyBhbiBlcnJvciBpZiBhIExpbmVhclJpbmcgb2YgdGhlIHBvbHlnb24gaGFzIHRvbyBmZXcgcG9zaXRpb25zXG4gKiBvciBpZiBhIExpbmVhclJpbmcgb2YgdGhlIFBvbHlnb24gZG9lcyBub3QgaGF2ZSBtYXRjaGluZyBQb3NpdGlvbnMgYXQgdGhlXG4gKiBiZWdpbm5pbmcgJiBlbmQuXG4gKiBAZXhhbXBsZVxuICogdmFyIHBvbHlnb24gPSB0dXJmLnBvbHlnb24oW1tcbiAqICBbLTIuMjc1NTQzLCA1My40NjQ1NDddLFxuICogIFstMi4yNzU1NDMsIDUzLjQ4OTI3MV0sXG4gKiAgWy0yLjIxNTExOCwgNTMuNDg5MjcxXSxcbiAqICBbLTIuMjE1MTE4LCA1My40NjQ1NDddLFxuICogIFstMi4yNzU1NDMsIDUzLjQ2NDU0N11cbiAqIF1dLCB7IG5hbWU6ICdwb2x5MScsIHBvcHVsYXRpb246IDQwMH0pO1xuICpcbiAqIC8vPXBvbHlnb25cbiAqL1xubW9kdWxlLmV4cG9ydHMucG9seWdvbiA9IGZ1bmN0aW9uIChjb29yZGluYXRlcywgcHJvcGVydGllcykge1xuXG4gICAgaWYgKCFjb29yZGluYXRlcykgdGhyb3cgbmV3IEVycm9yKCdObyBjb29yZGluYXRlcyBwYXNzZWQnKTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29vcmRpbmF0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHJpbmcgPSBjb29yZGluYXRlc1tpXTtcbiAgICAgICAgaWYgKHJpbmcubGVuZ3RoIDwgNCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFYWNoIExpbmVhclJpbmcgb2YgYSBQb2x5Z29uIG11c3QgaGF2ZSA0IG9yIG1vcmUgUG9zaXRpb25zLicpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgcmluZ1tyaW5nLmxlbmd0aCAtIDFdLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICBpZiAocmluZ1tyaW5nLmxlbmd0aCAtIDFdW2pdICE9PSByaW5nWzBdW2pdKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGaXJzdCBhbmQgbGFzdCBQb3NpdGlvbiBhcmUgbm90IGVxdWl2YWxlbnQuJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmVhdHVyZSh7XG4gICAgICAgIHR5cGU6ICdQb2x5Z29uJyxcbiAgICAgICAgY29vcmRpbmF0ZXM6IGNvb3JkaW5hdGVzXG4gICAgfSwgcHJvcGVydGllcyk7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSB7QGxpbmsgTGluZVN0cmluZ30gYmFzZWQgb24gYVxuICogY29vcmRpbmF0ZSBhcnJheS4gUHJvcGVydGllcyBjYW4gYmUgYWRkZWQgb3B0aW9uYWxseS5cbiAqXG4gKiBAbmFtZSBsaW5lU3RyaW5nXG4gKiBAcGFyYW0ge0FycmF5PEFycmF5PG51bWJlcj4+fSBjb29yZGluYXRlcyBhbiBhcnJheSBvZiBQb3NpdGlvbnNcbiAqIEBwYXJhbSB7T2JqZWN0PX0gcHJvcGVydGllcyBhbiBPYmplY3Qgb2Yga2V5LXZhbHVlIHBhaXJzIHRvIGFkZCBhcyBwcm9wZXJ0aWVzXG4gKiBAcmV0dXJucyB7RmVhdHVyZTxMaW5lU3RyaW5nPn0gYSBMaW5lU3RyaW5nIGZlYXR1cmVcbiAqIEB0aHJvd3Mge0Vycm9yfSBpZiBubyBjb29yZGluYXRlcyBhcmUgcGFzc2VkXG4gKiBAZXhhbXBsZVxuICogdmFyIGxpbmVzdHJpbmcxID0gdHVyZi5saW5lU3RyaW5nKFtcbiAqXHRbLTIxLjk2NDQxNiwgNjQuMTQ4MjAzXSxcbiAqXHRbLTIxLjk1NjE3NiwgNjQuMTQxMzE2XSxcbiAqXHRbLTIxLjkzOTAxLCA2NC4xMzU5MjRdLFxuICpcdFstMjEuOTI3MzM3LCA2NC4xMzY2NzNdXG4gKiBdKTtcbiAqIHZhciBsaW5lc3RyaW5nMiA9IHR1cmYubGluZVN0cmluZyhbXG4gKlx0Wy0yMS45MjkwNTQsIDY0LjEyNzk4NV0sXG4gKlx0Wy0yMS45MTI5MTgsIDY0LjEzNDcyNl0sXG4gKlx0Wy0yMS45MTYwMDcsIDY0LjE0MTAxNl0sXG4gKiBcdFstMjEuOTMwMDg0LCA2NC4xNDQ0Nl1cbiAqIF0sIHtuYW1lOiAnbGluZSAxJywgZGlzdGFuY2U6IDE0NX0pO1xuICpcbiAqIC8vPWxpbmVzdHJpbmcxXG4gKlxuICogLy89bGluZXN0cmluZzJcbiAqL1xubW9kdWxlLmV4cG9ydHMubGluZVN0cmluZyA9IGZ1bmN0aW9uIChjb29yZGluYXRlcywgcHJvcGVydGllcykge1xuICAgIGlmICghY29vcmRpbmF0ZXMpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBjb29yZGluYXRlcyBwYXNzZWQnKTtcbiAgICB9XG4gICAgcmV0dXJuIGZlYXR1cmUoe1xuICAgICAgICB0eXBlOiAnTGluZVN0cmluZycsXG4gICAgICAgIGNvb3JkaW5hdGVzOiBjb29yZGluYXRlc1xuICAgIH0sIHByb3BlcnRpZXMpO1xufTtcblxuLyoqXG4gKiBUYWtlcyBvbmUgb3IgbW9yZSB7QGxpbmsgRmVhdHVyZXxGZWF0dXJlc30gYW5kIGNyZWF0ZXMgYSB7QGxpbmsgRmVhdHVyZUNvbGxlY3Rpb259LlxuICpcbiAqIEBuYW1lIGZlYXR1cmVDb2xsZWN0aW9uXG4gKiBAcGFyYW0ge0ZlYXR1cmVbXX0gZmVhdHVyZXMgaW5wdXQgZmVhdHVyZXNcbiAqIEByZXR1cm5zIHtGZWF0dXJlQ29sbGVjdGlvbn0gYSBGZWF0dXJlQ29sbGVjdGlvbiBvZiBpbnB1dCBmZWF0dXJlc1xuICogQGV4YW1wbGVcbiAqIHZhciBmZWF0dXJlcyA9IFtcbiAqICB0dXJmLnBvaW50KFstNzUuMzQzLCAzOS45ODRdLCB7bmFtZTogJ0xvY2F0aW9uIEEnfSksXG4gKiAgdHVyZi5wb2ludChbLTc1LjgzMywgMzkuMjg0XSwge25hbWU6ICdMb2NhdGlvbiBCJ30pLFxuICogIHR1cmYucG9pbnQoWy03NS41MzQsIDM5LjEyM10sIHtuYW1lOiAnTG9jYXRpb24gQyd9KVxuICogXTtcbiAqXG4gKiB2YXIgZmMgPSB0dXJmLmZlYXR1cmVDb2xsZWN0aW9uKGZlYXR1cmVzKTtcbiAqXG4gKiAvLz1mY1xuICovXG5tb2R1bGUuZXhwb3J0cy5mZWF0dXJlQ29sbGVjdGlvbiA9IGZ1bmN0aW9uIChmZWF0dXJlcykge1xuICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdGZWF0dXJlQ29sbGVjdGlvbicsXG4gICAgICAgIGZlYXR1cmVzOiBmZWF0dXJlc1xuICAgIH07XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSB7QGxpbmsgRmVhdHVyZTxNdWx0aUxpbmVTdHJpbmc+fSBiYXNlZCBvbiBhXG4gKiBjb29yZGluYXRlIGFycmF5LiBQcm9wZXJ0aWVzIGNhbiBiZSBhZGRlZCBvcHRpb25hbGx5LlxuICpcbiAqIEBuYW1lIG11bHRpTGluZVN0cmluZ1xuICogQHBhcmFtIHtBcnJheTxBcnJheTxBcnJheTxudW1iZXI+Pj59IGNvb3JkaW5hdGVzIGFuIGFycmF5IG9mIExpbmVTdHJpbmdzXG4gKiBAcGFyYW0ge09iamVjdD19IHByb3BlcnRpZXMgYW4gT2JqZWN0IG9mIGtleS12YWx1ZSBwYWlycyB0byBhZGQgYXMgcHJvcGVydGllc1xuICogQHJldHVybnMge0ZlYXR1cmU8TXVsdGlMaW5lU3RyaW5nPn0gYSBNdWx0aUxpbmVTdHJpbmcgZmVhdHVyZVxuICogQHRocm93cyB7RXJyb3J9IGlmIG5vIGNvb3JkaW5hdGVzIGFyZSBwYXNzZWRcbiAqIEBleGFtcGxlXG4gKiB2YXIgbXVsdGlMaW5lID0gdHVyZi5tdWx0aUxpbmVTdHJpbmcoW1tbMCwwXSxbMTAsMTBdXV0pO1xuICpcbiAqIC8vPW11bHRpTGluZVxuICpcbiAqL1xubW9kdWxlLmV4cG9ydHMubXVsdGlMaW5lU3RyaW5nID0gZnVuY3Rpb24gKGNvb3JkaW5hdGVzLCBwcm9wZXJ0aWVzKSB7XG4gICAgaWYgKCFjb29yZGluYXRlcykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGNvb3JkaW5hdGVzIHBhc3NlZCcpO1xuICAgIH1cbiAgICByZXR1cm4gZmVhdHVyZSh7XG4gICAgICAgIHR5cGU6ICdNdWx0aUxpbmVTdHJpbmcnLFxuICAgICAgICBjb29yZGluYXRlczogY29vcmRpbmF0ZXNcbiAgICB9LCBwcm9wZXJ0aWVzKTtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIHtAbGluayBGZWF0dXJlPE11bHRpUG9pbnQ+fSBiYXNlZCBvbiBhXG4gKiBjb29yZGluYXRlIGFycmF5LiBQcm9wZXJ0aWVzIGNhbiBiZSBhZGRlZCBvcHRpb25hbGx5LlxuICpcbiAqIEBuYW1lIG11bHRpUG9pbnRcbiAqIEBwYXJhbSB7QXJyYXk8QXJyYXk8bnVtYmVyPj59IGNvb3JkaW5hdGVzIGFuIGFycmF5IG9mIFBvc2l0aW9uc1xuICogQHBhcmFtIHtPYmplY3Q9fSBwcm9wZXJ0aWVzIGFuIE9iamVjdCBvZiBrZXktdmFsdWUgcGFpcnMgdG8gYWRkIGFzIHByb3BlcnRpZXNcbiAqIEByZXR1cm5zIHtGZWF0dXJlPE11bHRpUG9pbnQ+fSBhIE11bHRpUG9pbnQgZmVhdHVyZVxuICogQHRocm93cyB7RXJyb3J9IGlmIG5vIGNvb3JkaW5hdGVzIGFyZSBwYXNzZWRcbiAqIEBleGFtcGxlXG4gKiB2YXIgbXVsdGlQdCA9IHR1cmYubXVsdGlQb2ludChbWzAsMF0sWzEwLDEwXV0pO1xuICpcbiAqIC8vPW11bHRpUHRcbiAqXG4gKi9cbm1vZHVsZS5leHBvcnRzLm11bHRpUG9pbnQgPSBmdW5jdGlvbiAoY29vcmRpbmF0ZXMsIHByb3BlcnRpZXMpIHtcbiAgICBpZiAoIWNvb3JkaW5hdGVzKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTm8gY29vcmRpbmF0ZXMgcGFzc2VkJyk7XG4gICAgfVxuICAgIHJldHVybiBmZWF0dXJlKHtcbiAgICAgICAgdHlwZTogJ011bHRpUG9pbnQnLFxuICAgICAgICBjb29yZGluYXRlczogY29vcmRpbmF0ZXNcbiAgICB9LCBwcm9wZXJ0aWVzKTtcbn07XG5cblxuLyoqXG4gKiBDcmVhdGVzIGEge0BsaW5rIEZlYXR1cmU8TXVsdGlQb2x5Z29uPn0gYmFzZWQgb24gYVxuICogY29vcmRpbmF0ZSBhcnJheS4gUHJvcGVydGllcyBjYW4gYmUgYWRkZWQgb3B0aW9uYWxseS5cbiAqXG4gKiBAbmFtZSBtdWx0aVBvbHlnb25cbiAqIEBwYXJhbSB7QXJyYXk8QXJyYXk8QXJyYXk8QXJyYXk8bnVtYmVyPj4+Pn0gY29vcmRpbmF0ZXMgYW4gYXJyYXkgb2YgUG9seWdvbnNcbiAqIEBwYXJhbSB7T2JqZWN0PX0gcHJvcGVydGllcyBhbiBPYmplY3Qgb2Yga2V5LXZhbHVlIHBhaXJzIHRvIGFkZCBhcyBwcm9wZXJ0aWVzXG4gKiBAcmV0dXJucyB7RmVhdHVyZTxNdWx0aVBvbHlnb24+fSBhIG11bHRpcG9seWdvbiBmZWF0dXJlXG4gKiBAdGhyb3dzIHtFcnJvcn0gaWYgbm8gY29vcmRpbmF0ZXMgYXJlIHBhc3NlZFxuICogQGV4YW1wbGVcbiAqIHZhciBtdWx0aVBvbHkgPSB0dXJmLm11bHRpUG9seWdvbihbW1tbMCwwXSxbMCwxMF0sWzEwLDEwXSxbMTAsMF0sWzAsMF1dXSk7XG4gKlxuICogLy89bXVsdGlQb2x5XG4gKlxuICovXG5tb2R1bGUuZXhwb3J0cy5tdWx0aVBvbHlnb24gPSBmdW5jdGlvbiAoY29vcmRpbmF0ZXMsIHByb3BlcnRpZXMpIHtcbiAgICBpZiAoIWNvb3JkaW5hdGVzKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTm8gY29vcmRpbmF0ZXMgcGFzc2VkJyk7XG4gICAgfVxuICAgIHJldHVybiBmZWF0dXJlKHtcbiAgICAgICAgdHlwZTogJ011bHRpUG9seWdvbicsXG4gICAgICAgIGNvb3JkaW5hdGVzOiBjb29yZGluYXRlc1xuICAgIH0sIHByb3BlcnRpZXMpO1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIGEge0BsaW5rIEZlYXR1cmU8R2VvbWV0cnlDb2xsZWN0aW9uPn0gYmFzZWQgb24gYVxuICogY29vcmRpbmF0ZSBhcnJheS4gUHJvcGVydGllcyBjYW4gYmUgYWRkZWQgb3B0aW9uYWxseS5cbiAqXG4gKiBAbmFtZSBnZW9tZXRyeUNvbGxlY3Rpb25cbiAqIEBwYXJhbSB7QXJyYXk8e0dlb21ldHJ5fT59IGdlb21ldHJpZXMgYW4gYXJyYXkgb2YgR2VvSlNPTiBHZW9tZXRyaWVzXG4gKiBAcGFyYW0ge09iamVjdD19IHByb3BlcnRpZXMgYW4gT2JqZWN0IG9mIGtleS12YWx1ZSBwYWlycyB0byBhZGQgYXMgcHJvcGVydGllc1xuICogQHJldHVybnMge0ZlYXR1cmU8R2VvbWV0cnlDb2xsZWN0aW9uPn0gYSBnZW9tZXRyeWNvbGxlY3Rpb24gZmVhdHVyZVxuICogQGV4YW1wbGVcbiAqIHZhciBwdCA9IHtcbiAqICAgICBcInR5cGVcIjogXCJQb2ludFwiLFxuICogICAgICAgXCJjb29yZGluYXRlc1wiOiBbMTAwLCAwXVxuICogICAgIH07XG4gKiB2YXIgbGluZSA9IHtcbiAqICAgICBcInR5cGVcIjogXCJMaW5lU3RyaW5nXCIsXG4gKiAgICAgXCJjb29yZGluYXRlc1wiOiBbIFsxMDEsIDBdLCBbMTAyLCAxXSBdXG4gKiAgIH07XG4gKiB2YXIgY29sbGVjdGlvbiA9IHR1cmYuZ2VvbWV0cnljb2xsZWN0aW9uKFtbMCwwXSxbMTAsMTBdXSk7XG4gKlxuICogLy89Y29sbGVjdGlvblxuICovXG5tb2R1bGUuZXhwb3J0cy5nZW9tZXRyeUNvbGxlY3Rpb24gPSBmdW5jdGlvbiAoZ2VvbWV0cmllcywgcHJvcGVydGllcykge1xuICAgIHJldHVybiBmZWF0dXJlKHtcbiAgICAgICAgdHlwZTogJ0dlb21ldHJ5Q29sbGVjdGlvbicsXG4gICAgICAgIGdlb21ldHJpZXM6IGdlb21ldHJpZXNcbiAgICB9LCBwcm9wZXJ0aWVzKTtcbn07XG5cbnZhciBmYWN0b3JzID0ge1xuICAgIG1pbGVzOiAzOTYwLFxuICAgIG5hdXRpY2FsbWlsZXM6IDM0NDEuMTQ1LFxuICAgIGRlZ3JlZXM6IDU3LjI5NTc3OTUsXG4gICAgcmFkaWFuczogMSxcbiAgICBpbmNoZXM6IDI1MDkwNTYwMCxcbiAgICB5YXJkczogNjk2OTYwMCxcbiAgICBtZXRlcnM6IDYzNzMwMDAsXG4gICAgbWV0cmVzOiA2MzczMDAwLFxuICAgIGtpbG9tZXRlcnM6IDYzNzMsXG4gICAga2lsb21ldHJlczogNjM3M1xufTtcblxuLypcbiAqIENvbnZlcnQgYSBkaXN0YW5jZSBtZWFzdXJlbWVudCBmcm9tIHJhZGlhbnMgdG8gYSBtb3JlIGZyaWVuZGx5IHVuaXQuXG4gKlxuICogQG5hbWUgcmFkaWFuc1RvRGlzdGFuY2VcbiAqIEBwYXJhbSB7bnVtYmVyfSBkaXN0YW5jZSBpbiByYWRpYW5zIGFjcm9zcyB0aGUgc3BoZXJlXG4gKiBAcGFyYW0ge3N0cmluZz1raWxvbWV0ZXJzfSB1bml0czogb25lIG9mIG1pbGVzLCBuYXV0aWNhbG1pbGVzLCBkZWdyZWVzLCByYWRpYW5zLFxuICogaW5jaGVzLCB5YXJkcywgbWV0cmVzLCBtZXRlcnMsIGtpbG9tZXRyZXMsIGtpbG9tZXRlcnMuXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBkaXN0YW5jZVxuICovXG5tb2R1bGUuZXhwb3J0cy5yYWRpYW5zVG9EaXN0YW5jZSA9IGZ1bmN0aW9uIChyYWRpYW5zLCB1bml0cykge1xuICAgIHZhciBmYWN0b3IgPSBmYWN0b3JzW3VuaXRzIHx8ICdraWxvbWV0ZXJzJ107XG4gICAgaWYgKGZhY3RvciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCB1bml0Jyk7XG4gICAgfVxuICAgIHJldHVybiByYWRpYW5zICogZmFjdG9yO1xufTtcblxuLypcbiAqIENvbnZlcnQgYSBkaXN0YW5jZSBtZWFzdXJlbWVudCBmcm9tIGEgcmVhbC13b3JsZCB1bml0IGludG8gcmFkaWFuc1xuICpcbiAqIEBuYW1lIGRpc3RhbmNlVG9SYWRpYW5zXG4gKiBAcGFyYW0ge251bWJlcn0gZGlzdGFuY2UgaW4gcmVhbCB1bml0c1xuICogQHBhcmFtIHtzdHJpbmc9a2lsb21ldGVyc30gdW5pdHM6IG9uZSBvZiBtaWxlcywgbmF1dGljYWxtaWxlcywgZGVncmVlcywgcmFkaWFucyxcbiAqIGluY2hlcywgeWFyZHMsIG1ldHJlcywgbWV0ZXJzLCBraWxvbWV0cmVzLCBraWxvbWV0ZXJzLlxuICogQHJldHVybnMge251bWJlcn0gcmFkaWFuc1xuICovXG5tb2R1bGUuZXhwb3J0cy5kaXN0YW5jZVRvUmFkaWFucyA9IGZ1bmN0aW9uIChkaXN0YW5jZSwgdW5pdHMpIHtcbiAgICB2YXIgZmFjdG9yID0gZmFjdG9yc1t1bml0cyB8fCAna2lsb21ldGVycyddO1xuICAgIGlmIChmYWN0b3IgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgdW5pdCcpO1xuICAgIH1cbiAgICByZXR1cm4gZGlzdGFuY2UgLyBmYWN0b3I7XG59O1xuXG4vKlxuICogQ29udmVydCBhIGRpc3RhbmNlIG1lYXN1cmVtZW50IGZyb20gYSByZWFsLXdvcmxkIHVuaXQgaW50byBkZWdyZWVzXG4gKlxuICogQG5hbWUgZGlzdGFuY2VUb1JhZGlhbnNcbiAqIEBwYXJhbSB7bnVtYmVyfSBkaXN0YW5jZSBpbiByZWFsIHVuaXRzXG4gKiBAcGFyYW0ge3N0cmluZz1raWxvbWV0ZXJzfSB1bml0czogb25lIG9mIG1pbGVzLCBuYXV0aWNhbG1pbGVzLCBkZWdyZWVzLCByYWRpYW5zLFxuICogaW5jaGVzLCB5YXJkcywgbWV0cmVzLCBtZXRlcnMsIGtpbG9tZXRyZXMsIGtpbG9tZXRlcnMuXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBkZWdyZWVzXG4gKi9cbm1vZHVsZS5leHBvcnRzLmRpc3RhbmNlVG9EZWdyZWVzID0gZnVuY3Rpb24gKGRpc3RhbmNlLCB1bml0cykge1xuICAgIHZhciBmYWN0b3IgPSBmYWN0b3JzW3VuaXRzIHx8ICdraWxvbWV0ZXJzJ107XG4gICAgaWYgKGZhY3RvciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCB1bml0Jyk7XG4gICAgfVxuICAgIHJldHVybiAoZGlzdGFuY2UgLyBmYWN0b3IpICogNTcuMjk1ODtcbn07XG4iLCIvKipcbiAqIFVud3JhcCBhIGNvb3JkaW5hdGUgZnJvbSBhIEZlYXR1cmUgd2l0aCBhIFBvaW50IGdlb21ldHJ5LCBhIFBvaW50XG4gKiBnZW9tZXRyeSwgb3IgYSBzaW5nbGUgY29vcmRpbmF0ZS5cbiAqXG4gKiBAcGFyYW0geyp9IG9iaiBhbnkgdmFsdWVcbiAqIEByZXR1cm5zIHtBcnJheTxudW1iZXI+fSBhIGNvb3JkaW5hdGVcbiAqL1xuZnVuY3Rpb24gZ2V0Q29vcmQob2JqKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkob2JqKSAmJlxuICAgICAgICB0eXBlb2Ygb2JqWzBdID09PSAnbnVtYmVyJyAmJlxuICAgICAgICB0eXBlb2Ygb2JqWzFdID09PSAnbnVtYmVyJykge1xuICAgICAgICByZXR1cm4gb2JqO1xuICAgIH0gZWxzZSBpZiAob2JqKSB7XG4gICAgICAgIGlmIChvYmoudHlwZSA9PT0gJ0ZlYXR1cmUnICYmXG4gICAgICAgICAgICBvYmouZ2VvbWV0cnkgJiZcbiAgICAgICAgICAgIG9iai5nZW9tZXRyeS50eXBlID09PSAnUG9pbnQnICYmXG4gICAgICAgICAgICBBcnJheS5pc0FycmF5KG9iai5nZW9tZXRyeS5jb29yZGluYXRlcykpIHtcbiAgICAgICAgICAgIHJldHVybiBvYmouZ2VvbWV0cnkuY29vcmRpbmF0ZXM7XG4gICAgICAgIH0gZWxzZSBpZiAob2JqLnR5cGUgPT09ICdQb2ludCcgJiZcbiAgICAgICAgICAgIEFycmF5LmlzQXJyYXkob2JqLmNvb3JkaW5hdGVzKSkge1xuICAgICAgICAgICAgcmV0dXJuIG9iai5jb29yZGluYXRlcztcbiAgICAgICAgfVxuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0EgY29vcmRpbmF0ZSwgZmVhdHVyZSwgb3IgcG9pbnQgZ2VvbWV0cnkgaXMgcmVxdWlyZWQnKTtcbn1cblxuLyoqXG4gKiBFbmZvcmNlIGV4cGVjdGF0aW9ucyBhYm91dCB0eXBlcyBvZiBHZW9KU09OIG9iamVjdHMgZm9yIFR1cmYuXG4gKlxuICogQGFsaWFzIGdlb2pzb25UeXBlXG4gKiBAcGFyYW0ge0dlb0pTT059IHZhbHVlIGFueSBHZW9KU09OIG9iamVjdFxuICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgZXhwZWN0ZWQgR2VvSlNPTiB0eXBlXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBuYW1lIG9mIGNhbGxpbmcgZnVuY3Rpb25cbiAqIEB0aHJvd3Mge0Vycm9yfSBpZiB2YWx1ZSBpcyBub3QgdGhlIGV4cGVjdGVkIHR5cGUuXG4gKi9cbmZ1bmN0aW9uIGdlb2pzb25UeXBlKHZhbHVlLCB0eXBlLCBuYW1lKSB7XG4gICAgaWYgKCF0eXBlIHx8ICFuYW1lKSB0aHJvdyBuZXcgRXJyb3IoJ3R5cGUgYW5kIG5hbWUgcmVxdWlyZWQnKTtcblxuICAgIGlmICghdmFsdWUgfHwgdmFsdWUudHlwZSAhPT0gdHlwZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgaW5wdXQgdG8gJyArIG5hbWUgKyAnOiBtdXN0IGJlIGEgJyArIHR5cGUgKyAnLCBnaXZlbiAnICsgdmFsdWUudHlwZSk7XG4gICAgfVxufVxuXG4vKipcbiAqIEVuZm9yY2UgZXhwZWN0YXRpb25zIGFib3V0IHR5cGVzIG9mIHtAbGluayBGZWF0dXJlfSBpbnB1dHMgZm9yIFR1cmYuXG4gKiBJbnRlcm5hbGx5IHRoaXMgdXNlcyB7QGxpbmsgZ2VvanNvblR5cGV9IHRvIGp1ZGdlIGdlb21ldHJ5IHR5cGVzLlxuICpcbiAqIEBhbGlhcyBmZWF0dXJlT2ZcbiAqIEBwYXJhbSB7RmVhdHVyZX0gZmVhdHVyZSBhIGZlYXR1cmUgd2l0aCBhbiBleHBlY3RlZCBnZW9tZXRyeSB0eXBlXG4gKiBAcGFyYW0ge3N0cmluZ30gdHlwZSBleHBlY3RlZCBHZW9KU09OIHR5cGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIG5hbWUgb2YgY2FsbGluZyBmdW5jdGlvblxuICogQHRocm93cyB7RXJyb3J9IGVycm9yIGlmIHZhbHVlIGlzIG5vdCB0aGUgZXhwZWN0ZWQgdHlwZS5cbiAqL1xuZnVuY3Rpb24gZmVhdHVyZU9mKGZlYXR1cmUsIHR5cGUsIG5hbWUpIHtcbiAgICBpZiAoIW5hbWUpIHRocm93IG5ldyBFcnJvcignLmZlYXR1cmVPZigpIHJlcXVpcmVzIGEgbmFtZScpO1xuICAgIGlmICghZmVhdHVyZSB8fCBmZWF0dXJlLnR5cGUgIT09ICdGZWF0dXJlJyB8fCAhZmVhdHVyZS5nZW9tZXRyeSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgaW5wdXQgdG8gJyArIG5hbWUgKyAnLCBGZWF0dXJlIHdpdGggZ2VvbWV0cnkgcmVxdWlyZWQnKTtcbiAgICB9XG4gICAgaWYgKCFmZWF0dXJlLmdlb21ldHJ5IHx8IGZlYXR1cmUuZ2VvbWV0cnkudHlwZSAhPT0gdHlwZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgaW5wdXQgdG8gJyArIG5hbWUgKyAnOiBtdXN0IGJlIGEgJyArIHR5cGUgKyAnLCBnaXZlbiAnICsgZmVhdHVyZS5nZW9tZXRyeS50eXBlKTtcbiAgICB9XG59XG5cbi8qKlxuICogRW5mb3JjZSBleHBlY3RhdGlvbnMgYWJvdXQgdHlwZXMgb2Yge0BsaW5rIEZlYXR1cmVDb2xsZWN0aW9ufSBpbnB1dHMgZm9yIFR1cmYuXG4gKiBJbnRlcm5hbGx5IHRoaXMgdXNlcyB7QGxpbmsgZ2VvanNvblR5cGV9IHRvIGp1ZGdlIGdlb21ldHJ5IHR5cGVzLlxuICpcbiAqIEBhbGlhcyBjb2xsZWN0aW9uT2ZcbiAqIEBwYXJhbSB7RmVhdHVyZUNvbGxlY3Rpb259IGZlYXR1cmVjb2xsZWN0aW9uIGEgZmVhdHVyZWNvbGxlY3Rpb24gZm9yIHdoaWNoIGZlYXR1cmVzIHdpbGwgYmUganVkZ2VkXG4gKiBAcGFyYW0ge3N0cmluZ30gdHlwZSBleHBlY3RlZCBHZW9KU09OIHR5cGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIG5hbWUgb2YgY2FsbGluZyBmdW5jdGlvblxuICogQHRocm93cyB7RXJyb3J9IGlmIHZhbHVlIGlzIG5vdCB0aGUgZXhwZWN0ZWQgdHlwZS5cbiAqL1xuZnVuY3Rpb24gY29sbGVjdGlvbk9mKGZlYXR1cmVjb2xsZWN0aW9uLCB0eXBlLCBuYW1lKSB7XG4gICAgaWYgKCFuYW1lKSB0aHJvdyBuZXcgRXJyb3IoJy5jb2xsZWN0aW9uT2YoKSByZXF1aXJlcyBhIG5hbWUnKTtcbiAgICBpZiAoIWZlYXR1cmVjb2xsZWN0aW9uIHx8IGZlYXR1cmVjb2xsZWN0aW9uLnR5cGUgIT09ICdGZWF0dXJlQ29sbGVjdGlvbicpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGlucHV0IHRvICcgKyBuYW1lICsgJywgRmVhdHVyZUNvbGxlY3Rpb24gcmVxdWlyZWQnKTtcbiAgICB9XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmZWF0dXJlY29sbGVjdGlvbi5mZWF0dXJlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgZmVhdHVyZSA9IGZlYXR1cmVjb2xsZWN0aW9uLmZlYXR1cmVzW2ldO1xuICAgICAgICBpZiAoIWZlYXR1cmUgfHwgZmVhdHVyZS50eXBlICE9PSAnRmVhdHVyZScgfHwgIWZlYXR1cmUuZ2VvbWV0cnkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBpbnB1dCB0byAnICsgbmFtZSArICcsIEZlYXR1cmUgd2l0aCBnZW9tZXRyeSByZXF1aXJlZCcpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghZmVhdHVyZS5nZW9tZXRyeSB8fCBmZWF0dXJlLmdlb21ldHJ5LnR5cGUgIT09IHR5cGUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBpbnB1dCB0byAnICsgbmFtZSArICc6IG11c3QgYmUgYSAnICsgdHlwZSArICcsIGdpdmVuICcgKyBmZWF0dXJlLmdlb21ldHJ5LnR5cGUpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cy5nZW9qc29uVHlwZSA9IGdlb2pzb25UeXBlO1xubW9kdWxlLmV4cG9ydHMuY29sbGVjdGlvbk9mID0gY29sbGVjdGlvbk9mO1xubW9kdWxlLmV4cG9ydHMuZmVhdHVyZU9mID0gZmVhdHVyZU9mO1xubW9kdWxlLmV4cG9ydHMuZ2V0Q29vcmQgPSBnZXRDb29yZDtcbiJdfQ==
