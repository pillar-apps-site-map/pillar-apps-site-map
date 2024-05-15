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
    });
});

/********** PILLAR APP DEPLOYMENTS (MARKER SETS) **********/

// To store marker objects by Pillar App (for keeping seperate layers)
var markersByPillarApp = {};

// To store markers grouped by coordinates (to clarify overlapping markers)
var markersByCoordinate = {};

// marker/pillar app counts
var pillarAppCounts = {};

// Function to update legend with pillar app counts
function updateLegendAppCounts() {
    // Iterate through each pillar app checkbox in the legend
    document.querySelectorAll('.map-overlay-inner input[type="checkbox"]').forEach((checkbox) => {
        if (checkbox.id==='All-Sites') return;
        const pillarApp = checkbox.id.replaceAll('-', ' ');
        var count = pillarAppCounts[pillarApp];
        
        // Get the legend element
        const appCountsLegend = document.getElementById(checkbox.id + '-Count');
        // Update the text content to display the count
        appCountsLegend.innerText = `${count}`;

    });
}

// Create a marker and add it to the map
function createMarker(color, lngLat, popupHTML, pillarApp) {

    updateLegendAppCounts();

    // Increment count for this pillar app
    pillarAppCounts[pillarApp] = (pillarAppCounts[pillarApp] || 0) + 1;

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

// Function to generate popup HTML content
function generatePopupHTML(feature) {
    return `
        <div class="popup-content">
            <h3>${feature.properties['SITE']}</h3>
            <table class="popup-table">
                <tr>
                    <th>Property</th>
                    <th>Value</th>
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
                var popupHTML = generatePopupHTML(feature);

                // Assign marker color based on Pillar App
                var color = getColorForPillarApp(pillarApp);
                if(color != '#000000'){
                    createMarker(color, lngLat, popupHTML, pillarApp);
                }
            });
        });
}

// Add markers for Pillar App data
fetchAndAddMarkers('./data/app_deployment.geojson');

// Fetch color
function getColorForPillarApp(pillarApp) {
    switch (pillarApp) {
        case 'OpsVision MES':
            return '#00008B';
        case 'OpsVision Smart Mfg':
            return '#5d5dff';
        case 'Reliance':
            return '#FFA500';
        case 'Maximo':
            return '#FFFF00';
        case 'SCC Phase 1':
            return '#7d007d';
        case 'SCC Phase 2':
            return '#b100b1';
        /*case 'AWS':
            return '#00000F';*/
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
            const pillarApp = checkbox.id.replaceAll('-', ' ');
            console.log(pillarApp);
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

// Get references to the file input and apply button
const masterSitesFileInput = document.getElementById('master-sites-upload');
const masterSitesApplyButton = document.getElementById('apply-master-sites-upload');

// Event listener for file input change
masterSitesFileInput.addEventListener('change', function () {
    // Check if any file is selected
    if (masterSitesFileInput.files.length > 0) {
        // Enable the apply button
        masterSitesApplyButton.disabled = false;
    } else {
        // Disable the apply button if no file is selected
        masterSitesApplyButton.disabled = true;
    }
});

// Get references to the file input and apply button
const appsFileInput = document.getElementById('app-deployment-upload');
const appsApplyButton = document.getElementById('apply-app-deployment-upload');

// Event listener for file input change
appsFileInput.addEventListener('change', function () {
    // Check if any file is selected
    if (appsFileInput.files.length > 0) {
        // Enable the apply button
        appsApplyButton.disabled = false;
    } else {
        // Disable the apply button if no file is selected
        appsApplyButton.disabled = true;
    }
});

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
                // Initialize an array to store GeoJSON features
                const features = [];

                // Iterate over each row in the CSV data
                for (let i = 0; i < results.data.length; i++) {
                    const row = results.data[i];

                    // Check if the row meets criteria
                    if (row['LATITUDE'] && row['LONGITUDE'] && row['IT Site Code']) {
                        // Create a GeoJSON feature and add it to the features array
                        const feature = {
                            type: "Feature",
                            geometry: {
                                type: "Point",
                                coordinates: [parseFloat(row['LONGITUDE']), parseFloat(row['LATITUDE'])]
                            },
                            properties: row
                        };
                        features.push(feature);
                    } else {
                        // if row does not meet criteria, skip to the next row
                        continue;
                    }
                }

                // create a FeatureCollection from the features array
                const geojson = {
                    type: "FeatureCollection",
                    features: features
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

// Function to reset pillar app counts
function resetPillarAppCounts() {
    for (const pillarApp in pillarAppCounts) {
        if (pillarAppCounts.hasOwnProperty(pillarApp)) {
            pillarAppCounts[pillarApp] = 0;
        }
    }
}

/*****LOCAL STORAGE*****/

// Event listener for map style change
map.on('load', function () {
    // Reload the uploaded data layers when the map style changes
    loadAndStoreGeoJSON();
    //loadGeoJSONFromLocalStorage();
});

function loadAndStoreGeoJSON() {
    fetch('./data/master_site_listing.geojson')
    .then(response => response.json())
    .then(masterSitesGeoJSON => {
        // Store master sites GeoJSON in local storage
        storeGeoJSONInLocalStorage('/master_sites_upload', masterSitesGeoJSON);
        // Update the map with the master sites data
        addOrUpdateSourceAndLayer('master_sites_data', masterSitesGeoJSON, true, 'visible');
    })
    .catch(error => console.error('Error loading master site listing:', error));

    // Load app deployment GeoJSON from file
    fetch('./data/app_deployment.geojson')
        .then(response => response.json())
        .then(appDeploymentGeoJSON => {
            // Store app deployment GeoJSON in local storage
            storeGeoJSONInLocalStorage('/app_deployment_upload', appDeploymentGeoJSON);
        })
        .catch(error => console.error('Error loading app deployment data:', error));

        // reflect counts in legend
        updateAllSitesCount();
    }

/*
// Load GeoJSON from localStorage with prefixed keys when the page loads
function loadGeoJSONFromLocalStorage() {
    // Retrieve GeoJSON data with prefixed keys
    const masterSitesGeoJSON = getGeoJSONFromLocalStorage('/master_sites_upload');
    const appDeploymentGeoJSON = getGeoJSONFromLocalStorage('/app_deployment_upload');

    console.log('masterSitesGeoJSON:', masterSitesGeoJSON);
    console.log('appDeploymentGeoJSON:', appDeploymentGeoJSON);

    if (masterSitesGeoJSON) {
        map.on('style.load', function() {
            // Update the map with the retrieved GeoJSON data
            addOrUpdateSourceAndLayer('master_sites_data', masterSitesGeoJSON, true, 'visible');
            //updateAllSitesCount();
        });
    } 

    if (appDeploymentGeoJSON) {
        map.on('style.load', function() {
            // Update the map with the retrieved GeoJSON data
            addOrUpdateSourceAndLayer('app_deployment', appDeploymentGeoJSON, false, 'visible');
            //updateAllSitesCount();
        });
    }
}*/

function updateAllSitesCount() {
    const allSitesData = map.getSource('master_sites_data')._data;
    const siteCount = allSitesData.features.length;
    updateLegendAllSites(siteCount);
}

function updateLegendAllSites(count) {
    // Get the legend element
    const allSitesLegend = document.getElementById('All-Sites-Count');
    // Update the text content to display the count
    allSitesLegend.innerText = `${count}`;
}

/*
// Update the function to retrieve GeoJSON data from localStorage with prefixed keys
function getGeoJSONFromLocalStorage(key) {
    // Use prefixed key provided by github-pages-local-storage library
    const storedData = localStorage.getItem(key);
    return storedData ? JSON.parse(storedData) : null;
}*/

// Update the function to store GeoJSON in localStorage with prefixed keys
function storeGeoJSONInLocalStorage(key, geojson) {
    // Use prefixed key provided by github-pages-local-storage library
    localStorage.setItem(key, JSON.stringify(geojson));
}

// Update the event listeners for upload buttons to store data in localStorage with prefixed keys & update map
document.getElementById('apply-master-sites-upload').addEventListener('click', function () {

    localStorage.removeItem('/master_sites_upload');

    convertCSVtoGeoJSON('master-sites-upload', function (err, geojson) {
        if (!err) {
            console.log('Successfully converted CSV to GeoJSON:', geojson);
            // Store GeoJSON in localStorage with prefixed key
            storeGeoJSONInLocalStorage('/master_sites_upload', geojson);
            // Update the map with the new data
            addOrUpdateSourceAndLayer('master_sites_data', geojson, true, 'visible');
            updateAllSitesCount();
        }
    });
    showSuccessMessage('Changes applied successfully.', 'master-message');
});

document.getElementById('apply-app-deployment-upload').addEventListener('click', function () {
    
    resetPillarAppCounts();

    localStorage.removeItem('/app_deployment_upload');

    convertCSVtoGeoJSON('app-deployment-upload', function (err, geojson) {
        if (!err) {
            console.log('Successfully converted CSV to GeoJSON:', geojson);
            // Store GeoJSON in localStorage with prefixed key
            storeGeoJSONInLocalStorage('/app_deployment_upload', geojson);
            // Update the map with the new data
            addOrUpdateSourceAndLayer('app_deployment', geojson, false, 'visible');
            updateAllSitesCount();
        }
    });
    showSuccessMessage('Changes applied successfully.', 'master-message');
});


/**** UPDATE DATA (NEW DATASET UPLOADED) ******/

// add or update map source and layer
function addOrUpdateSourceAndLayer(sourceId, geojson, isLayer, visibility) {
    console.log('sourceID: ' + sourceId + ', visibility: ' + visibility);
    
        if (isLayer) {
            map.removeLayer('All-Sites');
            map.getSource(sourceId).setData(geojson);
            map.addLayer({
                'id': 'All-Sites',
                'type': 'circle',
                'source': sourceId,
                'paint': {
                    'circle-radius': 2.75,
                    'circle-color': '#FF0000',
                    'circle-opacity': 1
                }
            });
            const siteCount = geojson.features.length;
            updateLegendAllSites(siteCount);
            return;
        }

        for (const pillarApp in markersByPillarApp) {
            if (markersByPillarApp.hasOwnProperty(pillarApp)) {
                removeMarkersByPillarApp(pillarApp);
            }
        }

        markersByCoordinate = {};

        // add as a marker
        geojson.features.forEach(function (feature) {
            var pillarApp = feature.properties['Pillar App'];
            var lngLat = [feature.geometry.coordinates[0], feature.geometry.coordinates[1]];
            var coordinateKey= lngLat.join(',');
            if (!markersByCoordinate[coordinateKey]) {
                markersByCoordinate[coordinateKey] = [];
            }
            markersByCoordinate[coordinateKey].push({
                pillarApp: pillarApp
            });
            var popupHTML = generatePopupHTML(feature);

            var color = getColorForPillarApp(pillarApp);
            if(color != '#000000'){
                createMarker(color, lngLat, popupHTML, pillarApp);
            }
        });
    }

    function removeMarkersByPillarApp(pillarApp) {
        if (markersByPillarApp[pillarApp]) {
            markersByPillarApp[pillarApp].forEach(function (marker) {
                marker.remove(); // remove marker from map
            });
        }
    }

    // show success message when new data has been uploaded
    function showSuccessMessage(message, messageId) {
        // span element for the success message
        const successMessage = document.getElementById(messageId);
        successMessage.textContent = message;

        // show message
        successMessage.style.opacity = '1';

        // remove the success message after a few seconds
        setTimeout(function () {
            // Set opacity back to 0 to hide the message
            successMessage.style.opacity = '0';
        }, 3000); // Adjust the duration as needed
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
