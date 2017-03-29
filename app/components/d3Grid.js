var d3 = require('d3');

function d3Grid(el, props, state) {
	this.el = el;
	this.props = props;
	this.state = state;
}

d3Grid.prototype.createGrid = function(){
	//Create grid in d3 with SVG
	var gridWidth = this.state.gridData.cellWidth * this.state.gridData.noOfColumns+2,
		gridHeight = this.state.gridData.cellHeight * this.state.gridData.noOfRows+2;

	this.grid = d3.select('.Grid').append('svg')
		.attr('class', 'd3')
		.attr('width', gridWidth)
		.attr('height', gridHeight)
		.attr('viewBox', '0 0 '+gridWidth+' '+gridHeight+'');


	var row = this.grid.selectAll(".row")
		.data(this.state.gridData.cells)
		.enter().append("g");
		
	var column = row.selectAll(".square")
		.data(function(d) { return d; })
		.enter().append("rect")
		.attr("id", function(d) { return "rect"+"_"+d.x+"_"+d.y; })
		.attr("x", function(d) { return d.x; })
		.attr("y", function(d) { return d.y; })
		.attr("width", function(d) { return d.width; })
		.attr("height", function(d) { return d.height; })
		.style("fill", "#fff")
		.style("stroke", "lightgray");


	this.grid.append('rect')
		.attr('width', gridWidth)
		.attr('height', gridHeight)
		.style("stroke", "#222")
		.style("opacity", "0");
}

d3Grid.prototype.createZone = function(){
	//Calculate zone details
	var self = this;
	this.state.zoneData.forEach(function(zone, index){
		self.eachGridX = 30;
		self.eachGridY = 30;
		//Calculate px of grid
		zone.zoneAtGrid = {};
		zone.zoneAtGrid.zoneStartsAtGridInX = (zone.x * self.eachGridX) - self.eachGridX + 1;
		zone.zoneAtGrid.zoneEndsAtGridInX = zone.zoneAtGrid.zoneStartsAtGridInX + ((zone.width - 1) * self.eachGridX);
		zone.zoneAtGrid.zoneStartsAtGridInY = (zone.y * self.eachGridY) - self.eachGridY + 1;
		zone.zoneAtGrid.zoneEndsAtGridInY = zone.zoneAtGrid.zoneStartsAtGridInY + ((zone.height - 1) * self.eachGridY);
		//Calculate zone's px
		zone.zoneInPx = {};
		zone.zoneInPx.zoneStartsInPxInX = zone.zoneAtGrid.zoneStartsAtGridInX;
		zone.zoneInPx.zoneEndsInPxInX = zone.zoneAtGrid.zoneEndsAtGridInX + self.eachGridX;
		zone.zoneInPx.zoneStartsInPxInY = zone.zoneAtGrid.zoneStartsAtGridInY;
		zone.zoneInPx.zoneEndsInPxInY = zone.zoneAtGrid.zoneEndsAtGridInY + self.eachGridY;
		//Calculate px for label and text
		zone.zoneLabelText = {};
		zone.zoneLabelText.labelWidht = 2*self.eachGridY;
		zone.zoneLabelText.labelHeight = self.eachGridY;
		zone.zoneLabelText.labelStartsInX = zone.zoneInPx.zoneStartsInPxInX + ((zone.zoneInPx.zoneEndsInPxInX - zone.zoneInPx.zoneStartsInPxInX)/2) - (zone.zoneLabelText.labelWidht/2);
		zone.zoneLabelText.labelStartsInY = zone.zoneAtGrid.zoneStartsAtGridInY + self.eachGridY;
		zone.zoneLabelText.textStartsInX = zone.zoneLabelText.labelStartsInX + zone.zoneLabelText.labelWidht/2;
		zone.zoneLabelText.testStartInY = zone.zoneLabelText.labelStartsInY +  (zone.zoneLabelText.labelHeight/ 2);

		self.createZoneForGrid(zone, index);

	});
}

d3Grid.prototype.createZoneForGrid = function(zone, index){
	//Create zone, label and text
	var self = this;
	// for(var yGrid = 0; yGrid < zone.height; yGrid++){
	// 	for(var xGrid = 0; xGrid < zone.width; xGrid++){	
			
	// 		var x = zone.zoneAtGrid.zoneStartsAtGridInX + (xGrid * self.eachGridX),
	// 			y = zone.zoneAtGrid.zoneStartsAtGridInY + (yGrid * self.eachGridY);
			
	// 		self.grid.select("#rect_"+x+"_"+y)
	// 			.style("fill", zone.color)
	// 			.style("stroke", zone.strokeColor)
	// 			.style("opacity", 1);
	// 	}
	// }

	self.grid.append("rect")
		.attr("id", "image_rect"+"_"+zone.zoneInPx.zoneStartsInPxInX+"_"+zone.zoneInPx.zoneStartsInPxInY)
		.attr("x", zone.zoneInPx.zoneStartsInPxInX)
		.attr("y", zone.zoneInPx.zoneStartsInPxInY)
		.attr("width", zone.zoneInPx.zoneEndsInPxInX - zone.zoneInPx.zoneStartsInPxInX)
		.attr("height", zone.zoneInPx.zoneEndsInPxInY - zone.zoneInPx.zoneStartsInPxInY)
		.style("fill", zone.color)
		.style("stroke", zone.strokeColor)
		.style("opacity", 1);


	self.grid.append("rect")
		.attr("x", zone.zoneLabelText.labelStartsInX)
		.attr("y", zone.zoneLabelText.labelStartsInY)
		.attr("width", zone.zoneLabelText.labelWidht)
		.attr("height", zone.zoneLabelText.labelHeight)
		.style("fill", "white");

	self.grid.append("text")
		.attr("id","zone_"+index)
		.attr("x", zone.zoneLabelText.textStartsInX)
		.attr("y", zone.zoneLabelText.testStartInY)
		.attr("dy", ".35em")
		.text("0");
}

d3Grid.prototype.createCircleForGrid = function(){
	//Create circle to show currently active device
	this.grid.append("circle")
		.style("fill","green");
}

d3Grid.prototype.create = function(){
	debugger
	var self = this;
	this.createGrid();
	this.createZone();
	this.createCircleForGrid();
}

d3Grid.prototype.update = function(newData){
	// debugger
	var self = this;
	//Update active device by updated data
	// this.grid.select('circle')
	// 	.transition(1000)
	// 	.attr("cx",newData.data[0].x)
	// 	.attr("cy",newData.data[0].y)
	// 	.attr("r",10);

	//Update active devices in each zone
	this.state.zoneData.forEach(function(zone, index){
		newData.data.forEach(function(tag){
			if((zone.zoneInPx.zoneStartsInPxInX < tag.x && tag.x < zone.zoneInPx.zoneEndsInPxInX) && 
				(zone.zoneInPx.zoneStartsInPxInY < tag.y && tag.y< zone.zoneInPx.zoneEndsInPxInY)){
				
				var indexOfTag = zone.activeTag.indexOf(tag.auid);
				if (indexOfTag === -1) {
					zone.activeTag.push(tag.auid);
				}
			} else {
				var indexOfTag = zone.activeTag.indexOf(tag.auid);
				if (indexOfTag > -1) {
					zone.activeTag.splice(indexOfTag, 1);
				}
			}
		});
		self.grid.select("#zone_"+index)
			.text(zone.activeTag.length)
	});


}
export default d3Grid