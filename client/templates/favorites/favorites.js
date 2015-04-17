Template.favorites.helpers({
    favorites: function() {
        return Favorites.find({userId: Meteor.userId()}, {sort: {submitted: -1}});
    },
    favoriteCount: function() {
        return Favorites.find({userId: Meteor.userId()}).count();
    }
});