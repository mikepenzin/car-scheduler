var db = require('../models');

var comapnyAPI = {};

comapnyAPI.getCompanyById = function(company_id){
    return db.Company.findById(company_id);
};

comapnyAPI.getAllCompanies = function(sort){
    if (sort) {
        return db.Company.find({}).sort(sort);
    } else {
        return db.Company.find({});
    }
};

comapnyAPI.getCompanyByUserId = function(user_id){
    console.log(user_id);
    return db.Company.find({ users: { $in: user_id }});
};

comapnyAPI.getCompanyByIdAndUpdate = function(company_id, update){
    return db.Company.findByIdAndUpdate(company_id, update);
};

comapnyAPI.getCompanyByIdAndRemove = function(company_id){
    return db.Company.findByIdAndRemove(company_id);
};

comapnyAPI.getCompanyByIdAndPopulate = function(company_id, populate){
    return db.Company.findById(company_id).populate(populate);
};

module.exports = comapnyAPI; 