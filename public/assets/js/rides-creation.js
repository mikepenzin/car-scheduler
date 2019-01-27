(function ($) {
  $(document).ready( function() {
        var counter = 0;
        
        $(document).on('click', '#addStop', function(e){
             var htmlTemplate = '<div id="inputForAddStop">'
                            + '<div class="align-items-baseline d-flex justify-content-between lead text-left">'
                            + 'תחנה ביניים'
                            + '<span id="delete-stop" class="close-stop-item text-muted h5"><i class="fal fa-times-circle" style="font-size: 1rem;"></i></span>'
                            + '</div>'
                            + '<label for="addresses">'
                            + 'שם התחנה'
                            + '</label>'
                            + '<input type="text" class="form-control" name="addresses[stopName]" placeholder="הכנס שם התחנה">'
                            + '<label for="addresses">'
                            + 'כתובת תחנה'
                            + '</label>'
                            + '<input type="text" id="inputForAddStop_' + counter + '" class="form-control" name="addresses[stopAddress]" placeholder="הכנס כתובת התחנה">'
                            + '<label for="addresses">'
                            + 'איש קשר לתחנה זו'
                            + '</label>'
                            + '<input type="text" class="form-control" name="addresses[contactPerson]" placeholder="הכנס איש קשר לתחנה">'
                            + '<label for="addresses">'
                            + 'טלפון'
                            + '</label>'
                            + '<input class="form-control input-stop-phone inputForAddStop_' + counter + '" name="addresses[phoneNumber]" placeholder="0XX-XXX-XXXX">'
                            + '<label for="addresses">'
                            + 'כמות אנשים לאיסוף'
                            + '</label>'
                            + '<input type="number" class="form-control" name="addresses[numberOfPeopleToCollect]" placeholder="כמות אנשים לאיסוף">'
                            + '<hr class="mb-4 mt-4">'
                            + '</div>';
            
            $('#stops').append(htmlTemplate).show('slow').trigger("stopAddedEvent", ['inputForAddStop_' + counter]);
            counter++;
            e.preventDefault(); //Prevent default click action which is causing the 
            return false;       //page to scroll back to the top
            
        });
        
        $(document).on('click', '#delete-stop', function () {
            $(this).closest('#inputForAddStop').remove();
            counter--;
        });
        
        $('#rideType').on('change', function() {
            if (this.value === 'regular') {
                $('#onetime-ride-form').slideUp(2000);
                $('#regular-ride-form').slideDown(2000);
                removeInputContent('onetime-ride-form');
            } else {
                $('#regular-ride-form').slideUp(2000);
                $('#onetime-ride-form').slideDown(2000);
                removeInputContent('regular-ride-form');
                
            }
        });
        
        var ridePriceBeforeVAT = $('#priceBeforeVAT');
        var ridePriceAfterVAT = $('#priceAfterVAT');
        
        ridePriceBeforeVAT.on('keyup paste drop', function(){
            ridePriceAfterVAT.val((Number(ridePriceBeforeVAT.val().split(',').join('')) * 1.17).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
        });
        
        ridePriceAfterVAT.on('keyup paste drop', function(){
            ridePriceBeforeVAT.val((Number(ridePriceAfterVAT.val().split(',').join('')) / 1.17).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
        });
        
        function removeInputContent(id) {
            jQuery("#"+ id).find(':input').each(function() {
                switch(this.type) {
                    case 'password':
                    case 'text':
                    case 'textarea':
                    case 'file':
                    case 'select-one':
                    case 'select-multiple':
                    case 'date':
                    case 'number':
                    case 'tel':
                    case 'email':
                        jQuery(this).val('');
                        break;
                    case 'checkbox':
                    case 'radio':
                        this.checked = false;
                        break;
                    default:
                        jQuery(this).val('');
                        break;
                }
            });
        }
        
     });
}(jQuery));