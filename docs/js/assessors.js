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
        Description
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
    
}

export { loadAssessorsMode };