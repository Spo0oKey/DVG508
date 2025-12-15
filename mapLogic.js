//MAPTILER
//maptilersdk.config.apiKey = '4oXeihv8TRlNgvDIP168';
//const key = '4oXeihv8TRlNgvDIP168';

var map = L.map("map", { zoomControl: false }).setView([57.5, 18.78], 9);

var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

//Geojson style
function gotlandStyle(feature) {
	return {
		fillColor: "rgba(255,255,255,0.2)",
		fillOpacity: 0.2,
		color: "rgba(0,0,0,0.5)",
		weight: 4,
	};
}

const geojsonGotland = new L.GeoJSON.AJAX("https://api.maptiler.com/data/b8a04b8f-0a30-41e0-8b2a-081aa2153fbd/features.json?key=4oXeihv8TRlNgvDIP168", {
	onEachFeature: popupPoly,
	style: gotlandStyle
});

var typeOfTool = document.getElementById("tool").value;
tool.addEventListener("change", function () {
	typeOfTool = document.getElementById("tool").value;
});

var distanceForBuffer = document.getElementById("bufferDist").value;
bufferDist.addEventListener("change", function () {
	distanceForBuffer = document.getElementById("bufferDist").value;
});

const button = document.getElementById("clear");

// Add a click event listener
button.addEventListener("click", function () {
	clearAll();
});
function roadStyle(feature) {
	return {
		//fillColor: "#FF00FF",
		fillOpacity: 0.5,
		//color: '#B04173',
		color: 'rgba(0,0,0,0.7)',
		weight: 6
	};
}

$.ajax('http://localhost:8086/geoserver/wfs', {
	type: 'GET',
	data: {
		service: 'WFS',
		version: '1.1.0',
		request: 'GetFeature',
		typename: 'sweden:vagData',
		srsname: 'EPSG:4326',
		outputFormat: 'text/javascript',
	},
	dataType: 'jsonp',
	jsonpCallback: 'callback:handleRoadsJson',
	jsonp: 'format_options'
});
var roadLayerData = new L.GeoJSON(null, {
	style: roadStyle(),
});

function handleRoadsJson(data1) {
	roadLayerData.addData(data1); //.addTo(map)
	map.fitBounds(roadLayerData.getBounds());
}

var radjurMarkers = [];

var RIcon = L.icon({
	iconUrl: 'icons/deer.svg',
	iconSize: [2, 2],
});

var CIcon = L.icon({
	iconUrl: 'icons/chanterelle.svg',
	iconSize: [15, 15],
});

function toolChooser(e) {
	if (typeOfTool == "buffer") {
		if (distanceForBuffer == "choose") {
			alert("Välj ett värde för buffer distansen");
		} else calculateBufferZone(e);
	} else if (typeOfTool == "near") {
		calculateNearAnalysis(e);
	}
	zoomToFeature(e);
}

function zoomToFeature(e) {
	var lat = e.target.getLatLng().lat;
	var lon = e.target.getLatLng().lng;

	map.flyTo([lat, lon], 13);
}
/*
//Geoserver Web Feature Service for radjur
$.ajax('http://localhost:8086/geoserver/wfs', {
	type: 'GET',
	data: {
		service: 'WFS',
		version: '1.1.0',
		request: 'GetFeature',
		typename: 'sweden:radjur',
		//CQL_FILTER: "NAME_1 LIKE 'V%'",
		srsname: 'EPSG:4326',
		outputFormat: 'text/javascript',
	},
	dataType: 'jsonp',
	jsonpCallback: 'callback:handleJsonRadjur',
	jsonp: 'format_options'
});
*/
$.ajax('data/radjur.geojson', {
    dataType: 'json',
    success: handleJsonRadjur,
    error: function(xhr, status, error) {
        console.error("Kunde inte ladda lokal GeoJSON-fil:", status, error);
    }
});
var layerDataRadjur = new L.GeoJSON(null, {
	onEachFeature: radjurOnEachFeature,
	pointToLayer: function (feature, latlng) {
		return (L.circleMarker(latlng, determineStyle(feature))); //return L.marker(latlng, {icon: iconPath});
	}
});

function handleJsonRadjur(data1) {
	layerDataRadjur.addData(data1).addTo(map);
	//map.fitBounds(layerDataRadjur.getBounds());
}

function radjurOnEachFeature(feature, layer) {
	popup(feature, layer)
	layer.on({
		click: toolChooser
	});
}

$.ajax('data/kantareller.geojson', {
    dataType: 'json',
    success: handleJsonKantareller,
    error: function(xhr, status, error) {
        console.error("Kunde inte ladda lokal GeoJSON-fil:", status, error);
    }
});

var layerDataKantareller = new L.GeoJSON(null, {
	onEachFeature: kantarellerOnEachFeature,
	pointToLayer: function (feature, latlng) {
		return (L.circleMarker(latlng, determineStyle(feature))); //return L.marker(latlng, {icon: iconPath});
	}
});

function handleJsonKantareller(data1) {
	layerDataKantareller.addData(data1).addTo(map);
	//map.fitBounds(layerDataKantareller.getBounds());
}

function kantarellerOnEachFeature(feature, layer) {
	popup(feature, layer)
	layer.on({
		click: toolChooser
	});
}

$.ajax('data/trattisar.geojson', {
    dataType: 'json',
    success: handleJsonTrattisar,
    error: function(xhr, status, error) {
        console.error("Kunde inte ladda lokal GeoJSON-fil:", status, error);
    }
});

var layerDataTrattisar = new L.GeoJSON(null, {
	onEachFeature: trattisarOnEachFeature,
	pointToLayer: function (feature, latlng) {
		return (L.circleMarker(latlng, determineStyle(feature))); //return L.marker(latlng, {icon: iconPath});
	}
});

function handleJsonTrattisar(data1) {
	layerDataTrattisar.addData(data1).addTo(map);
	//map.fitBounds(layerDataTrattisar.getBounds());
}

function trattisarOnEachFeature(feature, layer) {
	popup(feature, layer)
	layer.on({
		click: toolChooser
	});
}

//========================================================== DATA

function popup(feature, layer) {
	var species = feature.properties.species;
	var count = feature.properties.individual;
	var year = feature.properties.year;
	var month = feature.properties.month;
	var day = feature.properties.day;
	var date = year + "-" + month + "-" + day;
	var recordedBy = feature.properties.recordedby;
	var popupContent, toolTipContent;
	if (count == null || count =="") count = 1;

	var name = species;
	var link = "https://www.google.com/search?q=";
	for (var i = 0; i < name.length; i++) {
		if (name[i] == " ") link += "+";
		else link += name[i];
	}
	if (species == "Capreolus capreolus") {
		popupContent = "<img src='https://cdn.pixabay.com/photo/2019/10/30/16/17/animal-4589923_1280.jpg' width='250px' height='200px' style='border-radius:50%'>";
		//toolTipContent = ""; 
	} else if (species == "Craterellus tubaeformis") {
		popupContent = "<img src='https://cdn.pixabay.com/photo/2017/10/02/21/43/mushroom-2810448_1280.jpg' width='250px' height='200px' style='border-radius:50%'>";
		//toolTipContent = ""; 
	} else if (species == "Cantharellus cibarius") {
		popupContent = "<img src='https://cdn.pixabay.com/photo/2016/02/11/19/46/fungus-1194380_1280.jpg' width='250px' height='200px' style='border-radius:50%'>";
		//toolTipContent = ""; 
	} else {
		console.log('Unknown species', species)
		return;
	}
	
	popupContent += "<br><b>" + count + "</b> stycken " + "<a target='_blank' href=" + link + ">" + name + "</a>" + " observerade<br><br><b>Datum:</b> " + date + "<br><b>Observerad av:</b> " + recordedBy;
	toolTipContent = "<h4>" + species + "</h4>";

	layer.bindPopup(popupContent);
	layer.bindTooltip(toolTipContent, { noHide: true }).open;
}

function popupPoly(feature, layer) {
	//layer.bindPopup("");
	layer.bindTooltip("<h4>" + feature.properties.NAME_1 + "</h4>", { noHide: true }).open;
}

function determineStyle(feature) {
	var color, radius, fillColor;
	var species = feature.properties.species;
	var count = feature.properties.individual;

	if (species == "Capreolus capreolus") {
		let element = document.querySelector('.radjur');
		let colorStyle = window.getComputedStyle(element).backgroundColor;
		color = colorStyle;
		colorStyle = colorStyle.replace(".8", ".2")
		fillColor = colorStyle;
	} else if (species == "Craterellus tubaeformis") {
		let element = document.querySelector('.trattisar');
		let colorStyle = window.getComputedStyle(element).backgroundColor;
		color = colorStyle;
		colorStyle = colorStyle.replace(".8", ".2")
		fillColor = colorStyle;
	} else if (species == "Cantharellus cibarius") {
		let element = document.querySelector('.kantareller');
		let colorStyle = window.getComputedStyle(element).backgroundColor;
		color = colorStyle;
		colorStyle = colorStyle.replace(".8", ".2")
		fillColor = colorStyle;
	} else {
		console.log('Unknown species', species)
		return;
	}

	if (count != null) radius = count;
	else radius = 1;

	return { color: color, radius: radius, fillColor: fillColor, weight: 8, opacity: 1, fillOpacity: 0.6 };
}

var basemaps = {
	"OSM": osm,
};

var overlays = {
	"Gotland": geojsonGotland,
	"Rådjur": layerDataRadjur,
	"Kantareller": layerDataKantareller,
	"Trattkantareller": layerDataTrattisar,
	"Vägar": roadLayerData
};

var layersControl = L.control.layers
	(
		basemaps,
		overlays,
		{ collapsed: true, position: "topleft" }
	).addTo(map);

// filtrera på år
function filterByYear(year, type) {
	if (type == "radjur") layerDataRadjur.clearLayers();
	else if (type == "kantareller") layerDataKantareller.clearLayers();
	else if (type == "trattisar") layerDataTrattisar.clearLayers();

	loadLocalGeoJsonAndFilter(type, year)
}

function loadLocalGeoJsonAndFilter(type, year) {

    var filename = 'data/' + type + '.geojson';
    
    $.ajax(filename, {
        dataType: 'json', 
        success: function(fullGeoJsonData) {
            
            var filteredFeatures = fullGeoJsonData.features.filter(function(feature) {

                var targetYear = String(year); 
                return String(feature.properties.year) === targetYear;
            });

            var filteredGeoJson = {
                type: 'FeatureCollection',
                features: filteredFeatures
            };
            
            if (type == "kantareller") handleJsonKantareller(filteredGeoJson);
			else if (type == "trattisar") handleJsonTrattisar(filteredGeoJson);
			else handleJsonRadjur(filteredGeoJson)
        },
        error: function(xhr, status, error) {
            console.error("Kunde inte ladda GeoJSON-fil:", filename, status, error);
        }
    });
}

// filtrera på intervall
function filterByInterval(from, to, type) {
	if (type == "radjur") layerDataRadjur.clearLayers();
	else if (type == "kantareller") layerDataKantareller.clearLayers();
	else if (type == "trattisar") layerDataTrattisar.clearLayers();
	console.log(to < from)
	if (to < from) {
		var temp = to;
		to = from;
		from = temp;
	}

	loadLocalGeoJsonAndFilterRange(type, from, to)
}

function loadLocalGeoJsonAndFilterRange(type, from, to) {

    var filename = 'data/' + type + '.geojson';
    
    $.ajax(filename, {
        dataType: 'json', 
        success: function(fullGeoJsonData) {
            
            var filteredFeatures = fullGeoJsonData.features.filter(function(feature) {
                
                var startYear = parseInt(from);
                var endYear = parseInt(to);
                
                var featureYear = parseInt(feature.properties.year);
                
                return (featureYear >= startYear && featureYear <= endYear);
            });

            var filteredGeoJson = {
                type: 'FeatureCollection',
                features: filteredFeatures
            };
            if (type == "kantareller") handleJsonKantareller(filteredGeoJson);
			else if (type == "trattisar") handleJsonTrattisar(filteredGeoJson);
			else handleJsonRadjur(filteredGeoJson)
        },
        error: function(xhr, status, error) {
            console.error("Kunde inte ladda GeoJSON-fil:", filename, status, error);
        }
    });
}

function addFilterControlBtn() {
	var filterControlBtn = document.createElement("div");
	filterControlBtn.classList.add("openFilterToolBtn");
	document.body.appendChild(filterControlBtn);
	filterControlBtn.innerHTML = "Filter verktyg"
	filterControlBtn.setAttribute("onClick", "openFilterTool()");
}

addFilterControlBtn();

function addFilterControl() {
	// add filter control to document body
	var filterControl = document.createElement("div");
	filterControl.classList.add("filterControl");
	//var btn = document.querySelector(".openFilterToolBtn")
	//btn.appendChild(filterControl);
	document.body.appendChild(filterControl);

	var btn = document.createElement("button");
	filterControl.appendChild(btn);
	btn.classList.add("closeBtn");
	btn.innerHTML = "Stäng verktyget"
	btn.setAttribute("onClick", "closeFilterTool()")

	// add stuff to filter control
	var radjurYears = [];
	var kantarellerYears = [];
	var trattisarYears = [];

	layerDataRadjur.eachLayer(function (layer) { radjurYears.push(layer.feature.properties.year) });
	layerDataKantareller.eachLayer(function (layer) { kantarellerYears.push(layer.feature.properties.year) });
	layerDataTrattisar.eachLayer(function (layer) { trattisarYears.push(layer.feature.properties.year) });

	radjurYears.sort();
	kantarellerYears.sort();
	trattisarYears.sort();

	// radjur
	var filterControlRadjur = addFilterControlInner("radjur", radjurYears, filterControl);

	// kantareller
	var filterControlKantareller = addFilterControlInner("kantareller", kantarellerYears, filterControl);

	// trattisar
	var filterControlTrattisar = addFilterControlInner("trattisar", trattisarYears, filterControl);
}

function closeFilterTool() {
	var filterControl = document.querySelector('.filterControl');
	while (filterControl.hasChildNodes()) {
		filterControl.removeChild(filterControl.firstChild);
	}
	filterControl.remove();
	var btn = document.querySelector(".openFilterToolBtn")
	btn.style.visibility = "visible";
}

function openFilterTool() {
	var btn = document.querySelector(".openFilterToolBtn")
	btn.style.visibility = "hidden";
	addFilterControl();
}

function addFilterControlInner(type, years, filterControl) {
	// inner div
	var filterControlInner = document.createElement("div");
	filterControlInner.classList.add("filterControlInner");
	filterControl.appendChild(filterControlInner);

	// header
	var header = document.createElement("p");
	header.innerHTML = "<b>Filtrera " + type + "</b>";
	filterControlInner.appendChild(header)

	// select list
	filterControlInner.appendChild(makeSelectList(type + "From", years));
	filterControlInner.appendChild(makeSelectList(type + "To", years));

	// fixed styling
	var filterControlInner2 = document.createElement("div");
	filterControlInner2.classList.add("filterControlInner");
	filterControl.appendChild(filterControlInner2);

	// radio btn+label year
	filterControlInner2.appendChild(makeRadioBtn(type + "_RadioYear", type + "_Radio", "År"));
	filterControlInner2.appendChild(makeLabel(type + "_RadioYear", "År"));

	// fixed styling
	var filterControlInner3 = document.createElement("div");
	filterControlInner3.classList.add("filterControlInner");
	filterControl.appendChild(filterControlInner3);

	// radio btn+label interval
	filterControlInner3.appendChild(makeRadioBtn(type + "_RadioInterval", type + "_Radio", "Intervall"));
	filterControlInner3.appendChild(makeLabel(type + "_RadioInterval", "Intervall"));

	// fixed styling
	var filterControlInner4 = document.createElement("div");
	filterControlInner4.classList.add("filterControlInner");
	filterControl.appendChild(filterControlInner4);

	// filter btn
	var btn = document.createElement("button");
	btn.classList.add("filterControlBtn");
	filterControlInner4.appendChild(btn);
	btn.innerHTML = "Filtrera";
	btn.setAttribute("id", type + "_filterBtn")
	btn.addEventListener("click", function () {
		// antingen denna lösning eller förmodligen en knapp som är "utför filtrering" yee bby
		handleFilterBtnClick(btn.id);
	});

	return filterControlInner;
}

function makeRadioBtn(id, name, value) {
	var radioBtn = document.createElement("input");
	radioBtn.setAttribute("type", "radio");
	radioBtn.setAttribute("id", id);
	radioBtn.setAttribute("name", name);
	radioBtn.setAttribute("value", value);

	if (value == "Intervall") radioBtn.checked = true;

	radioBtn.addEventListener("change", function (e) {
		handleRadioChange(e);
	});

	return radioBtn;
}

function makeLabel(id, txt) {
	var label = document.createElement("label");
	label.setAttribute("for", id);
	var text = document.createTextNode(txt);
	label.appendChild(text);

	return label;
}

function makeSelectList(type, options) {
	var selectList = document.createElement("select");
	selectList.setAttribute("id", type + "_Select");
	var parsed = [];
	options.forEach(option => {
		if (!parsed.includes(option) || parsed.length == 0) {
			var op = document.createElement("option");
			op.setAttribute("value", option);

			var opText = document.createTextNode(option);
			op.appendChild(opText);

			selectList.appendChild(op);
			parsed.push(option);
		}
	});

	if (type.includes("To")) selectList.value = options[options.length - 1];

	return selectList;
}

function handleRadioChange(e) {
	var id = e.target.id;
	id = id.slice(0, id.indexOf("_")) + "From_Select";
	var value = e.target.value;
	if (value == "År") document.getElementById(id).setAttribute("disabled", true);
	else document.getElementById(id).removeAttribute("disabled");
}

function handleFilterBtnClick(id) {
	id = id.slice(0, id.indexOf("_"))
	var from = document.getElementById(id + "From_Select");
	var to = document.getElementById(id + "To_Select");

	if (from.disabled) filterByYear(to.value, id);
	else filterByInterval(from.value, to.value, id);

	if (from.disabled) alert("Filtrerade: " + id + ", " + to.value)
	else alert("Filtrerade: " + id + ", " + from.value + " -> " + to.value)
}

function handleToolChange(value) {
	//console.log(value)
	makeBufferElemsVisible();
	clearAll();
	var buffDist = document.getElementById("bufferDist");
	if (value == "buffer") {
		buffDist.removeAttribute("disabled");
		buffDist.classList.remove("disabled");
	} else if (value == "near") {
		buffDist.setAttribute("disabled", true);
		buffDist.classList.add("disabled");
	} else {
		buffDist.value = "choose";
		buffDist.setAttribute("disabled", true);
		buffDist.classList.add("disabled");
	}
}

function makeBufferElemsVisible() {
	//document.getElementById('bufferDist').style.visibility = 'visible';
	//document.querySelector('.bufferControlInnerInner').style.visibility = 'visible';
	//document.querySelector('.bufferControlInner').style.visibility = 'visible';
	//document.getElementById('clear').style.visibility = 'visible';
	var parent = document.querySelector(".bufferControl");
	var childs = parent.getElementsByTagName('*');
	parent.style.visibility = 'visible';
	for (i = 0; i < childs.length; i++) {
		childs[i].style.visibility = 'visible';
	}
}

function makeBufferElemsHidden() {
	document.getElementById('bufferDist').style.visibility = 'hidden';
	document.querySelector('.bufferControlInnerInner').style.visibility = 'hidden';
	document.getElementById('clear').style.visibility = 'hidden';
}
/*
// trälig lösning på async problem
var interval = setInterval(() => {
	if (layerDataRadjur && layerDataKantareller && layerDataTrattisar) {
		clearInterval(interval);
		addFilterControl();
	}
}, 1000);
*/
makeBufferElemsHidden();
closeBufferTool();
function closeBufferTool() {
	clearAll();
	document.querySelector(".openBufferToolBtn").style.visibility = "visible";
	var tool = document.getElementById('tool');
	tool.value = "choose";
	handleToolChange("choose");
	typeOfTool = "choose";
	distanceForBuffer = "choose";

	var parent = document.querySelector(".bufferControl");
	var childs = parent.getElementsByTagName('*');
	parent.style.visibility = 'hidden';
	for (i = 0; i < childs.length; i++) {
		childs[i].style.visibility = 'hidden';
	}
}

function openBufferTool() {
	document.querySelector(".openBufferToolBtn").style.visibility = "hidden";
	/*
	var parent = document.querySelector(".bufferControl");
	var childs = parent.getElementsByTagName('*');
	parent.style.visibility = 'visible';
	for(i = 0; i < childs.length; i++) {
		childs[i].style.visibility = 'visible';
	}
	*/
	document.querySelector(".bufferControl").style.visibility = 'visible';
	var parent = document.getElementById("1");
	var children = parent.getElementsByTagName('*');
	parent.style.visibility = 'visible';
	for (i = 0; i < children.length; i++) {
		if (children[i].id == "bufferDist") break;
		//console.log(children[i])
		children[i].style.visibility = 'visible';
	}
	document.querySelector(".closeBtn").style.visibility = 'visible';
	document.getElementById("2").style.visibility = 'visible';
}
//===============================================================#ClEAR
function clearAll(e) {
	if (geojsonBufferPoints != undefined) {
		map.removeLayer(geojsonBufferPoints);
	}
	if (geojsonBufferLines != undefined) {
		map.removeLayer(geojsonBufferLines);
	}
	if (buffer != undefined) {
		map.removeLayer(buffer);
	}
	if (geojsonNearPoints != undefined) {
		map.removeLayer(geojsonNearPoints);
	}
	if (geojsonNearLine != undefined) {
		map.removeLayer(geojsonNearLine);
	}
	if (tempPoint != undefined) {
		map.removeLayer(tempPoint);
	}
	map.flyTo([57.5, 18.78], 9);
}
//===============================================================#NEAR
var geojsonNearPoints;
var geojsonNearLine;
var highNumber = 10000000;
var nearElements = [];
function calculateNearAnalysis(e) {
	if (geojsonNearPoints != undefined) {
		map.removeLayer(geojsonNearPoints);
	}
	if (geojsonNearLine != undefined) {
		map.removeLayer(geojsonNearLine);
	}
	if (tempPoint != undefined) {
		map.removeLayer(tempPoint);
	}
	nearElements.length = 0;
	const checkboxes = document.querySelectorAll('input[name="option"]:checked');
	const values = Array.from(checkboxes).map(cb => cb.value);
	layer = e.target;
	var latlng = layer.getLatLng();
	xy = [latlng.lat, latlng.lng];  //clicked coordinate
	var theRadius = Number(10000);
	var points = [];
	var road;
	var pointData = [];
	var lineData;
	for (var i = 0; i < values.length; i++) {
		if (values[i] != "vag") {
			if (values[i] == "radjur") {
				pointData.push(layerDataRadjur);
			} else if (values[i] == "trattisar") {
				pointData.push(layerDataTrattisar);
			} else pointData.push(layerDataKantareller);
		} else lineData = roadLayerData;
	}
	var closestDist;

	for (var i = 0; i < pointData.length; i++) {
		closestDist = null;
		var point;
		var typeOFData;
		var hasSetType = false;
		pointData[i].eachLayer(function (layer) {
			if (!hasSetType) {
				hasSetType = true;
				var species = layer.feature.properties.species;
				if (species == "Capreolus capreolus") {
					typeOFData = "rådjur";
				} else if (species == "Craterellus tubaeformis") {
					typeOFData = "trattis";
				} else if (species == "Cantharellus cibarius") {
					typeOFData = "kantarell";
				}
			}
			// Lat, long of current point as it loops through.
			layer_lat_long = layer.getLatLng();
			// All distances to the clicked point to earthquakes points
			distance_from_centerPoint = layer_lat_long.distanceTo(xy);
			if (distance_from_centerPoint == 0) distance_from_centerPoint = highNumber
			//console.log("Distance " + distance_from_centerPoint);

			// See if the point is within the radius, add the to array
			if (distance_from_centerPoint <= theRadius) {
				if (closestDist != null) {
					if (closestDist > distance_from_centerPoint) {
						closestDist = Number(distance_from_centerPoint);
						point = layer.feature
					}
				} else {
					closestDist = Number(distance_from_centerPoint);
					point = layer.feature
				}
			}
		});
		if (point != undefined) {
			points.push(point);
			var distance = closestDist;
			if (distance != null) distance = distance.toFixed(2);
			nearElements.push([typeOFData, distance]);
		}
	}
	closestDist = null;
	lineData.eachLayer(function (layer) {
		// Lat, long of current point as it loops through.
		layer_lat_long = layer.getLatLngs();
		var distance_from_centerPoint = []
		for (var i = 0; i < layer_lat_long[0].length; i++) {
			var dist = layer_lat_long[0][i].distanceTo(xy);
			distance_from_centerPoint.push(dist);
		}

		//console.log("Distance " + distance_from_centerPoint);

		// See if the point is within the radius, add the to array
		for (var i = 0; i < distance_from_centerPoint.length; i++) {
			if (distance_from_centerPoint[i] <= theRadius) {
				if (closestDist != null) {
					if (closestDist > distance_from_centerPoint[i]) {
						closestDist = Number(distance_from_centerPoint[i]);
						road = layer.feature
					}
				} else {
					closestDist = Number(distance_from_centerPoint[i]);

					road = layer.feature
				}
			}
		}
	});
	if (road != undefined) {
		var distance = closestDist;
		if (distance != null) distance = distance.toFixed(2);
		nearElements.push(["väg", distance]);
	}
	if (road != undefined) {
		geojsonNearLine = L.geoJson(road, {
			onEachFeature: tempNearLinePopup,
			style: function (feature) {
				return {
					color: 'rgba(31, 158, 0, 0.8)',
					weight: 7,
					fillOpacity: 0.5
				};
			}
		});
		
		//Add selected points back into map as green circles.
		map.addLayer(geojsonNearLine);
	}
	if (points != undefined) {
		geojsonNearPoints = L.geoJson(points, {
			onEachFeature: tempNearPopup,

			pointToLayer: function (feature, latlng) {
				var radius = Number(feature.properties.individual);
				radius += 6;
				if (radius == null) radius = 7;
				return L.circleMarker(latlng, {
					radius: radius, //expressed in pixels circle size
					color: "rgba(0, 162, 255, 0.8)",
					stroke: true,
					weight: 1.5,		//outline width  increased width to look like a filled circle.
					fillOpcaity: 0,
					opacity: 1

				});
			}
		});
		//Add selected points back into map as green circles.
		map.addLayer(geojsonNearPoints);
	}

	tempPoint = new L.GeoJSON(layer.feature, {
		pointToLayer: function (feature, latlng) {
			return (L.circleMarker(latlng, determineStyle(feature))); //return L.marker(latlng, {icon: iconPath});
		}
	});
	map.addLayer(tempPoint);
	popupContent = "<h3>Resultatet av Near analysen blev</h3>";
	for (var i = 0; i < nearElements.length; i++) {
		popupContent += "<h4>Närmsta " + nearElements[i][0] + " är " + nearElements[i][1] + " meter ifrån den valda punkten</h4>"
	}
	tempPoint.bindPopup(popupContent).openPopup();
}
//===============================================================#BUFFER

var geojsonBufferPoints;
var geojsonBufferLines;
var buffer;
var bufferElements = [];
var tempPoint;
function calculateBufferZone(e) {
	if (geojsonBufferPoints != undefined) {
		map.removeLayer(geojsonBufferPoints);
	}
	if (geojsonBufferLines != undefined) {
		map.removeLayer(geojsonBufferLines);
	}
	if (buffer != undefined) {
		map.removeLayer(buffer);
	}
	if (tempPoint != undefined) {
		map.removeLayer(tempPoint);
	}
	bufferElements.length = 0;
	const checkboxes = document.querySelectorAll('input[name="option"]:checked');
	const values = Array.from(checkboxes).map(cb => cb.value);
	layer = e.target
	var latlng = layer.getLatLng();
	xy = [latlng.lat, latlng.lng];  //clicked coordinate
	var theRadius = Number(distanceForBuffer);
	var points = [];
	var roads = [];
	var pointData = [];
	var lineData;
	for (var i = 0; i < values.length; i++) {
		if (values[i] != "vag") {
			if (values[i] == "radjur") {
				pointData.push(layerDataRadjur);
			} else if (values[i] == "trattisar") {
				pointData.push(layerDataTrattisar);
			} else pointData.push(layerDataKantareller);
		} else lineData = roadLayerData;
	}
	for (var i = 0; i < pointData.length; i++) {
		var count = 0;
		var typeOFData;
		var hasSetType = false;
		pointData[i].eachLayer(function (layer) {
			if (!hasSetType) {
				//alert(count)
				hasSetType = true;
				var species = layer.feature.properties.species;
				if (species == "Capreolus capreolus") {
					typeOFData = "rådjur";
				} else if (species == "Craterellus tubaeformis") {
					typeOFData = "trattisar";
				} else if (species == "Cantharellus cibarius") {
					typeOFData = "kantareller";
				}
			}
			// Lat, long of current point as it loops through.
			layer_lat_long = layer.getLatLng();
			// All distances to the clicked point to earthquakes points
			distance_from_centerPoint = layer_lat_long.distanceTo(xy);
			if (distance_from_centerPoint == 0) distance_from_centerPoint = highNumber
			//console.log("Distance " + distance_from_centerPoint);

			// See if the point is within the radius, add the to array
			if (distance_from_centerPoint <= theRadius) {
				points.push(layer.feature);

				count++;
			}
		});
		bufferElements.push([typeOFData, count]);
	}
	if (lineData != undefined) {
		var foundRoad = false;
		lineData.eachLayer(function (layer) {
			// Lat, long of current point as it loops through.
			layer_lat_long = layer.getLatLngs();
			var distance_from_centerPoint = []
			for (var i = 0; i < layer_lat_long[0].length; i++) {
				var dist = layer_lat_long[0][i].distanceTo(xy);
				distance_from_centerPoint.push(dist);
			}

			//console.log("Distance " + distance_from_centerPoint);

			// See if the point is within the radius, add the to array
			for (var i = 0; i < distance_from_centerPoint.length; i++) {
				if (distance_from_centerPoint[i] <= theRadius && !foundRoad) {
					foundRoad = true
					roads.push(layer.feature);
				}
			}
			foundRoad = false;
		});
		bufferElements.push(["vägar", roads.length])
	}

	
	if (roads.length != 0) {
		geojsonBufferLines = L.geoJson(roads, {
			style: function (feature) {
				return {
					color: 'rgba(31, 158, 0, 0.8)',
					weight: 7,
					fillOpacity: 0.5
				};
			}
		});
		//Add selected points back into map as green circles.
		map.addLayer(geojsonBufferLines);
	}
	buffer = L.circle(xy, theRadius, {
		color: 'rgba(0, 4, 139, 0.8)',
		fillOpacity: 0,
		opacity: 0.5,
		weight: 9
	}).addTo(map);
	if (points.length != 0) {
		geojsonBufferPoints = L.geoJson(points, {
			onEachFeature: tempPopup,

			pointToLayer: function (feature, latlng) {
				var radius = Number(feature.properties.individual);
				radius += 6;
				if (radius == null) radius = 7;
				return L.circleMarker(latlng, {
					radius: radius, //expressed in pixels circle size
					color: "rgba(0, 162, 255, 0.8)",
					stroke: true,
					weight: 1.5,		//outline width  increased width to look like a filled circle.
					fillOpcaity: 0,
					opacity: 1

				});
			}

		});
		//Add selected points back into map as green circles.
		map.addLayer(geojsonBufferPoints);


	}
	
	tempPoint = new L.GeoJSON(layer.feature, {
		pointToLayer: function (feature, latlng) {
			return (L.circleMarker(latlng, determineStyle(feature))); //return L.marker(latlng, {icon: iconPath});
		}
	});
	map.addLayer(tempPoint);
	popupContent = "<h3>Inför buffern finns det </h3>";
	for (var i = 0; i < bufferElements.length; i++) {
		popupContent += "<h4>" + bufferElements[i][1] + " st " + bufferElements[i][0] + "</h4>"
	}
	tempPoint.bindPopup(popupContent).openPopup();
}

function tempPopup(feature, layer) {
	layer.bindTooltip("<h4>" + layer.feature.properties.species + "</h4>", { noHide: true }).open;
}

function tempNearPopup(feature, layer) {
	var dist;
	var species = layer.feature.properties.species;
	if (species == "Capreolus capreolus") {
		for (var i = 0; i < nearElements.length; i++) {
			if (nearElements[i][0] == "rådjur") dist = nearElements[i][1];
		}
	} else if (species == "Craterellus tubaeformis") {
		for (var i = 0; i < nearElements.length; i++) {
			if (nearElements[i][0] == "trattis") dist = nearElements[i][1];
		}
	} else if (species == "Cantharellus cibarius") {
		for (var i = 0; i < nearElements.length; i++) {
			if (nearElements[i][0] == "kantarell") dist = nearElements[i][1];
		}
	}
	layer.bindTooltip("<h4>" + species + "</h4>"+dist+" meter från den valda punkten", { noHide: true }).open;
}

function tempNearLinePopup(feature, layer) {
	var dist;
	for (var i = 0; i < nearElements.length; i++) {
		if (nearElements[i][0] == "väg") dist = nearElements[i][1];
	}

	layer.bindTooltip("<h4>väg</h4>" + dist + " meter från den valda punkten", { noHide: true }).open;
}
