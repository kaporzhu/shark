Template.header.events({
    'click .navbar-nav>li>a': function() {
        if ($('#login-dropdown-list').is('.open')) {
            Template._loginButtons.toggleDropdown();
        }
    },
    'click #login-dropdown-list': function(evt) {
        Template._loginButtons.toggleDropdown();
        evt.stopImmediatePropagation();
    }
});

Template.header.rendered = function() {
    $(document).on('click', 'body', function(){
        if ($('#login-dropdown-list').is('.open')) {
            $('#cover').hide();
            Template._loginButtons.toggleDropdown();
        } else {
            $('#cover').hide();
        }
    });
    $('#login-dropdown-list .dropdown-menu').click(function(evt) {
        evt.stopImmediatePropagation();
    });
};
