if (Meteor.users.find().count() === 0) {
    Accounts.createUser({
        username: 'kapor',
        email: 'kapor.zhu@gmail.com',
        password: 'oc123',
        profile: {
            first_name: 'Kapor',
            last_name: 'Zhu',
            is_superuser: true
        }
    });
}