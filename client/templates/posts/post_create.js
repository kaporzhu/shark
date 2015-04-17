function bindFileUpload() {
    $('.upload-img').fileupload({
        url: Router.path('post.uploadphoto'),
        dataType: 'json',
        done: function (e, data) {
            var $upload = $(e.target).parents('.upload');
            $('.ajax-loading', $upload).addClass('hidden');
            $('input.img', $upload).after($('<img>', {
                src: data.result.url + '@!small',
                height: 80
            })).val(data.result.url);
        },
        start: function (e) {
            var $upload = $(e.target).parents('.upload');
            $('.ajax-loading', $upload).removeClass('hidden');
        }
    }).prop('disabled', !$.support.fileInput)
        .parent().addClass($.support.fileInput ? undefined : 'disabled');
}

Template.postCreate.events({
    'click button[type="submit"]': function (evt, template) {
        var post = {
            title: template.find('input[name="title"]').value
        };
    },
    'click #add-clothing-btn': function(evt, template) {
        $('.clothing:last').after(Blaze.toHTMLWithData(Template.addClothing));
        bindFileUpload();
    },
    'click #create-post-btn': function(evt, template) {
        var post = {
            title: template.$('input[name="title"]').val(),
            description: template.$('textarea[name="description"]').val(),
            overview: template.$('input[name="overview"]').val(),
            clothings: []
        };
        template.$('.clothing').each(function(i, clothing){
            post.clothings.push(
                {
                    type: $('select[name="type"]', clothing).val(),
                    name: $('input[name="name"]', clothing).val(),
                    price: parseFloat($('input[name="price"]', clothing).val()),
                    img: $('input[name="img"]', clothing).val(),
                    url: $('input[name="taobao-url"]', clothing).val(),
                    alimamaUrl: $('input[name="alimama-url"]', clothing).val()
                }
            );
        });
        Meteor.call('postInsert', post, function(err, result){
            if (err) return alert(err.reason);
            Router.go('post.item', {
                _id : result._id
            });
        });
    }
});

Template.postCreate.rendered = function () {
    bindFileUpload();
};
