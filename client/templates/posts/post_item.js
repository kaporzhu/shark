Template.postItem.events({
    'click #post-item .like': function(evt, template) {
        if (! Meteor.user()) return;
        Meteor.call('postLike', this._id);
    },
    'click #post-comments .like': function() {
        if (! Meteor.user()) return;
        Meteor.call('commentVote', this._id, true);
    },
    'click #post-comments .dislike': function() {
        if (! Meteor.user()) return;
        Meteor.call('commentVote', this._id, false);
    },
    'click #post-comments .reward-btn': function(evt, template) {
        if (! Meteor.user()) return;
        if (Meteor.user().is_superuser && !this.reward && !this.reject) {
            var amount = prompt('奖励多少？');
            if (amount) {
                Meteor.call('commentReward', this._id, parseInt(amount));
            }
        }
    },
    'click #post-comments .reject-btn': function(evt, template) {
        if (! Meteor.user()) return;
        if (Meteor.user().is_superuser && !this.reward && !this.reject) {
            var reason = prompt('WHY?');
            if (reason) {
                Meteor.call('commentReject', this._id, reason);
            }
        }
    },
    'click .nav-list li': function(evt, template) {
        if ($(evt.target).parents('li').is('.selected'))  return;
        $('#post-item .nav-list li.selected').removeClass('selected');
        $('#post-item .img-zoom-view .cover').show();
        $('#post-item .img-zoom-view>img').on('load', function() {
            $('#post-item .img-zoom-view .cover').hide();
        }).attr('src', $(evt.target).parents('li').addClass('selected').data('img'));
    },
    'change .other-comments .selector input': function(evt, template) {
        var $comments = $('#post-comments .other-comments .{comment}'.replace('{comment}', $(evt.target).val())).toggleClass('hidden');
        var top = $comments.offset().top;
        if ($comments.is(':visible')) {
            $('html, body').animate({
                scrollTop: top*0.8
            }, top/2);
        }
    },
    'click .slide-nav a.nav-btn': function(evt, template) {
        var type = $(evt.target).data('type');
        var $preBtn = $('.slide-nav .nav-prev');
        var $nextBtn = $('.slide-nav .nav-next');
        var listHeight = $('.nav-list').height();
        var $firstEle = $('.nav-list li:first');
        var $lastEle = $('.nav-list li:last');
        var firstElePos = $firstEle.position().top;
        var lastElePos = $lastEle.position().top;

        // scroll the slide
        if (type == 'prev') {
            var marginTop = parseInt($('.nav-list ul').css('margin-top'));
            var $lis = $('.nav-list li');
            for (var i=$lis.length-1; i>=0; i--) {
                var $li = $($lis[i]);
                if ($li.position().top + $li.height() < $preBtn.height()) {
                    $('.nav-list ul').animate({
                        'margin-top': marginTop + ($preBtn.height()-$li.position().top)
                    }, function(){updateNavBtnStatus();});
                    break;
                }
            }
        }
        if (type == 'next') {
            var marginTop = parseInt($('.nav-list ul').css('margin-top'));
            var $lis = $('.nav-list li');
            for (var i=0; i<$lis.length; i++) {
                var $li = $($lis[i]);
                if ($li.position().top > $preBtn.height()+listHeight) {
                    $('.nav-list ul').animate({
                        'margin-top': marginTop - ($li.position().top+$li.height()-$preBtn.height()-listHeight)
                    }, function(){updateNavBtnStatus();});
                    break;
                }
            }
        }
        updateNavBtnStatus();
    }
});

Template.postItem.helpers({
    likedClass: function() {
        var userId = Meteor.userId();
        if (userId && _.include(this.likers, userId)) {
            return 'liked';
        } else {
            return '';
        }
    },
    hasComment: function() {
        return !! Comments.findOne({
            postId: this._id,
            userId: {$ne: Meteor.userId()}
        });
    },
    comments: function(type) {
        var query = {
            postId: this._id,
            userId: {$ne: Meteor.userId()}
        };
        if (type == 'reward') {
            _.extend(query, {reward: {$ne: null}});
        } else if (type == 'reject') {
            _.extend(query, {reject: {$ne: null}});
        } else {
            _.extend(query, {
                reward: null,
                reject: null
            });
        }
        return Comments.find(query, {sort: {'reward.amount': -1, submitted: -1}});
    },
    myComment: function() {
        if (Meteor.user()) {
            return Comments.findOne({postId: this._id, userId: Meteor.userId()});
        }
    },
    images: function() {
        var imgs = [{
            index: 0,
            url: this.overview,
            active: true
        }];
        for (var i in this.pickedImages) {
            imgs.push({
                index: parseInt(i)+1,
                url: this.pickedImages[i].url,
                active: false
            });
        }
        return imgs;
    },
    showProcessingComment: function() {
        return ! Comments.findOne({
            postId: this._id,
            userId: {$ne: Meteor.userId()},
            reward: {$exists: true}
        });
    }
});

Template.commentItem.helpers({
    showRewardForm: function() {
        return Meteor.user() && Meteor.user().is_superuser && ! this.reward && ! this.reject;
    },
    isMyComment: function() {
        return this.userId === Meteor.userId();
    },
    isProcessing: function() {
        return ! this.reward && ! this.reject;
    }
});

Template.commentItem.events({
    'click .del-btn': function(evt, template) {
        if (! Meteor.user()) return;
        if (confirm('确定删除？')) {
            Comments.remove({_id: this._id});
        }
    },
    'click .edit-btn': function(evt, template) {
        if (! Meteor.user()) return;
        UI.renderWithData(Template.commentEditForm, {comment: this}, document.getElementsByTagName('body')[0]);
        $('#edit-comment').modal('show').on('hidden.bs.modal', function (e) {
            $('#edit-comment').remove();
        });
    }
});

Template.commentEditForm.events({
    'click button.save': function(evt, template) {
        if (! Meteor.user()) return;
        var comment = {
            commentId: this.comment._id,
            content: template.$('form textarea[name="content"]').val(),
            imgs: _.map(template.$('form .imgs img'), function(img) {
                return {
                    url: $(img).attr('src').split('@!')[0]
                };
            })
        };
        Meteor.call('commentEdit', comment, function(err, result){
            if (err) return alert(err.reason);
            $('#edit-comment').modal('hide');
            bindEvents();
        });
    },
    'click .del-img-btn': function(evt, template) {
        if (! Meteor.user()) return;
        $(evt.target).parents('li').remove();
    }
});

Template.commentForm.events({
    'click .upload-imgs .plus': function(evt, template) {
        $(evt.target).parents('li').find('input[type="file"]').trigger('click');
    },
    'click .upload-imgs input[type="file"]': function(evt, template) {
        $(evt.target).parents('.fileinput-button').tooltip('destroy');
    },
    'click .upload-imgs .del-img-btn': function(evt, template) {
        var $li = $(evt.target).parents('li');
        $li.find('.fileinput-button, .plus').removeClass('hidden');
        $li.find('img, .del-img-btn').remove();
    },
    'click #submit-comment-btn': function(evt, template) {
        if (! Meteor.user()) return;

        // check if all required images are uploaded
        if (template.$('.upload-imgs li.required img').size() != template.$('.upload-imgs li.required').size()) {
            alert('(●—●)我有点贪心。正面、侧面和背面的全身照都需要。。。');
            return;
        }

        var comment = {
            content: template.$('form textarea[name="content"]').val(),
            postId: this._id,
            imgs: _.map(template.$('.upload-imgs img'), function(img) {
                return {url: $(img).attr('src').split('@!')[0]};
            })
        };

        Meteor.call('commentInsert', comment, function(err, result){
            if (err) return alert(err.reason);
            bindEvents();
        });
    },
    'load #applyPostageForm .upload-imgs img': function(evt, template) {
        // check image size
        var $img = $(evt.target);
        if ($img.height() - $img.width() < 10 ) {
            $img.siblings('.del-img-btn').remove();
            $img.siblings('.hidden').removeClass('hidden');
            $img.siblings('.fileinput-button').tooltip({
                title: '(●—●) 请上传竖着的长方形样式的照片',
                trigger: 'manual',
                container: 'body'
            }).tooltip('show');
            $img.remove();
        }
    }
});

var bindEvents = function() {
    $('img').unveil();
    $('#post-comments .comment').each(function() {
        $(this).magnificPopup({
            tClose: '关闭 (Esc)',
            tLoading: '加载中...',
            delegate: 'a.img',
            type: 'image',
            gallery: {
                enabled:true,
                tPrev: '上一张 (←)',
                tNext: '下一张 (→)',
                tCounter: '%curr%/%total%'
            },
            image: {
                tError: '<a href="%url%">图片</a>加载失败',
                titleSrc: 'data-title'
            },
            callbacks: {
                open: function() {
                    $('figure').swipe( {
                        swipe:function(event, direction, distance, duration, fingerCount, fingerData) {
                            if (direction == 'left') {
                                $.magnificPopup.instance.next();
                            } else if (direction == 'right') {
                                $.magnificPopup.instance.prev();
                            }
                        }
                    });
                },
                markupParse: function(template, values, item) {
                    if (Meteor.user() && Meteor.user().is_superuser) {
                        var picked = item.el.data('picked')||false;
                        $('figure .glyphicon', template).remove();
                        $('figure', template).append($('<span>', {
                            'class': picked?'glyphicon glyphicon-star':'glyphicon glyphicon-star-empty',
                            'data-comment': item.el.data('comment'),
                            'data-url': item.el.data('url')
                        }));
                    }
                }
            }
        });
    });
    $('.upload-img').fileupload({
        url: Router.path('post.uploadphoto'),
        dataType: 'json',
        done: function (evt, data) {
            $(evt.target).parents('form').find('img[file="{name}"]'.replace('{name}', data.files[0].name)).attr('src', data.result.url + '@!small');
        },
        fail: function(evt, data) {
            console.log(data);
            if (data.jqXHR.status == 402) {
                alert('请上传照片（支持JPG和PNG格式的照片）');
            }
            $(evt.target).parents('form').find('img[file="{name}"]'.replace('{name}', data.files[0].name)).parent().remove();
        },
        submit: function (evt, data) {
            $(evt.target).parents('form').find('.imgs').append($('<li>').append($('<img>', {
                src: '/image/ajax-loader-large.gif',
                file: data.files[0].name,
                height: 80
            })).append('<span class="glyphicon glyphicon-remove del-img-btn"></span>'));
        }
    }).prop('disabled', !$.support.fileInput)
        .parent().addClass($.support.fileInput ? undefined : 'disabled');

    $('#applyPostageForm .upload-imgs li input[type="file"]').fileupload({
        url: Router.path('post.uploadphoto'),
        dataType: 'json',
        done: function (evt, data) {
            $(evt.target).parents('li').removeClass('loading').append([
                $('<img>', {src: data.result.url + '@!small'}),
                '<span class="glyphicon glyphicon-remove del-img-btn"></span>'
            ]).find('.fileinput-button, .plus').addClass('hidden').find('input[type="file"]').prop('disabled', false);
        },
        fail: function(evt, data) {
            console.log(data);
            if (data.jqXHR.status == 402) {
                alert('请上传照片（支持JPG和PNG格式的照片）');
            }
            $(evt.target).parents('li').removeClass('loading').find('input[type="file"]').prop('disabled', false);
        },
        submit: function (evt, data) {
            $(evt.target).parents('li').addClass('loading').find('input[type="file"]').prop('disabled', true);

        }
    }).prop('disabled', !$.support.fileInput)
        .parent().addClass($.support.fileInput ? undefined : 'disabled');
};

var updateNavBtnStatus = function(init) {
    // if init is true, it means the page is just loaded. The images in nav list may not be ready.
    // let's enable the next nav button first.
    var $preBtn = $('.slide-nav .nav-prev');
    var $nextBtn = $('.slide-nav .nav-next');
    var $firstEle = $('.nav-list li:first');
    var $lastEle = $('.nav-list li:last');

    if ($preBtn.position().top+$preBtn.height()-$firstEle.position().top < 15) {
        $preBtn.addClass('nav-prev-disabled');
    } else {
        $preBtn.removeClass('nav-prev-disabled');
    }
    if (!init) {
        if ($nextBtn.position().top-$lastEle.position().top - $lastEle.height() > -15) {
            $nextBtn.addClass('nav-next-disabled');
        } else {
            $nextBtn.removeClass('nav-next-disabled');
        }
    }
}

Template.postItem.rendered = function() {
    $('#post-item .nav-list li:first').addClass('selected');
    bindEvents();
    updateNavBtnStatus(true);
    $(document).on('click', '.mfp-figure .glyphicon', function() {
        var $glyphicon = $('.mfp-figure .glyphicon');
        Meteor.call('pickImage', $glyphicon.data('url'), $glyphicon.data('comment'), function(err, result){
            if (err) return alert(err.reason);
            if ($glyphicon.is('.glyphicon-star-empty')) {
                $glyphicon.removeClass('glyphicon-star-empty').addClass('glyphicon-star');
            } else {
                $glyphicon.removeClass('glyphicon-star').addClass('glyphicon-star-empty');
            }
        })
    });
}
Template.commentItem.rendered = bindEvents;
Template.commentEditForm.rendered = bindEvents;
Template.commentForm.rendered = bindEvents;