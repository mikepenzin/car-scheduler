/* global $ */
$(document).ready( function() { 
    
        $.ajax({
    		method: 'GET',
    		url: window.location.pathname + '/getAllCars'
    	}).then(function(cars){
    	    cars.data.forEach(function(car){
                appendCar(car);
            });
    	});

        $('#cars-info').on('click', '.car-status', function(event){
    		event.stopPropagation();
    		event.stopImmediatePropagation();
    		var elm = $(this)[0];
    		var activity = $(this).data('active');
    		console.log("ID: " + elm.id,'Activity: ' + activity);
    		updateVendorStatus(elm.id, elm.dataset.url, !activity);
    	});
    	
    	$('#cars-info').on('click', '.btn-delete', function(event){
            event.stopPropagation();
    		event.stopImmediatePropagation();
    	   // console.log($(this).attr('href'));
    	    var addr = $(this).attr('href');
    	    $("#carModal").modal('show');
    	    $("#modal-id").attr('data-url', addr);
        });
        
        $("#modal-id").on('click', function(){
	        deleteCar($(this).attr('data-url'));
	    });
    	
        function appendCar(car){
            var driverInfo = '';
            var carColor = '';
            if(!car.isContractor) {
                carColor = 'azure';
                if(!car.driver) {
                    driverInfo = '<div class="text-danger no-driver-message"><i class="fal fa-exclamation-triangle"></i>'
                                 + ' יש להוסיף נהג!'
                                 + '</div>';
                } else {
                    driverInfo = '<div>'
                                 + 'נהג : '
                                 + car.driver.firstName + ' ' + car.driver.lastName
                                 + '</div>';
                }
            } else {
                carColor = 'purple';
                driverInfo = '<div>נהג קבלן</div>';
            }
            
            var carActive = '';
            var disableMessage = '';
            if(car.isActive) {
                carActive = '<div id="not-active-' + car._id + '" class="text-warning no-driver-message mt-2" style="visibility: hidden;">';
                disableMessage = '<a href="javascript:void(0)" class="btn btn-warning btn-round btn-sm btn-block mr-2 mt-1 pl-3 pr-3 car-status" id="' + car._id + '" data-url="' + window.location.pathname + '/' + car._id +'/change-status"> השבת <i class="fal fa-eye-slash ml-1"></i> </a>';
            } else {
                carActive = '<div id="not-active-' + car._id + '" class="text-warning no-driver-message">';
                disableMessage = '<a href="javascript:void(0)" class="btn btn-warning btn-round btn-sm btn-block mr-2 mt-1 pl-3 pr-3 car-status" id="' + car._id + '" data-url="' + window.location.pathname + '/' + car._id +'/change-status"> הפעלה <i class="fal fa-eye ml-1"></i> </a>';
            }
            
            var carTemplate = $('<div id="general_'+ car._id +'" class="col-10 col-sm-10 col-md-6 col-lg-6 col-xl-6">'
                             + '<div class="card">'
                             + '<div class="card-info">'
                             + '<div class="media d-flex">'
                             + '<div class="media-body text-left">'
                             + '<h3>'+ car.carName +'</h3>'
                             + '<small>'
							 + ' לוחית רישוי:'
							 + car.licensePlate + '</small>'
                             + '<div>' + car.model + ' / ' + car.manufactureYear + '</div>'
                             + '<small>'
							 + ' מספר מושבים:'
							 + car.numberOfSeats + '</small>'
                             + driverInfo
                             + carActive
                             + '<i class="fal fa-exclamation-triangle"></i> הרכב מושבת, לא ניתן להשתמש ברכב זה עד להפעלתו!  </div>'
                             + '</div>'
                             + '<div class="align-self-start" style="margin: 8px 10px 0 0;">'
                             + '<i class="fal fa-car '+ carColor +' font-large-2 float-left"></i>'
                             + '</div>' 
                             + '</div>'
                             + '<div class="mt-2 centered-buttons-container">'
                             + '<div class="row">'
                             + '<div class="col-12 col-md-4 p-1">'
                             + '<a class="btn btn-default btn-round btn-block btn-sm mr-2 mt-1 pl-3 pr-3" href="' + window.location.pathname + '/' + car._id +'/edit">עדכון</a>'
                             + '</div>'
                             + '<div class="col-12  col-md-4 p-1">'
                             + disableMessage
    						 + '</div>'
    						 + '<div class="col-12 col-md-4 p-1">'
                        	 + '<div href="' + window.location.pathname + '/' + car._id +'" class="btn btn-delete btn-round btn-sm btn-block mt-1 pl-3 pr-3"> מחיקה  <i class="fal fa-trash-alt ml-2"></i></div>'
                    		 + '</div>'
                    		 + '</div>'
                    		 + '</div>'
                    		 + '</div>'
                    		 + '</div>'
                    		 + '</div>');
                    		 
            $('#cars-info').append(carTemplate);
            $('#' + car._id).data('active', car.isActive);
        }
    	
    	function updateVendorStatus(id, url, active) {
    		var updateUrl = url;
    		var updateData = { isActive: active };
    		
    		$.ajax({
    			method: 'PUT',
    			url: updateUrl,
    		    data: updateData
    		})
    		.then(function(updatedCar){
    			
    			var result = updatedCar;
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
    	
    	//Create new car route
    	$("form").submit(function(e){
            e.preventDefault();
            var creationURL = $(this).attr('action');
            var carData = {
                carName: $("#carName").val(),
                licensePlate: $("#licensePlate").val(),
                model: $("#model").val(),
                numberOfSeats: $("#numberOfSeats").val(),
                manufactureYear: $("#manufactureYear").val(),
                isContractor: $("#isContractor").val() === 'true' ? true : false
            };
            
            if(!carData.isContractor){
                carData.driverID = $('#driverID').val();
            }
            
            console.log(carData);
            
            $.post(creationURL, carData)
            .then(function(newCar){
        	    console.log(newCar);
        	    $('#open-form-dialog').trigger('click');
        	    $("#carName").val('');
        	    $("#licensePlate").val('');
        	    $("#model").val('');
        	    $("#numberOfSeats").val('');
        	    $("#manufactureYear").val('');
        	    
        	    appendCar(newCar);
        	});
        });
        	
    	// Delete car route
        function deleteCar(carURL) {
            var id = carURL.split('/');
            id = id[id.length - 1];
            
            $.ajax({
        		method: 'DELETE',
        		url: carURL
        	}).then(function(car){
        	    console.log(car);
        	    $('#general_' + id).hide('slow', function(){ $('#general_' + id).remove(); });
        	});
        }
        
        if(!$('#isContractor').val() == 'true'){
           $('#labelForDriverID').hide();
           $('#driverID').hide();
        }
    
        $('#isContractor').change(function(){
           if($(this).val() == 'true'){
               $('#labelForDriverID').hide(1000);
               $('#driverID').hide(1000);
               return true;
           }
           $('#labelForDriverID').show(1000);
           $('#driverID').show(1000);
        });
    
    });