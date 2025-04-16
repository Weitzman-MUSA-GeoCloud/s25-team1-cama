// map.js
mapboxgl.accessToken = 'pk.eyJ1IjoiYnlyb25ubiIsImEiOiJjbTB2NG9qajYxOTE1Mmtwd3Q1aDd5cjM2In0.K6SRujI45VvXnG1vfcwbwA';
var map = new mapboxgl.Map({
    container: 'map', // ID of the div where the map will be placed
    style: 'mapbox://styles/byronnn/cm15ugzyg00dg01pc3ucid3od', // Mapbox style
    center: [-75.181756, 39.952451], // Initial position [lng, lat]
    zoom: 12
});

var nav = new mapboxgl.NavigationControl();
map.on('load', function() {

    // 1. A-roads-all.geojson (fill)
    // map.addLayer({
    //     id: "A-roads-all",
    //     type: "fill",
    //     source: {
    //         type: "geojson",
    //         data: "assets/grids/Grid-A/A-roads-all.geojson"
    //     },
    //     paint: {
    //         "fill-color": "#ffffff",
    //         "fill-opacity": 1,
    //     }
    // });

});

map.addControl(
    new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        bbox: [-75.4833601043, 39.7480955613, -74.7562025115, 40.2404700471],
        placeholder: 'E.G. Powelton Ave'
    })
);

map.addControl(nav, 'bottom-right');


// Reset button functionality
document.getElementById('reset-button').addEventListener('click', function() {
    map.flyTo({
        center: [-75.181756, 39.952451],
        zoom: 12,
        bearing: 0,
        essential: true
    });
});

