export default function gridData(state = {}, action) {
	var data = new Array();
	var xpos = 1; //starting xpos and ypos at 1 so the stroke will show when we make the grid below
	var ypos = 1;
	var width = 30;
	var height = 30;
	var click = 0;
	var rows = 36;
	var columns = 27;
	
	// iterate for rows	
	for (var row = 0; row < rows; row++) {
		data.push( new Array() );
		
		// iterate for cells/columns inside rows
		for (var column = 0; column < columns; column++) {
			data[row].push({
				x: xpos,
				y: ypos,
				width: width,
				height: height,
				click: click
			})
			// increment the x position. I.e. move it over by 30 (width variable)
			xpos += width;
		}
		// reset the x position after a row is complete
		xpos = 1;
		// increment the y position for the next row. Move it down 30 (height variable)
		ypos += height;	
	}
	return {cells:data, cellWidth: width, cellHeight: height, noOfRows: rows, noOfColumns: columns};
}