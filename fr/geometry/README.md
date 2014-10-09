# Partie Géométrie

La partie géométrie est dédié à la construction des `Point` (points), `Line` (lignes), `Polygon` (polygones) et des `FeatureCollection` (collections d'objets).

Une collection est un regroupement de points, lignes ou polygones. Avec Turf, on ne manipule que les collections de type `FeatureCollection` qui comprennent des `Feature`, c'est à dire des objets ayant géométries et propriétés pour chacun des objets géographiques dessinés. Les collections de  type `GeometryCollection` ne sont pas gérées.

Turf ne couvre pas tous les cas de figure comme par exemple les objets de type multi: `MultiPoint`, `MultiLine`, `MultiPolygon`
Ces derniers sont utiles par exemple pour figurer la france et les DOM-TOM (voir [les statuts entre les DOM, COM et autres cas spéciaux](https://fr.wikipedia.org/wiki/France_d%27outre-mer)),  la France étant dans ce cas un MultiPolygon.

L'ensemble des éléments décrits ici peuvent être vus plus en détail dans [la spécification GeoJSON](http://geojson.org/geojson-spec.html), Turf étant directement destiné à manipuler du GeoJSON.

Il faut noter que même si Turf facilite la création d'objets GeoJSON pour les débutants, quelqu'un avec un minimum de connaissances en JavaScript peut aisément s'en passer.