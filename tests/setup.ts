// Test credentials only; independent of developer shells and Docker build secrets.
process.env.ADMIN_SESSION_SECRET ||= 'unit-test-only-not-a-deployment-secret-0123456789';
