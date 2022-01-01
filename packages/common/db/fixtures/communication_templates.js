let templates = [
    {
        title: 'One Time Password Login Email',
        name: 'communication/login-otp-email',
        content: `
        <p>Hi {{titleize fields.first_name}}!</p>
        <p>Your login code is {{fields.code}}.</p>
        <p>Note: for security reasons, the above code will expire in three minutes.</p>
        `
    },
    {
        title: 'One Time Password Login SMS',
        name: 'communication/login-otp-sms',
        content:`Hi {{titleize reference.first_name}}, Here's your code to log in: {{{fields.code}}}.

        @{{{fields.url}}} #{{{fields.code}}}`
    }

];

module.exports = templates;