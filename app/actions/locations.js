import moment from 'moment';

export function getActiveLocations(succesCallback) {
  $.ajax({
    url : "/locations",
    type : "get",
    async: false,
    headers: { 'Content-Type': 'application/json' },
    success : succesCallback,
    error: function(error) {
      alert("Error in getting locations",error);
    }
  });

    // return fetch('/locations', {
    //     method: 'get',
    //     headers: { 'Content-Type': 'application/json' },
    //     synchronous: true
    //   }).then((response) => {
    //     if (response.ok) {
    //       return response.json().then((json) => {
    //         return json;
    //       });
    //     } else {
    //       alert("Error in getting locations",response.json());
    //     }
    //   });
}

export function getLayoutDetails(succesCallback) {
  $.ajax({
    url : "/layouts",
    type : "get",
    async: false,
    headers: { 'Content-Type': 'application/json' },
    success : succesCallback,
    error: function(error) {
      alert("Error in getting layouts",error);
    }
  });
}

export function getLayoutChunkDetails(url, succesCallback) {
  $.ajax({
    url : url,
    type : "get",
    async: false,
    headers: { 'Content-Type': 'application/json' },
    success : succesCallback,
    error: function(error) {
      alert("Error in getting layouts",error);
    }
  });
}

export function getCurrentLocationOfTag(succesCallback, tag_id) {
  $.ajax({
    url : "/locations/tasks/"+tag_id,
    type : "get",
    async: false,
    headers: { 'Content-Type': 'application/json' },
    success : succesCallback,
    error: function(err) {
      alert("Error in getting current locations of tag",err);
    }
  });
}

export function getLocationHistroyOfDevice(succesCallback, assigned_id) {
  $.ajax({
    url : "/locations/"+assigned_id+"/history",
    type : "get",
    async: false,
    headers: { 'Content-Type': 'application/json' },
    success : succesCallback,
    error: function(err) {
      alert("No history data found",err);
    }
  });
}

export function getGateEntries(succesCallback) {
  $.ajax({
    url : "/gate_entries/",
    type : "get",
    async: false,
    headers: { 'Content-Type': 'application/json' },
    success : succesCallback,
    error: function(err) {
      console.log("No gate data found",err);
    }
  });
}

function createZone(zoneData, eachGridX, eachGridY){
  //Calculate zone details
  zoneData.forEach(function(zone, index){
    //Calculate px of grid
    zone.zoneAtGrid = {};
    zone.zoneAtGrid.zoneStartsAtGridInX = (zone.x * eachGridX) - eachGridX + 1;
    zone.zoneAtGrid.zoneEndsAtGridInX = zone.zoneAtGrid.zoneStartsAtGridInX + ((zone.width - 1) * eachGridX);
    zone.zoneAtGrid.zoneStartsAtGridInY = (zone.y * eachGridY) - eachGridY + 1;
    zone.zoneAtGrid.zoneEndsAtGridInY = zone.zoneAtGrid.zoneStartsAtGridInY + ((zone.height - 1) * eachGridY);
    //Calculate zone's px
    zone.zoneInPx = {};
    zone.zoneInPx.zoneStartsInPxInX = zone.zoneAtGrid.zoneStartsAtGridInX;
    zone.zoneInPx.zoneEndsInPxInX = zone.zoneAtGrid.zoneEndsAtGridInX + eachGridX;
    zone.zoneInPx.zoneStartsInPxInY = zone.zoneAtGrid.zoneStartsAtGridInY;
    zone.zoneInPx.zoneEndsInPxInY = zone.zoneAtGrid.zoneEndsAtGridInY + eachGridY;
    //Calculate px for label and text
    zone.zoneLabelText = {};
    zone.zoneLabelText.labelWidht = 2 * eachGridY;
    zone.zoneLabelText.labelHeight = eachGridY;
    zone.zoneLabelText.labelStartsInX = zone.zoneInPx.zoneStartsInPxInX + ((zone.zoneInPx.zoneEndsInPxInX - zone.zoneInPx.zoneStartsInPxInX)/2) - (zone.zoneLabelText.labelWidht/2);
    zone.zoneLabelText.labelStartsInY = zone.zoneAtGrid.zoneStartsAtGridInY + eachGridY;
    zone.zoneLabelText.textStartsInX = zone.zoneLabelText.labelStartsInX + zone.zoneLabelText.labelWidht/2;
    zone.zoneLabelText.testStartInY = zone.zoneLabelText.labelStartsInY +  (zone.zoneLabelText.labelHeight/ 2);

  });
}

export function calculateZoneOfHistoryDate(history, zoneData, eachGridX, eachGridY){
  createZone(zoneData, eachGridX, eachGridY);
  zoneData.forEach(function(zone, index){
    history.forEach(function(location){
      if((zone.zoneInPx.zoneStartsInPxInX < location.x && location.x < zone.zoneInPx.zoneEndsInPxInX) && 
        (zone.zoneInPx.zoneStartsInPxInY < location.y && location.y< zone.zoneInPx.zoneEndsInPxInY)){
          location.zoneName = zone.name;
      }
    });
  });
  history.forEach(function(location){
    location.readableTime = moment(location.time).format("DD/MM/YYYY hh:mm a");
  });
  console.log(history);
}