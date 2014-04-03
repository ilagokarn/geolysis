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

var stamen = L.tileLayer.provider('Stamen.Watercolor');

var baseMaps = {
    "Open Street Maps": minimal,
    "Google Satellite Maps": ggs,
    "Stamen Watercolor": stamen
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
        "<tr><td><button type='button' class='btn btn-link' data-toggle='modal' data-target='#myModal'>Add Point Layer</button></td></tr>"+
        "<tr><td><h5>Geospatial Analysis</h5></td></tr>"+
        "<tr><td><button type='button' class='btn btn-link' data-toggle='modal' data-target='#nniModal'>Nearest Neighbor</button></td></tr>"+
        "<tr><td><button type='button' class='btn btn-link' data-toggle='modal' data-target='#quadModal'>Quadrat Analysis</button></td></tr>"+
        "<tr><td><button type='button' class='btn btn-link' data-toggle='modal' data-target='#kfuncModal'>Ripley's K Function</button></td></tr>"+
        "<tr><td><button type='button' class='btn btn-link' data-toggle='modal' data-target='#kdeModal'>Kernal Density <br/>Estimation</button></td></tr>"+
        "<tr><td><h5>Visualization <i>(beta)</i></h5></td></tr>"+
        "<tr><td><button type='button' class='btn btn-link' data-toggle='modal' data-target='#quadtreeModal'>Geo-Visual Suite</button></td></tr>";
        return this._div;
}
uploadFile.addTo(map);

var outputControl = L.control({position: 'topleft'});
outputControl.onAdd = function(map) {
        this._div = L.DomUtil.create('div', 'controlBox');
        this._div.innerHTML = "<table><tr><td><h5>Output Control</h5></td></tr>"+
        "<tr><td><button type='button' class='btn btn-link' onclick='toggleOutputDiv();'>Toggle R Output</button></td></tr></table>";
        return this._div;
}
outputControl.addTo(map);

function toggleOutputDiv() {
    $('#infoBox').fadeToggle('fast');
}

L.control.scale({
        maxWidth: 200
}).addTo(map);

//--------------------Handle File Upload---------------------
var uploadedFiles= [];
var files;
$('input[type=file]').on('change', prepareUpload);
function prepareUpload(event){
	files = event.target.files;
}
var upload;        
$('#upload-submit').click(function() {
	event.stopPropagation(); // Stop stuff happening
	event.preventDefault(); // Totally stop stuff happening
	// START A LOADING SPINNER HERE

	// Create a formdata object and add the files
	var data = new FormData();
	var filename ='';
        var sourceCrs = document.getElementById("sourceCRS").value;
        var targetCrs = document.getElementById("targetCRS").value;
        if(targetCrs === "") {targetCrs = "WGS84";}
	$.each(files, function(key, value)
	{
		data.append("upload", value);
                data.append("sourceSrs", sourceCrs);
                data.append("targetSrs", targetCrs);
                filename = value.name;
                var temp = filename.substring(0,filename.indexOf("."))
                uploadedFiles.push(temp);
        });
	var filePath = 'uploads/'+filename;
        var chosenColor = "#"+document.getElementById("pointColor").value;
        var geojsonMarkerOptions = {
        radius: 8,
        fillColor: chosenColor,
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };
	$.ajax({
            url: '/Geolysis/upload',
            type: 'POST',
            data: data,
            cache: false,
            processData: false, // Don't process the files
            contentType: false, // Set content type to false as jQuery will tell the server its a query string request
            success: function(data, textStatus, jqXHR)
            {
            if(typeof data.error === 'undefined'){
                    var index = filename.indexOf(".");
                    var type = filename.substring(index+1);
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
    $.ajax({
            url: 'http://ogre.adc4gis.com/convert',
            type: 'POST',
            data: data,
            cache: false,
            processData: false,
            contentType: false,// Don't process the files
            success: function(data, textStatus, jqXHR)
            {   
                var datastring = JSON.stringify(data);
                writeToFile(filename, datastring);
            }
    });
});

function writeToFile(filename, datastring){
    var temp = filename.substring(0,filename.indexOf("."));
    $.post('/Geolysis/write',{
        "filename": temp,
        "geojson": datastring
        },
        function(data){
            console.log(data);
        }
    );
    
}
//-----------------Handle Modal Behavior--------------------
$('#kdeModal').on('shown.bs.modal', function () {
  if(uploadedFiles.length === 0 ){
      $('#kdeModal').modal('hide');
      $('#errorModal').modal('show');
  }else{
    var du1=document.getElementById("selectKDEFile");
    document.getElementById("selectKDEFile").options.length = 0; 
    for(var i = 0; i < uploadedFiles.length; i++) {
        var opt = uploadedFiles[i];
        var el = document.createElement("option");
        el.textContent = opt;
        el.value = opt;
        du1.appendChild(el);
      }
  }
});


$('#kfuncModal').on('shown.bs.modal', function () {
  if(uploadedFiles.length === 0 ){
      $('#kfuncModal').modal('hide');
      $('#errorModal').modal('show');
  }else{
    var du1=document.getElementById("selectKfuncFile");
    document.getElementById("selectKfuncFile").options.length = 0;
    for(var i = 0; i < uploadedFiles.length; i++) {
        var opt = uploadedFiles[i];
        var el = document.createElement("option");
        el.textContent = opt;
        el.value = opt;
        du1.appendChild(el);
      }
  }
});

$('#nniModal').on('shown.bs.modal', function () {
  if(uploadedFiles.length === 0 ){
      $('#nniModal').modal('hide');
      $('#errorModal').modal('show');
  }else{
    var du1=document.getElementById("selectNNIFile");
    document.getElementById("selectNNIFile").options.length = 0;
    for(var i = 0; i < uploadedFiles.length; i++) {
        var opt = uploadedFiles[i];
        var el = document.createElement("option");
        el.textContent = opt;
        el.value = opt;
        du1.appendChild(el);
      }
  }
});

$('#quadModal').on('shown.bs.modal', function () {
  if(uploadedFiles.length === 0 ){
      $('#quadModal').modal('hide');
      $('#errorModal').modal('show');
  }else{
    var du1=document.getElementById("selectQuadFile");
    document.getElementById("selectQuadFile").options.length = 0;
    for(var i = 0; i < uploadedFiles.length; i++) {
        var opt = uploadedFiles[i];
        var el = document.createElement("option");
        el.textContent = opt;
        el.value = opt;
        du1.appendChild(el);
      }
  }
});

$('#quadtreeModal').on('shown.bs.modal', function () {
  if(uploadedFiles.length === 0 ){
      $('#quadtreeModal').modal('hide');
      $('#errorModal').modal('show');
  }else{
    var du1=document.getElementById("selectQTFile");
    document.getElementById("selectQTFile").options.length = 0;
    for(var i = 0; i < uploadedFiles.length; i++) {
        var opt = uploadedFiles[i];
        var el = document.createElement("option");
        el.textContent = opt;
        el.value = opt;
        du1.appendChild(el);
      }
  }
});


//--------------Handle Run Commands-----------------------
function kdeinitialize(){
    $("#kdeOutput").show();
    $("#nniOuput").hide();
    $("#quadOutput").hide();
    $("#kfuncOutput").hide();
    $("#kdeimg").hide();
    var chosenFile = document.getElementById("selectKDEFile").value;
    var radius = document.getElementById("kdeRadius").value;
    var kdeType = document.getElementById("kdeType").value;
    document.getElementById("kdeChosenFile").innerHTML = chosenFile;
    document.getElementById("kdeChosenWeight").innerHTML = kdeType;
    $(function() {
        $( "#slider" ).slider({
          value:radius,
          min: 0,
          max: 1000,
          step: 10,
          slide: function( event, ui ) {
            $( "#amount" ).val(ui.value );
          },
          change: function(event, ui){
              kderun();
          }
        });
        $( "#amount" ).val( $( "#slider" ).slider( "value" ) );
      });
    $('#kdeModal').modal('hide');
    kderun();
}
function kderun(){
    var filename = document.getElementById("kdeChosenFile").innerHTML;
    var kdeType = document.getElementById("kdeChosenWeight").innerHTML;
    var radius = document.getElementById("amount").value;
    $.get('/Geolysis/rservlet',{
        "algo": 'kde',
        "fileName": filename,
        "kdeRadius": radius,
        "kdeType": kdeType
        },
        function(data){
            $("#kdeloading").hide();
            document.getElementById("kdeimg").src="tempoutput/"+data;
            $("#kdeimg").show();
        }
    );
}

function kfuncrun(){
    $('#kfuncModal').modal('hide');
    $("#kfuncOutput").show();
    $("#kdeOutput").hide();
    $("#nniOuput").hide();
    $("#quadOutput").hide();
    $("#kfuncimg").hide();
    var filename = document.getElementById("selectKfuncFile").value;
    var knsim = document.getElementById("kfuncnsim").value;
    document.getElementById("kfuncFile").innerHTML = filename;
    document.getElementById("kfuncNSim").innerHTML = knsim;
    $.get('/Geolysis/rservlet',{
        "algo": 'kfunc',
        "fileName": filename,
        "knsim": knsim
        },
        function(data){
            if(data==""){
                alert("Error: nrank > 0 && nrank < nsim/2 is not TRUE <br/> Adjust nSim");
                $('#kfuncModal').modal('show');
            } else{
                $("#kfuncloading").hide();
                document.getElementById("kfuncimg").src="tempoutput/"+data;
                $("#kfuncimg").show();
            }
            
        }
    );
}
function nnirun(){
    $('#nniModal').modal('hide');
    $("#kfuncOutput").hide();
    $("#kdeOutput").hide();
    $("#nniOutput").show();
    $("#quadOutput").hide();
    var filename = document.getElementById("selectNNIFile").value;
    var k = document.getElementById("nnik").value;
    document.getElementById("nniFile").innerHTML = filename;
    document.getElementById("k").innerHTML = k;
    $.get('/Geolysis/rservlet',{
        "algo": 'nni',
        "fileName": filename,
        "k": k
        },
        function(data){
            $("#nniloading").hide();
            document.getElementById("nniresult").innerHTML=data;
        }
    );
}
function quadinitialize(){
    $('#quadModal').modal('hide');
    $("#kfuncOutput").hide();
    $("#kdeOutput").hide();
    $("#nniOutput").hide();
    $("#quadOutput").show();
    var filename = document.getElementById("selectQuadFile").value;
    var r = document.getElementById("quadR").value;
    var c = document.getElementById("quadC").value;
    document.getElementById("quadFile").innerHTML = filename;
    document.getElementById("r").value = r;
    document.getElementById("c").value = c;
    quadrun();
}

function quadrun(){
    document.getElementById("quadresult").innerHTML="";
    $("#quadloading").show();
    $("#quadimg").hide();
    var filename = document.getElementById("quadFile").innerHTML;
    var r = document.getElementById("r").value;
    var c = document.getElementById("c").value;
    $.get('/Geolysis/rservlet',{
        "algo": 'quad',
        "fileName": filename,
        "r": r,
        "c": c
        },
        function(data){
            $("#quadloading").hide();
            var t = data.split(";;");
            document.getElementById("quadimg").src="tempoutput/"+t[0];
            $("#quadimg").show();
            document.getElementById("quadresult").innerHTML=t[1];
        }
    );
    
}

function addSuite(){
    var data={}, layers={}, fills =[
    "rgb(197,27,125)",
	"rgb(222,119,174)",
	"rgb(213, 62, 79)",
	"rgb(84, 39, 136)",
	"rgb(247,64,247)",
	"rgb(244, 109, 67)",
	"rgb(184,225,134)",
	"rgb(127,188,65)",
	"rgb(69, 117, 180)"
];
    $('#quadtreeModal').modal('hide');
    var filename = document.getElementById("selectQTFile").value;
    var ogr = "uploads/"+filename+".geojson";
    d3.json(ogr, dealwithData);
    function dealwithData(oa){
            data.json= oa.features.map(function(v){
            return [v.geometry.coordinates[1],v.geometry.coordinates[0]];
            });
            
        delaunay();
        clusters();
        quadtree();
    }
    function delaunay(){
        data.delaunay = d3.geom.delaunay(data.json);
        layers.delaunay = L.layerGroup(data.delaunay.map(function(v){
                    return L.polygon(v,{stroke:false,fillOpacity:0.7,color:fills[Math.floor((Math.random()*9))]})
            }));
            layerControl.addOverlay(layers.delaunay,filename.substring(0,3)+" voronoi","Overlays");
    }
    function clusters(){
        layers.clusters= new L.MarkerClusterGroup();
            layers.clusters.addLayers(data.json.map(function(v){
                    return L.marker(L.latLng(v));
            }));
            layerControl.addOverlay(layers.clusters,filename.substring(0,3)+" clusters","Overlays");
    }
    function quadtree(){
        data.quadtree = d3.geom.quadtree(data.json.map(function(v){return {x:v[0],y:v[1]};}));
            layers.quadtree = L.layerGroup();
            data.quadtree.visit(function(quad, lat1, lng1, lat2, lng2){
                    layers.quadtree.addLayer(L.rectangle([[lat1,lng1],[lat2,lng2]],{fillOpacity:0,weight:1,color:"#000",clickable:false}));
            });
            layerControl.addOverlay(layers.quadtree,filename.substring(0,3)+" quadtree","Overlays");
    }

}


