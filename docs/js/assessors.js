// assessors.js

function loadAssessorsMode() {
    let contentPanel = document.getElementById('description-panel');
    contentPanel.innerHTML = `
    <h3 style="line-height: 1.05;"><span style="font-size: 1.2em;">Assessor's Section</span></h3>
    <div class="image-container">
        <img src="./site-assets/map1.png" alt="map-logo" id="map-image" class="img-fluid">
    </div>
    <p>
        Welcome to the assessor's mode!
    </p>
    <p>
        Navigate directly on the map, or search for an area below:
    </p>

    <!-- Search Bar -->
    <nav class="navbar p-2 rounded">
        <form class="d-flex w-100" role="search">
            <input class="form-control me-2" type="search" placeholder="E.G. Powelton Ave, 19104" aria-label="Search">
        </form>
        <ul id="search-suggestions" class="list-group position-absolute z-3 mt-1" style="max-height: 200px; overflow-y: auto;"></ul>
    </nav>

    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <!-- Back Icon Section -->
    <div class="d-flex align-items-center mt-3" id="back-icon-section">
        <i class="bi bi-arrow-left-circle-fill" style="font-size: 1.5em; cursor: pointer; margin-right: 10px;"></i>
        <span style="font-size: 1.1em; cursor: pointer;" id="return-home">Return to home</span>
    </div>
    `;

    document.getElementById('back-icon-section').addEventListener('click', () => {
        location.reload();
    });

    document.getElementById('view-toggle').style.display = 'block';

    // map.off('mouseenter', 'property-tile-layer');
    // map.off('mouseleave', 'property-tile-layer');
  
    const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
      });
      
      map.on('mouseenter', 'property-tile-layer', (e) => {
        map.getCanvas().style.cursor = 'pointer';
      
        const feature = e.features[0];
        const id = feature.properties.property_id;
        const address = feature.properties.address;
        const currentAV = feature.properties.current_assessed_value;
        const previousAV = feature.properties.tax_year_assessed_value;
      
        const formattedCurrent = `$${Number(currentAV).toLocaleString()}`;
        const rawChange = currentAV - previousAV;
        const formattedRaw = `${rawChange >= 0 ? '+' : '-'}$${Math.abs(rawChange).toLocaleString()}`;
      
        const pctChange = ((currentAV - previousAV) / previousAV) * 100;
        const formattedPct = `${pctChange.toFixed(2)}%`;
      
        popup
          .setLngLat(e.lngLat)
          .setHTML(`
            <strong>ID:</strong> ${id}<br>
            <strong>Address:</strong> ${address}<br>
            <strong>Current AV:</strong> ${formattedCurrent}<br>
            <strong>Change from Previous Year:</strong> ${formattedRaw}<br>
            <strong>% Change from Previous Year:</strong> ${formattedPct}
          `)
          .addTo(map);
      });
      
    map.on('mouseleave', 'property-tile-layer', () => {
    map.getCanvas().style.cursor = '';
    popup.remove();
    });

    function updatePropertyTileOpacity() {
      const viewCurrent = document.getElementById('viewCurrent');
      const view2024 = document.getElementById('view2024');
      const pctchange = document.getElementById('pctchange');
      const abschange = document.getElementById('abschange');
    
      // Hide all by default
      const layers = [
        'property-tile-layer',
        'previous-tile-layer',
        'absolute-change-layer',
        'pct-change-layer'
      ];
      layers.forEach(layer => {
        if (map.getLayer(layer)) {
          map.setPaintProperty(layer, 'fill-opacity', 0);
        }
      });
    
      if (viewCurrent && viewCurrent.checked) {
        map.setPaintProperty('property-tile-layer', 'fill-opacity', 0.9);
      } else if (view2024 && view2024.checked) {
        map.setPaintProperty('previous-tile-layer', 'fill-opacity', 0.8);
      } else if (abschange && abschange.checked) {
        map.setPaintProperty('absolute-change-layer', 'fill-opacity', 0.8);
      } else if (pctchange && pctchange.checked) {
        map.setPaintProperty('pct-change-layer', 'fill-opacity', 0.8);
      }
    }
    
    // Attach listeners to view toggle radios
    document.getElementById('viewCurrent')?.addEventListener('change', updatePropertyTileOpacity);
    document.getElementById('view2024')?.addEventListener('change', updatePropertyTileOpacity);
    document.getElementById('pctchange')?.addEventListener('change', updatePropertyTileOpacity);
    document.getElementById('abschange')?.addEventListener('change', updatePropertyTileOpacity);
    
    // Run once on load (based on default selection)
    updatePropertyTileOpacity();
}

export { loadAssessorsMode };