// سرّ اختبار فقط — حتى لا تعتمد الاختبارات على بيئة المطوّر ولا على أسرار البناء.
process.env.ADMIN_SESSION_SECRET ||= 'unit-test-only-not-a-deployment-secret-0123456789';
