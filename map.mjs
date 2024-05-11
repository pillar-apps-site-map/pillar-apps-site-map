'use strict'

import 'https://tomashubelbauer.github.io/github-pages-local-storage/index.js';

console.log('Loaded map.js')

// MapBox account access token 
mapboxgl.accessToken = 'pk.eyJ1Ijoib2xpdmlhdDEwIiwiYSI6ImNsdXZ3aDYzcjA2bW0yaWwzZ3g2cXA2bWYifQ.YFXEBTfX3eiQrk5pm5qBVQ';

// Basemap
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/standard',
    center: [-70, 20],
    zoom: 2.3
});

// Get reference to the select element
const mapTypeSelect = document.getElementById('map-type-select');

// Event listener for dropdown change
mapTypeSelect.addEventListener('change', function () {
    // Get the selected value from the map style dropdown
    const selectedMapType = mapTypeSelect.value;

    // Update the map style based on the selected value
    map.setStyle('mapbox://styles/mapbox/' + selectedMapType);
});

// Get reference to the select element
const projectionSelect = document.getElementById('projection-select');

// Event listener for projection dropdown change
projectionSelect.addEventListener('change', function () {
    // Get selected value from projection dropdown
    const selectedProjection = projectionSelect.value;

    // Update projection property based on selection
    map.setProjection(selectedProjection);
    if (selectedProjection == 'naturalEarth') {
        map.setCenter([-25, 25]);
    } else {
        map.setCenter([-70, 20]);
    }
});

/********** FULL SITE LISTING LAYER **********/

// Data for 'All Sites' category (red dots)
var master_site_listing_url = "./data/master_site_listing.geojson"

// Load in master site list data
map.on('style.load', function () {
    map.addSource('master_sites_data', {
        'type': 'geojson',
        'data': master_site_listing_url
    });
    map.addLayer({ // apply sites layer
        'id': 'All-Sites',
        'type': 'circle',
        'source': 'master_sites_data',
        'paint': {
            'circle-radius': 2.75,
            'circle-color': '#FF0000',
            'circle-opacity': 1
        },
    })
});

/********** PILLAR APP DEPLOYMENTS (MARKER SETS) **********/

// To store marker objects by Pillar App (for keeping seperate layers)
var markersByPillarApp = {};

// To store markers grouped by coordinates (to clarify overlapping markers)
var markersByCoordinate = {};

// Create a marker and add it to the map
function createMarker(color, lngLat, popupHTML, pillarApp) {

    // Generate unique key for the coordinates
    var coordinateKey = lngLat.join(',');

    // Check if markers already exist at this coordinate
    if (!markersByCoordinate[coordinateKey]) {
        // If no markers, new array to store markers
        markersByCoordinate[coordinateKey] = [];
    }

    // # existing markers
    var existingMarkers = markersByCoordinate[coordinateKey].length;

    // Adjust lngLat slightly for subsequent markers 
    // (so that when zoomed closely, viewer can see multiple points at the same site)
    if (existingMarkers > 0) {
        var offset1 = (Math.random() * 0.0001) * existingMarkers;
        var offset2 = (Math.random() * 0.0001) * existingMarkers;
        lngLat[0] += offset1; // offset longitude slightly
        lngLat[1] += offset2; // offset latitude slightly
    }

    // Store new marker at this coordinate
    markersByCoordinate[coordinateKey].push({
        marker: marker,
        pillarApp: pillarApp
    });

    // Create new marker & fill popup data
    var marker = new mapboxgl.Marker({
        color: color,
        scale: 0.6,
        draggable: false
    }).setLngLat(lngLat)
        .setPopup(new mapboxgl.Popup().setHTML(popupHTML + getMarkerPopupHTML(coordinateKey)))
        .addTo(map);

    // Click event listener for marker
    marker.getElement().addEventListener('click', function () {
        // Fly to a clicked marker's location
        map.flyTo({
            center: lngLat,
            zoom: 10,
            essential: true
        });
    });

    // hover over marker to view popup
    marker.getElement().addEventListener('mouseenter', function () {
        marker.getPopup().addTo(map);
    });

    // popup disappears when mouse leaves marker
    marker.getElement().addEventListener('mouseleave', function () {
        marker.getPopup().remove();
    });

    // Create new layer for markers if one does not exist already
    if (!markersByPillarApp[pillarApp]) {
        markersByPillarApp[pillarApp] = [];
    }
    // Store new marker by Pillar App 
    markersByPillarApp[pillarApp].push(marker);

}

// Display all Pillar Apps at single site in the marker popup
function getMarkerPopupHTML(coordinateKey) {
    // Array of markers that share same coordinates
    var markers = markersByCoordinate[coordinateKey];

    // Extract unique Pillar Apps (dupe checking)
    var uniquePillarApps = Array.from(new Set(markers.map(item => item.pillarApp)));

    // Generate string to note any overlapping markers
    var popupHTML = '';
    uniquePillarApps.forEach(function (pillarApp) {
        var color = getColorForPillarApp(pillarApp);

        popupHTML += `<svg width="10" height="10"><circle cx="5" cy="5" r="5" fill="${color}"/></svg>
                 ${pillarApp}&nbsp&nbsp&nbsp`;

    });
    return popupHTML;
}

// Fetch Pillar App data and add markers
function fetchAndAddMarkers(url) {
    return fetch(url)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            data.features.forEach(function (feature) {
                // Prep data to create new marker
                var pillarApp = feature.properties['Pillar App'];
                var lngLat = [feature.geometry.coordinates[0], feature.geometry.coordinates[1]];

                // Marker popup info
                var popupHTML = `
                    <div class="popup-content">
                        <h3>${feature.properties['SITE']}</h3>
                        <table class="popup-table">
                            <tr>
                                <th>Property</th>
                                <th>Value</th>
                            </tr>
                            <tr>
                            </tr>
                            <tr>
                                <td>IT Site Code</td>
                                <td>${feature.properties['IT Site Code']}</td>
                            </tr>
                            <tr>
                                <td>B/U</td>
                                <td>${feature.properties['B/U']}</td>
                            </tr>
                            <tr>
                                <td>Ops Leader</td>
                                <td>${feature.properties['Ops Leader']}</td>
                            </tr>
                            <tr>
                                <td>ERP</td>
                                <td>${feature.properties['ERP']}</td>
                            </tr>
                            <tr>
                                <td>Address</td>
                                <td>${feature.properties['STREET ADDRESS']}</td>
                            </tr>
                            <tr>
                                <td>Products</td>
                                <td></td>
                            </tr>
                        </table>
                    </div>`;

                // Assign marker color based on Pillar App
                var color;
                switch (pillarApp) {
                    case 'OpsVision MES':
                    case 'OpsVision Smart Manufacturing':
                        color = '#00008B';
                        pillarApp = 'OpsVision';
                        break;
                    case 'Reliance':
                        color = '#FFA500';
                        break;
                    case 'Maximo':
                        color = '#FFFF00';
                        break;
                    case 'SCC (Phase 1)':
                    case 'SCC (Phase 2)':
                        color = '#800080';
                        pillarApp = 'SCC';
                        break;
                    default:
                        color = '#000000';
                }
                createMarker(color, lngLat, popupHTML, pillarApp);
            });
        });
}

// Add markers for Pillar App data
fetchAndAddMarkers('./data/app_deployment.geojson');

// Fetch color
function getColorForPillarApp(pillarApp) {
    switch (pillarApp) {
        case 'OpsVision':
        case 'OpsVision MES':
        case 'OpsVision Smart Manufacturing':
            return '#00008B';
        case 'Reliance':
            return '#FFA500';
        case 'Maximo':
            return '#FFFF00';
        case 'SCC':
        case 'SCC (Phase 1)':
        case 'SCC (Phase 2':
            return '#800080';
        default:
            return '#000000';
    }
}

/***** FILTERING BY LAYER *******/

// Event listener for Pillar App checkbox changes
document
    .querySelectorAll('.map-overlay-inner input[type="checkbox"]')
    .forEach((checkbox) => {
        checkbox.addEventListener('change', function () {
            const pillarApp = checkbox.id;
            const visibility = checkbox.checked ? 'visible' : 'none';

            // Check if markers for this pillar app exist 
            if (markersByPillarApp[pillarApp]) {
                markersByPillarApp[pillarApp].forEach(function (marker) {
                    marker.getElement().style.display = visibility === 'visible' ? 'block' : 'none';
                });
            }
        });
    });

// Toggle 'All Sites' visibility (red checkbox)
const allSitesCheckbox = document.getElementById('All-Sites');

allSitesCheckbox.addEventListener('change', function (event) {
    const layerId = 'All-Sites';
    const visibility = event.target.checked ? 'visible' : 'none';
    map.setLayoutProperty(layerId, 'visibility', visibility);
});

/***** SHOW/HIDE POPUP *******/

// Show the popup when Upload Data button is clicked
function showPopup(popupId) {
    // Hide all popups
    document.querySelectorAll('.popup-container').forEach(function (popup) {
        popup.classList.remove('show');
    });
    // Show the clicked popup
    document.getElementById(popupId).classList.add('show');
}

// Hide the popup when close button (X) is clicked
function hidePopup(popupId) {
    document.getElementById(popupId).classList.remove('show');
}

/*****AUTHENTICATION*******/

// password validation
function authenticate() {
    const password = document.getElementById('password').value;
    const correctPassword = 'IsabellaSt';

    if (password === correctPassword) {
        document.getElementById('authentication-form').style.display = 'none';
        document.getElementById('upload-data').style.display = 'block';
        document.getElementById('password').value = '';
        document.getElementById('error-message').style.display = 'none';
    } else {
        document.getElementById('error-message').style.display = 'block';
        document.getElementById('upload-data').style.display = 'none';
    }
}

// handle Enter key press
function handleEnterKey(event) {
    if (event.key === 'Enter') {
        authenticate();
    }
}
// event listener for password input field
document.getElementById('password').addEventListener('keypress', handleEnterKey);

// toggle password visibility
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const showPasswordCheckbox = document.getElementById('show-password');

    if (showPasswordCheckbox.checked) {
        passwordInput.type = 'text';
    } else {
        passwordInput.type = 'password';
    }
}
// event listener for show password checkbox
document.getElementById('show-password').addEventListener('change', togglePasswordVisibility);

// Event listener for "Upload Data" button click
document.getElementById('upload-data-button').addEventListener('click', function () {
    showPopup('upload-popup');
});

// Event listener for close button (X) click
document.querySelector('.close-btn').addEventListener('click', function () {
    hidePopup('upload-popup');
});

// Event listener for "Submit" button click in the authentication form
document.getElementById('submit-authentication').addEventListener('click', function () {
    authenticate();
});

// Event listener for show password checkbox
document.getElementById('show-password').addEventListener('change', togglePasswordVisibility);

/***** CSV TO GEOJSON CONVERSION *******/

// Convert uploaded CSV file to GeoJSON
function convertCSVtoGeoJSON(fileInputId, callback) {
    const fileInput = document.getElementById(fileInputId);
    const file = fileInput.files[0];

    const reader = new FileReader();
    reader.onload = function (event) {
        const csvString = event.target.result;

        // Parse CSV using PapaParse
        Papa.parse(csvString, {
            header: true,
            complete: function (results) {
                // Map CSV data to GeoJSON format
                const geojson = {
                    type: "FeatureCollection",
                    features: results.data.map(function (row) {
                        return {
                            type: "Feature",
                            geometry: {
                                type: "Point",
                                coordinates: [parseFloat(row.LONGITUDE), parseFloat(row.LATITUDE)]
                            },
                            properties: row
                        };
                    })
                };
                callback(null, geojson);
            },
            error: function (error) {
                console.error('Error parsing CSV:', error);
                callback(error);
            }
        });
    };
    reader.readAsText(file);
}

/*****LOCAL STORAGE*****/

// Call the function to load GeoJSON from localStorage when the page loads
window.addEventListener('load', loadGeoJSONFromLocalStorage);

// Event listener for map style change
map.on('load', function () {
    // Reload the uploaded data layers when the map style changes
    loadGeoJSONFromLocalStorage();
});

// Load GeoJSON from localStorage with prefixed keys when the page loads
function loadGeoJSONFromLocalStorage() {
    // Retrieve GeoJSON data with prefixed keys
    const masterSitesGeoJSON = getGeoJSONFromLocalStorage('/master_sites_upload');
    const appDeploymentGeoJSON = getGeoJSONFromLocalStorage('/app_deployment_upload');

    if (masterSitesGeoJSON) {
        map.on('style.load', function() {
            // Update the map with the retrieved GeoJSON data
            addOrUpdateSourceAndLayer('master_sites_data', masterSitesGeoJSON, true, 'visible');
        });
    }

    if (appDeploymentGeoJSON) {
        map.on('style.load', function() {
            // Update the map with the retrieved GeoJSON data
            addOrUpdateSourceAndLayer('app_deployment', appDeploymentGeoJSON, false, 'visible');
        });
    }
}

// Update the function to retrieve GeoJSON data from localStorage with prefixed keys
function getGeoJSONFromLocalStorage(key) {
    // Use prefixed key provided by github-pages-local-storage library
    const storedData = localStorage.getItem(key);
    return storedData ? JSON.parse(storedData) : null;
}

// Update the function to store GeoJSON in localStorage with prefixed keys
function storeGeoJSONInLocalStorage(key, geojson) {
    // Use prefixed key provided by github-pages-local-storage library
    localStorage.setItem(key, JSON.stringify(geojson));
}

// Update the event listeners for upload buttons to store data in localStorage with prefixed keys & update map
document.getElementById('apply-master-sites-upload').addEventListener('click', function () {
    convertCSVtoGeoJSON('master-sites-upload', function (err, geojson) {
        if (!err) {
            console.log('Successfully converted CSV to GeoJSON:', geojson);
            // Store GeoJSON in localStorage with prefixed key
            storeGeoJSONInLocalStorage('/master_sites_upload', geojson);
            // Update the map with the new data
            addOrUpdateSourceAndLayer('master_sites_data', geojson, true, 'visible');
        }
    });
});

document.getElementById('apply-app-deployment-upload').addEventListener('click', function () {
    convertCSVtoGeoJSON('app-deployment-upload', function (err, geojson) {
        if (!err) {
            console.log('Successfully converted CSV to GeoJSON:', geojson);
            // Store GeoJSON in localStorage with prefixed key
            storeGeoJSONInLocalStorage('/app_deployment_upload', geojson);
            // Update the map with the new data
            addOrUpdateSourceAndLayer('app_deployment', geojson, false, 'visible');
        }
    });
});


/**** UPDATE DATA (NEW DATASET UPLOADED) ******/

// add or update map source and layer
function addOrUpdateSourceAndLayer(sourceId, geojson, isLayer, visibility) {
    console.log('sourceID: ' + sourceId + ', visibility: ' + visibility);
    // check if source already exists
    if (isLayer) {
        // if source exists update the data
        map.getSource(sourceId).setData(geojson);

    } else {
        // add as a marker
        geojson.features.forEach(function (feature) {
            console.log(feature);
            var pillarApp = feature.properties['Pillar App'];
            if(pillarApp==='OpsVision MES' || pillarApp==='OpsVision Smart Manufacturing') {
                pillarApp = 'OpsVision';
            }
            if(pillarApp==='SCC (Phase 1)' || pillarApp==='SCC (Phase 2)'){
                pillarApp = 'SCC';
            }
            var lngLat = [feature.geometry.coordinates[0], feature.geometry.coordinates[1]];
            var popupHTML = `
                    <div class="popup-content">
                        <h3>${feature.properties['SITE']}</h3>
                        <table class="popup-table">
                            <tr>
                                <th>Property</th>
                                <th>Value</th>
                            </tr>
                            <tr>
                            </tr>
                            <tr>
                                <td>IT Site Code</td>
                                <td>${feature.properties['IT Site Code']}</td>
                            </tr>
                            <tr>
                                <td>B/U</td>
                                <td>${feature.properties['B/U']}</td>
                            </tr>
                            <tr>
                                <td>Ops Leader</td>
                                <td>${feature.properties['Ops Leader']}</td>
                            </tr>
                            <tr>
                                <td>ERP</td>
                                <td>${feature.properties['ERP']}</td>
                            </tr>
                            <tr>
                                <td>Address</td>
                                <td>${feature.properties['STREET ADDRESS']}</td>
                            </tr>
                            <tr>
                                <td>Products</td>
                                <td></td>
                            </tr>
                        </table>
                    </div>`;

            var color = getColorForPillarApp(pillarApp);
            // !!FIX!!  createMarker(color, lngLat, popupHTML, pillarApp);
        });
    }
}

/*********SEARCH & NAVIGATION CONTROLS ***********/

// Asynchronously load the search and navigation controls
async function loadControls() {
    try {
        // Load search control asynchronously
        const searchBox = new MapboxSearchBox();
        searchBox.accessToken = mapboxgl.accessToken;
        searchBox.options = {
            types: 'address,poi',
            proximity: [-73.99209, 40.68933]
        };

        // Load navigation control asynchronously
        const navigationControl = new mapboxgl.NavigationControl();

        // Add search and navigation controls to the map
        await Promise.all([
            map.addControl(searchBox),
            map.addControl(navigationControl)
        ]);

        console.log('Search and navigation controls loaded successfully');
    } catch (error) {
        console.error('Error loading search and navigation controls:', error);
    }
}

// Call the loadControls function to asynchronously load the search & nav controls
loadControls();
