
var schema = require('../models/schema'),
    shortId = require('shortid'),
    q = require('q'),
	calculatePosition = require('./calculatePosition'),
	tasks = require('./tasks'),
	layoutFunctions = require('./layout');

//Controller to add location
exports.addLocation = function(req, res){
	addLocationImpl(req.body).then(
		function(result){
			res.json(result);
		}, function(error) {
			res.status(404);
			res.json(error);
		}
	);
}

//Controller to get locations
exports.getLocations = function(req, res){
	getLocationsImpl().then(
		function(result){
			res.json(result);
		}, function(error) {
			res.status(404);
			res.json(error);
		}
	);
}

exports.getCurrentLocationOfTag = function(req, res){
	getCurrentLocationOfTagImpl(req.param('id')).then(
		function(result){
			res.json(result);
		}, function(error) {
			res.status(404);
			res.json(error);
		}
	);
}

//Calculate distance by given rssi decibel
function calculateDistance(rssi) {
	var txPower = -59 //hard coded power value. Usually ranges between -59 to -65
	var  ratioo = (-1.0*rssi+txPower)/29 ;
	var distance =  Math.pow(10,ratioo) + 0.111;
	return distance;
}
//Implementation to add location
var addLocationImpl = function(data){
	var deferred = q.defer();
	data.rawDataId = shortId.generate();
	data.time = (new Date()).getTime();

	var tagCoordinate;

	q.all(data.receivers.map(function(receiver){
		//Find current receiver co-ordinate
		var receiverCoordinate = schema.mongoFindOne(schema.receiverModel, { receiverId: receiver}, {});
		console.log(receiverCoordinate,"iiiiiii");
		return receiverCoordinate;
	})).then(function(result){
		//Make p1, p2, p3 objects based on three receiver
		var [p1,p2,p3] = result.map(function(coordinate, index){
			//Right now for 2d so using only x,y and don't consider z
			return {x:coordinate.x,y:coordinate.y,z:coordinate.z ,dis:calculateDistance(data.rssi[index])};
		});
		console.log(p1,p2,p3,"ooooo",calculatePosition);
		//Pass three receiver co-ordinates to trilaterate function to get tag co-ordinates
		var tagCoordinate = calculatePosition.calculatePosition([p1,p2,p3]);
		console.log(tagCoordinate,"eeeeewwwwwww");
		//get appropriate micro grid
		var xInUnit = Math.floor(tagCoordinate.x)+1;
		var yInUnit = String(Math.floor(tagCoordinate.y)+1);
		console.log(yInUnit,"xInUnit",xInUnit,layoutFunctions.convertNumberToAlphabet);
		var microGrid = layoutFunctions.convertNumberToAlphabet(xInUnit) + yInUnit;
		console.log(microGrid,"microGriddddd");
		//Add calcaulated tag co-ordiante in location table
		insertInLocationTable(tagCoordinate,data,microGrid).then(
			function(result2){
				deferred.resolve(result2);
			}, function(error) {
				deferred.reject(error);
			}
		);
	});
	return deferred.promise;
}

var insertInLocationTable = function(tagCoordinate,data,microGrid){
	//Insert tag location in location table
	var deferred = q.defer(),
		time = (new Date()).getTime();
	//Get zone by micro grid	
	schema.mongoFind(schema.layoutPartModel, {"area":{"$elemMatch":{"$elemMatch":{$in:[microGrid]}}}}, {}).then(
		function(layoutChunk){
			console.log("layoutChunk", layoutChunk);
			tasks.getActiveTaskByAuid(data.auid).then(
				function(task){
					var chunkIds = {'zone':'','department':''},
						chunkName = {'zone':'','department':''};
					layoutChunk.forEach(function(chunk){
						chunkIds[chunk.type]=chunk.layoutPartId;
						chunkName[chunk.type]=chunk.name;
					});
					console.log("taskkkkk", task);
					var location = {
						auid: data.auid,
						asid: task.length === 0?null:task[0].asid,
						x: tagCoordinate.x,
						y: tagCoordinate.y,
						z: tagCoordinate.z?tagCoordinate.z:0,
						pi: data.pi,
						microGrid: microGrid,
						layoutChunkId: chunkIds,
						layoutChunkName: chunkName,
						createdAt: time,
						updatedAt: time
					};
					console.log("locationlllll", location);
					schema.mongoInsert(schema.rawDataModel, data).then(
						function(rawLocationData){
							schema.mongoInsert(schema.locationModel, location).then(
								function(processedLocation){
									deferred.resolve(processedLocation);
								}, function(error) {
									deferred.reject(error);
								}
							);
						}, function(error) {
							deferred.reject(error);
						});
			}, function(error) {
				deferred.reject(error);
			});
		}, function(error) {
			deferred.reject(error);
		}
	);
	return deferred.promise;
}
//Implementation to get locations
var getLocationsImpl = function(){
	var deferred = q.defer();
	var currentTimeXMinAgo = (new Date()).getTime() - (10 * 60 * 1000);
	tasks.getActiveTasksImpl({'auid':1,'_id':0}).then(function(activeDevices){
		activeDevices = activeDevices.map(function(auidObj){return auidObj.auid;});
		console.log("activeDevices----",activeDevices);
		schema.mongoFind(schema.locationModel, { 'auid':{$in:activeDevices}, createdAt: { $gt: currentTimeXMinAgo } }, {}).then(
			function(result){
				deferred.resolve(result);
			}, function(error) {
				deferred.reject(error);
			}
		);
	}, function(error) {
		deferred.reject(error);
	})

	return deferred.promise;
}

//Get added new location and pass to client using sockent.emit function
var getNewLocations = function(socket, time, activeDevices){
	var deferred = q.defer();
	var currentTimeXMinAgo = (new Date()).getTime() - (10 * 60 * 1000);
	schema.mongoFind(schema.locationModel, { createdAt: { $gt: currentTimeXMinAgo }, 'auid':{$in:activeDevices} }, {}, {sort: {createdAt: 1 }}).then(
		function(result){
			console.log("location...new ", result, result.length);
			if(result.length > 0){
				console.log("location...new inseide ", result, result.length,result.slice(-1)[0]);
				updateLastPollTime(result.slice(-1)[0].createdAt);
				console.log("newLocations...here ", result);
				socket.broadcast.emit('location', {data:result});
				deferred.resolve(result);
			}
		}, function(error) {
			console.log("location...new..error ", error);
			deferred.reject(error);
		}
	);
	return deferred.promise;
}
//Update last poll time
var updateLastPollTime = function(time){
	var deferred = q.defer();
	console.log("updateLastPollTime...we ", time);
	schema.mongoUpdate(schema.lastPollModel, {}, {time: time}).then(
		function(result){
			console.log("update poll...last ", result);
			deferred.resolve(result);
		}, function(error) {
			deferred.reject(error);
		}
	);
	return deferred.promise;
}
//poll location table to get new locations 
exports.pollForNewLocations = function(socket){
	var deferred = q.defer();
	schema.mongoFindOne(schema.lastPollModel, {}, {}).then(
		function(lastPolltime){
			if(lastPolltime){
				console.log("poll time...last ", lastPolltime);
				tasks.getActiveTasksImpl({'auid':1,'_id':0}).then(function(activeDevices){
					activeDevices = activeDevices.map(function(auidObj){return auidObj.auid;});
					console.log("activeDevices----",activeDevices);
					getNewLocations(socket, lastPolltime.time, activeDevices).then(
						function(newLocations){
							deferred.resolve(newLocations);
						}, function(error) {
							deferred.reject(error);
						}
					)
				}, function(error) {
					deferred.reject(error);
				})
			} else {
				schema.mongoInsert(schema.lastPollModel, {time: 0});
			}
		}, function(error) {
			deferred.reject(error);
		}
	);
	return deferred.promise;
}

var getCurrentLocationOfTagImpl = function(asid){
	var deferred = q.defer();
	tasks.getActiveTaskByConditionImpl({'asid':asid, 'active': 'Y'}).then(
		function(task){
			console.log("dddddddd",task);
			if(task.length !== 0){
				schema.mongoFind(schema.locationModel, {'auid': task[0].auid}, {}, {sort: {time: 1 }}).then(
					function(locations){
						deferred.resolve(locations.slice(-1)[0]);
					}, function(error) {
						deferred.reject(error);
					}
				);
			} else {
				deferred.reject({'message': 'No Data Found'});
			}
		}, function(error) {
			deferred.reject(error);
		}
	);
	return deferred.promise;
}

exports.getLocationHistory = function(req, res){
	getLocationHistoryImpl(req.param('taskId')).then(
		function(result){
			res.json(result);
		}, function(error) {
			res.status(404);
			res.json(error);
		}
	);
}

var getLocationHistoryImpl = function(deviceId){
	var deferred = q.defer();
	schema.mongoFind(schema.locationModel, {'asid': deviceId}, {}).then(
		function(locations){
			// q.all(locations.map(getZoneDetails)).then(
			// 	function(historyOfDevice){
			// 		deferred.resolve(historyOfDevice);
			// 	}, function(error) {
			// 		deferred.reject(error);
			// 	}
			// );
			if(locations.length !== 0)
				deferred.resolve(locations);
			else
				deferred.reject({'message': 'No Data Found'});
		}, function(error) {
			deferred.reject(error);
		}
	);
	return deferred.promise;
}

exports.addTag = function(req, res){
	console.log("-----------------add tag-----")
	addTagImpl(req.body).then(
		function(result){
			res.json(result);
		}, function(error) {
			res.status(404);
			res.json(error);
		}
	);
}

var addTagImpl = function(data){
	var deferred = q.defer();
	console.log(data,"................data.....111");
	data.time = (new Date()).getTime();
	console.log(data,"................data.....");
	schema.mongoFindOne(schema.lastActiveTagModel, {}, {}).then(
		function(lastActiveTag){
			if(lastActiveTag){
				schema.mongoUpdate(schema.lastActiveTagModel, {}, data).then(
					function(result){
						console.log("lastActiveTagModel......update", result);
						deferred.resolve(result);
					}, function(error) {
						deferred.reject(error);
					}
				);
			} else {
				schema.mongoInsert(schema.lastActiveTagModel, data).then(
					function(result){
						console.log("lastActiveTagModel......insert", result);
						deferred.resolve(result);
					}, function(error) {
						deferred.reject(error);
					}
				);
			}
		}, function(error) {
				deferred.reject(error);
			}
		);
	return deferred.promise;
}

exports.getLastActiveTag = function(req, res){
	getLastActiveTagImpl().then(
		function(result){
			res.json(result);
		}, function(error) {
			res.status(404);
			res.json(error);
		}
	);
}

var getLastActiveTagImpl = function(deviceId){
	var deferred = q.defer();
	schema.mongoFind(schema.lastActiveTagModel, {}, {}).then(
		function(tag){
			if(tag.length !== 0){
				console.log(tag,"ooooooooo-----");
				tasks.getActiveTaskByAuid(tag[0].auid).then(
					function(result){
						console.log(result,"ooooooooo-----lllll");
						result.length === 0?deferred.resolve(tag):deferred.reject({'message': 'No Nearby tag found'});
					}, function(error) {
						deferred.reject(error);
					})
			}else{
				deferred.reject({'message': 'No Data Found'});
			}
		}, function(error) {
			deferred.reject(error);
		}
	);
	return deferred.promise;
}
