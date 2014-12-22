# Partie Données

Cette partie permet principalement de travailler avec des collections d'objets (`FeatureCollection`).

Dans les faits, les fonctions offertes sont liées à la manipulation de tableaux JavaScript (`Array`) en bouclant avec des critères sur la partie `features` d'un GeoJSON.

    { "type": "FeatureCollection",
        "features": [
        {...},
        {...},
        ...
        ]
    }

Là encore, selon votre niveau en JavaScript, cela peut s'avérer utile ou contraignant. Par exemple, turf.filter est utile si on a qu'un critère mais il est préférable de s'en passer si on a plusieurs critères. Nous vous conseillons de vous référer à la [documentation JavaScript de Mozilla](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Array) sur les `Array`.