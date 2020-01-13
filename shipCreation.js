// SHIP TAB

// date: 29/09/2019
/* Global Code */

 // instancing map class

document.getElementById("shipInformationSummary").style.visibility = "hidden";


// initializing global VARIABLES
let nameShip = "";
let speedShip = "";
let rangeShip = "";
let descShip = "";
let costShip = "";
let statusShip = "";
let commentsShip = "";

function addShip()
{
  // NOTE: have to find a way to stop people inputting now
  // taking input data
  nameShip = document.getElementById("inNameShip").value;
  speedShip = Number(document.getElementById("inSpeedShip").value);
  rangeShip = Number(document.getElementById("inRangeShip").value);
  descShip = document.getElementById("inDescShip").value;
  costShip = Number(document.getElementById("inCostShip").value);
  statusShip = document.getElementById("inStatusShip").value;
  commentsShip = document.getElementById("inComShip").value;

  if (nameShip != '' && speedShip != NaN && rangeShip != NaN && descShip != "" && costShip != NaN){
    // displaying input data to user
    document.getElementById("nameShip").innerHTML = nameShip;
    document.getElementById("speedShip").innerHTML = speedShip + " (knots)";
    document.getElementById("rangeShip").innerHTML = rangeShip + " (km)";
    document.getElementById("descShip").innerHTML = descShip
    document.getElementById("costShip").innerHTML = costShip;
    if (statusShip == ""){
      statusShip = "available"
    }
    document.getElementById("statusShip").innerHTML = statusShip;
    if (commentsShip== ""){
      document.getElementById("commentsShip").innerHTML = "No comments";
    }
    else{
      document.getElementById("commentsShip").innerHTML = commentsShip
    }
    document.getElementById("shipInformationSummary").style.visibility = "visible";
  }
}

function confirmShip()
{
  let addingShip = new Ship(nameShip,speedShip,rangeShip,descShip,costShip,statusShip,commentsShip);
  mainFleet.addShip(addingShip);
  alert(addingShip.name + ' was created')
  localStorage.setItem("mainFleet", JSON.stringify(mainFleet));		// saving to local storage
}
function cancelShip()
{
  // NOTE: have to find a way so people can input again now
  document.getElementById("shipInformationSummary").style.visibility = "hidden";
}
