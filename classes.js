class Point{
  // building attributes of class
  constructor(longitude, latitude){
    this._lng = longitude;
    this._lat = latitude;
  }
  // defining accessors
  get lng(){return this._lng;}
  get lat(){return this._lat;}

  getCoordinates()
  {
    return [this._lng, this._lat];
  }

  getDistance(otherPoint)
  {
    let lat1 = this._lat;
    let lon1 = this._lng;
    let lat2 = otherPoint._lat;
    let lon2 = otherPoint._lng
    let r = 6371; // kilometres
    let phi1 = lat1 * (Math.PI/180);
    let phi2 = lat2 * (Math.PI/180);
    let delPhi = (lat2-lat1) * (Math.PI/180);
    let delLan = (lon2-lon1) * (Math.PI/180);

    let a = Math.sin(delPhi/2) * Math.sin(delPhi/2) + Math.cos(phi1) * Math.cos(phi2) * Math.sin(delLan/2) * Math.sin(delLan/2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    let d = r * c;
    return d
  }

  fromData(dataObj)
  {
    this._lng = dataObj._lng;
    this._lat = dataObj._lat;
  }
}

class Ship{
  // building attributes of class
  constructor(name,speed,range,description,cost,status,comments)
  {
    // comments default variable
    if (typeof comments === undefined){
      comments = ""
    }

    this._name = name;
    this._speed = speed;
    this._range = range;
    this._desc = description;
    this._cost = cost;
    this._status = status;
    this._comments = comments;
  }
  // defining accessors
  get name(){return this._name;}
  get speed(){return this._speed;}
  get range(){return this._range;}
  get desc(){return this._desc;}
  get cost(){return this._cost;}
  get status(){return this._status;}
  get comments(){return this._comments;}

  set status(newStatus){this._status = newStatus;}
  set comments(newComments){this._comments = newComments;}

  fromData(dataObj)
  {
    this._name = dataObj._name;
    this._speed = dataObj._speed;
    this._range = dataObj._range;
    this._desc = dataObj._desc;
    this._cost = dataObj._cost;
    this._status = dataObj._status;
    this._comments = dataObj._comments;
  }

}

class ShipFleet{
  // building attributes of class ShipFleet
    constructor()
    {
      this._availableShipList = [];
      this._activeShipList = [];
    }

    // defining accessors
    get availableShipList(){return this._availableShipList;}
    get activeShipList(){return this._activeShipList;}
    get shipList()
    {
      let shipList = this._availableShipList;
      for (let i = 0; i<this._activeShipList.length;i++){
        shipList.push(this._activeShipList[i])
      }
      return shipList
    }
    getAvailableShip(index)
  	{
  		if (index >= this._availableShipList.length)
  		{
  			return null;
  		}
  		return this._availableShipList[index];
  	}
    getActiveShip(index)
  	{
  		if (index >= this._activeShipList.length)
  		{
  			return null;
  		}
  		return this._activeShipList[index];
  	}

    reserveAvailableShip(shipIndex)
    {
      this._availableShipList[i].status = 'unavailable';
      this._availableShipList[i].comments = 'Currently on route'
    }

    reserveActiveShip(shipIndex)
    {
      this._activeShipList[i].status = 'unavailable';
      this._activeShipList[i].comments = 'Currently on route'
    }

    searchAvailableShips(ship)
    {
      for (let i = 0;i<this._availableShipList.length;i++){
        if (this._availableShipList[i].name == ship.name){
          return true
        }
      }
      return false
    }

    addAPIShip(ship)
    {
      this._availableShipList.push(ship);
    }

    addShip(ship)
    {
      this._activeShipList.push(ship);
    }

    fromData(dataObj)
    {
      this._availableShipList = [];
      for (let i = 0;i<dataObj._availableShipList.length;i++){
        let oldAvailableShip = new Ship;
        oldAvailableShip.fromData(dataObj._availableShipList[i]);
        this.addAPIShip(oldAvailableShip);
      }
      this._activeShipList = [];
      for (let i = 0;i<dataObj._activeShipList.length;i++){
        let oldActiveShip = new Ship;
        oldActiveShip.fromData(dataObj._activeShipList[i]);
        this.addShip(oldActiveShip);
    }
  }

}

class Port{
  // building attributes of class Port
    constructor(name, country, type, size, locationPrecision, coord)
    {
      this._name = name;
      this._country = country;
      this._type = type;
      this._size = size;
      this._locationPrecision = locationPrecision;
      this._coord = coord; // point object
    }

    // defining accessors
    get name(){return this._name;}
    get country(){return this._country;}
    get type(){return this._type;}
    get size(){return this._size;}
    get locationPrecision(){return this._locationPrecision;}
    get coord(){return this._coord;}

    fromData(dataObj)
    {
      this._name = dataObj._name;
      this._country = dataObj._country;
      this._type = dataObj._type;
      this._size = dataObj._size;
      this._locationPrecision = dataObj._locationPrecision;
      this._coord = new Point;
      this._coord.fromData(dataObj._coord);
    }
}

class Route{
  // building attributes of class Route
    constructor(id, startPort, endPort, startDate, ship, waypoints)
    {
      if (id != undefined){
        let distance = this._calculateDistance(startPort, endPort, waypoints)
        let endDate = this._calculateArrival(ship, startDate, distance)
        this._id = id;
        this._startPort = startPort;
        this._endPort = endPort;
        this._startDate = startDate;
        this._endDate = endDate;
        this._ship = ship;
        this._waypoints = waypoints;
        this._distance = distance;
        this._cost = ship.cost * distance;
        this._weather = new Weather;
        this._maxWeatherCalc = 7*24*60*60*1000; // milliseconds in 7 days
      }
    }

    // defining accessors
    get id(){return this._id;}
    get startPort(){return this._startPort;}
    get endPort(){return this._endPort;}
    get startDate(){return this._startDate;}
    get endDate(){return this._endDate;}
    get ship(){return this._ship;}
    get waypoints(){return this._waypoints;}
    get distance(){return this._distance;}
    get cost(){return this._cost;}
    get weather(){return this._weather;}

    // defining setters
    set waypoints(newWaypoints) { this._waypoints = newWaypoints;}
    set startDate(newStartDate) { this._startDate = newStartDate;}
    set endDate(newEndDate) { this._endDate = newEndDate;}

    getPrettyStartDate()
    {
      return this._startDate.getDate() + '/' + (this._startDate.getMonth() + 1) + '/' + this._startDate.getFullYear();
    }

    getPrettyEndDate()
    {
      return this._endDate.getDate() + '/' + (this._endDate.getMonth() + 1) + '/' + this._endDate.getFullYear();
    }

    _calculateDistance(start, end, waypoints)
    {
      let distance = 0;
      if (waypoints.length == 0)
      {
        distance += start.coord.getDistance(end.coord);
      }
      else
      {
        distance += start.coord.getDistance(waypoints[0]);
        for (let i = 0; i<waypoints.length-1;i++)
        {
          distance += waypoints[i].getDistance(waypoints[i+1]);
        }
        distance += waypoints[waypoints.length-1].getDistance(end.coord);
      }
      return distance
    }

    _calculateArrival(ship, startDate, distance)
    {
      let time = distance / ship.speed; // time taken in hours
      let time_milliseconds = 60*60*1000*time; // time taken in milliseconds
      let arrivalDate = new Date;
      arrivalDate.setTime(startDate.getTime()+time_milliseconds); // sets arrival time to time_milliseconds after arrival time
      return arrivalDate
    }

    getWeather(func)
    {
      let currentDate = new Date;
      let startTime = this._startDate.getTime() / 1000; // startDate in seconds
      let endTime = this._endDate.getTime() / 1000; // endDate in seconds
      if (this._endDate.getTime() - currentDate.getTime() > this._maxWeatherCalc){
        endTime = (currentDate.getTime() + this._maxWeatherCalc) / 1000;
      }
      if (this._startDate.getTime() - currentDate.getTime() > this._maxWeatherCalc){
        startTime = (currentDate.getTime() + this._maxWeatherCalc) / 1000;
      }
      endTime = endTime - (endTime % 1);
      startTime = startTime - (startTime % 1);
      let urlStart = 'https://api.darksky.net/forecast/96de7496623eb0829283b0d31e1bb14d/'
      urlStart += this._startPort.coord.lat;
      urlStart += ',';
      urlStart += this._startPort.coord.lng;
      urlStart += ',';
      urlStart += startTime + '/';
      let dataStart = {
      exclude: 'currently,minutely,hourly,flags',
      units: 'si',
      callback: func + '._calcWeatherStart'
      };
      this._jsonpRequest(urlStart, dataStart)
      let urlEnd = 'https://api.darksky.net/forecast/96de7496623eb0829283b0d31e1bb14d/'
      urlEnd += this._endPort.coord.lat;
      urlEnd += ',';
      urlEnd += this._endPort.coord.lng
      urlEnd += ',';
      urlEnd += endTime + '/';
      let dataEnd = {
      exclude: 'currently,minutely,hourly,flags',
      units: 'si',
      callback: func + '._calcWeatherEnd'
      };
      this._jsonpRequest(urlEnd, dataEnd)
    }

    _jsonpRequest(url, data)
    {
        // Build URL parameters from data object.
        let params = "";
        // For each key in data object...
        for (let key in data)
        {
            if (data.hasOwnProperty(key))
            {
                if (params.length == 0)
                {
                    // First parameter starts with '?'
                    params += "?";
                }
                else
                {
                    // Subsequent parameter separated by '&'
                    params += "&";
                }

                let encodedKey = encodeURIComponent(key);
                let encodedValue = encodeURIComponent(data[key]);

                params += encodedKey + "=" + encodedValue;
             }
        }
        let script = document.createElement('script');
        script.src = url + params;
        document.body.appendChild(script);
    }

    _calcWeatherStart(dataObj)
    {
      let weather_list = [];
      if (dataObj.hasOwnProperty('daily')){
        weather_list.push(dataObj.daily.data[0].summary);
        weather_list.push(dataObj.daily.data[0].temperatureMax);
        weather_list.push(dataObj.daily.data[0].temperatureMin);
        this._weather.startWeather = weather_list;
        if (document.getElementById('startWeatherSum') != undefined){
          document.getElementById('startWeatherSum').innerHTML = this.weatherSumStart();
        }
      }
      else{
        if (document.getElementById('startWeatherSum') != undefined){
          document.getElementById('startWeatherSum').innerHTML = 'Weather summary unavailable';
      }
    }
    }

    _calcWeatherEnd(dataObj)
    {
      let weather_list = [];
      if (dataObj.hasOwnProperty('daily')){
        weather_list.push(dataObj.daily.data[0].summary);
        weather_list.push(dataObj.daily.data[0].temperatureMax);
        weather_list.push(dataObj.daily.data[0].temperatureMin);
        this._weather.endWeather = weather_list;
        if (document.getElementById('endWeatherSum') != undefined){
          document.getElementById('endWeatherSum').innerHTML = this.weatherSumEnd();
        }
      }
      else{
        if (document.getElementById('endWeatherSum') != undefined){
          document.getElementById('endWeatherSum').innerHTML = 'Weather summary unavailable';
      }
    }
    }

    weatherSum()
    {
      return this.weatherSumStart() + ' ' + this.weatherSumEnd()
    }

    weatherSumStart()
    {
      let currentDate = new Date;
      let output = "";
      if (this._startDate.getTime() - currentDate.getTime() > this._maxWeatherCalc){
        output += 'As the departure time is greater than 7 days, the weather forcast at the departure port is only an estimate,'
        output += 'check again later for a more accurate forcast.'
      }
      output += "On " + this.getPrettyStartDate() + ' in ' + this._startPort.name;
      output += ' the weather will be ' + this._weather.startWeather[0];
      output += ' with a maximum temperature of ' + this._weather.startWeather[1] + ' degress Celsius';
      output += ' and a minimum temperature of ' + this._weather.startWeather[2] + ' degress Celsius.';
      return output
    }

    weatherSumEnd()
    {
      let currentDate = new Date;
      let output = "";
      if (this._endDate.getTime() - currentDate.getTime() > this._maxWeatherCalc){
        output += 'As the arrival time is greater than 7 days, the weather forcast at the arrival port is only an estimate,'
        output += 'check again later for a more accurate forcast.'
      }
      output += "On " + this.getPrettyEndDate() + ' in ' + this._endPort.name;
      output += ' the weather will be ' + this._weather.endWeather[0];
      output += ' with a maximum temperature of ' + this._weather.endWeather[1] + ' degress Celsius';
      output += ' and a minimum temperature of ' + this._weather.endWeather[2] + ' degress Celsius.';
      return output
    }


    fromData(dataObj)
    {
      this._id = dataObj._id
      let oldStart = new Port;
      oldStart.fromData(dataObj._startPort);
      this._startPort = oldStart;
      let oldEnd = new Port;
      oldEnd.fromData(dataObj._endPort);
      this._endPort = oldEnd;
      this._startDate = new Date (dataObj._startDate);
      this._endDate = new Date(dataObj._endDate);
      let oldShip = new Ship;
      oldShip.fromData(dataObj._ship);
      this._ship = oldShip;
      let oldWaypoints = [];
      for (let i = 0; i < dataObj._waypoints.length;i++){
        let oldPoint = new Point;
        oldPoint.fromData(dataObj._waypoints[i]);
        oldWaypoints.push(oldPoint);
      }
      this._waypoints = oldWaypoints;
      this._distance = dataObj._distance;
      this._cost = dataObj._cost;
      this._weather = new Weather;
      this.getWeather('mainMap._routeList['+(mainMap._routeList.length)+']')
      this._maxWeatherCalc = 7*24*60*60*1000;
    }
}

class Map{
  // building attributes of class Map
    constructor()
    {
      this._routeList = [];
      this._apiPortList = [];
      this._userAddedPortList = [];
    }

    // defining accessors
    get routeList(){return this._routeList;}
    get apiPortList()
    {
      return this._apiPortList;
    }
    get userAddedPortList()
    {
      return this._userAddedPortList;
    }
    get portList()
    {
      return this._apiPortList.concat(this._userAddedPortList);
    }
    getApiPort(index)
  	{
  		if (index >= this._apiPortList.length)
  		{
  			return null;
  		}
  		return this._apiPortList[index];
  	}
    getUserAddedPort(index)
    {
      if (index >= this._userAddedPortList.length)
      {
        return null;
      }
      return this._userAddedPortList[index];
    }

    getRoute(index)
  	{
  		if (index >= this._routeList.length)
  		{
  			return null;
  		}
  		return this._routeList[index];
  	}

    deleteRoute(index)
    {
      this._routeList.splice(index,1);
    }

    addRoute(route)
    {
      this._routeList.push(route);
    }

    addApiPort(port)
    {
      this.apiPortList.push(port);
    }

    addPort(port)
    {
      this._userAddedPortList.push(port);
    }

    searchApiPorts(port)
    {
      for (let i = 0;i<this._apiPortList.length;i++){
        if (this._apiPortList[i].name == port.name){
          return true
        }
      }
      return false
    }

    fromData(dataObj)
    {
      this._routeList = [];
      for (let i = 0; i<dataObj._routeList.length;i++){
        let addingRoute = new Route;
        addingRoute.fromData(dataObj._routeList[i]);
        this.addRoute(addingRoute);
      }
      this._apiPortList = [];
      for (let i = 0; i<dataObj._apiPortList.length;i++){
        let oldPort = new Port;
        oldPort.fromData(dataObj._apiPortList[i]);
        this.addApiPort(oldPort);
      }
      this._userAddedPortList = [];
      for (let i = 0; i<dataObj._userAddedPortList.length;i++){
        let oldPort = new Port;
        oldPort.fromData(dataObj._userAddedPortList[i]);
        this.addPort(oldPort);
      }
    }
}

class Weather{
  constructor()
  {
    this._startWeather = [];
    this._endWeather = [];
  }
  get startWeather(){return this._startWeather;}
  get endWeather(){return this._endWeather;}

  set startWeather(startWeather){this._startWeather = startWeather;}
  set endWeather(endWeather){this._endWeather = endWeather;}

  fromData(dataObj)
  {
    this._startWeather = dataObj._startWeather;
    this._endWeather = dataObj._endWeather;
  }


}

function jsonpRequest(url, data)
{
    // Build URL parameters from data object.
    let params = "";
    // For each key in data object...
    for (let key in data)
    {
        if (data.hasOwnProperty(key))
        {
            if (params.length == 0)
            {
                // First parameter starts with '?'
                params += "?";
            }
            else
            {
                // Subsequent parameter separated by '&'
                params += "&";
            }

            let encodedKey = encodeURIComponent(key);
            let encodedValue = encodeURIComponent(data[key]);

            params += encodedKey + "=" + encodedValue;
         }
    }
    let script = document.createElement('script');
    script.src = url + params;
    document.body.appendChild(script);
}
function requestShips(shipsObj)
{

  for (let i = 0; i < shipsObj.ships.length; i++){
    let oldShip = shipsObj.ships[i];
    oldShip.maxSpeed = oldShip.maxSpeed * 1.85 // converting knots to kilometres
    let newShip = new Ship(oldShip.name,oldShip.maxSpeed,oldShip.range,oldShip.desc,oldShip.cost,oldShip.status,oldShip.comments);
    mainFleet.addAPIShip(newShip);
  }
  localStorage.setItem("mainFleet", JSON.stringify(mainFleet));		// saving to local storage
  let shipList = document.getElementById("shipList");
  if (shipList != null){
    shipList.innerHTML = generateShipList();
  }
}
function requestCheckShips(shipsObj)
{

  for (let i = 0; i < shipsObj.ships.length; i++){
    if (mainFleet.searchAvailableShips(shipsObj.ships[i]) == false){
      let oldShip = shipsObj.ships[i];
      oldShip.maxSpeed = oldShip.maxSpeed * 1.85 // converting knots to kilometres
      let newShip = new Ship(oldShip.name,oldShip.maxSpeed,oldShip.range,oldShip.desc,oldShip.cost,oldShip.status,oldShip.comments);
      mainFleet.addAPIShip(newShip);
    }
  }
  localStorage.setItem("mainFleet", JSON.stringify(mainFleet));		// saving to local storage
  let shipList = document.getElementById("shipList");
  if (shipList != null){
    shipList.innerHTML = generateShipList();
  }
}
function requestPorts(portsObj)
{
  for (let i = 0; i < portsObj.ports.length; i++){
    let oldPort = portsObj.ports[i];
    let newPoint = new Point(oldPort.lng,oldPort.lat);
    let newPort = new Port(oldPort.name,oldPort.country,oldPort.type,oldPort.size,oldPort.locprecision,newPoint);
    mainMap.addApiPort(newPort);
  }
  localStorage.setItem("mainMap", JSON.stringify(mainMap));		// saving to local storage
  let portList = document.getElementById("portList");
  if (portList != null){
    portList.innerHTML = generatePortList();
  }
}

function requestCheckPorts(portsObj)
{

  for (let i = 0; i < portsObj.ports.length; i++){
    if (mainMap.searchApiPorts(portsObj.ports[i]) == false){
      let oldPort = portsObj.ports[i];
      let newPoint = new Point(oldPort.lng,oldPort.lat);
      let newPort = new Port(oldPort.name,oldPort.country,oldPort.type,oldPort.size,oldPort.locprecision,newPoint);
      mainMap.addApiPort(newPort);
    }
  }
  localStorage.setItem("mainMap", JSON.stringify(mainMap));		// saving to local storage
  let portList = document.getElementById("portList");
  if (portList != null){
    portList.innerHTML = generatePortList();
  }
}

// pulling from local storage
// instancing map class

let mainMap = new Map();
// checking if local storage has information
if (localStorage.hasOwnProperty("mainMap")){
	mainMap.fromData(JSON.parse(localStorage.getItem("mainMap")));
  url = "https://eng1003.monash/api/v1/ports/";
  data = {
    callback: 'requestCheckPorts'
  };
  jsonpRequest(url,data);
}
else{
  url = "https://eng1003.monash/api/v1/ports/";
  data = {
    callback: 'requestPorts'
  };
  jsonpRequest(url,data);
}


// instancing map class
let mainFleet = new ShipFleet();
// checking if local storage has information
if (localStorage.hasOwnProperty("mainFleet")){
  mainFleet.fromData(JSON.parse(localStorage.getItem("mainFleet")));
  url = "https://eng1003.monash/api/v1/ships/";
  data = {
    callback: 'requestCheckShips'
  };
  jsonpRequest(url,data);
}
else{
  url = "https://eng1003.monash/api/v1/ships/";
  data = {
    callback: 'requestShips'
  };
  jsonpRequest(url,data);
}
