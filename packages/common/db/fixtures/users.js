let users = [
    {
        username: 'admin@teloshs.com',
        email_address: 'admin@teloshs.com',
        first_name: 'admin',
        last_name: 'user',
        phone: '3023837042',
        roles: ['admin'],
        password: 'change me immediately'
    }
];

if(['local','development'].includes(process.env.NODE_ENV)) {
    users.push(
        {
            username: 'test_provider@teloshs.com',
            email_address: 'test_provider@teloshs.com',
            first_name: 'provider',
            last_name: 'test',
            phone: '3023837042',
            roles: ['provider'],
            password: 'change me immediately'
        },
        {
            username: 'test_patient@teloshs.com',
            email_address: 'test_patient@teloshs.com',
            first_name: 'patient',
            last_name: 'test',
            phone: '3023837042',
            roles: ['patient'],
            password: 'change me immediately'
        },
    );
}

module.exports = users;