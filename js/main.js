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

var osmGeocoder = new L.Control.OSMGeocoder();
map.addControl(osmGeocoder);

var uploadFile = L.control({position: 'topleft'});
uploadFile.onAdd = function(map) {
        this._div = L.DomUtil.create('div', 'controlBox');
        this._div.innerHTML = "<h4 class='panel-title'>Add New Layer</h4>" +
        "<button type='button' class='btn btn-default' data-toggle='modal' data-target='#myModal'>Upload Spatial Data</button>";
        return this._div;
}
uploadFile.addTo(map);



L.control.scale({
        maxWidth: 200
}).addTo(map);
	
        
        
// Adding layer to map

$('#upload-submit').click(function() {
    alert("upload submit");
    var data = new FormData();
    var filename = "";
    jQuery.each($('#file')[0].files, function(i, file) {
        data.append('file-'+i, file);
            filename = file.name;
    });
    $.ajax({
        url: 'upload.php',
        data: data,
        cache: false,
        contentType: false,
        processData: false,
        type: 'POST',
        success: function(data){
        if(data === "true") {
                var filePath = "file/" + filename;
                console.log(filePath);
                $.getJSON(filePath,function(data){
                        var newLayer = L.geoJson(data, {
                                onEachFeature: onEachFeature
                        }).addTo(map);
                });
        }
        $('#myModal').modal('hide');
    }
    });
});
