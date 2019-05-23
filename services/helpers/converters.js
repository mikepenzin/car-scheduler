var converter = {};

converter.convertDate = function(date, backward) {
    if (!backward) {

        var newDate = date.split('/');
        return newDate[1] + '/' + newDate[0] + '/' + newDate[2];

    }
    else {

        var month = (date.month + 1) < 10 ? '0' + (date.month + 1) : (date.month + 1);
        var rightDate = date.date < 10 ? '0' + date.date : date.date;

        return rightDate + '/' + month + '/' + date.year;

    }
}

converter.converTimeToString = function(time) {
    var timeString;
    if (time < 60 && time >= 10) {
        timeString = "00" + time;
    }
    else if (time < 10) {
        timeString = "000" + time;
    }
    else if (time.toString().length < 4) {
        timeString = "0" + time;
    }
    else {
        timeString = time.toString();
    }

    timeString = [timeString.slice(0, 2), ':', timeString.slice(2)].join('');
    return timeString;
}

module.exports = converter;
