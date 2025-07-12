# Security Policy

## Supported Versions

We actively maintain and provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 2.0.x   | :white_check_mark: |
| 1.x.x   | :x:                |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security vulnerability in zca-js, please follow these steps:

### 1. **DO NOT** create a public GitHub issue
Security vulnerabilities should be reported privately to prevent potential exploitation.

### 2. Report the vulnerability
Send an email to the maintainers with the following information:
- **Subject**: `[SECURITY] zca-js vulnerability report`
- **Description**: Detailed description of the vulnerability
- **Steps to reproduce**: Clear steps to reproduce the issue
- **Impact assessment**: Potential impact of the vulnerability
- **Suggested fix** (if available): Any suggestions for fixing the issue

### 3. Response timeline
- **Initial response**: Within 48 hours
- **Status update**: Within 1 week
- **Resolution**: As soon as possible, typically within 30 days

## Security Considerations

### Important Warnings

⚠️ **This is an unofficial API library** that simulates browser interactions with Zalo Web. Please be aware of the following security considerations:

1. **Account Risk**: Using this API may result in your Zalo account being locked or banned. Use at your own risk.

2. **Authentication**: The library handles sensitive authentication data. Ensure proper security measures when storing or transmitting this information.

3. **Rate Limiting**: Respect Zalo's rate limits to avoid triggering security measures.

4. **Data Privacy**: Be mindful of user privacy and comply with relevant data protection regulations.

### Best Practices

1. **Environment Variables**: Store sensitive configuration in environment variables, not in code
2. **HTTPS Only**: Always use HTTPS when transmitting data
3. **Input Validation**: Validate all inputs before processing
4. **Error Handling**: Implement proper error handling to avoid information disclosure
5. **Regular Updates**: Keep the library updated to the latest version

### Known Limitations

- This library is not officially supported by Zalo
- API endpoints and behavior may change without notice
- No guarantee of service availability or stability
- May break with Zalo Web updates

## Security Updates

Security updates will be released as patch versions (e.g., 2.0.1, 2.0.2) and will be clearly marked in the changelog.

## Contact Information

For security-related issues, please contact:
- **GitHub Issues**: Create a private issue with the `[SECURITY]` label
- **GitHub Discussions**: Use the "Security" category for general security questions
- **Team Members**: 
  - [@RFS-ADRENO](https://github.com/RFS-ADRENO)
  - [@truong9c2208](https://github.com/truong9c2208)
  - [@JustKemForFun](https://github.com/JustKemForFun)
- **Alternative**: Contact any team member through GitHub for urgent security matters

## Acknowledgments

We appreciate security researchers and community members who responsibly disclose vulnerabilities. Contributors will be acknowledged in our security advisories unless they prefer to remain anonymous.

---

**Note**: This security policy is subject to change. Please check back regularly for updates. 