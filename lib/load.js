var addCDNJsLib = function(url) {
    var script = document.createElement('script');
    script.src = url;
    document.getElementsByTagName('head')[0].appendChild(script);
};

if (Meteor.isClient) {
    //addCDNJsLib('http://libs.useso.com/js/html5shiv/3.7/html5shiv.min.js');
    addCDNJsLib('http://libs.useso.com/js/respond.js/1.4.2/respond.min.js');
}
