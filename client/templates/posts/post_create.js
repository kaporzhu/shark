Template.postCreate.events({
    'click button[type="submit"]': function (evt, template) {
        var post = {
            title: template.find('input[name="title"]').value
        };
    }
});

Template.postCreate.rendered = function () {
    $('#fileupload').fileupload({
        url: Router.path('post.uploadphoto'),
        dataType: 'json',
        done: function (e, data) {
            $('#ajax-loading').addClass('hidden');
            $('<p/>').text(data.result.file).appendTo('#files');
        },
        submit: function (e, data) {
        },
        start: function (e) {
            $('#ajax-loading').removeClass('hidden');
        }
    }).prop('disabled', !$.support.fileInput)
        .parent().addClass($.support.fileInput ? undefined : 'disabled');
};
