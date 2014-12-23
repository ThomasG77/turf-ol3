## turf-isClockwise

Takes a ring and return true or false whether or not the ring is clockwise or counter-clockwise.

This function is useful because the ring order can affect image rendering and because some tools are sensitive to ring order. To correct, after a test with the `isClockwise` function, we recommend to visit [NPM geojson-rewind library page](https://www.npmjs.com/package/geojson-rewind). It will help you grasping the issue and discover how to solve it.