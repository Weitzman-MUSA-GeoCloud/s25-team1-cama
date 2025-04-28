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
    <div id="summary-stats" class="my-3"></div>
    <p>
        Navigate directly on the map, or search for a property below using its ID / address:
    </p>

    <!-- Search Bar -->
    <nav class="navbar p-2 rounded">
        <div class="d-flex flex-column w-100" role="search">
            <input id="property-search-input" class="form-control mb-2" type="search" placeholder="E.G. 883080615" aria-label="Search">
            <ul id="search-suggestions" class="list-group" style="max-height: 200px; overflow-y: auto;"></ul>
        </div>
    </nav>

    <!-- Selected property info -->
    <div id="selected-property-info" class="mt-3"></div>

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

    let selectedPropertyId = null;  // Track currently selected feature
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
      selectedPropertyId = null;  // Reset any selection when changing view!
    
      const layers = [
        'property-tile-layer',
        'previous-tile-layer',
        'absolute-change-layer',
        'pct-change-layer'
      ];
      layers.forEach(layer => {
        if (map.getLayer(layer)) {
          map.setFilter(layer, null);  // Clear filters
          map.setPaintProperty(layer, 'fill-opacity', 0);
        }
      });
    
      const viewCurrent = document.getElementById('viewCurrent');
      const view2024 = document.getElementById('view2024');
      const pctchange = document.getElementById('pctchange');
      const abschange = document.getElementById('abschange');
    
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

    function getActiveLayer() {
      const viewCurrent = document.getElementById('viewCurrent');
      const view2024 = document.getElementById('view2024');
      const abschange = document.getElementById('abschange');
      const pctchange = document.getElementById('pctchange');
    
      if (viewCurrent && viewCurrent.checked) {
        return 'property-tile-layer';
      } else if (view2024 && view2024.checked) {
        return 'previous-tile-layer';
      } else if (abschange && abschange.checked) {
        return 'absolute-change-layer';
      } else if (pctchange && pctchange.checked) {
        return 'pct-change-layer';
      } else {
        return null;
      }
    }

    map.on('click', (e) => {
      const activeLayer = getActiveLayer();
      if (!activeLayer) return;  // Safety check
  
      // Check if the clicked feature belongs to the active layer
      const features = map.queryRenderedFeatures(e.point, { layers: [activeLayer] });
      if (!features.length) return;
  
      const clickedFeature = features[0];
      const clickedId = clickedFeature.properties.property_id;
  
      // 🆕 Console log the clicked feature!
      console.log('🖱️ Clicked feature:', clickedFeature);

      // address: "3000 WALNUT ST"
      // current_assessed_value: 10040700
      // property_id: "885715940"
      // tax_year_assessed_value: 10039700
  
      if (selectedPropertyId === clickedId) {
          map.setFilter(activeLayer, null);  // Remove any filters — show all again
          selectedPropertyId = null;
      } else {
          map.setFilter(activeLayer, ['==', ['get', 'property_id'], clickedId]);
          selectedPropertyId = clickedId;
      }
  });

  function setupSearchBar() {
    const input = document.getElementById('property-search-input');
    const suggestionsList = document.getElementById('search-suggestions');
    const infoPanel = document.getElementById('selected-property-info');

    input.addEventListener('input', (e) => {
        const searchText = e.target.value.trim().toLowerCase();
        suggestionsList.innerHTML = '';

        if (searchText.length === 0) {
            return;
        }

        const features = map.queryRenderedFeatures({ layers: ['property-tile-layer'] });

        const matches = features.filter(f => {
            const propertyId = f.properties.property_id?.toString().toLowerCase() || '';
            const address = f.properties.address?.toLowerCase() || '';
            return propertyId.includes(searchText) || address.includes(searchText);
        }).slice(0, 10); // limit to 5 matches

        matches.forEach(feature => {
            const li = document.createElement('li');
            li.className = 'list-group-item list-group-item-action';
            li.style.cursor = 'pointer';
            li.innerText = `${feature.properties.property_id} - ${feature.properties.address}`;
            li.addEventListener('click', () => {
                // Zoom to the feature
                const bbox = turf.bbox(feature);
                map.fitBounds(bbox, { padding: 300 });

                // Update selected property panel
                infoPanel.innerHTML = `
                    <h5>Selected Property</h5>
                    <p><strong>ID:</strong> ${feature.properties.property_id}<br>
                    <strong>Address:</strong> ${feature.properties.address}<br>
                    <strong>Current Assessed Value:</strong> $${Number(feature.properties.current_assessed_value).toLocaleString()}<br>
                    <strong>Tax Year Assessed Value:</strong> $${Number(feature.properties.tax_year_assessed_value).toLocaleString()}</p>
                `;

                // Simulate a map click (selection)
                const activeLayer = getActiveLayer() || 'property-tile-layer';
                const clickedId = feature.properties.property_id;

                if (selectedPropertyId === clickedId) {
                    map.setFilter(activeLayer, null);
                    selectedPropertyId = null;
                } else {
                    map.setFilter(activeLayer, ['==', ['get', 'property_id'], clickedId]);
                    selectedPropertyId = clickedId;
                }

                suggestionsList.innerHTML = ''; // Clear suggestions
                input.value = ''; // Clear input
            });
            suggestionsList.appendChild(li);
        });
    });
}

setupSearchBar();

function updateSummaryStats() {
  const features = map.queryRenderedFeatures({ layers: ['property-tile-layer'] });

  if (!features.length) {
      document.getElementById('summary-stats').innerHTML = '<p>Loading summary...</p>';
      return;
  }

  let increaseCount = 0;
  let totalPctChange = 0;
  let validFeatureCount = 0;

  features.forEach(f => {
      const current = f.properties.current_assessed_value;
      const previous = f.properties.tax_year_assessed_value;

      if (current != null && previous != null && previous !== 0) {
          const pctChange = ((current - previous) / previous) * 100;
          totalPctChange += pctChange;
          validFeatureCount += 1;

          if (current > previous) {
              increaseCount += 1;
          }
      }
  });

  const meanPctChange = (totalPctChange / validFeatureCount).toFixed(2);

  document.getElementById('summary-stats').innerHTML = `
      <p>
          There were <strong>${increaseCount}</strong> properties that increased in assessed value since the last mass appraisal.
          Overall, each property assessment changed by an increase of <strong>${meanPctChange}%</strong> on average.
      </p>
  `;
}


    
}

export { loadAssessorsMode };