Template.registerHelper('truncatechars', function(str, len) {
    if (str.length <= len) {
        return str;
    }
    return str.slice(0, len-3) + '...';
});

Template.registerHelper('formatDate', function(datetime, format) {
    return moment(datetime).format(format);
});

Template.registerHelper('dateFromNow', function(datetime) {
    return moment(datetime).fromNow();
});

Template.registerHelper('defaultIfUndefined', function(val, dft) {
    if (val === undefined)
        return dft;
    else
        return val;
});
