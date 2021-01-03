function geojson_style(prop) {
  var s = {};
  for(name in prop) {
    if(name.match(/^_/) && !name.match(/_markerType/)){
      if( prop['_markerType']=='Circle' && name =='_radius'){continue;}
      s[name.substr(1)]=prop[name];
    }
  }
  return s;
}
function popup_properties(prop) {
  var s = ''
  for(name in prop) {
    if(!name.match(/^_/)){
      s += "<p class='popup-content'>" + name + "：" + prop[name] + "</p>";
    }
  }
  return s;
}
function tooltip_properties(prop) {
  var s = ''
  for(name in prop) {
    if(!name.match(/^_/)){
      s += prop[name];
    }
  }
  return s;
}


var gsi = L.tileLayer(
  'https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',
  {
    attribution: "<a href='http://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル（標準地図）</a>",
    maxNativeZoom: 18,
    maxZoom: 18,
    opacity:1,
    label: "地理院タイル（標準地図）"
  });
var gsipale = L.tileLayer(
  'https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png',
  {
    attribution: "<a href='http://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル（淡色地図）</a>",
    maxNativeZoom: 18,
    maxZoom: 18,
    opacity:1,
    label: "地理院タイル（淡色地図）"
  });
var gsiphoto = L.tileLayer(
  'https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg',
  {
    attribution: "<a href='http://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル（写真）</a>",
    maxNativeZoom: 18,
    maxZoom: 18,
    opacity:1,
    label: "地理院タイル（写真）"
  });
var opentopo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    maxNativeZoom: 17,
    maxZoom: 17,
    opacity:1,
    label: "OpenTopoMap"
  });
var openstreet = L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
    maxNativeZoom: 19,
    maxZoom: 19,
    opacity:1,
    label: "OpenStreetMap"
  });

//NHM.json(日本百名山)
var xhr1 = new XMLHttpRequest();
xhr1.open('GET', 'https://real-tozan-attack.github.io/NHM.json', false);
xhr1.send(null);
var RTA_ReachedMtlist_Deta = JSON.parse(xhr1.responseText);
var RTA_ReachedMtlist_marker = L.geoJson(RTA_ReachedMtlist_Deta, {
pointToLayer: function (feature, latlng) {
    var s = geojson_style(feature.properties);
    if(feature.properties['_markerType']=='Icon'){
      var myIcon = L.icon(s);
      return L.marker(latlng, {icon: myIcon});
    }
    if(feature.properties['_markerType']=='DivIcon'){
      var myIcon = L.divIcon(s);
      return L.marker(latlng, {icon: myIcon});
    }
    if(feature.properties['_markerType']=='Circle'){
      return L.circle(latlng,feature.properties['_radius'],s);
    }
    if(feature.properties['_markerType']=='CircleMarker'){
      return L.circleMarker(latlng,s);
    }
  },
  style: function (feature) {
    if(!feature.properties['_markerType']){
      var s = geojson_style(feature.properties);
      return s;
    }
  },
  onEachFeature: function (feature, layer) {
    layer.bindTooltip(tooltip_properties(feature.properties.番号) + "<br>" + tooltip_properties(feature.properties.山名) + "<br>" + tooltip_properties(feature.properties.走者),{permanent: true, direction: 'top', className: 'RTA_ReachedMtlist-tooltip'});
    layer.bindPopup(popup_properties(feature.properties));
  }
});


var markers1 = L.markerClusterGroup({
 disableClusteringAtZoom:13,
 maxClusterRadius: 100,
    });
var RTA_ReachedMtlist_Layer = markers1.addLayer(RTA_ReachedMtlist_marker);

var map = L.map('mapdiv', {
 center: [36.104700,140.087013], layers: [gsi, RTA_ReachedMtlist_Layer]
});

L.control.scale({imperial: false}).addTo(map);

var baseLayers = {};
var overlays = {"日本百名山": RTA_ReachedMtlist_Layer};
var layerscontrol = L.control.layers(baseLayers, overlays,{position:'topright',collapsed:false}).addTo(map);

function change_legend() {
    layerscontrol.removeFrom(map);
   baseLayers = {
    "地理院タイル（標準地図）[~18]": gsi, "地理院タイル（淡色地図）[~18]": gsipale, "地理院タイル（写真）[~18]": gsiphoto, "OpenTopoMap[~17]": opentopo, "OpenStreetMap[~19]": openstreet
};
};

var searchLayers = L.layerGroup([RTA_ReachedMtlist_Layer]);

map.addControl( new L.Control.Search({layer: searchLayers,propertyName:'_MtSeachKey',initial:false,zoom:13,textErr:'……',textPlaceholder:'山岳'}));

map.addControl( new L.Control.Search({layer: searchLayers,propertyName:'_RunnerSeachKey',initial:false,zoom:13,textErr:'……',textPlaceholder:'走者'}));

map.addControl(new L.Control.Fullscreen({
        title: {
          'false': '最大化',
          'true': '元に戻す'
        }
}));

L.control.zoomLabel().addTo(map);

map.fitBounds(RTA_ReachedMtlist_Layer.getBounds());

var target = document.getElementsByClassName("leaflet-tooltip");
for(var i = 0; i < target.length; i++) {
    target[i].style.display = "block";
}


var basemaps = [gsi,gsipale,gsiphoto,opentopo,openstreet];
map.addControl(L.control.basemaps({
    basemaps: basemaps,
    position:"topright",
    tileX: 28,  // tile X coordinate
    tileY: 12,  // tile Y coordinate
    tileZ: 5   // tile zoom level
}));

new L.HistoryControl({
    position: 'bottomleft',
    maxMovesToSave: 0,
    backTooltip: '戻る',
    forwardTooltip: '進む',
    backText: '',
    forwardText: '',
    }).addTo(map);
