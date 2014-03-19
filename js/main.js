var cloudmadeUrl = 'http://{s}.tile.cloudmade.com/06155e782b2045288946065f2d11d8b5/997/256/{z}/{x}/{y}.png',
    cloudmadeAttribution = 'Map data &copy; 2011 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade',
    cloudmadeUrl1='http://{s}.tile.cloudmade.com/06155e782b2045288946065f2d11d8b5/73457/256/{z}/{x}/{y}.png';

var minimal   = L.tileLayer(cloudmadeUrl, {minZoom: 5, maxZoom: 18,styleId: 22677, attribution: cloudmadeAttribution});
var minimap = L.tileLayer(cloudmadeUrl, {minZoom: 4, maxZoom: 10, attribution: cloudmadeAttribution});
//var max, scale, classes = 9, scheme = colorbrewer["YlOrRd"][classes];
var map = L.map('map', {
    center: new L.LatLng(1.3, 103.8),
    zoom: 11,
    layers: [minimal]
});
var styles = [
    {
      featureType: 'all',
      stylers: [{hue: '#ff0000'}]
    }
 ];

var ggs = new L.Google('SATELLITE', {
	mapOptions: {
		styles: styles
	}
});

var baseMaps = {
    "Open Street Maps": minimal,
    "Google Satellite Maps": ggs
};
var groupedOverlays = {
  "Overlays": {
  }
};
var layerControl = L.control.groupedLayers(baseMaps, groupedOverlays).addTo(map);

var osmGeocoder = new L.Control.OSMGeocoder();
map.addControl(osmGeocoder);

var uploadFile = L.control({position: 'topleft'});
uploadFile.onAdd = function(map) {
        this._div = L.DomUtil.create('div', 'controlBox');
        this._div.innerHTML = "<h4 class='panel-title'>Toolbox</h4>" +
        "<table><tr><td><h5>Vector Layers</h5></td></tr>"+
        "<tr><td><button type='button' class='btn btn-link' data-toggle='modal' data-target='#myModal'>Add Spatial Layer</button></td></tr>"+
        "<tr><td><h5>Geospatial Analysis</h5></td></tr>"+
        "<tr><td><button type='button' class='btn btn-link' data-toggle='modal' data-target='#nniModal'>Nearest Neighbor</button></td></tr>"+
        "<tr><td><button type='button' class='btn btn-link' data-toggle='modal' data-target='#quadModal'>Quadrat Analysis</button></td></tr>"+
        "<tr><td><button type='button' class='btn btn-link' data-toggle='modal' data-target='#kfuncModal'>Ripley's K</button></td></tr>"+
        "<tr><td><button type='button' class='btn btn-link' data-toggle='modal' data-target='#lfuncModal'>L Function</button></td></tr>"+
        "<tr><td><button type='button' class='btn btn-link' data-toggle='modal' data-target='#bufModal'>Trade Area Analysis</button></td></tr></table>";
        return this._div;
}
uploadFile.addTo(map);



L.control.scale({
        maxWidth: 200
}).addTo(map);

var files;
$('input[type=file]').on('change', prepareUpload);
function prepareUpload(event)
{
	files = event.target.files;
}
$('#upload-submit').click(function() {
	event.stopPropagation(); // Stop stuff happening
	event.preventDefault(); // Totally stop stuff happening
	alert("clicked");
	// START A LOADING SPINNER HERE

	// Create a formdata object and add the files
	var data = new FormData();
	var filename ='';
	$.each(files, function(key, value)
	{
		data.append(key, value);
		filename = value.name;
		
	});
	alert(data);
	var filePath = 'upload/'+filename;
	alert (filePath);
	var geojsonMarkerOptions = {
        radius: 8,
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };
	$.ajax({
		url: 'submit.php?files',
		type: 'POST',
		data: data,
		cache: false,
		processData: false, // Don't process the files
		contentType: false, // Set content type to false as jQuery will tell the server its a query string request
		success: function(data, textStatus, jqXHR)
		{
			alert("success");
			if(typeof data.error === 'undefined'){
				var index = filename.indexOf(".");
				var type = filename.substring(index+1);
				alert(type);
				if(type === "geojson"){
					$.getJSON(filePath,function(data){
						var layer = L.geoJson(data, {
							pointToLayer: function (feature, latlng) {
								return L.circleMarker(latlng, geojsonMarkerOptions);
							}
						});
						layerControl.addOverlay(layer,filename,"Overlays");
					});
				}
				if(type === "zip"){
					var shpfile = new L.Shapefile(filePath,{
						pointToLayer: function (feature, latlng) {
							return L.circleMarker(latlng, geojsonMarkerOptions);
						}
					});
					layerControl.addOverlay(shpfile,filename.substring(0, index),"Overlays");
				}
				$('#myModal').modal('hide');
			}
			else
			{
				// Handle errors here
				console.log('ERRORS: ' + data.error);
			}
		}
	});
});