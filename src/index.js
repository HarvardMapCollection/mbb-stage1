import L, { icon, divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import './style.styl';
import axios from 'axios'

var jquery = require("jquery");
window.$ = window.jQuery = jquery; // notice the definition of global variables here
require("jquery-ui-dist/jquery-ui.js")


// Markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  // 🧡 replace the two image paths here for custom markers
  iconRetinaUrl: require("./icon.svg"),
  iconUrl: require("./icon.svg"),
  shadowSize: [0,0]
});


// 🧡 syntax if your data is local 
// import markers from './markers.json';

//variable to hold clicked marker
var prevMarker = null; 


var theMap = new L.map('map',{
  zoomControl:false
}).setView([42.350,-71.065 ], 14);

L.control.zoom({
  position: 'topright'
}).addTo(theMap);

// 🧡 uncomment and drag the map around to decide where you want the bounds to be
// theMap.on('dragend', function onDragEnd(){
//   alert (
//       'east:' + theMap.getBounds().getEast() +'\n'+
// 	    'west:' + theMap.getBounds().getWest() +'\n'+
// 	    'north:' + theMap.getBounds().getNorth() +'\n'+
// 	    'south:' + theMap.getBounds().getSouth());

//   });

theMap.fitBounds([
  [42.369, -71.092],
  [42.348, -71.038]
]);



L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',{
    tileSize: 512,
    zoomOffset: -1,
    minZoom: 1,
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    crossOrigin: true
}).addTo(theMap);


function getData(map) {
  // 🧡 Replace with the link to your json data
  axios.get("https://raw.githubusercontent.com/HarvardMapCollection/mbb-stage1/master/data/historical_data.geojson")
      .then(response => {
          var datapoints = response.data.features;
          console.log(datapoints)

      	// Use this divIcon as marker to make it keyboard accessible and not ugly
        var geojsonIcon = L.divIcon( {className: 'geojson-Icon'});
        var activeIcon = L.divIcon({className: 'geojson-Icon-active'});

        //create sidebar content in a function to call when the user takes an action
        function whenClicked(e) {
          // e = event
          var feature = e.target;
          document.getElementById("sidebar-text").innerHTML = "";
          // if any other active icons exist, change color of icon back
          if (prevMarker !== null) {
            prevMarker.setIcon(geojsonIcon);
          }

          // change color to active icon
          feature.setIcon(activeIcon);
          prevMarker = feature;

          // Build the display name
          if (feature.feature.properties.NAME_2 == null){
            var display_name = feature.feature.properties.NAME_1
          } else {
            if (feature.feature.properties.NAME_1 == null){
              display_name = feature.feature.properties.NAME_2
            } else {
              display_name = feature.feature.properties.NAME_2 + " " + feature.feature.properties.NAME_1
              }
            }
          
          // Build the display date
          if (feature.feature.properties.START_LOC == null && feature.feature.properties.END_LOC == null){
            var date = "no date available."
          } else {
            if (feature.feature.properties.START_LOC == null){
              date = "in " + feature.feature.properties.END_LOC + "." 
            } else {
              if (feature.feature.properties.END_LOC == null){
                date = "since " + feature.feature.properties.START_LOC + "." 
              } else {
                date = "from " + feature.feature.properties.START_LOC + " to " + feature.feature.properties.END_LOC + "."
              }
            }
          }
          
          // Build display for original address
          if (feature.feature.properties.ORIG_ADDRESS == null){
            var orig_address = ""
          } else {
            orig_address = "At the time, this address was " + feature.feature.properties.ORIG_ADDRESS + "."
          }

          // Build the display notes and source
          if (feature.feature.properties.NOTES == null){
            var notes = ""
          } else{
            notes = "<br><strong>Notes:</strong> " + feature.feature.properties.NOTES
          }
          if (feature.feature.properties.SOURCE == null){
            var source = ""
          } else {
            source = "<br><strong>Sources:</strong> " + feature.feature.properties.SOURCE
          }

          // Build the display record links
          if (feature.feature.properties.TITLE_1 == ""){
            var r_link_1 = ""
          } else {
            r_link_1 = "<p>Records in HOLLIS include: <p>" + "<ul><li><a href='" + feature.feature.properties.URL_1 + "'>" 
            + feature.feature.properties.TITLE_1 + "</a></li></ul>"
          }
          if (feature.feature.properties.TITLE_2 == ""){
            var r_link_2 = ""
          } else {
            r_link_2 = "<ul><li><a href='" + feature.feature.properties.URL_2 + "'>" 
            + feature.feature.properties.TITLE_2 + "</a></li></ul>"
          }
          if (feature.feature.properties.TITLE_3 == ""){
            var r_link_3 = ""
          } else {
            r_link_3 = "<ul><li><a href='" + feature.feature.properties.URL_3 + "'>" 
            + feature.feature.properties.TITLE_3 + "</a></li></ul>"
          }
          
          var action = feature.feature.properties.ACTION
          var type = feature.feature.properties.Type;

          var content = display_name + " " + action + " here " + date + " " + orig_address + r_link_1 + r_link_2 + r_link_3 + "<br>" + notes + "<br>" + source;
          
          $("#sidebar-text").append("<div id='placeinfo'>"+content+"</div>");
          console.log(content);
        };

        //Call all the geoJson data as individual layers for the map. 
        //Add filter options and event functions.
        var layerAll = L.geoJson(datapoints, {
          onEachFeature: function(feature, layer) {
            layer.on({
              click: whenClicked,
              keypress: whenClicked
            })
          },
          pointToLayer : function (feature, latlng) {
            return L.marker(latlng, {icon: geojsonIcon});
          }
        });

        var layer1830 = L.geoJson(datapoints, {
          onEachFeature: function(feature, layer) {
            layer.on({
              click: whenClicked,
              keypress: whenClicked
            })
          },
          pointToLayer : function (feature, latlng) {
            return L.marker(latlng, {icon: geojsonIcon});
          },
          filter: function(feature) {
            return feature.properties.END_LOC <= 1830
          }
        });

        var layer1840 = L.geoJson(datapoints, {
          onEachFeature: function(feature, layer) {
            layer.on({
              click: whenClicked,
              keypress: whenClicked
            })
          },
          pointToLayer : function (feature, latlng) {
            return L.marker(latlng, {icon: geojsonIcon});
          },
          filter: function(feature) {
            return feature.properties.END_LOC <= 1840 && feature.properties.END_LOC > 1830
          }
        });

        var layer1850 = L.geoJson(datapoints, {
          onEachFeature: function(feature, layer) {
            layer.on({
              click: whenClicked,
              keypress: whenClicked
            })
          },
          pointToLayer : function (feature, latlng) {
            return L.marker(latlng, {icon: geojsonIcon});
          },
          filter: function(feature) {
            return feature.properties.END_LOC <= 1850 && feature.properties.END_LOC > 1840
          }
        });

        var layer1860 = L.geoJson(datapoints, {
          onEachFeature: function(feature, layer) {
            layer.on({
              click: whenClicked,
              keypress: whenClicked
            })
          },
          pointToLayer : function (feature, latlng) {
            return L.marker(latlng, {icon: geojsonIcon});
          },
          filter: function(feature) {
            return feature.properties.END_LOC <= 1860 && feature.properties.END_LOC > 1850
          }
        });

        var layer1870 = L.geoJson(datapoints, {
          onEachFeature: function(feature, layer) {
            layer.on({
              click: whenClicked,
              keypress: whenClicked
            })
          },
          pointToLayer : function (feature, latlng) {
            return L.marker(latlng, {icon: geojsonIcon});
          },
          filter: function(feature) {
            return feature.properties.END_LOC <= 1870 && feature.properties.END_LOC > 1860
          }
        });

        var layerResources = L.geoJson(datapoints, {
          onEachFeature: function(feature, layer) {
            layer.on({
              click: whenClicked,
              keypress: whenClicked
            })
          },
          pointToLayer : function (feature, latlng) {
            return L.marker(latlng, {icon: geojsonIcon});
          },
          filter: function(feature) {
            return feature.properties.TITLE_1 != ""
          }
        });
          
          //Create markercluster groups for all the layers. Add a keypress listener for each cluster
        var markersAll = L.markerClusterGroup();
            markersAll.addLayer(layerAll);
            markersAll.on('clusterkeypress', function (a) {
          a.layer.zoomToBounds();
        });

        map.addLayer(markersAll);
        
        var markers1830 = L.markerClusterGroup();
        markers1830.addLayer(layer1830);
        markers1830.on('clusterkeypress', function (a) {
          a.layer.zoomToBounds();
        });

        var markers1840 = L.markerClusterGroup();
        markers1840.addLayer(layer1840);
        markers1840.on('clusterkeypress', function (a) {
          a.layer.zoomToBounds();
        });

        var markers1850 = L.markerClusterGroup();
        markers1850.addLayer(layer1850);
        markers1850.on('clusterkeypress', function (a) {
          a.layer.zoomToBounds();
        });

        var markers1860 = L.markerClusterGroup();
        markers1860.addLayer(layer1860);
        markers1860.on('clusterkeypress', function (a) {
          a.layer.zoomToBounds();
        });

        var markers1870 = L.markerClusterGroup();
        markers1870.addLayer(layer1870);
        markers1870.on('clusterkeypress', function (a) {
          a.layer.zoomToBounds();
        });

        var markersResources = L.markerClusterGroup();
        markersResources.addLayer(layerResources);
        markersResources.on('clusterkeypress', function (a) {
          a.L.zoomToBounds();
        });
          //Add layers to controls and add controls to the map
        var dataLayers = {
          "All data": markersAll,
          "Pre-1830": markers1830,
          "1831-1840": markers1840,
          "1841-1850": markers1850,
          "1851-1860": markers1860,
          "1861-1870": markers1870,
          "Linked to library resources": markersResources
        };

          var dataControl = L.control.layers(dataLayers, null, { position: 'bottomright', collapsed: false }).addTo(map);

        // Create markercluster groups for all the layers with a low cluster radius for display at high zoom. 
        // Add a keypress listener for each cluster    
          var markersAllZoom = L.markerClusterGroup( {maxClusterRadius: 2});
          markersAllZoom.addLayer(layerAll);
          markersAllZoom.on('clusterkeypress', function (a) {
              a.layer.zoomToBounds();
          });
          
          var markers1830Zoom = L.markerClusterGroup({maxClusterRadius: 2});
          markers1830Zoom.addLayer(layer1830);
          markers1830Zoom.on('clusterkeypress', function (a) {
              a.layer.zoomToBounds();
          });

          var markers1840Zoom = L.markerClusterGroup({maxClusterRadius: 2});
          markers1840Zoom.addLayer(layer1840);
          markers1840Zoom.on('clusterkeypress', function (a) {
              a.layer.zoomToBounds();
          });

          var markers1850Zoom = L.markerClusterGroup({maxClusterRadius: 2});
          markers1850Zoom.addLayer(layer1850);
          markers1850Zoom.on('clusterkeypress', function (a) {
              a.layer.zoomToBounds();
          });

          var markers1860Zoom = L.markerClusterGroup({maxClusterRadius: 2});
          markers1860Zoom.addLayer(layer1860);
          markers1860Zoom.on('clusterkeypress', function (a) {
              a.layer.zoomToBounds();
          });

          var markers1870Zoom = L.markerClusterGroup({maxClusterRadius: 2});
          markers1870Zoom.addLayer(layer1870);
          markers1870Zoom.on('clusterkeypress', function (a) {
              a.layer.zoomToBounds();
          });

          var markersResourcesZoom = L.markerClusterGroup({maxClusterRadius: 2});
          markersResourcesZoom.addLayer(layerResources);
          markersResourcesZoom.on('clusterkeypress', function (a) {
              a.layer.zoomToBounds();
          });
          
          //Add layers to controls and add controls to the map
          var dataLayersZoom = {
              "All data": markersAllZoom,
              "Pre-1830": markers1830Zoom,
              "1831-1840": markers1840Zoom,
              "1841-1850": markers1850Zoom,
              "1851-1860": markers1860Zoom,
              "1861-1870": markers1870Zoom,
              "Has Library Resource": markersResourcesZoom
          };

          var dataControlZoom = L.control.layers(dataLayersZoom, null, { position: 'bottomright', collapsed: false });

          // Boolean that returns true when the zoom is above 17 
          var zoomCheck = false
            
          // Listener for Zoom to act differently near max Zoom
          map.on('zoomend', function(e){
                if (map.getZoom() <= 16) {  
                    //Swap layers if moving below 16 zoom
                    if(zoomCheck == true) {
                        if (map.hasLayer(markersAllZoom)) {
                            map.removeLayer(markersAllZoom);
                            map.addLayer(markersAll);
                        };
                        if (map.hasLayer(markers1830Zoom)) {
                            map.removeLayer(markers1830Zoom);
                            map.addLayer(markers1830);
                        };
                        if (map.hasLayer(markers1840Zoom)) {
                            map.removeLayer(markers1840Zoom);
                            map.addLayer(markers1840);
                        };
                        if (map.hasLayer(markers1850Zoom)) {
                            map.removeLayer(markers1850Zoom);
                            map.addLayer(markers1850);
                        };
                        if (map.hasLayer(markers1860Zoom)) {
                            map.removeLayer(markers1860Zoom);
                            map.addLayer(markers1860);
                        };
                        if (map.hasLayer(markers1870Zoom)) {
                            map.removeLayer(markers1870Zoom);
                            map.addLayer(markers1870);
                        };
                        if (map.hasLayer(markersResourcesZoom)) {
                            map.removeLayer(markersResourcesZoom)
                            map.addLayer(markersResources);
                        };
                    map.removeControl(dataControlZoom);
                    map.addControl(dataControl);
                    }
                    zoomCheck = false;
                }
                // swap cluster layers if above 16 zoom
                else if (map.getZoom() > 16){
                    if(zoomCheck == true) {
                        if (map.hasLayer(markersAll)) {
                            map.removeLayer(markersAll);
                            map.addLayer(markersAllZoom);
                        };
                        if (map.hasLayer(markers1830)) {
                            map.removeLayer(markers1830);
                            map.addLayer(markers1830Zoom);
                        };
                        if (map.hasLayer(markers1840)) {
                            map.removeLayer(markers1840);
                            map.addLayer(markers1840Zoom);
                        };
                        if (map.hasLayer(markers1850)) {
                            map.removeLayer(markers1850);
                            map.addLayer(markers1850Zoom);
                        };
                        if (map.hasLayer(markers1860)) {
                            map.removeLayer(markers1860);
                            map.addLayer(markers1860Zoom);
                        };
                        if (map.hasLayer(markers1870)) {
                            map.removeLayer(markers1870);
                            map.addLayer(markers1870Zoom);
                        };
                        if (map.hasLayer(markersResources)) {
                            map.removeLayer(markersResources)
                            map.addLayer(markersResourcesZoom);
                        };

                    map.removeControl(dataControl);
                    map.addControl(dataControlZoom);
                }
                zoomCheck = true;
                } 
          });

      }).catch(err => {
          console.log(err)
      })
};

getData(theMap);

