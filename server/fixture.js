if (Meteor.users.find().count() === 0) {
    var userId = Accounts.createUser({
        username: 'kapor',
        email: 'kapor.zhu@gmail.com',
        password: 'oc123',
        profile: {
            first_name: 'Kapor',
            last_name: 'Zhu'
        }
    });
    Meteor.users.update({_id: userId}, {$set: {is_superuser: true}});
}