Template.layout.events({
    'click .login-required': function(evt, template) {
        if (!Meteor.userId()) {
            if ($('#header .navbar-toggle').is(':visible') && $('#navigation').is(':hidden')) {
                $('#navigation').collapse('show');
            }
            Template._loginButtons.toggleDropdown();
            $('#cover').show();
            evt.stopImmediatePropagation();
        }
    }
});
