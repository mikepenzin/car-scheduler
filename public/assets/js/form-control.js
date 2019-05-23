(function($) {

    for (let field of $('.input-phone').toArray()) {
        new Cleave(field, {
            numericOnly: true,
            phone: true,
            phoneRegionCode: 'IL'
        });
    }

    for (let field of $('.input-date').toArray()) {
        new Cleave(field, {
            numericOnly: true,
            date: true,
            datePattern: ['d', 'm', 'Y'],
            delimiter: '/',
            onValueChanged: function(e) {
                // e.target = { value: '5000-1234', rawValue: '51001234' }
                var currentDate;
                var dateObj = new Date();
                var month = dateObj.getUTCMonth() + 1; //months from 1-12
                var day = dateObj.getUTCDate();
                var year = dateObj.getUTCFullYear();

                currentDate = year + "/" + month + "/" + day;

                var clicked = e.target.value;

                var splitted = clicked.split("/");
                clicked = splitted[2] + '/' + splitted[1] + '/' + splitted[0];

                if (!(Date.parse(clicked) >= Date.parse(currentDate))) {
                    $(field).addClass('red-border');
                }
                else {
                    $(field).removeClass('red-border');
                }
            }
        });
    }

    for (let field of $('.input-price').toArray()) {
        new Cleave(field, {
            numeral: true,
            numeralThousandsGroupStyle: 'thousand',
            numeralDecimalScale: 2
        });
    }

    for (let field of $('.input-time').toArray()) {
        new Cleave(field, {
            numericOnly: true,
            time: true,
            timeFormat: '24',
            timePattern: ['h', 'm']
        });
    }

    $('#stops').on("stopAddedEvent", function(event, id) {
        new Cleave('.' + id, {
            numericOnly: true,
            phone: true,
            phoneRegionCode: 'IL'
        });

        for (let field of $('.input-time').toArray()) {
            new Cleave(field, {
                numericOnly: true,
                time: true,
                timeFormat: '24',
                timePattern: ['h', 'm']
            });
        }
    });

    for (let field of $("input[class*='inputForAddStop_']").toArray()) {
        new Cleave(field, {
            numericOnly: true,
            phone: true,
            phoneRegionCode: 'IL'
        });
    }

}(jQuery));
