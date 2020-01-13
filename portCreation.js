// PORT TAB
document.getElementById("portInformationSummary").style.visibility = "hidden";
function confirmPort()
{
  document.getElementById("portInformationSummary").style.visibility = "visible";
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

function addPort()
{
  // NOTE: have to find a way to stop people inputting now
  // taking input data
  namePort = document.getElementById("inNamePort").value;
  countryPort = document.getElementById("inCountryPort").value;
  typePort = document.getElementById("inTypePort").value;
  sizePort = document.getElementById("inSizePort").value;
  locationPrecisionPort = document.getElementById("inLocationPrecisionPort").value;
  latPort = document.getElementById("inLatPort").value;
  lngPort = document.getElementById("inLngPort").value;

  // displaying input data to user
  document.getElementById("namePort").innerHTML = namePort;
  document.getElementById("countryPort").innerHTML = countryPort;
  document.getElementById("typePort").innerHTML = typePort;
  if (document.getElementById("sizePort").innerHTML != ""){
  document.getElementById("sizePort").innerHTML = sizePort;
  }
  else{
  document.getElementById("sizePort").innerHTML = "Unknown";
  }
  document.getElementById("locationPrecisionPort").innerHTML = locationPrecisionPort;
  document.getElementById("latPort").innerHTML = latPort;
  document.getElementById("lngPort").innerHTML = lngPort;

  mapboxgl.accessToken = 'pk.eyJ1Ijoic21hcjAwNTEiLCJhIjoiY2swZzN2bGIzMDNtZTNjbnh1bm94d3ByZCJ9.CD0kSJKKLZqqlZIy0YekuA';
  let mapPort = new mapboxgl.Map({
  container: 'newPortMapArea', // container id
  style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
  center: [lngPort,latPort], // starting position [lng, lat]
  zoom: 13 // starting zoom
  });
  document.getElementById("newPortMapArea").style.visibility = "visible";
  portAddCon.style.visibility = "visible";
}

function confirmPort()
{
  let coords = new Point(lngPort,latPort);
  let addingPort = new Port(namePort,countryPort,typePort,sizePort,locationPrecisionPort,coords);
  mainMap.addPort(addingPort);
  localStorage.setItem("mainMap", JSON.stringify(mainMap));		// saving to local storage
  alert(namePort + " was added to the map");
}

function cancelPort()
{
  // NOTE: have to find a way so people can input again now
  portAddCon.style.visibility = "hidden";
  document.getElementById("newPortMapArea").style.visibility = "hidden";
}

function showFoundPorts()
{
  if (document.getElementById("inNamePort").value != ""){
    let url = 'https://api.opencagedata.com/geocode/v1/json'
     let data = {
       q: encodeURI(document.getElementById("inNamePort").value+","+document.getElementById("inCountryPort").value),
       key: '6d0f2e1795ac40bf939817a7c61c9317',
       jsonp: 'suggestPorts'
     };
     jsonpRequest(url,data);
   }
   else{
     alert("To suggest coordinates input a Port name in the name field")
   }
}

function suggestPorts(dataObj)
{
  console.log(dataObj);
  document.getElementById("inLatPort").value = dataObj.results[0].geometry.lat;
  document.getElementById("inLngPort").value = dataObj.results[0].geometry.lng;
  let suggestPort = dataObj.results[0].components;
  let suggestName;
  if (suggestPort.city != undefined){
    suggestName = suggestPort.city;
  }
  else if(suggestPort.county != undefined){
    suggestName = suggestPort.county;
  }
  else if(suggestPort.state != undefined){
    suggestName = suggestPort.state;
  }
  else{
    suggestName = 'Unknown';
  }
  alert(suggestName + ", " + suggestPort.country + " was suggested as the port coordinates")
}

let namePort = "";
let countryPort = "";
let typePort = "";
let sizePort = "";
let locationPrecisionPort = "";
let latPort = "";
let lngPort = "";


let portAddCon = document.getElementById("portAddConfirmation");
if (portAddCon != null){
  portAddCon.style.visibility = "hidden";
}
document.getElementById("inLatPort").value = " ";
document.getElementById("inLngPort").value = " ";

document.getElementById("newPortMapArea").style.visibility = "hidden";
