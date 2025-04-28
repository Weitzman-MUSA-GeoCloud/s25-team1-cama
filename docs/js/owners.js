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

                li.addEventListener('click', async () => {
                    const bbox = turf.bbox(feature);
                    map.fitBounds(bbox, { padding: 300, maxZoom: 25 });
                
                    const propertyId = feature.properties.property_id;
                
                    // Clear previous info panel
                    infoPanel.innerHTML = `
                        <h5>Selected Property</h5>
                        <p><strong>ID:</strong> ${propertyId}<br>
                        <strong>Address:</strong> ${feature.properties.address}<br>
                        <strong>Current Assessed Value:</strong> $${Number(feature.properties.current_assessed_value).toLocaleString()}<br>
                        <strong>Tax Year Assessed Value:</strong> $${Number(feature.properties.tax_year_assessed_value).toLocaleString()}</p>
                        <div id="property-history-chart" class="my-3"></div>
                        <div id="property-history-table" class="my-3"></div>
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
                
                    // Fetch assessment history from BigQuery API
                    try {
                        const response = await fetch(`https://bq-api-49320340036.us-east4.run.app/query-assessments?property_id=${propertyId}`);
                        const data = await response.json();
                
                        if (data.length > 0) {
                            drawPropertyHistoryChart(data);
                            drawPropertyHistoryTable(data);
                        } else {
                            document.getElementById('property-history-chart').innerHTML = `<p>No history found.</p>`;
                            document.getElementById('property-history-table').innerHTML = '';
                        }
                    } catch (error) {
                        console.error('Error fetching property history:', error);
                        document.getElementById('property-history-chart').innerHTML = `<p>Error loading history.</p>`;
                        document.getElementById('property-history-table').innerHTML = '';
                    }
                });

                suggestionsList.appendChild(li);
            });
        });
    }

    setupSearchBar();

    function drawPropertyHistoryChart(data) {
        // Sort data by year ascending
        const sortedData = data.sort((a, b) => +a.year - +b.year);
    
        // Prepare dimensions
        const margin = { top: 20, right: 30, bottom: 40, left: 60 },
              width = 400 - margin.left - margin.right,
              height = 250 - margin.top - margin.bottom;
    
        // Clear previous chart
        const container = d3.select("#property-history-chart");
        container.html('');

        container.append("div")
    .attr("id", "property-history-chart-tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background", "white")
    .style("border", "1px solid #ccc")
    .style("padding", "8px")
    .style("border-radius", "4px")
    .style("font-size", "12px")
    .style("pointer-events", "none")
    .style("box-shadow", "0px 2px 6px rgba(0,0,0,0.15)");
    
        const svg = container.append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);
    
        const x = d3.scaleLinear()
            .domain(d3.extent(sortedData, d => +d.year))
            .range([0, width]);
    
            const marketValues = sortedData.map(d => +d.market_value);
            const minValue = d3.min(marketValues);
            const maxValue = d3.max(marketValues);
            
            // Add +/- 10% buffer
            const buffer = (maxValue - minValue) * 0.1;
            
            const y = d3.scaleLinear()
                .domain([minValue - buffer, maxValue + buffer])
                .range([height, 0]);
    
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).ticks(sortedData.length).tickFormat(d3.format("d")));
    
        svg.append("g")
            .call(d3.axisLeft(y).ticks(6));
    
        const line = d3.line()
            .x(d => x(+d.year))
            .y(d => y(+d.market_value));
    
        svg.append("path")
            .datum(sortedData)
            .attr("fill", "none")
            .attr("stroke", "#0f4d90")
            .attr("stroke-width", 2)
            .attr("d", line);
    
        // Draw circles for each data point
        svg.selectAll("circle")
        .data(sortedData)
        .enter()
        .append("circle")
        .attr("cx", d => x(+d.year))
        .attr("cy", d => y(+d.market_value))
        .attr("r", 4)
        .attr("fill", "#0f4d90")
        .on("mouseover", (event, d) => {
            d3.select("#property-history-chart-tooltip")
                .style("visibility", "visible")
                .html(`
                    <strong>Year:</strong> ${d.year}<br>
                    <strong>Market Value:</strong> $${Number(d.market_value).toLocaleString()}
                `);
        })
        .on("mousemove", (event) => {
            d3.select("#property-history-chart-tooltip")
                .style("top", (event.pageY - 30) + "px")
                .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", () => {
            d3.select("#property-history-chart-tooltip")
                .style("visibility", "hidden");
        });
    }

    function drawPropertyHistoryTable(data) {
        const sortedData = data.sort((a, b) => +b.year - +a.year); // descending year
    
        const tableDiv = document.getElementById('property-history-table');
        let tableHtml = `
            <table class="table table-striped table-bordered">
                <thead>
                    <tr>
                        <th>Year</th>
                        <th>Market Value</th>
                    </tr>
                </thead>
                <tbody>
        `;
    
        sortedData.forEach(row => {
            tableHtml += `
                <tr>
                    <td>${row.year}</td>
                    <td>$${Number(row.market_value).toLocaleString()}</td>
                </tr>
            `;
        });
    
        tableHtml += `
                </tbody>
            </table>
        `;
    
        tableDiv.innerHTML = tableHtml;
    }
}

export { loadOwnersMode };