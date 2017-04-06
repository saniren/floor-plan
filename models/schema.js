"use strict";
var mongoose = require('mongoose'),
    q = require('q');
var mongooseiTrace = mongoose.createConnection('mongodb://'+process.env.DB_HOST+':'+process.env.DB_PORT+'/itrace', {
    server: {
        poolSize: 2
    }
    // user: util.config.mongodb.user,
    // pass: util.config.mongodb.password
}, function(err, res) {
    if (err) {
        console.log('ERROR connecting to itrace ');
    } else {
        console.log('Successfully connected to itrace');
    }
});

var assertSchema = new mongoose.Schema({
    auid: {
        type: String,
        required: true
    }
});
assertSchema.index({
    auid: 1
}, {
    unique: true
});
exports.assertModel = mongooseiTrace.model("assert", assertSchema);


var locationSchema = new mongoose.Schema({
    auid: {
        type: String,
        required: true
    },
    asid: {
        type: String,
        required: false
    },
    x:{
        type: Number,
        required: true
    },
    y:{
        type: Number,
        required: true
    },
    z:{
        type: Number,
        required: true
    },
    microGrid: {
        type: String,
        required: true
    },
    layoutChunkId: {
        type: Object,
        required: true
    },
    layoutChunkName: {
        type: Object,
        required: true
    },
    pi:{
        type: Number,
        required: true
    },
    createdAt:{
        type: Number,
        required: true
    },
    updatedAt:{
        type: Number,
        required: true
    }
});
locationSchema.index({
    auid: 1
}, {
    unique: false
});
exports.locationModel = mongooseiTrace.model("location", locationSchema);


var receiverSchema = new mongoose.Schema({
    receiverId: {
        type: String,
        required: true
    },
    x:{
        type: Number,
        required: true
    },
    y:{
        type: Number,
        required: true
    },
    z:{
        type: Number,
        required: true
    },
    zoneId:{
        type: String,
        required: true
    }
});
receiverSchema.index({
    receiverId: 1
}, {
    unique: true
});
exports.receiverModel = mongooseiTrace.model("receiver", receiverSchema);


var zoneSchema = new mongoose.Schema({
    zoneId: {
        type: String,
        required: true
    },
    name:{
        type: String,
        required: true
    }
});
zoneSchema.index({
    zoneId: 1
}, {
    unique: true
});
exports.zoneModel = mongooseiTrace.model("zone", zoneSchema);


var taskSchema = new mongoose.Schema({
    taskId: {
        type: String,
        required: true
    },
    auid: {
        type: String,
        required: true
    },
    asid:{
        type: String,
        required: true
    },
    route: {
        type: Array,
        required: false
    },
    startTime:{
        type: Number,
        required: true
    },
    endTime:{
        type: Number,
        required: false
    },
    active: {
        type: String,
        required: true
    },
    createdAt:{
        type: Number,
        required: true
    },
    updatedAt:{
        type: Number,
        required: true
    }
});
taskSchema.index({
    asid: 1,
    taskId: 1
}, {
    unique: true
});
exports.taskModel = mongooseiTrace.model("task", taskSchema);


var rawDataSchema = new mongoose.Schema({
    rawDataId: {
        type: String,
        required: true
    },
    auid: {
        type: String,
        required: true
    },
    receivers:{
        type: Array,
        required: true
    },
    rssi: {
        type: Array,
        required: true
    },
    pi:{
        type: Number,
        required: true
    },
    time:{
        type: Number,
        required: true
    }
});
rawDataSchema.index({
    rawDataId: 1
}, {
    unique: true
});
exports.rawDataModel = mongooseiTrace.model("rawData", rawDataSchema);

var lastPollSchema = new mongoose.Schema({
    time:{
        type: Number,
        required: true
    }
});
exports.lastPollModel = mongooseiTrace.model("lastPoll", lastPollSchema);


var lastActiveTagSchema = new mongoose.Schema({
    auid: {
        type: String,
        required: true
    },
    time:{
        type: Number,
        required: true
    }
});
exports.lastActiveTagModel = mongooseiTrace.model("lastActiveTag", lastActiveTagSchema);


var layoutPartSchema = new mongoose.Schema({
    layoutPartId:{
        type: String,
        required: true
    },
    type:{
        type: String,
        required: true
    },
    name:{
        type: String,
        required: true
    },
    area:{
        type: Array,
        required: true
    },
    layoutId:{
        type: String,
        required: true
    },
    createdAt:{
        type: Number,
        required: true
    },
    updatedAt:{
        type: Number,
        required: true
    }
});
rawDataSchema.index({
    layoutPartId: 1
}, {
    unique: true
});
exports.layoutPartModel = mongooseiTrace.model("layoutPart", layoutPartSchema);

var layoutSchema = new mongoose.Schema({
    layoutId:{
        type: String,
        required: true
    },
    name:{
        type: String,
        required: true
    },
    imageLocation:{
        type: String,
        required: true
    },
    height:{
        type: Number,   //In pixel
        required: true
    },
    width:{
        type: Number,   //In pixel
        required: true
    },
    createdAt:{
        type: Number,
        required: true
    },
    updatedAt:{
        type: Number,
        required: true
    }
});
rawDataSchema.index({
    layoutId: 1
}, {
    unique: true
});
exports.layoutModel = mongooseiTrace.model("layout", layoutSchema);

var gateEntrySchema = new mongoose.Schema({
    auid: {
        type: String,
        required: true
    },
    gateEntryId:{
        type: String,
        required: true
    },
    gateId:{
        type: String,
        required: true
    },
    state:{
        type: String,
        required: true
    },
    createdAt:{
        type: Number,
        required: true
    },
    updatedAt:{
        type: Number,
        required: true
    }

});
exports.gateEntryModel = mongooseiTrace.model("gateEntry", gateEntrySchema);

exports.mongoInsert = function(Model, data) {
    var deferred = q.defer();
    if (data === null) {
        return deferred.resolve(null);
    }
    var insertData = new Model(data);
    insertData.save(function(error, results) {
        console.log("mongoInsert",results);
        if (error) {
            console.log("mongoInsert error",error);
            deferred.reject({
                status: "Error",
                message: error
            });
        } else {
            console.log("mongoInsert suc",results);
            deferred.resolve(results);
        }
    });
    return deferred.promise;
};

exports.mongoFindOne = function(model, record, dataToSelect, options) {
    var deferred = q.defer();
    model.findOne(record, dataToSelect, options, function(error, results) {
        if (error) {
            deferred.reject({
                status: "Error",
                message: error
            });
        } else {
            deferred.resolve(results);
        }
    });
    return deferred.promise;
};
exports.mongoFind = function(model, record, dataToSelect, options) {
    var deferred = q.defer();
    model.find(record, dataToSelect, options, function(error, results) {
        if (error) {
            deferred.reject({
                status: "Error",
                message: error
            });
        } else {
            deferred.resolve(results);
        }
    });
    return deferred.promise;
};
exports.mongoUpdate = function(updateModel, record, dataToUpdate) {
    var deferred = q.defer();
    if (record === null)
        return deferred.resolve(null);
    updateModel.update(record, dataToUpdate, function(error, results) {
        // console.log("mongoUpdate",results,error,record,dataToUpdate);
        if (error) {
            deferred.reject({
                status: "myError",
                message: error
            });
        } else {
            deferred.resolve(results);
        }
    });
    return deferred.promise;
};
exports.mongoRemove = function(model, record) {
    var deferred = q.defer();
    model.remove(record, function(error, results) {
        if (error) {
            deferred.reject({
                status: "Error",
                message: error
            });
        } else {
            deferred.resolve(results);
        }
    });
    return deferred.promise;
};