
var schema = require('../models/schema'),
    shortId = require('shortid'),
    q = require('q');

//Controller to add layout part
exports.addLayoutPart = function(req, res){
	addLayoutPartImpl(req.body).then(
		function(result){
			res.json(result);
		}, function(error) {
			res.status(404);
			res.json(error);
		}
	);
}
//add layout part implementation
var addLayoutPartImpl = function(data){
	var deferred = q.defer();
	var layoutPart = {};

	layoutPart.layoutPartId = shortId.generate();
	layoutPart.createdAt = (new Date()).getTime();
	layoutPart.updatedAt = layoutPart.createdAt;
	var tempArea = data.area.split(","),
		tempMicroGrid = [];
	tempArea.forEach(function(range){
		var microGrids = getMicroGridRange(range)
		tempMicroGrid = tempMicroGrid.concat(microGrids);
	});
	layoutPart.area = tempMicroGrid;
	layoutPart.layoutId = data.layoutId;
	layoutPart.name = data.name;
	layoutPart.type = data.type;
	console.log("qqqq111",layoutPart)

	schema.mongoInsert(schema.layoutPartModel, layoutPart).then(
		function(result){
			deferred.resolve(result);
		}, function(error) {
			deferred.reject(error);
		}
	)

	return deferred.promise;
}
//Controller to get layout part
exports.getLayoutPart = function(req, res){
	getLayoutPartImpl().then(
		function(result){
			res.json(result);
		}, function(error) {
			res.status(404);
			res.json(error);
		}
	);
}
var getLayoutPartImpl = function(){
	var deferred = q.defer();
	schema.mongoFind(schema.layoutPartModel, {}, {}).then(
		function(layoutPart){
			if(layoutPart.length !== 0)
				deferred.resolve(layoutPart);
			else
				deferred.reject({'message': 'No Layout Data Found'});
		}, function(error) {
			deferred.reject(error);
		}
	);
	return deferred.promise;
}
//Controller to get layout chunks by id
exports.getLayoutChunksById = function(req, res){
	getLayoutChunksByIdImpl(req.param('id')).then(
		function(result){
			res.json(result);
		}, function(error) {
			res.status(404);
			res.json(error);
		}
	);
}
var getLayoutChunksByIdImpl = function(layoutId){
	var deferred = q.defer();
	schema.mongoFind(schema.layoutPartModel, {layoutId:layoutId}, {}).then(
		function(layoutPart){
			if(layoutPart.length !== 0)
				deferred.resolve(layoutPart);
			else
				deferred.reject({'message': 'No Layout Data Found'});
		}, function(error) {
			deferred.reject(error);
		}
	);
	return deferred.promise;
}


function getMicroGridRange(range){
	var startEnd = range.split(":"),
		startChar = startEnd[0].replace(/[0-9]/g, ''),
		startNum = Number(startEnd[0].match(/\d+/g)[0]),
		endChar = startEnd[1].replace(/[0-9]/g, ''),
		endNum = Number(startEnd[1].match(/\d+/g)[0]),
		microGrids = [];

	for(var i=startNum;i<endNum;i++){
		var tempArr = [];
		var tempChar = startChar.trim();

		while(tempChar !== endChar){
			tempArr.push(tempChar+String(i));
			tempChar = nextChar(tempChar).trim();
		}
		microGrids.push(tempArr)
		console.log("microGrids",microGrids)
	}
	return microGrids;
}

function nextChar(c) {
	var u = c.toUpperCase();
    if (same(u,'Z')){
        var txt = '';
        var i = u.length;
        while (i--) {
            txt += 'A';
        }
        return (txt+'A');
    } else {
        var p = "";
        var q = "";
        if(u.length > 1){
            p = u.substring(0, u.length - 1);
            q = String.fromCharCode(p.slice(-1).charCodeAt(0));
        }
        var l = u.slice(-1).charCodeAt(0);
        var z = nextLetter(l);
        if(z==='A'){
            return p.slice(0,-1) + nextLetter(q.slice(-1).charCodeAt(0)) + z;
        } else {
            return p + z;
        }
    }
}

function nextLetter(l){
    if(l<90){
        return String.fromCharCode(l + 1);
    }
    else{
        return 'A';
    }
}

function same(str,char){
    var i = str.length;
    while (i--) {
        if (str[i]!==char){
            return false;
        }
    }
    return true;
}

exports.convertNumberToAlphabet = function(number) {
  var baseChar = ("A").charCodeAt(0),
      letters  = "";

  do {
    number -= 1;
    letters = String.fromCharCode(baseChar + (number % 26)) + letters;
    number = (number / 26) >> 0;
  } while(number > 0);

  return letters;
}

//Controller to add layout 
exports.addLayout = function(req, res){
	addLayoutImpl(req.body).then(
		function(result){
			res.json(result);
		}, function(error) {
			res.status(404);
			res.json(error);
		}
	);
}
var addLayoutImpl = function(layout){
	var deferred = q.defer();
	layout.layoutId = shortId.generate();
	layout.createdAt = (new Date()).getTime();
	layout.updatedAt = layout.createdAt;

	schema.mongoInsert(schema.layoutModel, layout).then(
		function(result){
			deferred.resolve(result);
		}, function(error) {
			deferred.reject(error);
		}
	)

	return deferred.promise;
}

//Controller to get layout 
exports.getLayout = function(req, res){
	getLayoutImpl().then(
		function(result){
			res.json(result);
		}, function(error) {
			res.status(404);
			res.json(error);
		}
	);
}
var getLayoutImpl = function(){var deferred = q.defer();
	schema.mongoFind(schema.layoutModel, {}, {}).then(
		function(layout){
			if(layout.length !== 0)
				deferred.resolve(layout);
			else
				deferred.reject({'message': 'No Layout Data Found'});
		}, function(error) {
			deferred.reject(error);
		}
	);
	return deferred.promise;
}

//Controller to delete layout
exports.deleteLayout = function(req, res){
	deleteLayoutImpl(req.param('id')).then(
		function(result){
			res.json(result);
		}, function(error) {
			res.status(404);
			res.json(error);
		}
	);
}

//delete given layout
var deleteLayoutImpl = function(layoutId){
	var deferred = q.defer();
	schema.mongoRemove(schema.layoutModel, {layoutId: layoutId}).then(
		function(result){
			deferred.resolve(result);
		}, function(error) {
			deferred.reject(error);
		}
	);
	return deferred.promise;
}