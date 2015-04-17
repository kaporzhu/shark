Favorites = new Meteor.Collection('favorites');

createFavorite = function(post) {
    Favorites.insert({
        userId: Meteor.userId(),
        postId: post._id,
        postTitle: post.title,
        submitted: new Date()
    });
};

removeFavorite = function(postId) {
    Favorites.remove({
        postId: postId
    });
};
