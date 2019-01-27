(function ($) {
  $(document).ready( function() {
        var ridePriceBeforeVAT = $('#priceBeforeVAT');
        var ridePriceAfterVAT = $('#priceAfterVAT');
        
        ridePriceAfterVAT.val((Number(ridePriceBeforeVAT.val().split(',').join('')) * 1.17).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
        
        ridePriceBeforeVAT.on('keyup paste drop', function(){
            ridePriceAfterVAT.val((Number(ridePriceBeforeVAT.val().split(',').join('')) * 1.17).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
        });
        
        ridePriceAfterVAT.on('keyup paste drop', function(){
            ridePriceBeforeVAT.val((Number(ridePriceAfterVAT.val().split(',').join('')) / 1.17).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
        });
        
        function sendDeleteform() {
            $('#deleteForm').submit();
        }
        
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
                            + '<input type="text" class="form-control" id="inputForAddStop_' + counter + '" name="addresses[stopAddress]" placeholder="הכנס כתובת התחנה">'
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
            
            $('#stops').prepend(htmlTemplate).show('slow').trigger("stopAddedEvent", ['inputForAddStop_' + counter]);
            counter++;
            e.preventDefault(); //Prevent default click action which is causing the 
            return false;       //page to scroll back to the top
            
        });
        
        $(document).on('click', '#delete-stop', function () {
            $(this).closest('#inputForAddStop').remove();
            counter--;
        });
    });
}(jQuery));