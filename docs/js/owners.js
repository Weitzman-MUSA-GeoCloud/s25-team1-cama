// owners.js

// owners.js

function loadOwnersMode() {
    const contentPanel = document.getElementById('description-panel');
    contentPanel.innerHTML = `
        <h3 style="line-height: 1.05;"><span style="font-size: 1.2em;">Owner's Section</span></h3>
        <div class="image-container">
            <img src="./site-assets/map1.png" alt="map-logo" id="map-image" class="img-fluid">
        </div>
        <p>Welcome to the owners' mode!</p>
        <p>View your property's assessed value and how it has changed over time by searching in the box below.</p>

        <!-- Search Bar -->
        <nav class="navbar p-2 rounded">
            <div class="d-flex flex-column w-100" role="search">
                <input id="property-search-input" class="form-control mb-2" type="search" placeholder="E.G. 883080615" aria-label="Search">
                <ul id="search-suggestions" class="list-group" style="max-height: 200px; overflow-y: auto;"></ul>
            </div>
        </nav>

        <!-- Selected Property Info -->
        <div id="selected-property-info" class="mt-3"></div>

        <!-- Back Icon Section -->
        <div class="d-flex align-items-center mt-3" id="back-icon-section">
            <i class="bi bi-arrow-left-circle-fill" style="font-size: 1.5em; cursor: pointer; margin-right: 10px;"></i>
            <span style="font-size: 1.1em; cursor: pointer;" id="return-home">Return to home</span>
        </div>
    `;

    let selectedPropertyId = null;

    // Setup back button
    document.getElementById('back-icon-section').addEventListener('click', () => {
        location.reload();
    });

    // Show the view toggle controls
    document.getElementById('view-toggle').style.display = 'block';

    // Map popup
    const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    });

    map.on('mouseenter', 'property-tile-layer', (e) => {
        map.getCanvas().style.cursor = 'pointer';

        const { property_id, address, current_assessed_value, tax_year_assessed_value } = e.features[0].properties;
        const formattedCurrent = `$${Number(current_assessed_value).toLocaleString()}`;
        const rawChange = current_assessed_value - tax_year_assessed_value;
        const formattedRaw = `${rawChange >= 0 ? '+' : '-'}$${Math.abs(rawChange).toLocaleString()}`;
        const pctChange = ((current_assessed_value - tax_year_assessed_value) / tax_year_assessed_value) * 100;
        const formattedPct = `${pctChange.toFixed(2)}%`;

        popup
            .setLngLat(e.lngLat)
            .setHTML(`
                <strong>ID:</strong> ${property_id}<br>
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
        selectedPropertyId = null;

        const layers = [
            'property-tile-layer',
            'previous-tile-layer',
            'absolute-change-layer',
            'pct-change-layer'
        ];

        layers.forEach(layer => {
            if (map.getLayer(layer)) {
                map.setFilter(layer, null);
                map.setPaintProperty(layer, 'fill-opacity', 0);
            }
        });

        const viewCurrent = document.getElementById('viewCurrent');
        const view2024 = document.getElementById('view2024');
        const pctchange = document.getElementById('pctchange');
        const abschange = document.getElementById('abschange');

        if (viewCurrent?.checked) {
            map.setPaintProperty('property-tile-layer', 'fill-opacity', 0.9);
        } else if (view2024?.checked) {
            map.setPaintProperty('previous-tile-layer', 'fill-opacity', 0.8);
        } else if (abschange?.checked) {
            map.setPaintProperty('absolute-change-layer', 'fill-opacity', 0.8);
        } else if (pctchange?.checked) {
            map.setPaintProperty('pct-change-layer', 'fill-opacity', 0.8);
        }
    }

    document.getElementById('viewCurrent')?.addEventListener('change', updatePropertyTileOpacity);
    document.getElementById('view2024')?.addEventListener('change', updatePropertyTileOpacity);
    document.getElementById('pctchange')?.addEventListener('change', updatePropertyTileOpacity);
    document.getElementById('abschange')?.addEventListener('change', updatePropertyTileOpacity);

    updatePropertyTileOpacity();

    function getActiveLayer() {
        const viewCurrent = document.getElementById('viewCurrent');
        const view2024 = document.getElementById('view2024');
        const abschange = document.getElementById('abschange');
        const pctchange = document.getElementById('pctchange');

        if (viewCurrent?.checked) return 'property-tile-layer';
        if (view2024?.checked) return 'previous-tile-layer';
        if (abschange?.checked) return 'absolute-change-layer';
        if (pctchange?.checked) return 'pct-change-layer';
        return null;
    }

    map.on('click', (e) => {
        const activeLayer = getActiveLayer();
        if (!activeLayer) return;

        const features = map.queryRenderedFeatures(e.point, { layers: [activeLayer] });
        if (!features.length) return;

        const clickedFeature = features[0];
        const clickedId = clickedFeature.properties.property_id;

        console.log('🖱️ Clicked feature:', clickedFeature);

        if (selectedPropertyId === clickedId) {
            map.setFilter(activeLayer, null);
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

            if (searchText.length === 0) return;

            const features = map.queryRenderedFeatures({ layers: ['property-tile-layer'] });

            const matches = features.filter(f => {
                const propertyId = f.properties.property_id?.toString().toLowerCase() || '';
                const address = f.properties.address?.toLowerCase() || '';
                return propertyId.includes(searchText) || address.includes(searchText);
            }).slice(0, 10);

            matches.forEach(feature => {
                const li = document.createElement('li');
                li.className = 'list-group-item list-group-item-action';
                li.style.cursor = 'pointer';
                li.innerText = `${feature.properties.property_id} - ${feature.properties.address}`;

                li.addEventListener('click', () => {
                    const bbox = turf.bbox(feature);
                    map.fitBounds(bbox, { padding: 300, maxZoom: 25 });

                    infoPanel.innerHTML = `
                        <h5>Selected Property</h5>
                        <p><strong>ID:</strong> ${feature.properties.property_id}<br>
                        <strong>Address:</strong> ${feature.properties.address}<br>
                        <strong>Current Assessed Value:</strong> $${Number(feature.properties.current_assessed_value).toLocaleString()}<br>
                        <strong>Tax Year Assessed Value:</strong> $${Number(feature.properties.tax_year_assessed_value).toLocaleString()}</p>
                    `;

                    const activeLayer = getActiveLayer() || 'property-tile-layer';
                    const clickedId = feature.properties.property_id;

                    if (selectedPropertyId === clickedId) {
                        map.setFilter(activeLayer, null);
                        selectedPropertyId = null;
                    } else {
                        map.setFilter(activeLayer, ['==', ['get', 'property_id'], clickedId]);
                        selectedPropertyId = clickedId;
                    }

                    suggestionsList.innerHTML = '';
                    input.value = '';
                });

                suggestionsList.appendChild(li);
            });
        });
    }

    setupSearchBar();
}

export { loadOwnersMode };