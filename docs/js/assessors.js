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
    <div id="previous-year-chart" class="my-3"></div>
    <p>
        To see more information on individual parcels, navigate directly on the map, or search for a property below using its ID / address:
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
                map.fitBounds(bbox, { padding: 300, maxZoom: 25 });

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
    const current = Number(f.properties.current_assessed_value);
    const previous = Number(f.properties.tax_year_assessed_value);

    if (!isNaN(current) && !isNaN(previous) && previous !== 0) {
      const pctChange = ((current - previous) / previous) * 100;
      totalPctChange += pctChange;
      validFeatureCount += 1;

      if (current > previous) {
        increaseCount += 1;
      }
    }
  });

  const meanPctChange = validFeatureCount > 0
    ? (totalPctChange / validFeatureCount).toFixed(2)
    : '0.00';

  document.getElementById('summary-stats').innerHTML = `
    <p>
      There were <strong>${increaseCount.toLocaleString()}</strong> properties that increased in assessed value since the last mass appraisal.
      Overall, each property assessment changed by an increase of <strong>${meanPctChange}%</strong> on average.
    </p>
    <p>Current assessment values:</p>
    <div id="assessment-chart" class="mt-4"></div>
  `;
}

async function drawAssessmentChart() {
  const response = await fetch('https://storage.googleapis.com/musa5090s25-team1-public/configs/current_assessment_bins.json');
  const dataJson = await response.json();

  const data = dataJson.features.map(d => ({
      lower_bound: +d.properties.lower_bound,
      upper_bound: +d.properties.upper_bound,
      property_count: +d.properties.property_count
  }));

  // Set dimensions
  const margin = { top: 20, right: 30, bottom: 40, left: 70 },
        width = 400 - margin.left - margin.right,
        height = 200 - margin.top - margin.bottom;

  // Create SVG
  const svg = d3.select("#assessment-chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  // Create tooltip
  const tooltip = d3.select("#assessment-chart")
      .append("div")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "white")
      .style("border", "1px solid #ccc")
      .style("border-radius", "4px")
      .style("padding", "8px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("box-shadow", "0px 2px 6px rgba(0,0,0,0.1)");

  // X scale
  const x = d3.scaleLinear()
      .domain(d3.extent(data, d => d.lower_bound))
      .range([0, width]);

  svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

  // Y scale
  const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.property_count)])
      .range([height, 0]);

  svg.append("g")
      .call(d3.axisLeft(y).ticks(6));

  // Line generator
  const line = d3.line()
      .x(d => x(d.lower_bound))
      .y(d => y(d.property_count));

  // Draw line
  svg.append("path")
      .datum(data.sort((a, b) => a.lower_bound - b.lower_bound))
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("d", line);

  // Draw circles for each data point
  svg.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => x(d.lower_bound))
      .attr("cy", d => y(d.property_count))
      .attr("r", 4)
      .attr("fill", "steelblue")
      .on("mouseover", (event, d) => {
          tooltip
              .html(`
                  <strong>Lower Bound:</strong> ${d.lower_bound}<br>
                  <strong>Upper Bound:</strong> ${d.upper_bound}<br>
                  <strong>Property Count:</strong> ${d.property_count.toLocaleString()}
              `)
              .style("visibility", "visible");
      })
      .on("mousemove", (event) => {
          tooltip
              .style("top", (event.pageY - 10) + "px")
              .style("left", (event.pageX + 10) + "px");
      })
      .on("mouseout", () => {
          tooltip.style("visibility", "hidden");
      });

  // X axis label
  svg.append("text")
  .attr("x", width / 2)
  .attr("y", height + margin.bottom - 5)
  .attr("text-anchor", "middle")
  .style("font-size", "0.7rem")   // <-- NEW
  .text("Lower Bound (Log Current Value)");

  // Y axis label
  svg.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", -margin.left + 15)
  .attr("x", -height / 2)
  .attr("text-anchor", "middle")
  .style("font-size", "0.7rem")   // <-- NEW
  .text("Property Count");
}

async function drawAssessmentChartPrevious() {
  const response = await fetch('https://storage.googleapis.com/musa5090s25-team1-public/configs/tax_year_assessment_bins.json');
  const dataJson = await response.json();

  const allData = dataJson.features.map(d => ({
      tax_year: +d.properties.tax_year,
      lower_bound: +d.properties.lower_bound,
      upper_bound: +d.properties.upper_bound,
      property_count: +d.properties.property_count
  }));

  // Get unique tax_years
  const taxYears = [...new Set(allData
    .map(d => d.tax_year)
    .filter(year => year !== 2013 && year !== 2014))]
    .sort((a, b) => b - a);

  // Create dropdown menu
  const chartDiv = d3.select("#previous-year-chart");
  chartDiv.html(""); // Clear previous content

  chartDiv.append("label")
    .text("Select Tax Year: ")
    .style("font-size", "0.9rem")
    .attr("for", "tax-year-select");

  const dropdown = chartDiv.append("select")
    .attr("id", "tax-year-select")
    .style("margin-left", "8px")
    .style("margin-bottom", "10px");

  dropdown.selectAll("option")
    .data(taxYears)
    .enter()
    .append("option")
    .attr("value", d => d)
    .text(d => d);

  // SVG container
  const svgContainer = chartDiv.append("div").attr("id", "tax-year-chart-svg");

  function renderChart(selectedYear) {
    svgContainer.html(""); // Clear previous SVG

    const yearData = allData.filter(d => d.tax_year === selectedYear);

    const margin = { top: 20, right: 30, bottom: 40, left: 70 },
          width = 400 - margin.left - margin.right,
          height = 200 - margin.top - margin.bottom;

    const svg = svgContainer.append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const tooltip = svgContainer.append("div")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "white")
      .style("border", "1px solid #ccc")
      .style("border-radius", "4px")
      .style("padding", "8px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("box-shadow", "0px 2px 6px rgba(0,0,0,0.1)");

    const x = d3.scaleLinear()
      .domain(d3.extent(yearData, d => d.lower_bound))
      .range([0, width]);

    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    const y = d3.scaleLinear()
      .domain([0, d3.max(yearData, d => d.property_count)])
      .range([height, 0]);

    svg.append("g")
      .call(d3.axisLeft(y).ticks(6));

    const line = d3.line()
      .x(d => x(d.lower_bound))
      .y(d => y(d.property_count));

    svg.append("path")
      .datum(yearData.sort((a, b) => a.lower_bound - b.lower_bound))
      .attr("fill", "none")
      .attr("stroke", "#25cef7")
      .attr("stroke-width", 2)
      .attr("d", line);

    svg.selectAll("circle")
      .data(yearData)
      .enter()
      .append("circle")
      .attr("cx", d => x(d.lower_bound))
      .attr("cy", d => y(d.property_count))
      .attr("r", 4)
      .attr("fill", "#25cef7")
      .on("mouseover", (event, d) => {
          tooltip
              .html(`
                  <strong>Lower Bound:</strong> ${d.lower_bound}<br>
                  <strong>Upper Bound:</strong> ${d.upper_bound}<br>
                  <strong>Property Count:</strong> ${d.property_count.toLocaleString()}
              `)
              .style("visibility", "visible");
      })
      .on("mousemove", (event) => {
          tooltip
              .style("top", (event.pageY - 10) + "px")
              .style("left", (event.pageX + 10) + "px");
      })
      .on("mouseout", () => {
          tooltip.style("visibility", "hidden");
      });

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 5)
      .attr("text-anchor", "middle")
      .style("font-size", "0.7rem")
      .text("Lower Bound (Log Current Value)");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 15)
      .attr("x", -height / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "0.7rem")
      .text("Property Count");
  }

  // Initial render
  renderChart(taxYears[0]);

  // On dropdown change
  dropdown.on("change", function() {
    const selectedYear = +this.value;
    renderChart(selectedYear);
  });
}

map.once('idle', () => {
  updateSummaryStats();
  drawAssessmentChart();
  drawAssessmentChartPrevious();
});
    
}

export { loadAssessorsMode };