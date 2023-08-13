import './App.css'
import React, {useState,useCallback} from 'react';
import {Map, Marker} from 'react-map-gl';

import maplibregl from 'maplibre-gl';
import DeckGL from '@deck.gl/react';
import {GeoJsonLayer, PolygonLayer} from '@deck.gl/layers';
import {LightingEffect, AmbientLight, _SunLight as SunLight} from '@deck.gl/core';
import { FlyToInterpolator } from 'deck.gl';
import Search from './Search.jsx'
import  { faLocationDot } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import img from './assets/logo.png'
import 'mapbox-gl/dist/mapbox-gl.css';

import InfoModal from './InfoModal';
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

var geojsonData = [];

fetch(DATA_URL)
.then((response) =>
{
  return response.json();
})
.then((json) =>
{
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
    maxZoom: 24,
    pitch: 45,
    bearing: 0
  });

  const [markerPos,setMarkerPos] = useState(null)
  const [modalState,setModalState] = useState('closed')

  const goToPoint = useCallback((lat,lon) => {
    setMarkerPos({longitude:lon,latitude:lat})
    setViewState({...viewState,
      longitude: lon,
      latitude: lat,
      zoom: 18,
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

  function getTooltip() 
  {
    function inside(point, vs) 
    {
      // ray-casting algorithm based on
      // https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html
      
      var x = point[0], y = point[1];
      
      var inside = false;
      for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
          var xi = vs[i][0], yi = vs[i][1];
          var xj = vs[j][0], yj = vs[j][1];
          
          var intersect = ((yi > y) != (yj > y))
              && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
          if (intersect) inside = !inside;
      }
      
      return inside;
    };
  
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
      var closestLatLong = [];

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

        const coordLat = coordinates[0][0][1];
        const coordLong = coordinates[0][0][0];

        const dLat = (currentLatitude - coordLat);
        const dLong = (currentLongitude - coordLong);

        const distance = Math.sqrt((dLat * dLat) + (dLong * dLong));

        // Get closest flood plain by distance.
        if(distance < closestDistance)
        {
          closest = entry;
          closestDistance = distance;
          closestLatLong = [coordLat, coordLong];
        }
      }  

      if(closest === null || 
        closest.geometry === null || 
        closest.geometry.coordinates === null || 
        closest.geometry.coordinates[0] === null || 
        closest.geometry.coordinates[0].length == 0)
      {
        return (
          {
            html: 'No nearby flood plains. You\'re safe!'
          }
        );
      }
      else
      {
        // Check if within flood plain bounds.
        var geometry = closest.geometry;  
        var coordinates = geometry.coordinates[0];

        var inside = inside([currentLongitude, currentLatitude], coordinates);
        
        if(inside)
        {
          return (
            {
              html: '<p>You are within a flood plain!</p>'
            }
          );
        }
        else
        {
          function measure(lat1, lon1, lat2, lon2)
          {  // generally used geo measurement function
              var R = 6378.137; // Radius of earth in KM
              var dLat = lat2 * Math.PI / 180 - lat1 * Math.PI / 180;
              var dLon = lon2 * Math.PI / 180 - lon1 * Math.PI / 180;
              var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
              var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
              var d = R * c;
              return d * 1000; // meters
          }

          var floodPlainDistance = Math.round(measure(closestLatLong[0], closestLatLong[1], currentLatitude, currentLongitude));

          // Tooltip needs to be returned in form of html property of object
          return (
            {
              html: "<p> You are near a flood plain! <br>You are " + floodPlainDistance + ' m away.</p>'
            }
          );
        }
      }
    }
  }
  
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
      <InfoModal modalState = {modalState} setModalState ={setModalState}/>
      <div className ='searchBarContainer'>
        <div class="dropdown">
          <button class="btn btn-secondary dropdown-toggle BtnGray" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"/>
            <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
              <a class="dropdown-item" onClick={()=>setModalState('prepare')}>Flood Preperation</a>
              <a class="dropdown-item" onClick={()=>setModalState('contact')}>Contact Emergency Services</a>
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
        getTooltip = {() => getTooltip()}

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
