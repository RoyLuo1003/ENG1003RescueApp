// GLOBAL VARIABLES
let waypointsArray = [];  // array of Point instances
let markerArray = [];  // array of markers (to be used when adding waypoints - to allow for undo: just remove last item from array)
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


let boundaryCoordinates;
let bounds;

let shipDisplay = 0; // start of ships to display in table
let startDisplay = 0;// start of ports to display in table
let endDisplay = 0;
let numDisplay = 7;// number of items ot display in tables

let routeShip;
let addingRoute;
let sourcePort;
let destinationPort;
let sourcePortCoords;
let destinationPortCoords;
let sourceMarker;
let sourcePopup;
let destinationPopup;
let destinationMarker;

let shipIndex;


let shipList = document.getElementById("shipList");
if (shipList != null){
  shipList.innerHTML = generateShipList();
}

// MAPBOX SETUP
mapboxgl.accessToken = "pk.eyJ1IjoiZ29yYm9jaG8iLCJhIjoiY2swZXBnanZ2MGo1ZTNkcXhldXFjcjMxYiJ9.IaIUIz6IcnQzpOViYAK_Yg";
let routeCreationMap = new  mapboxgl.Map({
  container: 'routeCreationMapArea',
  center: [0, 0],
  zoom: 0.5,
  style: 'mapbox://styles/mapbox/streets-v9'
});
let waypointMap;

/////////////////////FUNCTIONS FOR ROUTE CREATION PAGE//////////////////////////

// BUTTON: Close
// this function adds the waypoints path onto the route map
// this function activates when user closes the dialog tab
function showWaypoints()
{
  if (waypointsArray.length > 0)
  {
    document.getElementById('routeWaypoints').innerHTML = "Waypoints Saved";
  }
  // remove existing layer
  if (routeCreationMap.getLayer('pathBetweenWaypoints') != undefined)
  {
    routeCreationMap.removeLayer("pathBetweenWaypoints");
    routeCreationMap.removeSource("pathBetweenWaypoints");
  }
  // adding markers for the ports of arrival and departure
  sourceMarker.addTo(routeCreationMap);
  sourcePopup.addTo(routeCreationMap);

  destinationMarker.addTo(routeCreationMap);
  destinationPopup.addTo(routeCreationMap);
  // adding markers for waypoints
  for (i = 0; i < markerArray.length; i++)
  {
    markerArray[i].addTo(routeCreationMap);
  }
  // generating lines between markers
  routeCreationMap.addLayer({
    id: "pathBetweenWaypoints",
    type: "line",
    source: lineObject,
    layout: { "line-join": "round", "line-cap": "round" },
    paint: { "line-color": "#888", "line-width": 6 }
  });
  // zooming map to show full route
  boundaryCoordinates = [];
  boundaryCoordinates.push(sourcePortCoords);
  for (i = 0; i < waypointsArray.length; i++)  // creating array of coordinates
  {
    boundaryCoordinates.push(waypointsArray[i].getCoordinates());
  }
  boundaryCoordinates.push(destinationPortCoords);
  bounds = boundaryCoordinates.reduce(function(bounds, boundaryCoordinates) {
    return bounds.extend(boundaryCoordinates);
  }, new mapboxgl.LngLatBounds(boundaryCoordinates[0], boundaryCoordinates[0]));

  routeCreationMap.fitBounds(bounds, {
    padding: 60
  });
}

//BUTTON: Add Ship
// this function creates a dialog pop up for user to select a ship for their route
function showShipList()
{
		let dialogBox = "";
		dialogBox += '<dialog class="mdl-dialog" style="width:80vw;"><h4 class="mdl-dialog__title">Select Ship</h4><div class="mdl-dialog__content">';
    dialogBox += '<table class="mdl-data-table mdl-js-data-table mdl-shadow--2dp fill40"><thead><tr>'
    dialogBox += '<th class="mdl-data-table__cell--non-numeric">Name</th><th class="mdl-data-table__cell--non-numeric">Max Speed</th><th class="mdl-data-table__cell--non-numeric">Range</th>'
    dialogBox += '<th class="mdl-data-table__cell--non-numeric">Description</th><th class="mdl-data-table__cell--non-numeric">Cost</th><th class="mdl-data-table__cell--non-numeric">Status</th><th>Action</th></tr>'
    dialogBox += '<tbody id="shipList">'
    dialogBox += generateShipSelectionList();
    if (generateShipSelectionList() == '')
    {
      dialogBox += '<h4>Currently no ships has the range to complete the journey</h4>'
    }
    dialogBox += '</tbody></thead></table>'
    dialogBox += '<button class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect" onclick = "prevShip()" id="Prev"> < </button>'
    dialogBox += '<button class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect" id="create" onclick="createShip()"> Create New Ship </button>'
    dialogBox += '<button  class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect" onclick = "nextShip()" id="Next"> > </button>'

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

function nextShip()
{
  if (shipDisplay + numDisplay < mainFleet.availableShipList.length + mainFleet.activeShipList.length){
    shipDisplay += numDisplay;
    document.getElementById("shipList").innerHTML = generateShipSelectionList();
  }
}

function prevShip()
{
  if (shipDisplay - numDisplay >= 0){
    shipDisplay -= numDisplay;
    document.getElementById("shipList").innerHTML = generateShipSelectionList();
  }
}

// this function generates list of ship that have enough range to complete route
function filterShipByRange(ship)
{
  let distance = 0;
  if (waypointsArray.length == 0)  // if no waypoints are added
  {
    distance += sourcePort.coord.getDistance(destinationPort.coord);
  }
  else
  {
    distance += sourcePort.coord.getDistance(waypointsArray[0]);
    for (let i = 0; i<waypointsArray.length-1;i++)
    {
      distance += waypointsArray[i].getDistance(waypointsArray[i+1]);
    }
    distance += waypointsArray[waypointsArray.length-1].getDistance(destinationPort.coord);
  }
  if (distance > ship.range)
  {
    return false
  }
  return true
}

// this function generates table of all available ships for selection
// this function is called by showShipList()
function generateShipSelectionList()
{
  let shipList = mainFleet.shipList
  let output = "";
  let i = 0;
  let j = shipDisplay;
	while (i < numDisplay && j < mainFleet.shipList.length)
	{
    if (mainFleet.shipList[j].status == 'available')
    {
      i += 1
      output += "<tr>";
      output += "<td>"+shipList[j].name+"</td>";
      output += "<td>"+shipList[j].speed+"</td>";
      output += "<td>"+shipList[j].range+"</td>";
      output += "<td>"+shipList[j].desc+"</td>";
      output += "<td>"+shipList[j].cost+"</td>";
      output += "<td>"+shipList[j].status+"</td>";
      output += "<td><a class=\"mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect\" onclick=\"selectShip("+j+")\">Select</a></td>";
      output += "</tr>";
    }
    j += 1;
	}
	return output;
}

// BUTTON: SELECT
// this function sets variable routeShip to a ship instance
function selectShip(index)
{
  shipIndex = index
  routeShip = mainFleet.shipList[index];
  document.getElementById("routeShip").innerHTML = routeShip.name;
  document.getElementById("hiddenDialog").innerHTML = '';
  document.getElementById("saveRouteButton").disabled = false;
}

// BUTTON: Add Departure Port
function showStartPortList()
{
		let dialogBox = "";
		dialogBox += '<dialog class="mdl-dialog" style="width:80vw;"><h4 class="mdl-dialog__title">Select Port</h4><div class="mdl-dialog__content">';
    dialogBox += '<table class="mdl-data-table mdl-js-data-table mdl-shadow--2dp fill40"><thead><tr>'
    dialogBox += '<th class="mdl-data-table__cell--non-numeric">Name</th><th class="mdl-data-table__cell--non-numeric">Country</th><th class="mdl-data-table__cell--non-numeric">Type</th>'
    dialogBox += '<th class="mdl-data-table__cell--non-numeric">Size</th><th class="mdl-data-table__cell--non-numeric">Location Precision</th><th>Action</th></tr>'
    dialogBox += '<tbody id="startList">'
    dialogBox += generateStartPortSelectionList();
    dialogBox += '</tbody></thead></table>'
    dialogBox += '<div><button class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect" onclick = "prevStart()" id="Prev"> < </button>'
    dialogBox += '<button class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect" id="create" onclick="createPort()"> Create New Port </button>'
    dialogBox += '<button class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect" onclick = "nextStart()" id="Next"> > </button></div>'

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
function nextStart()
{
  if (startDisplay + numDisplay < mainMap.portList.length){
    startDisplay += numDisplay;
    document.getElementById("startList").innerHTML = generateStartPortSelectionList();
  }
}

function createPort()
{
  window.location.replace("portCreation.html");  // redirecting
}

function createShip()
{
  window.location.replace("shipCreation.html");  // redirecting
}

function prevStart()
{
  if (startDisplay - numDisplay >= 0){
    startDisplay -= numDisplay;
    document.getElementById("startList").innerHTML = generateStartPortSelectionList();
  }
}
// this function generates table of all ports, and is called by showStartPortList()
function generateStartPortSelectionList()
{
  let portList = mainMap.portList;
	let output = "";
  let startDisplayEnd;
  if (portList.length < startDisplay + numDisplay){
    startDisplayEnd = portList.length;
  }
  else{
    startDisplayEnd = startDisplay + numDisplay
  }

	for (let i = startDisplay; i < startDisplayEnd; i++)
	{
		output += "<tr>";
		output += "<td>"+portList[i].name+"</td>";
		output += "<td>"+portList[i].country+"</td>";
    output += "<td>"+portList[i].type+"</td>";
    output += "<td>"+portList[i].size+"</td>";
    output += "<td>"+portList[i].locationPrecision+"</td>";
    output += "<td><a class=\"mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect\" onclick=\"selectStartPort("+i+")\">Select</a></td>";
		output += "</tr>";
	}
	return output;
}
// BUTTON: SELECT
// this function sets variable sourcePort to be a port instance
function selectStartPort(index)
{
  // check start and end port not the same
  if (mainMap.portList[index] == destinationPort)
  {
    alert("Your chosen source port is the same as your destination port");
    return
  }
  sourcePort = mainMap.portList[index];
  document.getElementById("sourcePort").innerHTML = sourcePort.name;
  document.getElementById("hiddenDialog").innerHTML = '';

  if (destinationPort == undefined)  // if only this port is being set
  {
    // setting coordinates of departure and arrival
    sourcePortCoords = sourcePort.coord.getCoordinates();

    if (sourceMarker == undefined)  // if first time setting source
    {
      // adding marker to departure
      sourceMarker = new mapboxgl.Marker({ "color": "#4caf50" });
      sourceMarker.setLngLat(sourcePortCoords);
      sourceMarker.addTo(routeCreationMap);
      sourcePopup = new mapboxgl.Popup({ offset: 45});
      sourcePopup.setText(sourcePort.name + " - your source port");
      sourceMarker.setPopup(sourcePopup);
      sourcePopup.addTo(routeCreationMap);
    }
    else  // else if changing source
    {
      sourceMarker.setLngLat(sourcePortCoords);
    }
  }
  else // both ports have been set
  {
    // setting coordinates of departure and arrival
    sourcePortCoords = sourcePort.coord.getCoordinates();
    destinationPortCoords = destinationPort.coord.getCoordinates();

    if (sourceMarker == undefined)  // if first time setting source
    {
      // adding marker to arrival
      sourceMarker = new mapboxgl.Marker({ "color": "#4caf50" });
      sourceMarker.setLngLat(sourcePortCoords);
      sourceMarker.addTo(routeCreationMap);
      sourcePopup = new mapboxgl.Popup({ offset: 45});
      sourcePopup.setText(sourcePort.name + " - your source port");
      sourceMarker.setPopup(sourcePopup);
      sourcePopup.addTo(routeCreationMap);
      // adding a line between source and destination ports
      lineObject.data.geometry.coordinates = [sourcePortCoords, destinationPortCoords]
      // adding layer - generating lines
      routeCreationMap.addLayer({
        id: "pathBetweenWaypoints",
        type: "line",
        source: lineObject,
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": "#888", "line-width": 6 }
      });
    }
    else  // else if changing source
    {
      sourceMarker.setLngLat(sourcePortCoords);
      // removing layer if it exists
      if (routeCreationMap.getLayer('pathBetweenWaypoints') != undefined)
      {
        routeCreationMap.removeLayer("pathBetweenWaypoints");
        routeCreationMap.removeSource("pathBetweenWaypoints");
        lineObject.data.geometry.coordinates = [];
      }
      lineObject.data.geometry.coordinates.push(sourcePortCoords);
      for(let i = 0; i < waypointsArray.length; i++)
      {
        lineObject.data.geometry.coordinates.push(waypointsArray[i].getCoordinates());
      }
      lineObject.data.geometry.coordinates.push(destinationPortCoords);
      // adding layer - generating lines
      routeCreationMap.addLayer({
        id: "pathBetweenWaypoints",
        type: "line",
        source: lineObject,
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": "#888", "line-width": 6 }
      });
    }

    // zooming map appropriately
    boundaryCoordinates = [sourcePortCoords, destinationPortCoords];
    bounds = boundaryCoordinates.reduce(function(bounds, boundaryCoordinates) {
      return bounds.extend(boundaryCoordinates);
    }, new mapboxgl.LngLatBounds(boundaryCoordinates[0], boundaryCoordinates[0]));

    routeCreationMap.fitBounds(bounds, {
      padding: 60
    });

    // enabling waypoints button
    document.getElementById('editWaypoints').disabled = false;
  }
}

//BUTTON: Add Arrival Port
function showEndPortList()
{
		let dialogBox = "";
		dialogBox += '<dialog class="mdl-dialog" style="width:80vw;"><h4 class="mdl-dialog__title">Select Port</h4><div class="mdl-dialog__content">';
    dialogBox += '<table class="mdl-data-table mdl-js-data-table mdl-shadow--2dp fill40"><thead><tr>'
    dialogBox += '<th class="mdl-data-table__cell--non-numeric">Name</th><th class="mdl-data-table__cell--non-numeric">Country</th><th class="mdl-data-table__cell--non-numeric">Type</th>'
    dialogBox += '<th class="mdl-data-table__cell--non-numeric">Size</th><th class="mdl-data-table__cell--non-numeric">Location Precision</th><th>Action</th></tr>'
    dialogBox += '<tbody id="endList">';
    dialogBox += generateEndPortSelectionList();
    dialogBox += '</tbody></thead></table>';
    dialogBox += '<div><button class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect" onclick = "prevEnd()" id="Prev"> < </button>'
    dialogBox += '<button class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect" id="create" onclick="createPort()"> Create New Port </button>'
    dialogBox += '<button class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect" onclick = "nextEnd()" id="Next"> > </button></div>'


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

function nextEnd()
{
  if (endDisplay + numDisplay < mainMap.portList.length){
    endDisplay += numDisplay;
    document.getElementById("endList").innerHTML = generateEndPortSelectionList();
  }
}

function prevEnd()
{
  if (endDisplay - numDisplay >= 0){
    endDisplay -= numDisplay;
    document.getElementById("endList").innerHTML = generateEndPortSelectionList();
  }
}

// this function generates a table of all ports, called by showEndPortList()
function generateEndPortSelectionList()
{
  let portList = mainMap.portList;
	let output = "";
  let endDisplayEnd;
  if (portList.length < endDisplay + numDisplay){
    endDisplayEnd = portList.length;
  }
  else{
    endDisplayEnd = endDisplay + numDisplay
  }

	for (let i = endDisplay; i < endDisplayEnd; i++)
	{
		output += "<tr>";
    output += "<td>"+portList[i].name+"</td>";
		output += "<td>"+portList[i].country+"</td>";
    output += "<td>"+portList[i].type+"</td>";
    output += "<td>"+portList[i].size+"</td>";
    output += "<td>"+portList[i].locationPrecision+"</td>";
    output += "<td><a class=\"mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect\" onclick=\"selectEndPort("+i+")\">Select</a></td>";
		output += "</tr>";
	}
	return output;
}

// BUTTON: SELECT
// this function sets variable destinationPort as port instance
function selectEndPort(index)
{
  if (mainMap.portList[index] == sourcePort)
  {
    alert("Your chosen destination port is the same as your source port.");
    return
  }
  destinationPort = mainMap.portList[index];
  document.getElementById("destinationPort").innerHTML = destinationPort.name;
  document.getElementById("hiddenDialog").innerHTML = '';

  if (sourcePort == undefined)  // if only this port is being set
  {
    if (destinationMarker == undefined)  // first time setting this port
    {
      destinationPortCoords = destinationPort.coord.getCoordinates();
      // adding marker to arrival port
      destinationMarker = new mapboxgl.Marker({ "color": "#4caf50" });
      destinationMarker.setLngLat(destinationPortCoords);
      destinationMarker.addTo(routeCreationMap);
      destinationPopup = new mapboxgl.Popup({ offset: 45});
      destinationPopup.setText(destinationPort.name + " - your destination port");
      destinationMarker.setPopup(destinationPopup);
      destinationPopup.addTo(routeCreationMap);
    }
    else  // changing this port
    {
      destinationMarker.setLngLat(destinationPortCoords);
    }
  }
  else  // if both ports are set
  {
    // setting coordinates of departure and arrival
    sourcePortCoords = sourcePort.coord.getCoordinates();
    destinationPortCoords = destinationPort.coord.getCoordinates();

    if (destinationMarker == undefined)  // first time setting this port
    {
      // adding marker to arrival port
      destinationMarker = new mapboxgl.Marker({ "color": "#4caf50" });
      destinationMarker.setLngLat(destinationPortCoords);
      destinationMarker.addTo(routeCreationMap);
      destinationPopup = new mapboxgl.Popup({ offset: 45});
      destinationPopup.setText(destinationPort.name + " - your destination port");
      destinationMarker.setPopup(destinationPopup);
      destinationPopup.addTo(routeCreationMap);
      // adding a line between source and destination ports
      lineObject.data.geometry.coordinates = [sourcePortCoords, destinationPortCoords]
      routeCreationMap.addLayer({
        id: "pathBetweenWaypoints",
        type: "line",
        source: lineObject,
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": "#888", "line-width": 6 }
      });
    }
    else  // changing port
    {
      destinationMarker.setLngLat(destinationPortCoords);
      // removing layer if it exists
      if (routeCreationMap.getLayer('pathBetweenWaypoints') != undefined)
      {
        routeCreationMap.removeLayer("pathBetweenWaypoints");
        routeCreationMap.removeSource("pathBetweenWaypoints");
        lineObject.data.geometry.coordinates = [];
      }
      lineObject.data.geometry.coordinates.push(sourcePortCoords);
      for(let i = 0; i < waypointsArray.length; i++)
      {
        lineObject.data.geometry.coordinates.push(waypointsArray[i].getCoordinates());
      }
      lineObject.data.geometry.coordinates.push(destinationPortCoords);
      // adding layer - generating lines
      routeCreationMap.addLayer({
        id: "pathBetweenWaypoints",
        type: "line",
        source: lineObject,
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": "#888", "line-width": 6 }
      });
    }

    // zooming map appropriately
    boundaryCoordinates = [sourcePortCoords, destinationPortCoords];
    bounds = boundaryCoordinates.reduce(function(bounds, boundaryCoordinates) {
      return bounds.extend(boundaryCoordinates);
    }, new mapboxgl.LngLatBounds(boundaryCoordinates[0], boundaryCoordinates[0]));

    routeCreationMap.fitBounds(bounds, {
      padding: 60
    });
    // enabling waypoints button
    document.getElementById('editWaypoints').disabled = false;
  }
}

// BUTTON: SAVE ROUTE
function addRoute()
{
  // check that date is set
  if (!document.getElementById("inRouteDate").value)
  {
    alert("Please select departure date.");
    return
  }
  // check date
  let todayDate = new Date;
  let departureDate = new Date(document.getElementById("inRouteDate").value);
  if (todayDate.getFullYear() > departureDate.getFullYear())
  {
    alert("Today is past your departure date. Please select new date.");
    return
  }
  else if (todayDate.getMonth() > departureDate.getMonth())
  {
    alert("Today is past your departure date. Please select new date.");
    return
  }
  else if (todayDate.getDate() > departureDate.getDate())
  {
    alert("Today is past your departure date. Please select new date.");
    return
  }
  let routeId = mainMap.routeList.length;
  let dDate = new Date(document.getElementById("inRouteDate").value);
  addingRoute = new Route(routeId, sourcePort, destinationPort, dDate, routeShip, waypointsArray);
  addingRoute.getWeather('addingRoute');
  showRouteConfirm();
}

// BUTTON: CLEAR ROUTE
function clearRoute()
{
  if (confirm("Are you sure you want to clear this route?"))
  {
    // clear:
    // date
    document.getElementById("inRouteDate").value = '';
    // no departure port added
    document.getElementById('sourcePort').innerHTML = "No Departure Port Added";
    // no arrival port added
    document.getElementById('destinationPort').innerHTML = "No Arrival Port Added";
    // no waypoints added
    document.getElementById('routeWaypoints').innerHTML = "No Waypoints Added";
    // no ship Added
    document.getElementById('routeShip').innerHTML = "No Ship Added";
    // clear variables:
    // start port
    sourcePort = undefined;
    sourcePortCoords = undefined;
    // end port
    destinationPort = undefined;
    destinationPortCoords = undefined;
    // ship
    routeShip = undefined;
    // waypoints
    waypointsArray = [];
    // markers
    sourceMarker.remove();
    destinationMarker.remove();
    sourceMarker = undefined;
    destinationMarker = undefined;
    for (let i = 0; i < markerArray.length; i++)
    {
      markerArray[i].remove();
    }
    markerArray = [];
    // popups
    sourcePopup = undefined;
    destinationPopup = undefined;
    // bounds
    boundaryCoordinates = undefined
    bounds = []
    // layers
    lineObject.data.geometry.coordinates = [];
    waypointMap.removeLayer("pathBetweenWaypoints");
    waypointMap.removeSource("pathBetweenWaypoints");
    routeCreationMap.removeLayer("pathBetweenWaypoints");
    routeCreationMap.removeSource("pathBetweenWaypoints");
    // reset map
    routeCreationMap = new  mapboxgl.Map({
      container: 'routeCreationMapArea',
      center: [0, 0],
      zoom: 0.5,
      style: 'mapbox://styles/mapbox/streets-v9'
    });
    // reset buttons
    document.getElementById("editWaypoints").disabled = true;
    document.getElementById("addShipButton").disabled = true;
    document.getElementById("saveRouteButton").disabled = true;
    // set route instance to nothing
    addingRoute = undefined;
    // exit dialog
    document.getElementById("hiddenDialog").innerHTML = '';
  }
  else
  {
    return
  }
}

function confirmRoute()
{
  mainMap.addRoute(addingRoute);
  if (shipIndex >= mainFleet.availableShipList.length){
    mainFleet.reserveActiveShip(shipIndex-mainFleet.availableShipList.length);
  }
  else{
    mainFleet.reserveAvailableShip(shipIndex);
  }
  alert('Route #' + addingRoute.id + ' has been created')
  localStorage.setItem("mainMap", JSON.stringify(mainMap));		// saving to local storage
  window.location.replace("index.html");  // redirecting to home page
}

function showRouteConfirm()
{
  let dialogBox = "";
  dialogBox += '<dialog class="mdl-dialog" style="width:80vw;"><h4 class="mdl-dialog__title">Route confirmation</h4><div class="mdl-dialog__content">';
  dialogBox += '<div class="mdl-grid"><div class="mdl-cell mdl-cell--6-col"><div class="mdl-card mdl-shadow--4dp fill40">';
  dialogBox += '<span> Route ID: <label>' + addingRoute.id + '</label></span><br/>';
  dialogBox += '<span> Departure Port: <label>' + addingRoute.startPort.name + '</label></span><br/>';
  dialogBox += '<span> Arrival Port: <label>' + addingRoute.endPort.name + '</label></span><br/>';
  dialogBox += '<span> Departure Date: <label>' + addingRoute.getPrettyStartDate() + '</label></span><br/>';
  dialogBox += '<span> Arrival Date: <label>' + addingRoute.getPrettyEndDate() + '</label></span><br/>';
  dialogBox += '<span> Ship: <label>' + addingRoute.ship.name + '</label></span><br/>';
  dialogBox += '<span> Distance: <label>' + (addingRoute.distance - addingRoute.distance%1) + '(km)</label></span><br/>';
  dialogBox += '<span> Cost: <label>' + (addingRoute.cost - addingRoute.cost%1) + '</label></span><br/>';
  dialogBox += '<b1> Weather Summary:</b1> <br/><span><label id = "startWeatherSum"></label></span><span><label id = "endWeatherSum"></label></span><br/>'
  dialogBox += '<div class="mdl-card__actions mdl-card--border">'
  dialogBox += '<a class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent" onclick ="confirmRoute()">Confirm Route</a>';
  dialogBox += '<button onclick="clearRoute()" id="clearRouteButton" class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent">Clear Route</button></div></div>'
  dialogBox += '<div class="mdl-cell mdl-cell--6-col"><div id="mapAreaRouteConfirm" class="page-block"></div><br/></div></div></div>'
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

// BUTTON: ADD/EDIT WAYPOINTS
// this function generates a dialog pop-up from which a user can set waypoints
function setWaypoints()
{
  // generating the html for the dialog
	let dialogBox = "";
	dialogBox += '<dialog class="mdl-dialog" style="width:80vw;"><h4 class="mdl-dialog__title">Set Route Waypoints</h4><div class="mdl-dialog__content">'
  dialogBox += '<span class="mdl-layout-title" id="waypointsInstructions">Tap on the map to add waypoints... (keep waypoints within a 10-1000km range)</span>'
  dialogBox += '<div id="waypointMapArea" class="page-block"></div>'
  dialogBox += '<div id="waypointButtons">'
  dialogBox += '<button onclick="undoWaypoint()" class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent" id="undoWaypointButton" disabled>Undo Last Waypoint</button>'
  dialogBox += '<button onclick="confirmWaypoints()" class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent" id="confirmWaypointsButton">Confirm Waypoints</button>'
  dialogBox += '</div>'
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
      showWaypoints();
    });
    // creating map
    waypointMap = new mapboxgl.Map({
      container: 'waypointMapArea', // container id
      style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
      center: [0, 0], // starting position [lng, lat]
      zoom: 0.5 // starting zoom
    });

    // if first time adding waypoints
    if (waypointsArray.length == 0)
    {
      // when waypint map loads, apply markers for source and destination, then zoom appropriately
      waypointMap.on('load', function () {
        // adding markers for the ports of arrival and departure
        sourceMarker.addTo(waypointMap);
        sourcePopup.addTo(waypointMap);

        destinationMarker.addTo(waypointMap);
        destinationPopup.addTo(waypointMap);

        // zooming to fit these markers
        boundaryCoordinates = [sourcePortCoords, destinationPortCoords];
        bounds = boundaryCoordinates.reduce(function(bounds, boundaryCoordinates) {
          return bounds.extend(boundaryCoordinates);
        }, new mapboxgl.LngLatBounds(boundaryCoordinates[0], boundaryCoordinates[0]));

        waypointMap.fitBounds(bounds, {
          padding: 60
        });
      });
      // generating line between source and port
      lineObject.data.geometry.coordinates = [sourcePortCoords, destinationPortCoords]
      waypointMap.on('load', function () {
        waypointMap.addLayer({
          id: "pathBetweenWaypoints",
          type: "line",
          source: lineObject,
          layout: { "line-join": "round", "line-cap": "round" },
          paint: { "line-color": "#888", "line-width": 6 }
        });
      });
    }
    // if revisiting/editting waypoints
    else
    {
      // adding source and destination markers
      sourceMarker.addTo(waypointMap);
      sourcePopup.addTo(waypointMap);

      destinationMarker.addTo(waypointMap);
      destinationPopup.addTo(waypointMap);
      // show all current waypoints
      for (i = 0; i < markerArray.length; i++)
      {
        markerArray[i].addTo(waypointMap);
      }
      // generating lines between markers
      waypointMap.on('load', function () {
        waypointMap.addLayer({
          id: "pathBetweenWaypoints",
          type: "line",
          source: lineObject,
          layout: { "line-join": "round", "line-cap": "round" },
          paint: { "line-color": "#888", "line-width": 6 }
        });
      });
      // zooming map to show all markers
      boundaryCoordinates = [];
      boundaryCoordinates.push(sourcePortCoords);
      for (i = 0; i < waypointsArray.length; i++)  // creating array of coordinates
      {
        boundaryCoordinates.push(waypointsArray[i].getCoordinates());
      }
      boundaryCoordinates.push(destinationPortCoords);
      bounds = boundaryCoordinates.reduce(function(bounds, boundaryCoordinates) {
        return bounds.extend(boundaryCoordinates);
      }, new mapboxgl.LngLatBounds(boundaryCoordinates[0], boundaryCoordinates[0]));

      waypointMap.fitBounds(bounds, {
        padding: 60
      });
      document.getElementById("undoWaypointButton").disabled = false;
    }
    // getting user to click/tap to add waypoints
    waypointMap.getCanvas().style.cursor = 'crosshair';
    // adds pointer to where user presses on the map
    waypointMap.on("click", onMapClick);
}

////////////////////FUNCTIONS FOR WAYPOINTS DIALOG POPUP////////////////////////
// LISTENER FUNCTION: allows user to click on map to add waypoints
function onMapClick(e)
{
 // gives you coorindates of the location where the map is clicked
 let waypointCoordinates = e.lngLat;
 waypointsArray.push(new Point(waypointCoordinates.lng, waypointCoordinates.lat));
 // check if waypoint within appropriate range
 if (waypointsArray.length == 1)  // check first waypoint against source
 {
   // if waypoint not in range, remove waypoint and alert
   if (sourcePort.coord.getDistance(waypointsArray[0]) > 1000 || sourcePort.coord.getDistance(waypointsArray[0]) < 10)
   {
     alert("Waypoint too close or too far from the last location");
     waypointsArray.pop()
   }
   else  // if in range, keep waypoint and add marker
   {
     // adding a marker at waypoint
     markerArray.push(new mapboxgl.Marker({ "color": "#FF8C00" }).setLngLat([waypointCoordinates.lng, waypointCoordinates.lat]).addTo(waypointMap));
     // remove old layer
     waypointMap.removeLayer("pathBetweenWaypoints");
     waypointMap.removeSource("pathBetweenWaypoints");
     // saving coordinates of waypoints into line object
     lineObject.data.geometry.coordinates = [sourcePortCoords, waypointsArray[0].getCoordinates(), destinationPortCoords];
     // adding layer - generating lines
     waypointMap.addLayer({
       id: "pathBetweenWaypoints",
       type: "line",
       source: lineObject,
       layout: { "line-join": "round", "line-cap": "round" },
       paint: { "line-color": "#888", "line-width": 6 }
     });
     // enable undo and confirm buttons if there are waypoints set
     document.getElementById("undoWaypointButton").disabled = false;
   }
 }
 else  // check against previous waypoint
 {
   if (waypointsArray[waypointsArray.length - 2].getDistance(waypointsArray[waypointsArray.length - 1]) > 1000 || waypointsArray[waypointsArray.length - 2].getDistance(waypointsArray[waypointsArray.length - 1]) < 10)
   {
     alert("Waypoint too close or too far from the last location");
     waypointsArray.pop()
   }
   else
   {
     // adding a marker at waypoint
     markerArray.push(new mapboxgl.Marker({ "color": "#FF8C00" }).setLngLat([waypointCoordinates.lng, waypointCoordinates.lat]).addTo(waypointMap));
     // remove old layer
     waypointMap.removeLayer("pathBetweenWaypoints");
     waypointMap.removeSource("pathBetweenWaypoints");
     lineObject.data.geometry.coordinates = [];
     lineObject.data.geometry.coordinates.push(sourcePortCoords);
     for(let i = 0; i < waypointsArray.length; i++)
     {
       lineObject.data.geometry.coordinates.push(waypointsArray[i].getCoordinates());
     }
     lineObject.data.geometry.coordinates.push(destinationPortCoords);
     // adding layer - generating lines
     waypointMap.addLayer({
       id: "pathBetweenWaypoints",
       type: "line",
       source: lineObject,
       layout: { "line-join": "round", "line-cap": "round" },
       paint: { "line-color": "#888", "line-width": 6 }
     });
     // enable undo and confirm buttons if there are waypoints set
     document.getElementById("undoWaypointButton").disabled = false;
   }
 }
}

// BUTTON: UNDO LAST WAYPOINT
// This function removes last added marker, and pops this marker from the markers array
// along with popping the coordinates of that marker from the points array and line object
function undoWaypoint()
{
  // remove data of waypoint from arrays
  markerArray[markerArray.length - 1].remove();
  markerArray.pop();
  waypointsArray.pop();
  // changing button availability if conditions are met
  if (markerArray.length == 0)  // if no waypoints are left
  {
    document.getElementById("undoWaypointButton").disabled = true;
    // remove old layer
    waypointMap.removeLayer("pathBetweenWaypoints");
    waypointMap.removeSource("pathBetweenWaypoints");
    lineObject.data.geometry.coordinates = [sourcePortCoords, destinationPortCoords];
    // adding layer - generating lines
    waypointMap.addLayer({
      id: "pathBetweenWaypoints",
      type: "line",
      source: lineObject,
      layout: { "line-join": "round", "line-cap": "round" },
      paint: { "line-color": "#888", "line-width": 6 }
    });
  }
  else  // if there are still waypoints
  {
    // remove old layer
    waypointMap.removeLayer("pathBetweenWaypoints");
    waypointMap.removeSource("pathBetweenWaypoints");
    lineObject.data.geometry.coordinates = [];
    lineObject.data.geometry.coordinates.push(sourcePortCoords);
    for(let i = 0; i < waypointsArray.length; i++)
    {
      lineObject.data.geometry.coordinates.push(waypointsArray[i].getCoordinates());
    }
    lineObject.data.geometry.coordinates.push(destinationPortCoords);
    // adding layer - generating lines
    waypointMap.addLayer({
      id: "pathBetweenWaypoints",
      type: "line",
      source: lineObject,
      layout: { "line-join": "round", "line-cap": "round" },
      paint: { "line-color": "#888", "line-width": 6 }
    });
  }
}

// BUTTON: CONFIRM WAYPOINTS
// This function will store waypoint coordinates into local storage so route may be
// displayed on the route's information page
function confirmWaypoints()
{
  if (waypointsArray.length == 0)
  {
    if (!confirm("Are you sure you want to proceed without adding waypoints?"))
    {
      return
    }
  }
  alert("Waypoints have been saved!");
  // show on map
  showWaypoints();
  // enabling add ship button
  document.getElementById('addShipButton').disabled = false;
  document.getElementById("hiddenDialog").innerHTML = '';
  document.getElementById("routeWaypoints").innerHTML = "Waypoints saved!";
}
