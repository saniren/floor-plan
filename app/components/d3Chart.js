var d3 = require('d3');
var moment = require('moment');

function d3Chart(el, layout, layoutChunks) {
	this.el = el;
	this.layout = layout;
	this.layoutChunks = layoutChunks;
	this.currentSearchTag = undefined;
}

d3Chart.prototype.createImage = function(){
	//Create Image in d3 with SVG
	var gridWidth = this.layout.width,
		gridHeight = this.layout.height;

	this.image = d3.select('.Chart').append('svg')
		.attr('class', 'd3')
		.attr('id', 'layout_'+this.layout.layoutId)
		.attr('width', '100%')
		.attr('height', '100%')
		.attr('viewBox', '0 0 '+gridWidth+' '+gridHeight+'');

	this.image.append("svg:image")
		.attr('x',1)
		.attr('y',1)
		.attr('width', gridWidth)
		.attr('height', gridHeight)
		.attr("xlink:href","img/house-eco-simple-2-floors-plan-1.jpg");

}

d3Chart.prototype.updateViewPort = function(xStarts, yStarts, xEnds, yEnds, layoutId){
	d3.select("#layout_"+layoutId)
		.transition()
		.duration(500)
		.attr('viewBox', ''+xStarts+' '+yStarts+' '+xEnds+' '+yEnds+'');
}

// d3Chart.prototype.createZone = function(){
// 	//Calculate zone details
// 	var self = this;
// 	this.state.zoneData.forEach(function(zone, index){
// 		self.eachGridX = 30;
// 		self.eachGridY = 30;
// 		//Calculate px of grid
// 		zone.zoneAtGrid = {};
// 		zone.zoneAtGrid.zoneStartsAtGridInX = (zone.x * self.eachGridX) - self.eachGridX + 1;
// 		zone.zoneAtGrid.zoneEndsAtGridInX = zone.zoneAtGrid.zoneStartsAtGridInX + ((zone.width - 1) * self.eachGridX);
// 		zone.zoneAtGrid.zoneStartsAtGridInY = (zone.y * self.eachGridY) - self.eachGridY + 1;
// 		zone.zoneAtGrid.zoneEndsAtGridInY = zone.zoneAtGrid.zoneStartsAtGridInY + ((zone.height - 1) * self.eachGridY);
// 		//Calculate zone's px
// 		zone.zoneInPx = {};
// 		zone.zoneInPx.zoneStartsInPxInX = zone.zoneAtGrid.zoneStartsAtGridInX;
// 		zone.zoneInPx.zoneEndsInPxInX = zone.zoneAtGrid.zoneEndsAtGridInX + self.eachGridX;
// 		zone.zoneInPx.zoneStartsInPxInY = zone.zoneAtGrid.zoneStartsAtGridInY;
// 		zone.zoneInPx.zoneEndsInPxInY = zone.zoneAtGrid.zoneEndsAtGridInY + self.eachGridY;
// 		//Calculate px for label and text
// 		zone.zoneLabelText = {};
// 		zone.zoneLabelText.labelWidht = 2*self.eachGridY;
// 		zone.zoneLabelText.labelHeight = self.eachGridY;
// 		zone.zoneLabelText.labelStartsInX = zone.zoneInPx.zoneStartsInPxInX + ((zone.zoneInPx.zoneEndsInPxInX - zone.zoneInPx.zoneStartsInPxInX)/2) - (zone.zoneLabelText.labelWidht/2);
// 		zone.zoneLabelText.labelStartsInY = zone.zoneAtGrid.zoneStartsAtGridInY + self.eachGridY;
// 		zone.zoneLabelText.textStartsInX = zone.zoneLabelText.labelStartsInX + zone.zoneLabelText.labelWidht/2;
// 		zone.zoneLabelText.testStartInY = zone.zoneLabelText.labelStartsInY +  (zone.zoneLabelText.labelHeight/ 2);

// 		self.createZoneForImage(zone, index)

// 	});
// }

d3Chart.prototype.createZone = function(){
	var self = this;
	this.layoutChunks.forEach(function(chunk){

		chunk.zoneInPx = {};
		var startMicroGrid = chunk.area[0][0]&&chunk.area[0][0];
		var	startChar = startMicroGrid.replace(/[0-9]/g, '');
		var startYNum = Number(startMicroGrid.match(/\d+/g)[0]),
			startXNum = self.convertLetterToNumber(startChar);

		chunk.zoneInPx.chunkStartsAtXInPx = startXNum === 1? startXNum: (startXNum * self.layout.microGridAtXInUnit);
		chunk.zoneInPx.chunkStartsAtYInPx = startYNum === 1? startYNum: (startYNum * self.layout.microGridAtYInUnit);

		var endMicroGrid = chunk.area[0][0]&&chunk.area.reverse()[0].reverse()[0];
		var endChar = endMicroGrid.replace(/[0-9]/g, '');
		var endYNum = Number(endMicroGrid.match(/\d+/g)[0]),
			endXNum = self.convertLetterToNumber(endChar);

		chunk.zoneInPx.chunkEndsAtXInPx = endXNum * self.layout.microGridAtXInUnit;
		chunk.zoneInPx.chunkEndsAtYInPx = endYNum * self.layout.microGridAtYInUnit;

		chunk.zoneLabelText = {};
		// chunk.zoneLabelText.labelWidht = (chunk.zoneInPx.chunkEndsAtXInPx - chunk.zoneInPx.chunkStartsAtXInPx) < self.layout.microGridAtXInUnit ? self.layout.microGridAtXInUnit : (2*self.layout.microGridAtXInUnit);
		chunk.zoneLabelText.labelWidht = 60/self.layout.microGridAtXInPx;
		// chunk.zoneLabelText.labelHeight = self.layout.microGridAtYInUnit;
		chunk.zoneLabelText.labelHeight = 30/self.layout.microGridAtYInPx;
		chunk.zoneLabelText.labelStartsInX = chunk.zoneInPx.chunkStartsAtXInPx + ((chunk.zoneInPx.chunkEndsAtXInPx - chunk.zoneInPx.chunkStartsAtXInPx)/2) - (chunk.zoneLabelText.labelWidht/2);
		// chunk.zoneLabelText.labelStartsInY = chunk.area[1]?(chunk.zoneInPx.chunkStartsAtYInPx + self.layout.microGridAtYInUnit):chunk.zoneInPx.chunkStartsAtYInPx;
		chunk.zoneLabelText.labelStartsInY = chunk.zoneInPx.chunkStartsAtYInPx + ((chunk.zoneInPx.chunkEndsAtYInPx - chunk.zoneInPx.chunkStartsAtYInPx)/2) - (chunk.zoneLabelText.labelHeight/2);
		chunk.zoneLabelText.textStartsInX = chunk.zoneLabelText.labelStartsInX + chunk.zoneLabelText.labelWidht/2;
		chunk.zoneLabelText.testStartInY = chunk.zoneLabelText.labelStartsInY +  (chunk.zoneLabelText.labelHeight/ 2);

		self.createChunkDetailsForImage(chunk);
	})
}

d3Chart.prototype.createChunkDetailsForImage = function(chunk){
	//Create zone, label and text
	var self = this;
	
	// self.image.append("rect")
	// 	.attr("id", "image_rect"+"_"+zone.zoneInPx.zoneStartsInPxInX+"_"+zone.zoneInPx.zoneStartsInPxInY)
	// 	.attr("x", zone.zoneInPx.zoneStartsInPxInX)
	// 	.attr("y", zone.zoneInPx.zoneStartsInPxInY)
	// 	.attr("width", zone.zoneInPx.zoneEndsInPxInX - zone.zoneInPx.zoneStartsInPxInX)
	// 	.attr("height", zone.zoneInPx.zoneEndsInPxInY - zone.zoneInPx.zoneStartsInPxInY)
	// 	.style("fill", zone.color)
	// 	.style("stroke", zone.strokeColor)
	// 	.style("opacity", 1)
	var labelGroup = self.image.append("g")
						.attr("class", chunk.type)
						.style("display", function(d) { return chunk.type === "zone" ? "none" : "block"; })

	labelGroup.append("rect")
		.attr("x", chunk.zoneLabelText.labelStartsInX)
		.attr("y", chunk.zoneLabelText.labelStartsInY)
		.attr("width", chunk.zoneLabelText.labelWidht)
		.attr("height", chunk.zoneLabelText.labelHeight)
		.style("fill", "white");
	
	var textFontSize = 15/self.layout.microGridAtXInPx;

	labelGroup.append("text")
		.attr("id","chunk_"+chunk.layoutPartId)
		.attr("x", chunk.zoneLabelText.textStartsInX)
		.attr("y", chunk.zoneLabelText.testStartInY)
		.attr("dy", ".35em")
		.style("font-size",textFontSize)
		.text("0");
}

d3Chart.prototype.createCircleForImage = function(){
	//Create circle to show currently active device
	this.image.append("circle")
		.style("fill","green");
}

d3Chart.prototype.calculateMicroGridInPx = function(){
	var selectedLayout = $('#layout_'+this.layout.layoutId);
	debugger
	this.layout.microGridAtXInPx = selectedLayout.innerWidth()/this.layout.width;
	this.layout.microGridAtYInPx = selectedLayout.innerHeight()/this.layout.height;
	this.layout.microGridAtXInUnit = 1;
	this.layout.microGridAtYInUnit = 1;
}
d3Chart.prototype.create = function(){
	var self = this;
	this.createImage();
	this.calculateMicroGridInPx();
	this.createZone();
	// this.createCircleForImage();
	this.createToolTip();


}

d3Chart.prototype.createToolTip = function(){
	this.tooltip = d3.select("body").append("div")	
		.attr("class", "tooltip")				
		.style("opacity", 0);
}

d3Chart.prototype.updateTagsOfZone = function(tagCount){
	// debugger
	var self = this;

	// Update active devices in each zone
	// this.state.zoneData.forEach(function(zone, index){
	// 	newData.data.forEach(function(tag){
	// 		if((zone.zoneInPx.zoneStartsInPxInX < tag.x && tag.x < zone.zoneInPx.zoneEndsInPxInX) && 
	// 			(zone.zoneInPx.zoneStartsInPxInY < tag.y && tag.y< zone.zoneInPx.zoneEndsInPxInY)){
				
	// 			var indexOfTag = zone.activeTag.indexOf(tag.auid);
	// 			if (indexOfTag === -1) {
	// 				zone.activeTag.push(tag.auid);
	// 			}
	// 		} else {
	// 			var indexOfTag = zone.activeTag.indexOf(tag.auid);
	// 			if (indexOfTag > -1) {
	// 				zone.activeTag.splice(indexOfTag, 1);
	// 			}
	// 		}
	// 	});

	// 	//show count
	// 	self.image.select("#zone_"+index)
	// 		.text(zone.activeTag.length)

	// });
	//show count
	self.image.selectAll('text').text("0");
	for (var dept in tagCount) {
		self.image.select("#chunk_"+dept)
			.text(tagCount[dept].length)
	}
}

d3Chart.prototype.lightUpAllTags = function(tagList){
	var self = this;
	//remove all the circles
	self.image.selectAll('.circle_radient').remove();
	//create new circles
	tagList.forEach(function(tag){
		var circleRadius = (tag.pi === 0.5?6:(tag.pi===1?3:0))/*/self.layout.microGridAtXInPx*/;

		tag.microGridStartsInPx = self.getCoordinateByMicroGrid(tag.microGrid);

		var selectedCircle = self.image.select("#circle_"+tag.auid);
		if(!selectedCircle._groups[0][0]){
			
			var tagLocation =self.image.append("g")
							.attr('class', 'circle_radient')
							.attr("id", "circle_radient_"+tag.auid);
			
			var radialGradient = tagLocation.append("defs")
				.append("radialGradient")
				.attr("id", "radial-gradient_"+tag.auid);

			radialGradient.append("stop")
				.attr("offset", "0%")
				.attr("stop-color", "blue");

			radialGradient.append("stop")
				.attr("offset", "100%")
				.attr("stop-color", "#fff");

			tagLocation.append("circle")
				.attr("id", "circle_"+tag.auid)
				.style("fill","green")
				.style("display", self.currentSearchTag?(self.currentSearchTag.auid===tag.auid?"block":"none"):"block")
				.attr("cx",tag.x * self.layout.microGridAtXInUnit)
				.attr("cy",tag.y * self.layout.microGridAtYInUnit)
				.attr("r",circleRadius)
				.on("mouseover", function(d) {		
					self.tooltip.transition()		
						.duration(200)		
						.style("opacity", .9);		
					self.tooltip.html(self.tooltipText(tag))	
						.style("left", (d3.event.pageX) + "px")		
						.style("top", (d3.event.pageY) + "px");	
				})				
				.on("mouseout", function(d) {		
					self.tooltip.transition()		
						.duration(500)		
						.style("opacity", 0);	
				})
				.style("fill", "url(#radial-gradient_"+tag.auid+")");

		} else {
			selectedCircle
				.transition(1000)
				.attr("cx",tag.x * self.layout.microGridAtXInUnit)
				.attr("cy",tag.y * self.layout.microGridAtYInUnit)
		}
	})
}

d3Chart.prototype.tooltipText = function(tag){
	return tag.asid + "<br/>"  + 
			"X: " + (tag.x).toFixed(2) + ", "  + 
			"Y: " + (tag.y).toFixed(2) +", "  + 
			"pi: " + (tag.pi&&tag.pi) + "<br/>"  + 
			moment(tag.createdAt).fromNow();
}

d3Chart.prototype.updateCurrentLocationOfTag = function(currentLocation){
	this.currentSearchTag = currentLocation
	if(currentLocation){
		this.image.selectAll('circle_radient')
			.style("display", "none");
		
		//Update active device by updated data
		this.image.select("#circle_radient_"+currentLocation.auid)	
			.style("display", "block");
	} else {
		this.image.selectAll('circle_radient')
			.style("display", "block");
	}
}
d3Chart.prototype.updateLabelVisibility = function(showType, hideType){
	
	this.image.selectAll("."+showType)
		.transition()		
		.duration(500)	
		.style('display', 'block')

	this.image.selectAll("."+hideType)
		.transition()		
		.duration(500)	
		.style('display', 'none')
}

d3Chart.prototype.convertLetterToNumber = function(str) {
  var out = 0, len = str.length;
  for (var pos = 0; pos < len; pos++) {
    out += (str.charCodeAt(pos) - 64) * Math.pow(26, len - pos - 1);
  }
  return out;
}

d3Chart.prototype.getCoordinateByMicroGrid = function(microGrid){
	var xChar = microGrid.replace(/[0-9]/g, '');
	var yNum = Number(microGrid.match(/\d+/g)[0]) - 1,
		xNum = this.convertLetterToNumber(xChar) - 1;
	return {x: xNum, y: yNum};
}

export default d3Chart