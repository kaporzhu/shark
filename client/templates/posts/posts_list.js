Template.postsList.helpers({
    likedClass: function() {
        var userId = Meteor.userId();
        if (userId && _.include(this.likers, userId)) {
            return 'liked';
        } else {
            return '';
        }
    }
});
