'use strict'      

console.log('Loaded map.js')

// MapBox account access token 
mapboxgl.accessToken = 'pk.eyJ1Ijoib2xpdmlhdDEwIiwiYSI6ImNsdXZ3aDYzcjA2bW0yaWwzZ3g2cXA2bWYifQ.YFXEBTfX3eiQrk5pm5qBVQ';

// Basemap
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/standard',
    center: [-70, 20],
    zoom: 2
});


/********** FULL SITE LISTING  **********/

// Data for 'All Sites' category (red dots)
var master_site_listing_url = "./data/master_site_listing.geojson"

// Load in master site list data
map.on('load',function(){
    map.addSource('master_sites_data',{
      'type':'geojson',
      'data': master_site_listing_url
    }); 
    map.addLayer({ // apply sites layer
      'id':'All-Sites',
      'type':'circle',
      'source':'master_sites_data',
      'paint':{
        'circle-radius':2,
        'circle-color': '#FF0000',
        'circle-opacity':0.7
      },
    })
  });

    // Toggle 'All Sites' visibility (red checkbox)
    const allSitesCheckbox = document.getElementById('All-Sites');
    var layerId; 
    var visibility;

    allSitesCheckbox.addEventListener('change', function(event) {
        layerId = this.id;
        visibility = event.target.checked ? 'visible' : 'none';
        map.setLayoutProperty(layerId, 'visibility', visibility);
    });
     

    /********** PILLAR APP DEPLOYMENTS  **********/

    // Array to store marker objects
    var markersByPillarApp = {};
    
    // Function to create a marker and add it to the map
    function createMarker(color, lngLat, popupHTML, pillarApp) {
        var marker = new mapboxgl.Marker({
            color: color,
            scale: 0.5,
            draggable: false
        }).setLngLat(lngLat)
            .setPopup(new mapboxgl.Popup().setHTML(popupHTML))
            .addTo(map);
    
        if (!markersByPillarApp[pillarApp]) {
            markersByPillarApp[pillarApp] = [];
        }
        // Store markers
        markersByPillarApp[pillarApp].push(marker);
    }
    
    // Function to fetch Pillar App data and add markers
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
                                <td>Pillar App</td>
                                <td>${feature.properties['Pillar App']}</td>
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

// Add markers for Pillar App data
fetchAndAddMarkers('./data/app_deployment.geojson');

