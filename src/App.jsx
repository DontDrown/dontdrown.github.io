import './App.css'
import React, {useState,useCallback} from 'react';
import {Map, Marker} from 'react-map-gl';

import maplibregl from 'maplibre-gl';
import DeckGL from '@deck.gl/react';
import {GeoJsonLayer, PolygonLayer,IconLayer} from '@deck.gl/layers';
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

  const [currentZoom, setCurrentZoom] = useState(0);
  const [currentLongitude, setCurrentLongitude] = useState();
  const [currentLatitude, setCurrentLatitude] = useState();
  const [markerDropped, setMarkerDropped] = useState(false);
  const [viewState,setViewState] = useState({
    latitude: -36.8509,
    longitude: 174.7645,
    zoom: 11,
    maxZoom: 24,
    pitch: 45,
    bearing: 0
  });

  const [markerPos,setMarkerPos] = useState([[1,1],[5,5]])
  const [modalState,setModalState] = useState('closed')
  console.log(markerPos)

  
  const goToPoint = useCallback((lat,lon) => {
    
    setViewState({...viewState,
      longitude: lon,
      latitude: lat,
      zoom: 18,
      transitionInterpolator: new FlyToInterpolator({speed:0.1})
    })
    setMarkerDropped(true)
    setCurrentLongitude(lon);
    setCurrentLatitude(lat);
  }, []);

  const goToUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((e)=>{goToPoint(e.coords.latitude,e.coords.longitude)});
    }
  }

  
  const circleCenter = [markerDropped ? viewState.longitude : 0, markerDropped ? viewState.latitude : 0]; // [longitude, latitude]
  const radius = 0.0002; // Adjust this value to change the circle's size

  const circlePolygon = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[]],
        },
      },
    ],
  };

// Generate the circle polygon coordinates
for (let i = 0; i <= 360; i += 10) {
  const angle = (i * Math.PI) / 180;
  const x = circleCenter[0] + radius * Math.cos(angle);
  const y = circleCenter[1] + radius * Math.sin(angle);
  circlePolygon.features[0].geometry.coordinates[0].push([x, y]);
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
    new GeoJsonLayer({
      id: 'marker-layer',
      data: circlePolygon,
      filled: true,
      stroked: false,
      getFillColor: d => markerDropped ? [195, 255, 104, 1000] // RGBA color for the circle fill
        : [255,255,255,0],
      lineWidthMinPixels: 2,
    })]

  function getTooltip() 
  {
    if(currentLatitude === undefined || currentLatitude === null || currentLongitude === undefined || currentLongitude === null)
    {
      return (
        {
          html: '<p></p>',
          style: {
            backgroundColor: 'white',
            color: 'black',
            opacity: 0
          }
        }
      );
    }

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
          html: '<p>Loading...</p>',
          style: {
            backgroundColor: 'white',
            color: 'black',
            opacity: 100
          }
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

        //const distance = Math.sqrt((dLat * dLat) + (dLong * dLong));
        const distance = measure(currentLatitude, currentLongitude, coordLat, coordLong);

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
            html: 'No nearby flood plains. <br>You\'re safe!',
            style: {
              backgroundColor: 'white',
              color: 'black',
              opacity: 100
            }
          }
        );
      }
      else
      {
        // Check if within flood plain bounds.
        var geometry = closest.geometry;  
        var coordinates = geometry.coordinates[0];

        var insideFP = inside([currentLongitude, currentLatitude], coordinates);

        var floodPlainDistance = Math.round(measure(currentLatitude, currentLongitude, closestLatLong[0], closestLatLong[1]));
        console.log(floodPlainDistance);

        if(insideFP || floodPlainDistance < 100 * (currentZoom / 5))
        {
          return (
            {
              html: '<p>You are within a flood plain!</p>',
              style: {
                backgroundColor: 'white',
                color: 'black',
                opacity: 100
              }
            }
          );
        }
        else
        {
          if(floodPlainDistance <= 200 * (currentZoom / 3))
          {
            // Tooltip needs to be returned in form of html property of object
            return (
              {
                html: "<p> You are near a flood plain! <br>You are " + floodPlainDistance + ' m away.</p>',
                style: {
                  backgroundColor: 'white',
                  color: 'black',
                  opacity: 100
                }
              }
            );
          }
          else
          {
            return (
              {
                html: 'No nearby flood plains. <br>You\'re safe!',
                style: {
                  backgroundColor: 'white',
                  color: 'black',
                  opacity: 100
                }
              }
            );
          }
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

  const viewStateChange = (viewState) =>
  {
    setCurrentZoom(viewState.viewState.zoom);
  };

  const hover = (info, event) =>
  {
    if(info === null || info.coordinate === undefined || info.coordinate === null || info.coordinate.length < 2 || 
      info.x < 150 || info.y < 150 || info.x > screen.width - 250 || info.y > screen.height - 250)
      {
        setCurrentLatitude(null);
        setCurrentLongitude(null);
        return;
      }

    setCurrentLongitude(info.coordinate[0]);
    setCurrentLatitude(info.coordinate[1]);
  };

  return (
    <>
      <InfoModal modalState = {modalState} setModalState ={setModalState}/>
      <div className ='searchBarContainer'>
        <div class="dropdown">
          <button class=" dropdown-toggle " type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"/>
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
        onHover={hover}
        onViewStateChange={viewStateChange}
      >
        
        <Map reuseMaps mapLib={maplibregl} mapStyle={mapStyle} preventStyleDiffing={true} controller={false} 
        onLoad={(e) => {
          e.target.addLayer(mapboxBuildingLayer);
        }}
      
        >
        
        </Map>
      
      </DeckGL>
    </>
  );
}

export default App
