# See https://github.com/Turfjs/turf/issues/404#issuecomment-247806350
npm install turf-meta
npm install turf-invariant
npm install turf-circle
browserify -d node_modules/turf-meta/index.js -s turf.meta  > assets/js/turf-meta.js
browserify node_modules/turf-meta/index.js -s turf.meta | uglifyjs -c warnings=false -m > assets/js/turf-meta.min.js
browserify -d node_modules/turf-invariant/index.js -s turf.invariant  > assets/js/turf-invariant.js
browserify node_modules/turf-invariant/index.js -s turf.invariant | uglifyjs -c warnings=false -m > assets/js/turf-invariant.min.js
browserify -d node_modules/turf-circle/index.js -s turf.circle  > assets/js/turf-circle.js
browserify node_modules/turf-circle/index.js -s turf.circle | uglifyjs -c warnings=false -m > assets/js/turf-circle.min.js