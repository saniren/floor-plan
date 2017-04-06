
var schema = require('../models/schema'),
    shortId = require('shortid'),
    q = require('q');

//Controller to add task
exports.addTask = function(req, res){
	addTaskImpl(req.body).then(
		function(result){
			res.json(result);
		}, function(error) {
			res.status(404);
			res.json(error);
		}
	);
}
//Controller to delete task
exports.deleteTask = function(req, res){
	unRegisterTask(req.param('id')).then(
		function(result){
			res.json(result);
		}, function(error) {
			res.status(404);
			res.json(error);
		}
	);
}

//Implementation to add receiver
var addTaskImpl = function(data){
	var deferred = q.defer(),
		time = (new Date()).getTime();
	data.taskId = shortId.generate();
	data.createdAt = time;
	data.updatedAt = time;

	var assertData = {auid:data.auid};
	schema.mongoFindOne(schema.assertModel,assertData).then(
		function(assert){
			console.log(assert,"--------")
			if(!assert){
				schema.mongoInsert(schema.assertModel, assertData).then(
					function(result){
						console.log(result);
					}, function(error) {
						deferred.reject(error);
					});
			}
			schema.mongoInsert(schema.taskModel, data).then(
				function(result2){
					deferred.resolve(result2);
				}, function(error) {
					deferred.reject(error);
				}
			);
		}, function(error) {
			deferred.reject(error);
		}
	);
	return deferred.promise;
}

//Unregister task
var unRegisterTask = function(taskId){
	var deferred = q.defer();
	schema.mongoUpdate(schema.taskModel, {taskId: taskId}, {active: "N"}).then(
		function(result){
			deferred.resolve(result);
		}, function(error) {
			deferred.reject(error);
		}
	);
	return deferred.promise;
}

//Controller to get Tasks
exports.getTasks = function(req, res){
	getTasksImpl().then(
		function(result){
			res.json(result);
		}, function(error) {
			res.status(404);
			res.json(error);
		}
	);
}
//Implementation to get Tasks
var getTasksImpl = function(){
	var deferred = q.defer();
	schema.mongoFind(schema.assertModel, {}, {}).then(
		function(tags){
			q.all(tags.map(function(tag){
				var tempTaks = schema.mongoFindOne(schema.taskModel, {auid: tag.auid, active:'Y'}, {}).then(
					function(task){
						var tempTag = {}
						tempTag.auid = tag.auid;
						tempTag.task = task;
						return tempTag;
					}, function(error) {
						return error;
					});
				return tempTaks;
			})).then(function(tasks){
				deferred.resolve(tasks);
			});
		}, function(error) {
			deferred.reject(error);
		}
	);
	return deferred.promise;
}
//Controller to get Tasks
exports.getActiveTasks = function(req, res){
	exports.getActiveTasksImpl('all').then(
		function(result){
			res.json(result);
		}, function(error) {
			res.status(404);
			res.json(error);
		}
	);
}
//Implementation to get Tasks
exports.getActiveTasksImpl = function(fieldsToSelect){
	var deferred = q.defer();
	schema.mongoFind(schema.taskModel, {'active':'Y'}, fieldsToSelect==='all'?{}:fieldsToSelect).then(
		function(result){
			deferred.resolve(result);
		}, function(error) {
			deferred.reject(error);
		}
	);
	return deferred.promise;
}
//Implementation to get Tasks
exports.getActiveTaskByAuid = function(auid){
	var deferred = q.defer();
	console.log(auid,";;;;;;;;;");
	schema.mongoFind(schema.taskModel, {$and:[{'active':'Y'}, {'auid':auid}]}, {}).then(
		function(result){
			console.log(result,"result;;;;;;;;;");
			deferred.resolve(result);
		}, function(error) {
			deferred.reject(error);
		}
	);
	return deferred.promise;
}
//Implementation to get Task by condition
exports.getActiveTaskByConditionImpl = function(condition){
	var deferred = q.defer();
	schema.mongoFind(schema.taskModel, condition, {}).then(
		function(result){
			deferred.resolve(result);
		}, function(error) {
			deferred.reject(error);
		}
	);
	return deferred.promise;
}


//Controller to get Tasks
exports.getTagById = function(req, res){
	getTagByIdImpl(req.param("id")).then(
		function(result){
			res.json(result);
		}, function(error) {
			res.status(404);
			res.json(error);
		}
	);
}
//Implementation to get Tasks
var getTagByIdImpl = function(tagId){
	var deferred = q.defer();
	schema.mongoFindOne(schema.assertModel,{auid:tagId}).then(
		function(assert){
			console.log(assert,"--------")
			if(!assert){
				schema.mongoFind(schema.taskModel, {auid:tagId, active:'Y'}).then(
					function(result2){
						deferred.resolve(result2);
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
