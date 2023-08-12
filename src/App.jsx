import './App.css'
import React, {useState,useCallback} from 'react';
import {Map} from 'react-map-gl';

import maplibregl from 'maplibre-gl';
import DeckGL from '@deck.gl/react';
import {GeoJsonLayer, PolygonLayer} from '@deck.gl/layers';
import {LightingEffect, AmbientLight, _SunLight as SunLight} from '@deck.gl/core';
import { FlyToInterpolator } from 'deck.gl';
import Search from './Search.jsx'
import  { faLocationDot } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Source data GeoJSON
const DATA_URL =
  './Flood_Plains.json'; // eslint-disable-line




const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0
});

const dirLight = new SunLight({
  timestamp: Date.UTC(2019, 7, 1, 22),
  color: [255, 255, 255],
  intensity: 1.0,
  _shadow: true
});

const landCover = [
  [
    [-123.0, 49.196],
    [-123.0, 49.324],
    [-123.306, 49.324],
    [-123.306, 49.196]
  ]
];

var geojsonData = [];

fetch(DATA_URL)
.then((response) =>
{
  return response.json();
})
.then((json) =>
{
  console.log('update');
  geojsonData = json;
});


function App({data = DATA_URL, mapStyle = MAP_STYLE}) {
  const [effects] = useState(() => {
    const lightingEffect = new LightingEffect({ambientLight, dirLight});
    lightingEffect.shadowColor = [0, 0, 0, 0.5];
    return [lightingEffect];
  });

  const [currentLongitude, setCurrentLongitude] = useState();
  const [currentLatitude, setCurrentLatitude] = useState();

  const [viewState,setViewState] = useState({
    latitude: -36.8509,
    longitude: 174.7645,
    zoom: 11,
    maxZoom: 16,
    pitch: 45,
    bearing: 0
  });

  const goToPoint = useCallback((lat,lon) => {
    console.log("lat " + lat + " lon " +lon)
    setViewState({...viewState,
      longitude: lon,
      latitude: lat,
      zoom: 16,
      transitionInterpolator: new FlyToInterpolator({speed:0.1})
    })
    setCurrentLongitude(lon);
    setCurrentLatitude(lat);
  }, []);

  const goToUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((e)=>{goToPoint(e.coords.latitude,e.coords.longitude)});
    }
  }

  const layers = [
    // only needed when using shadows - a plane for shadows to drop on
    new PolygonLayer({
      id: 'ground',
      data: landCover,
      stroked: false,
      getPolygon: f => f,
      getFillColor: [0, 0, 0, 0]
    }),
    new GeoJsonLayer({
      id: 'geojson',
      data,
      opacity: 1,
      stroked: false,
      filled: true,
      extruded: true,
      wireframe: true,
      getElevation: f => 0,
      getFillColor: [173, 216, 220],
      getLineColor: [173, 216, 230],
      pickable: true
    })
  ];

  function getTooltip() 
  {
    if(geojsonData === null || geojsonData.length == 0)
    {
      return (
        {
          html: '<p>Loading...</p>'
        }
      );
    }
    else
    {
      var closest = null;
      var closestDistance = 1000000;

      for(const entry of geojsonData.features)
      {
       var geometry = entry.geometry;
  
       if(geometry === null)
         continue;
       
       var coordinates = geometry.coordinates;
  
       if(coordinates === null || coordinates.length == 0)
         continue;
  
       if(coordinates[0] === null || coordinates[0].length == 0)
        continue;

        if(coordinates[0][0] === null)
        continue;

        const coordLat = coordinates[0][0][0];
        const coordLong = coordinates[0][0][1];

        const dLat = (currentLatitude - coordLat);
        const dLong = (currentLongitude - coordLong);

        const distance = Math.sqrt((dLat * dLat) + (dLong * dLong));

        if(distance < closestDistance)
        {
          closest = entry;
          closestDistance = distance;
        }
      }  

      if(closest === null)
      {
        return (
          {
            html: 'No nearby flood plains. You\'re safe!'
          }
        );
      }
      else
      {
        console.log("Closest " + JSON.stringify(closest));

        // Tooltip needs to be returned in form of html property of object
        return (
          {
            html: '<p> Distance: ' + closestDistance + ' Closest flood plain ' + closest.properties.DOCUMENT_NAME + '</p>'
          }
        );
      }
    }
  }
  

  return (
    <>
      <div className ='searchBarContainer'>
        <div class="dropdown">
          <button class="btn btn-secondary dropdown-toggle BtnGray" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"/>
            <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
              <a class="dropdown-item" href="#">Action</a>
              <a class="dropdown-item" href="#">Another action</a>
              <a class="dropdown-item" href="#">Something else here</a>
            </div>
        </div>
        <Search goToPoint = {goToPoint}/>
        <button title="Go to Current Location" className = "locateButton" onClick={goToUserLocation}><FontAwesomeIcon icon={faLocationDot} /></button>
      </div>

        
      
       

     



      <DeckGL
        layers={layers}
        effects={effects}
        initialViewState={viewState}
        controller={true}
        getTooltip = {() => getTooltip()}

      >
        
        <Map reuseMaps mapLib={maplibregl} mapStyle={mapStyle} preventStyleDiffing={true} controller={false}/>
      </DeckGL>
    </>
  );
}

export default App
