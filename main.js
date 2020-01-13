
//GLOBAL

// MAP TAB
function showRoutes()
{
  let routeList = mainMap.routeList;
  for (let i = 0;i < routeList-1; i++)
  {

  }
}
showRoutes();
///////////////////////////////// SHIP TAB ////////////////////////////////////
function viewAvailableShip(index)
{
  document.getElementById("shipInfoCard").style.visibility = "visible";
	let selectedShip = mainFleet.getAvailableShip(index);
	document.getElementById("shipNameCard").innerText = selectedShip.name;
	document.getElementById("shipSpeedCard").innerText = selectedShip.speed + " (knots)";
	document.getElementById("shipRangeCard").innerText = selectedShip.range + " (km)";
	document.getElementById("shipDescCard").innerText = selectedShip.desc;
	document.getElementById("shipCostCard").innerText = selectedShip.cost + "/km";
	document.getElementById("shipStatusCard").innerText = selectedShip.status;
	document.getElementById("shipCommentsCard").innerText = selectedShip.comments;
}

function viewActiveShip(index)
{
  document.getElementById("shipInfoCard").style.visibility = "visible";
	let selectedShip = mainFleet.getActiveShip(index);
	document.getElementById("shipNameCard").innerText = selectedShip.name;
	document.getElementById("shipSpeedCard").innerText = selectedShip.speed + " (knots)";
	document.getElementById("shipRangeCard").innerText = selectedShip.range + " (km)";
	document.getElementById("shipDescCard").innerText = selectedShip.desc;
	document.getElementById("shipCostCard").innerText = selectedShip.cost;
	document.getElementById("shipStausCard").innerText = selectedShip.status;
	document.getElementById("shipCommentsCard").innerText = selectedShip.comments;
}

function generateShipList()
{
	let shipList = mainFleet.shipList;
	let output = "";
  let shipDisplayEnd;
  if (shipList.length < shipDisplay + numDisplay){
    shipDisplayEnd = shipList.length;
  }
  else{
    shipDisplayEnd = shipDisplay + numDisplay
  }
	for (let i = shipDisplay; i < shipDisplayEnd; i++)
	{
		output += "<tr>";
		output += "<td>"+shipList[i].name+"</td>";
    output += "<td>"+shipList[i].cost+"</td>";
    output += "<td>"+shipList[i].status+"</td>";
		output += "<td>"+shipList[i].desc+"</td>";

    if (i < mainFleet.availableShipList.length){
      output += "<td><a class=\"mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect\" onclick=\"viewAvailableShip("+i+")\">View</a></td>";
    }
    else{
      output += "<td><a class=\"mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect\" onclick=\"viewActiveShip("+(i-mainFleet.availableShipList.length)+")\">View</a></td>"
    }
		output += "</tr>";
	}
	return output;
}

function nextShip()
{
  if (shipDisplay + numDisplay < mainFleet.availableShipList.length + mainFleet.activeShipList.length){
    shipDisplay += numDisplay;
    shipList.innerHTML = generateShipList();
  }
}

function prevShip()
{
  if (shipDisplay - numDisplay >= 0){
    shipDisplay -= numDisplay;
    shipList.innerHTML = generateShipList();
  }
}

///////////////////////////////// PORT TAB ////////////////////////////////////
function viewPort(index)
{
  document.getElementById("portInfoCard").style.visibility = "visible";
	let selectedPort = mainMap.portList[index];
	document.getElementById("portNameCard").innerText = selectedPort.name;
	document.getElementById("portCountryCard").innerText = selectedPort.country;
	document.getElementById("portTypeCard").innerText = selectedPort.type;
	document.getElementById("portSizeCard").innerText = selectedPort.size;
	document.getElementById("portLocationPrecisionCard").innerText = selectedPort.locationPrecision;
	document.getElementById("portLatCard").innerText = selectedPort.coord.lat;
	document.getElementById("portLngCard").innerText = selectedPort.coord.lng;
  document.getElementById("portMapArea").style.visibility="hidden"
  // get location coordinates
  let lat = selectedPort.coord.lat;
  let lng = selectedPort.coord.lng;
  let coord = [lng,lat];
  // move map to location
  mapPort.setZoom(4);
  mapPort.panTo(coord);
  // add marker
  if (markerPort == undefined) {
    markerPort = new mapboxgl.Marker()
    markerPort.setLngLat(coord).addTo(mapPort);
    document.getElementById("portMapArea").style.visibility = "visible";
  }
  else{
    markerPort.setLngLat(coord)
    document.getElementById("portMapArea").style.visibility = "visible";
  }

}

function generatePortList()
{
	let portList = mainMap.apiPortList.concat(mainMap.userAddedPortList);
	let output = "";
  let portDisplayEnd;
  if (portList.length < portDisplay + numDisplay){
    portDisplayEnd = portList.length;
  }
  else{
    portDisplayEnd = portDisplay + numDisplay
  }

	for (let i = portDisplay; i < portDisplayEnd; i++)
	{
		output += "<tr>";
		output += "<td>"+portList[i].name+"</td>";
		output += "<td>"+portList[i].country+"</td>";
    output += "<td>"+portList[i].size.toString()+"</td>";
    output += "<td><a class=\"mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect\" onclick=\"viewPort("+i+")\">View</a></td>";
		output += "</tr>";
	}
	return output;
}
function nextPort()
{
  if (portDisplay + numDisplay < mainMap.apiPortList.concat(mainMap.userAddedPortList).length){
    portDisplay += numDisplay;
    portList.innerHTML = generatePortList();
  }
}

function prevPort()
{
  if (portDisplay - numDisplay >= 0){
    portDisplay -= numDisplay;
    portList.innerHTML = generatePortList();
  }
}
// map tab
function viewRouteSummary(index)
{
	let selectedRoute = mainMap.getRoute(index);
  // ROY put waypoints viewing in here
  // start port

  let sourceMarker = new mapboxgl.Marker({ "color": "#01FE23" });
  let sourcePortCoords = selectedRoute.startPort.coord.getCoordinates()
  // end port
  let destinationMarker = new mapboxgl.Marker({ "color": "#01FE23" });
  let destinationPortCoords = selectedRoute.endPort.coord.getCoordinates()
  // waypoints
  let waypointsArray = selectedRoute.waypoints;
  // line
  let lineObject = {
    type: "geojson",
    data: {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: []
      }
    }
  };
  // saving coordinates of waypoints into line object
  lineObject.data.geometry.coordinates = [];
  lineObject.data.geometry.coordinates.push(sourcePortCoords);
  for (let i = 0; i < waypointsArray.length; i++)
  {
    lineObject.data.geometry.coordinates.push(waypointsArray[i].getCoordinates());
  }
  lineObject.data.geometry.coordinates.push(destinationPortCoords);
  // adding layer - generating lines
  indexMap.on('load', function () {
    indexMap.addLayer({
      id: "pathBetweenWaypoints"+index,
      type: "line",
      source: lineObject,
      layout: { "line-join": "round", "line-cap": "round" },
      paint: { "line-color": "#FE3B69", "line-width": 6 }
    });
  });
}


// route tab
function viewRoute(index)
{
  let routeTabMap = new mapboxgl.Map({
  container: 'routeTabMapArea', // container id
  style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
  center: [0, 0], // starting position [lng, lat]
  zoom: 0.5 // starting zoom
  });
  document.getElementById("routeTabMapArea").style.visibility = "visible";
  document.getElementById("routeInfoCard").style.visibility = "visible";
	let selectedRoute = mainMap.getRoute(index);
	document.getElementById("routeIdCard").innerText = selectedRoute.id;
	document.getElementById("startPortCard").innerText = selectedRoute.startPort.name;
	document.getElementById("endPortCard").innerText = selectedRoute.endPort.name;
	document.getElementById("startDateCard").innerText = selectedRoute.getPrettyStartDate();
	document.getElementById("endDateCard").innerText = selectedRoute.getPrettyEndDate();
	document.getElementById("routeShipCard").innerText = selectedRoute.ship.name;
	document.getElementById("routeDistanceCard").innerText = selectedRoute.distance;
  document.getElementById("routeCostCard").innerText = selectedRoute.cost;
  document.getElementById("weatherSumCard").innerText = selectedRoute.weatherSum();
  document.getElementById("postponeButton").setAttribute("onclick","showPostpone("+index+")");
  document.getElementById("deleteRouteButton").setAttribute("onclick","deleteRoute("+index+")");
  document.getElementById("routeTabMapArea").style.visibility="visible"
  // ROY put waypoints viewing in here
  // start port
  let sourceMarker = new mapboxgl.Marker({ "color": "#4caf50" });
  let sourcePortCoords = selectedRoute.startPort.coord.getCoordinates()
  sourceMarker.setLngLat(sourcePortCoords);
  sourceMarker.addTo(routeTabMap);
  sourcePopup = new mapboxgl.Popup({ offset: 45});
  sourcePopup.setText(selectedRoute.startPort.name + " - your source port");
  sourceMarker.setPopup(sourcePopup);
  sourcePopup.addTo(routeTabMap);
  // end port
  let destinationMarker = new mapboxgl.Marker({ "color": "#4caf50" });
  let destinationPortCoords = selectedRoute.endPort.coord.getCoordinates()
  destinationMarker.setLngLat(destinationPortCoords);
  destinationMarker.addTo(routeTabMap);
  destinationPopup = new mapboxgl.Popup({ offset: 45});
  destinationPopup.setText(selectedRoute.endPort.name + " - your destination port");
  destinationMarker.setPopup(destinationPopup);
  destinationPopup.addTo(routeTabMap);
  // waypoints
  let waypointsArray = selectedRoute.waypoints;
  for (let i = 0; i < waypointsArray.length; i++)
  {
    new mapboxgl.Marker({ "color": "#FF8C00" }).setLngLat(waypointsArray[i].getCoordinates()).addTo(routeTabMap);
  }
  // line
  let lineObject = {
    type: "geojson",
    data: {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: []
      }
    }
  };
  // remove old layer
  if (routeTabMap.getLayer("pathBetweenWaypoints") != undefined)
  {
    routeTabMap.removeLayer("pathBetweenWaypoints");
    routeTabMap.removeSource("pathBetweenWaypoints");
  }
  // saving coordinates of waypoints into line object
  lineObject.data.geometry.coordinates = [];
  lineObject.data.geometry.coordinates.push(sourcePortCoords);
  for (let i = 0; i < waypointsArray.length; i++)
  {
    lineObject.data.geometry.coordinates.push(waypointsArray[i].getCoordinates());
  }
  lineObject.data.geometry.coordinates.push(destinationPortCoords);
  // adding layer - generating lines
  routeTabMap.on('load', function () {
    routeTabMap.addLayer({
      id: "pathBetweenWaypoints",
      type: "line",
      source: lineObject,
      layout: { "line-join": "round", "line-cap": "round" },
      paint: { "line-color": "#888", "line-width": 6 }
    });
  });
  // zooming map to show all markers
  boundaryCoordinates = lineObject.data.geometry.coordinates;
  bounds = boundaryCoordinates.reduce(function(bounds, boundaryCoordinates) {
    return bounds.extend(boundaryCoordinates);
  }, new mapboxgl.LngLatBounds(boundaryCoordinates[0], boundaryCoordinates[0]));

  routeTabMap.fitBounds(bounds, {
    padding: 60
  });
}
function viewPath(index)
{
  let selectedRoute = mainMap.getRoute(index);

  let sourceMarker = new mapboxgl.Marker({ "color": "#01FE23" });
  let sourcePortCoords = selectedRoute.startPort.coord.getCoordinates()
  sourceMarker.setLngLat(sourcePortCoords);
  sourceMarker.addTo(indexMap);
  sourcePopup = new mapboxgl.Popup({ offset: 45});
  sourcePopup.setText("#"+index+" "+selectedRoute.startPort.name + " - your source port");
  sourceMarker.setPopup(sourcePopup);
  sourcePopup.addTo(indexMap);
  // end port
  let destinationMarker = new mapboxgl.Marker({ "color": "#01FE23" });
  let destinationPortCoords = selectedRoute.endPort.coord.getCoordinates()
  destinationMarker.setLngLat(destinationPortCoords);
  destinationMarker.addTo(indexMap);
  destinationPopup = new mapboxgl.Popup({ offset: 45});
  destinationPopup.setText("#"+index+" "+selectedRoute.endPort.name + " - your destination port");
  destinationMarker.setPopup(destinationPopup);
  destinationPopup.addTo(indexMap);
  // waypoints
  let waypointsArray = selectedRoute.waypoints;
  // line
  for (let i = 0; i < waypointsArray.length; i++)
  {
    new mapboxgl.Marker({ "color": "#FEB201" }).setLngLat(waypointsArray[i].getCoordinates()).addTo(indexMap);
  }
  let lineObject = {
    type: "geojson",
    data: {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: []
      }
    }
  };
  // remove old layer
  // saving coordinates of waypoints into line object
  lineObject.data.geometry.coordinates = [];
  lineObject.data.geometry.coordinates.push(sourcePortCoords);
  for (let i = 0; i < waypointsArray.length; i++)
  {
    lineObject.data.geometry.coordinates.push(waypointsArray[i].getCoordinates());
  }
  lineObject.data.geometry.coordinates.push(destinationPortCoords);
  // zooming map to show all markers
  boundaryCoordinates = lineObject.data.geometry.coordinates;
  bounds = boundaryCoordinates.reduce(function(bounds, boundaryCoordinates) {
    return bounds.extend(boundaryCoordinates);
  }, new mapboxgl.LngLatBounds(boundaryCoordinates[0], boundaryCoordinates[0]));

  indexMap.fitBounds(bounds, {
    padding: 60
  });
}
function deleteRoute(index)
{
  if (confirm("Are you sure you want to delete this route?"))
  {
    mainMap.deleteRoute(index);
    document.getElementById("routeList").innerHTML = generateRouteList();
    document.getElementById("mapList").innerHTML = generateRouteListSummary();
    document.getElementById("routeInfoCard").style.visibility = "hidden";
    document.getElementById("routeTabMapArea").style.visibility = "hidden";
    localStorage.setItem("mainMap", JSON.stringify(mainMap));		// saving to local storage
  }
}
function generateRouteList()
{

  let routeList = mainMap.routeList;
  let output = "";
  let routeDisplayEnd;
  if (routeList.length < routeDisplay + numDisplay){
    routeDisplayEnd = routeList.length;
  }
  else{
    routeDisplayEnd = routeDisplay + numDisplay
  }

  for (let i = routeDisplay;i < routeDisplayEnd; i++)
  {
    output += "<tr>";
    output += "<td>"+routeList[i].id+"</td>";
    output += "<td>"+routeList[i].startPort.name+"</td>";
    output += "<td>"+routeList[i].endPort.name+"</td>";
    output += "<td>"+routeList[i].getPrettyStartDate()+"</td>";
    output += "<td><a class=\"mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect\" onclick=\"viewRoute("+i+")\">View</a></td>";
    output += "</tr>";
  }
  return output;
}
function generateRouteListSummary()
{

  let routeList = mainMap.routeList;
  let output = "";
  let routeDisplayEnd;
  if (routeList.length < routeDisplay + numDisplay){
    routeDisplayEnd = routeList.length;
  }
  else{
    routeDisplayEnd = routeDisplay + numDisplay
  }

  for (let i = routeDisplay;i < routeDisplayEnd; i++)
  {
    output += "<tr>";
    output += "<td>"+routeList[i].id+"</td>";
    output += "<td>"+routeList[i].getPrettyStartDate()+"</td>";
    output += "<td><a class=\"mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect\" onclick=\"viewPath("+i+")\">View</a></td>";
    output += "</tr>";
    viewRouteSummary(i);
  }
  return output;
}
function nextRoute()
{
  if (routeDisplay + numDisplay < mainMap.routeList.length){
    routeDisplay += numDisplay;
    routeList.innerHTML = generateRouteList();
  }

}
function prevRoute()
{
  if (routeDisplay - numDisplay >= 0){
    routeDisplay -= numDisplay;
    routeList.innerHTML = generateRouteList();
  }
}
function showPostpone(index)
{
		let dialogBox = "";
		dialogBox += '<dialog class="mdl-dialog" style="width:50vw;"><h4 class="mdl-dialog__title">Pospone Route</h4><div class="mdl-dialog__content">';
    dialogBox += '<table class="mdl-data-table mdl-js-data-table mdl-shadow--2dp fill40"><thead><tr>'
    dialogBox += '<input type=\"date\"id=\"postponeDate\"></input><br>'
    dialogBox += "<a class=\"mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect\" onclick=\"postponeRoute("+index+")\">Confirm Postpone</a>";


		dialogBox +='</div><div class="mdl-dialog__actions"><button type="button" class="mdl-button close">Close</button></div></dialog>';
		document.getElementById("hiddenDialog").innerHTML = dialogBox;
		let dialog = document.querySelector('dialog');
	    let showDialogButton = document.querySelector('#show-dialog');
	    if (!dialog.showModal) {
	      dialogPolyfill.registerDialog(dialog);
	    }
	    dialog.showModal();
	    dialog.querySelector('.close').addEventListener('click', function() {
	      dialog.close();
	    });
}
function postponeRoute(index)
{
  let changedStartDate = new Date(document.getElementById("postponeDate").value);
  let selectedRoute = mainMap.routeList[index];
  selectedRoute.startDate = changedStartDate;
  selectedRoute.endDate = selectedRoute._calculateArrival(selectedRoute.ship, selectedRoute.startDate, selectedRoute.distance)
  selectedRoute.getWeather('mainMap.routeList['+index+']')
  alert('Route #' + selectedRoute.id + ' has been postponed to ' + selectedRoute.getPrettyStartDate())
  localStorage.setItem("mainMap", JSON.stringify(mainMap));		// saving to local storage
  document.getElementById("routeList").innerHTML = generateRouteList();
  viewRoute(index);



}


// GLOBAL CODE


//weather api request

// gloabl variable instanciation
let shipDisplay = 0; // start of ships to display in table
let portDisplay = 0;// start of ports to display in table
let routeDisplay = 0;// start of routes to display in table
let numDisplay = 9;// number of items ot display in tables


let markerPort = undefined;


// MAP TAB

mapboxgl.accessToken = 'pk.eyJ1Ijoic21hcjAwNTEiLCJhIjoiY2swZzN2bGIzMDNtZTNjbnh1bm94d3ByZCJ9.CD0kSJKKLZqqlZIy0YekuA';
let indexMap = new mapboxgl.Map({
container: 'indexMapArea', // container id
style: 'mapbox://styles/mapbox/navigation-preview-night-v4', // stylesheet location
center: [0, 0], // starting position [lng, lat]
zoom: 0 // starting zoom
});



// SHIP TAB
shipInfoCard.style.visibility = "hidden";
document.getElementById("shipList").innerHTML = generateShipList();





// PORTS TAB
let mapPort = new mapboxgl.Map({
container: 'portMapArea', // container id
style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
center: [144.9305, -37.84688], // starting position [lng, lat]
zoom: 13 // starting zoom
});
document.getElementById("portMapArea").style.visibility = "hidden";
portInfoCard.style.visibility = "hidden";
document.getElementById("portList").innerHTML = generatePortList();




// ROUTES TAB
document.getElementById("routeTabMapArea").style.visibility="hidden"
routeInfoCard.style.visibility = "hidden";
document.getElementById("routeList").innerHTML = generateRouteList();
document.getElementById("mapList").innerHTML = generateRouteListSummary();

function closeShip()
{
  document.getElementById('shipInfoCard').style.visibility ="hidden";
}
function closePort()
{
  document.getElementById('portInfoCard').style.visibility ="hidden";
  document.getElementById('portMapArea').style.visibility ="hidden";
}
