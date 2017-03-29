
var schema = require('../models/schema'),
    shortId = require('shortid'),
    q = require('q');

//Controller to add task
exports.addGateEntry = function(req, res){
	addGateEntryImpl(req.body).then(
		function(result){
			res.json(result);
		}, function(error) {
			res.status(404);
			res.json(error);
		}
	);
}
//Implementation to add gate entry
var addGateEntryImpl = function(data){
	var deferred = q.defer();
	data.gateEntryId = shortId.generate();
	var time = (new Date()).getTime();

	data.createdAt = time;
	data.updatedAt = time;
	
	schema.mongoInsert(schema.gateEntryModel, data).then(
		function(result2){
			deferred.resolve(result2);
		}, function(error) {
			deferred.reject(error);
		}
	);
	return deferred.promise;
}
//Controller to get Gate Entries
exports.getGateEntries = function(req, res){
	getGateEntriesImpl().then(
		function(result){
			res.json(result);
		}, function(error) {
			res.status(404);
			res.json(error);
		}
	);
}
//Implementation to get Gate Entry
var getGateEntriesImpl = function(){
	var deferred = q.defer();
	schema.mongoFind(schema.gateEntryModel, {}, {}).then(
		function(result){
			deferred.resolve(result);
		}, function(error) {
			deferred.reject(error);
		}
	);
	return deferred.promise;
}