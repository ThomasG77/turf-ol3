# Introduction

## Why?

The goal of these demos is to help you discover how to use Turf, a JavaScript library mainly dedicated to geoprocessing using the GeoJSON format. This library works both on client and server side. This work is directly inspired by the official version that relies on MapBox/Leaflet available at <http://turfjs.org>

Turf has many interesting functionalities to create GeoJSON objects and to do spatial operations on them. It enables to do some statistics on attributes based on spatial operations. When Turf is executed in the browser, it can't really replace a more classic server side solution when many data are involved.

## A mix of existing API but with a simplified API (but powerfull)

Although this library is quite interesting, you should know that Turf is not a new complete solution but mainly a mix of existing (good) ideas.

* Turf reuses the idea of GeoJSON objects constructor to simplify GeoJSON objects creation as something like <https:/github.com/caseypt/GeoJSON.js> was doing. You should note that that both functions codes and signatures really differs.

* Turf also borrows functionnality from [the simplify-js library](https://github.com/mourner/simplify-js) for simplifying features. This library is based on simplified Douglas Peucker and radial distance algorithms. Previously, the simplification was done with [the TopoJSON library](https://github.com/mbostock/topojson). Depending on use case, in particular for joined polygons, we recommend to avoid Turf as the Douglas Peucker doesn't keep perfect jointness and use TopoJSON instead.

* For many spatial functions, the Turf library uses functions from JSTS (JavaScript Topology Suite) by hiding complexity and verbosity. JSTS is able to manage GeoJSON without Turf et can do spatial operations but is really more verbose than Turf. The JSTS library comes from the JTS (JTS Topology Suite) library port, a Java library.

To see more about Turf project dependencies tree, head to <http:/www.yasiv.com/npm#view/turf>

## In which cases can you use Turf?

We think that Turf can be useful in a majority of cases. It helps for instance to find out which shops are included within an area, to measure distances, to see which places are around 100 meters from you using buffer,...

Turf presents a simple API although sometimes redundant in our opinion, in particular if you already have some JavaScript basic knowledge. One of it main advantages is it modularity. In the examples, we use the full library with all Turf functions but it's also possible to include only the Turf functions your code use by relying on the Node JS (NPM) dependencies packets manager to build a custom browser version.

Furthermore, Turf also brings new features that no other libraries provide for GeoJSON like Bezier curves or TIN generation.

However, there are always some cases where you should better use JSTS instead of Turf as it provides some complex operations due to topology or polygons validity testing. But everyone do not need these abilities.

## Limits related to OpenLayers 3

In the OpenLayers 3 context, it can be sometimes a pain to always switch with conversions between geometric objets "OpenLayers 3 specific" and the GeoJSON.

We made a trade off by previleging Turf but it would be better to use functions included in OpenLayers 3 instead of Turf, when equivalent is available. That's the case for example for "bearing" or "distance".