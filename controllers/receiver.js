
var schema = require('../models/schema'),
    q = require('q');

//Controller to add receiver
exports.addReceiver = function(req, res){
	addReceiverImpl(req.body).then(
		function(result){
			res.json(result);
		}, function(error) {
			res.status(404);
			res.json(error);
		}
	);
}
//Implementation to add receiver
var addReceiverImpl = function(data){
	var deferred = q.defer();
	schema.mongoInsert(schema.receiverModel, data).then(
		function(result){
			deferred.resolve(result);
		}, function(error) {
			deferred.reject(error);
		}
	);
	return deferred.promise;
}

//Controller to add receiver
exports.getReceivers = function(req, res){
	getReceiversImpl().then(
		function(result){
			res.json(result);
		}, function(error) {
			res.status(404);
			res.json(error);
		}
	);
}
//Implementation to add receiver
var getReceiversImpl = function(data){
	var deferred = q.defer();
	schema.mongoFind(schema.receiverModel, {}, {}).then(
		function(result){
			deferred.resolve(result);
		}, function(error) {
			deferred.reject(error);
		}
	);
	return deferred.promise;
}

//Controller to delete receiver
exports.deleteReceiver = function(req, res){
	deleteReceiverImpl(req.param('id')).then(
		function(result){
			res.json(result);
		}, function(error) {
			res.status(404);
			res.json(error);
		}
	);
}
//Update last poll time
var deleteReceiverImpl = function(receiverId){
	var deferred = q.defer();
	schema.mongoRemove(schema.receiverModel, {receiverId: receiverId}).then(
		function(result){
			deferred.resolve(result);
		}, function(error) {
			deferred.reject(error);
		}
	);
	return deferred.promise;
}


