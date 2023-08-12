import './App.css'
import React, {useState,useCallback} from 'react';
import {Map} from 'react-map-gl';

import maplibregl from 'maplibre-gl';
import DeckGL from '@deck.gl/react';
import {GeoJsonLayer, PolygonLayer} from '@deck.gl/layers';
import {LightingEffect, AmbientLight, _SunLight as SunLight} from '@deck.gl/core';
import { FlyToInterpolator } from 'deck.gl';
import Search from './Search.jsx'
import getTooltip from './getToolTip';

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


 function App({data = DATA_URL, mapStyle = MAP_STYLE}) {
  
  const [effects] = useState(() => {
    const lightingEffect = new LightingEffect({ambientLight, dirLight});
    lightingEffect.shadowColor = [0, 0, 0, 0.5];
    return [lightingEffect];
  });

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




  
  

  return (
    <div>
      <div style={{ zIndex: "30", position: "absolute", top: "1rem", left: "1rem", width: "10rem", display: 'flex' }}>

        <div> GEObutton</div>

        <Search goToPoint = {goToPoint}/>

        <button onClick={goToUserLocation}>Find me!</button>
      
        <div class="dropdown">
          <button onclick="myFunction()" class="dropbtn">Dropdown</button>
          <div id="myDropdown" class="dropdown-content">
            <a href="#">Link 1</a>
            <a href="#">Link 2</a>
            <a href="#">Link 3</a>
          </div>
        </div>

      </div>


      <DeckGL
        layers={layers}
        effects={effects}
        initialViewState={viewState}
        controller={true}
        getTooltip = {getTooltip}

      >
        
        <Map reuseMaps mapLib={maplibregl} mapStyle={mapStyle} preventStyleDiffing={true} />
      </DeckGL>
    </div>
  );
}

export default App
