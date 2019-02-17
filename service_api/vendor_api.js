var db = require('../models');

var vendorAPI = {};

vendorAPI.getVendorById = function(vendor_id){
    return db.Vendor.findById(vendor_id);
};

vendorAPI.createVendor = function(data){
    return db.Vendor.create(data);
};

vendorAPI.getAllVendors = function(){
    return db.Vendor.find({});
};

vendorAPI.getActiveVendors = function(get_fields){
    if (!get_fields) { get_fields = {} }
    return db.Vendor.find({isActive : true }, get_fields);
};

vendorAPI.getVendorByIdAndUpdate = function(vendor_id, update){
    return db.Vendor.findByIdAndUpdate(vendor_id, update);
};

module.exports = vendorAPI; 