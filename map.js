'use strict'      

console.log('Loaded map.js')

mapboxgl.accessToken = 'pk.eyJ1Ijoib2xpdmlhdDEwIiwiYSI6ImNsdXZ3aDYzcjA2bW0yaWwzZ3g2cXA2bWYifQ.YFXEBTfX3eiQrk5pm5qBVQ';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/standard',
    center: [-70, 20],
    zoom: 2
});

var app_deployment_url = "./data/app_deployment.geojson"

map.on('load',function(){
    map.addSource('app_data',{
      'type':'geojson',
      'data': app_deployment_url,
    });
    // OpsVision (blue)
    map.addLayer({
      'id':'OpsVision',
      'type':'circle',
      'source':'app_data',
      'paint':{
        'circle-radius':6,
        'circle-color': [
            'match',
            ['get', 'Pillar App'],
            'OpsVision MES',
            '#00008B',
            'OpsVision Smart Manufacturing',
            '#00008B',
            '#FFFFFF'
        ],
        'circle-opacity': [
            'match',
            ['get', 'Pillar App'],
            'OpsVision MES',
            1,
            'OpsVision Smart Manufacturing',
            1,
            0
        ],
      },
    }),
    // Reliance (yellow)
    map.addLayer({
        'id':'Reliance',
        'type':'circle',
        'source':'app_data',
        'paint':{
          'circle-radius':6,
          'circle-color': [
              'match',
              ['get', 'Pillar App'],
              'Reliance',
              '#FFFF00',
              '#FFFFFF'
          ],
          'circle-opacity': [
            'match',
            ['get', 'Pillar App'],
            'Reliance',
            1,
            0
        ],
        },
      }),
      // Maximo (orange)
      map.addLayer({
        'id':'Maximo',
        'type':'circle',
        'source':'app_data',
        'paint':{
          'circle-radius':6,
          'circle-color': [
              'match',
              ['get', 'Pillar App'],
              'Maximo',
              '#FFA500',
              '#FFFFFF'
          ],
          'circle-opacity': [
            'match',
            ['get', 'Pillar App'],
            'Maximo',
            1,
            0
        ],
        },
      }),
      // SCC (purple)
      map.addLayer({
        'id':'SCC',
        'type':'circle',
        'source':'app_data',
        'paint':{
          'circle-radius':6,
          'circle-color': [
            'match',
            ['get', 'Pillar App'],
            'SCC (Phase 1)',
            '#800080',
            'SCC (Phase 2)',
            '#800080',
            '#FFFFFF'
        ],
        'circle-opacity': [
            'match',
            ['get', 'Pillar App'],
            'SCC (Phase 1)',
            1,
            'SCC (Phase 2)',
            1,
            0
        ],
        },
      })

  });

// master site list (red dots)
var master_site_listing_url = "./data/master_site_listing.geojson"

map.on('load',function(){
    map.addSource('master_sites_data',{
      'type':'geojson',
      'data': master_site_listing_url
    });
    map.addLayer({
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

    // layer filtering
    document
    .querySelectorAll('.map-overlay-inner input[type="checkbox"]')
    .forEach((checkbox) => {
        checkbox.addEventListener('change', function () {
            const layerId = this.id;
            const visibility = this.checked ? 'visible' : 'none';
            map.setLayoutProperty(layerId, 'visibility', visibility);
        });
    });
