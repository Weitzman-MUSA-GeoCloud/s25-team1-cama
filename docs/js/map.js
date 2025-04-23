// map.js
mapboxgl.accessToken = 'pk.eyJ1IjoiYnlyb25ubiIsImEiOiJjbTB2NG9qajYxOTE1Mmtwd3Q1aDd5cjM2In0.K6SRujI45VvXnG1vfcwbwA';
var map = new mapboxgl.Map({
    container: 'map', // ID of the div where the map will be placed
    style: 'mapbox://styles/byronnn/cm9rapweo004c01qs5l0n4ncv', // Mapbox style
    center: [-75.181756, 39.952451], // Initial position [lng, lat]
    zoom: 13
});

var nav = new mapboxgl.NavigationControl();
map.on('load', function() {

    map.addSource('property-tiles', {
        type: 'vector',
        tiles: [
          'https://storage.googleapis.com/musa5090s25-team1-public/tiles/properties/{z}/{x}/{y}.pbf'
        ],
        minzoom: 13,
        maxzoom: 26
      });
      
      // Current year assessment values
      map.addLayer({
        id: 'property-tile-layer',
        type: 'fill',
        source: 'property-tiles',
        'source-layer': 'property_tile_info',
        paint: {
          'fill-color': [
          'step',
          ['get', 'current_assessed_value'],
          '#ffffcc',       // < 100,000
          100000, '#a1dab4', // 100k–200k
          400000, '#41b6c4', // 200k–300k
          700000, '#2c7fb8', // 300k–400k
          1000000, '#253494'  // 400k+
        ],
        'fill-opacity': 0,
        'fill-outline-color': '#000000'
        }
      });

      // Previous year assessment values
      map.addLayer({
        id: 'previous-tile-layer',
        type: 'fill',
        source: 'property-tiles',
        'source-layer': 'property_tile_info',
        paint: {
          'fill-color': [
          'step',
          ['get', 'tax_year_assessed_value'],
          '#ffffcc',       // < 100,000
          100000, '#a1dab4', // 100k–200k
          400000, '#41b6c4', // 200k–300k
          700000, '#2c7fb8', // 300k–400k
          1000000, '#253494'  // 400k+
        ],
        'fill-opacity': 0,
        'fill-outline-color': '#000000'
        }
      });

      map.addLayer({
        id: 'absolute-change-layer',
        type: 'fill',
        source: 'property-tiles',
        'source-layer': 'property_tile_info',
        paint: {
          'fill-color': [
            'step',
            ['abs', ['-', ['get', 'current_assessed_value'], ['get', 'tax_year_assessed_value']]],
            '#ffffcc',       // < 10k
            50, '#a1dab4', // 10k–50k
            100, '#41b6c4', // 50k–100k
            150, '#2c7fb8', // 100k–200k
            200, '#253494'  // >200k
          ],
          'fill-opacity': 0,
          'fill-outline-color': '#000000'
        }
      });

      map.addLayer({
        id: 'pct-change-layer',
        type: 'fill',
        source: 'property-tiles',
        'source-layer': 'property_tile_info',
        paint: {
          'fill-color': [
            'step',
            [
              '/', 
              ['-', ['get', 'current_assessed_value'], ['get', 'tax_year_assessed_value']],
              ['get', 'tax_year_assessed_value']
            ],
            '#ffffcc',       
            0.005, '#a1dab4', // 
            0.01, '#41b6c4', // 
            0.02, '#2c7fb8',  // 
            0.03, '#253494'   // 
          ],
          'fill-opacity': 0,
          'fill-outline-color': '#000000'
        }
      });

      // const center = map.getCenter();

      // map.once('idle', () => {
      //   const features = map.queryRenderedFeatures(
      //     map.project(center),
      //     { layers: ['property-tile-layer'] }
      //   );

      //   if (features.length > 0) {
      //     const properties = Object.keys(features[0].properties);
      //     console.log('Property keys in vector tile:', properties);
      //   } else {
      //     console.warn('No features found at the center of the map.');
      //   }
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

