import './App.css'
import React, {useState,useCallback} from 'react';
import {Map, Marker} from 'react-map-gl';

import maplibregl from 'maplibre-gl';
import DeckGL from '@deck.gl/react';
import {GeoJsonLayer, PolygonLayer} from '@deck.gl/layers';
import {LightingEffect, AmbientLight, _SunLight as SunLight} from '@deck.gl/core';
import { FlyToInterpolator } from 'deck.gl';
import Search from './Search.jsx'
import getTooltip from './getToolTip';
import  { faLocationDot } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import img from './assets/logo.png'
import 'mapbox-gl/dist/mapbox-gl.css';


// Source data GeoJSON
const DATA_URL =
  './Flood_Plains.json'; // eslint-disable-line




const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

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

  const [markerPos,setMarkerPos] = useState(null)

  const goToPoint = useCallback((lat,lon) => {
    setMarkerPos({longitude:lon,latitude:lat})
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
      opacity: .1,
      stroked: false,
      filled: true,
      extruded: true,
      wireframe: true,
      getElevation: f => 0,
      getFillColor: [9, 255, 800],
      getLineColor: [9, 255, 800],
      pickable: true
    }),
  ];

  const mapboxBuildingLayer = {
    id: "3d-buildings",
    source: "carto",
    "source-layer": "building",
    type: "fill-extrusion",
    minzoom: 0,
    paint: {
      "fill-extrusion-color": "rgb(245, 242, 235)",
      "fill-extrusion-opacity": 0.4,
      "fill-extrusion-height": ["get", "render_height"],
    },
  };

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
      <div className = 'logo'>
        <img src={img}/>
      </div>

        
      
       

     



      <DeckGL
        layers={layers}
        effects={effects}
        initialViewState={viewState}
        controller={true}
        getTooltip = {getTooltip}

      >
        
        <Map reuseMaps mapLib={maplibregl} mapStyle={mapStyle} preventStyleDiffing={true} controller={false} 
        onLoad={(e) => {
          e.target.addLayer(mapboxBuildingLayer);
        }}>
          <Marker latitude ={ -36.8509} longitude = {174.7645}><h1>safs</h1></Marker>
       
    
          { (markerPos != null) ? <Marker longitude={markerPos.longitude} latitude={markerPos.latitude}><h1>asfs</h1></Marker>:<></>}
        </Map>
      
      </DeckGL>
    </>
  );
}

export default App
