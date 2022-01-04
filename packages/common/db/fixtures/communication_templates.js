let templates = [
    {
        title: 'One Time Password Login Email',
        name: 'login-otp-email',
        content: `
        <p>Hi {{titleize first_name}}!</p>
        <p>Your login code is {{code}}.</p>
        <p>Note: for security reasons, the above code will expire in three minutes.</p>
        `
    },
    {
        title: 'One Time Password Login SMS',
        name: 'login-otp-sms',
        content:`Hi {{titleize first_name}}, Here's your code to log in: {{{code}}}.

        @{{{url}}} #{{{code}}}`
    }

];

module.exports = templates;