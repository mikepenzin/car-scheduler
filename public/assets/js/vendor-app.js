/* global $ */
$(document).ready( function() {
	
	$.ajax({
		method: 'GET',
		url: window.location.pathname + '/getAllVendors'
	}).then(function(vendors){
		console.log(vendors);
	    vendors.forEach(function(vendor){
            appendVendor(vendor);
        });
	});
	
	
	$('#vendors-info').on('click', '.vendor-status', function(event){
		event.stopPropagation();
		event.stopImmediatePropagation();
		var elm = $(this)[0];
		var activity = $(this).data('active');
		console.log("ID: " + elm.id,'Activity: ' + activity);
		updateVendorStatus(elm.id, elm.dataset.url, !activity);
	});
	
	function appendVendor(vendor){
        var vendorActive = '';
        var disableMessage = '';
        
        if(vendor.isActive) {
            vendorActive = '<div id="not-active-' + vendor._id + '" class="text-warning no-driver-message mt-2" style="visibility: hidden;">';
            disableMessage = '<a href="javascript:void(0)" class="btn btn-warning btn-round btn-sm btn-block mr-2 mt-1 pl-3 pr-3 vendor-status" id="' + vendor._id + '" data-url="' + window.location.pathname + '/' + vendor._id +'/change-status"> השבת <i class="fal fa-eye-slash ml-1"></i> </a>';
        } else {
            vendorActive = '<div id="not-active-' + vendor._id + '" class="text-warning no-driver-message mt-2">';
            disableMessage = '<a href="javascript:void(0)" class="btn btn-warning btn-round btn-sm btn-block mr-2 mt-1 pl-3 pr-3 vendor-status" id="' + vendor._id + '" data-url="' + window.location.pathname + '/' + vendor._id +'/change-status"> הפעלה <i class="fal fa-eye ml-1"></i> </a>';
        }
        
        var vendorTemplate = $('<div id="general_' + vendor._id + '" class="col-10 col-sm-10 col-md-6 col-lg-6 col-xl-6">'
					+ '<div class="card">'
					+ '<div class="card-info">'
					+ '<div class="media d-flex">'
					+ '<div class="media-body text-left">'
					+ '<h3>' + vendor.name + '</h3>'
					+ '<div> איש קשר: ' + vendor.personInfo + '</div>'
					+ '<div> כתובת:'
					+ '<div><small>' + vendor.address + '</small></div>'
					+ '</div>'
					+ '<div> טלפון:' 
					+ '<div class="input-phone">'
					+ '<small> <a href="tel:' + vendor.phoneNumber.replace(/\s/g, "") + '">' + vendor.phoneNumber + '</a> </small>'
					+ '</div>'
					+ '</div>'
					+ vendorActive
                    + '<i class="fal fa-exclamation-triangle"></i> הספק מושבת, לא ניתן להשתמש בספק זה עד להפעלתו! </div>'
					+ '</div>'
					+ '<div class="align-self-start" style="margin: 8px 10px 0 0;">'
					+ '<i class="fal fa-building azure font-large-2 float-left"></i>'
					+ '</div>'
					+ '</div>'
					+ '<div class="mt-2 centered-buttons-container">'
					+ '<div class="row">'
                    + '<div class="col-12 col-md-5 p-1">'
                    + '<a class="btn btn-default btn-round btn-block btn-sm mr-2 mt-1 pl-3 pr-3" href="' + window.location.pathname + '/' + vendor._id +'/edit">עדכון</a>'
                    + '</div>'
                    + '<div class="col-12 col-md-7 p-1">'
                    + disableMessage
					+ '</div>'
                    + '</div>'
					+ '</div>'
					+ '</div>'
				    + '</div>'
					+ '</div>');
                		 
        $('#vendors-info').append(vendorTemplate);
        $('#' + vendor._id).data('active', vendor.isActive);
    }
	
	function updateVendorStatus(id, url, active) {
		var updateUrl = url;
		var updateData = { isActive: active};
		
		console.log(updateData);
		
		$.ajax({
			method: 'PUT',
			url: updateUrl,
		    data: updateData
		})
		.then(function(updatedVendor){
			
			var result = updatedVendor;
		    var element = $("#" + id);
		    element.data('active', result.isActive);
		    
		    console.log(result.isActive, element.data());
		    
		    if(result.isActive) {
		    	element.html(' השבת <i class="fal fa-eye-slash ml-1"></i>');
		    	$('#not-active-' + id).animate({opacity: 0.0}, 500, function(){
				    $('#not-active-' + id).css("visibility","hidden");
				});
		    } else {
		    	element.html(' הפעלה <i class="fal fa-eye ml-1">');
		    	$('#not-active-' + id).css({visibility:"visible", opacity: 0.0}).animate({opacity: 1.0},500);
		    }
		    
		});
	}
	
	$("form").submit(function(e){
        e.preventDefault();
        var creationURL = $(this).attr('action');
        var vendorData = {
            name: $("#name").val(),
            personInfo: $("#personInfo").val(),
            address: $("#vendorAddress").val(),
            phoneNumber: $("#phoneNumber").val()
        };
        
        console.log(vendorData);
        
        $.post(creationURL, vendorData)
        .then(function(newVendor){
    	    console.log(newVendor);
    	    $('#open-form-dialog').trigger('click');
    	    $("#name").val('');
    	    $("#vendorAddress").val('');
    	    $("#personInfo").val('');
    	    $("#phoneNumber").val('');
    	    
    	    appendVendor(newVendor);
    	});
    });
	
});