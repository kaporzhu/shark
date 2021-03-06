// check that the userId specified owns the documents
ownsDocument = function(userId, doc) {
    return doc && doc.userId === userId;
};

isSuperuser = function() {
    return Meteor.user() && Meteor.user().is_superuser;
}
