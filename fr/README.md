# Introduction

## Pourquoi?

Le but de ces démos est de vous permettre de découvrir comment faire fonctionner Turf, une bibliothèque JavaScript pouvant fonctionner côté client comme serveur. Ce travail est directement inspiré de la version pour MapBox/Leaflet http://rousseau.io/turf-mapboxjs

Turf a beaucoup de fonctionnalités intéressantes pour créer des objets GeoJSON, effectuer des opérations spatiales sur ces mêmes objets. Elle permet aussi de faire des statistiques sur les attributs.

## Une reprise d'idées mais avec une API simplifiée

Même si la bibliothèque est très intéressante, il faut aussi noter que Turf n'est pas entièrement une nouveauté.

* Elle reprend L'idée de constructeurs d'objets GeoJSON pour simplifier la création d'objets GeoJSON comme le faisait déjà par exemple https://github.com/caseypt/GeoJSON.js en notant au passage que le code et les signatures des fonctions diffèrent fortement entre les deux.

* Elle emprunte quelques fonctionnalités à la bibliothèque TOPOJSON de Mike Bostock (le créateur de D3) pour la simplification des objets géométriques.

* Par ailleurs, pour un nombre important de fonctions spatiales, la bibliothèque Turf emprunte les fonctions à JSTS (JavaScript Topology Suite) en cachant de la complexité. JSTS seule est capable de gérer du GeoJSON et d'effectuer des opérations spatiales mais est nettement plus verbeuse que Turf: Elle vient d'un port de la bibliothèque JTS (JTS Topology Suite) venant du monde Java.

Pour consulter l'arbre de dépendances du projet, allez sur http://www.yasiv.com/npm#view/turf

## Dans quels cas l'utiliser?

Nous pensons que Turf est très utile dans la majorité des cas. Elle permet par exemple de savoir quels magasins sont inclus dans une zone, de mesurer des distances, de voir quelles sont les lieux à 100 mètres de vous en utilisant des tampons,...

Elle présente une API simple même elle parfois trop redondante à notre goût. Elle présente aussi l'énorme avantage d'être modulaire. Dans les exemples, nous prenons la bibliothèque "monobloc" mais il est possible de n'inclure que ce que vous utilisez avec le gestionnaire de dépendances de Node JS (NPM).

Néanmoins, il peut rester quelques cas où il faudra plutôt penser à utiliser JSTS car elle permet des opérations plus complexes liés à la topologie par exemple ou la validité des polygones mais tout le monde n'a pas non plus ce besoin.

## Limites liées au cas de OpenLayers 3

Dans le contexte de OpenLayers 3, il faut parfois faire des conversions entre les objets géométriques "à la sauce OpenLayers 3" et le GeoJSON.

Par choix, nous utilisons de manière privilégié Turf mais il peut être plus opportun d'utiliser les fonctions incluses dans OpenLayers 3 que celles de Turf.