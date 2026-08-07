fetch('http://localhost:4000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'Test-Login-Agent/2.0',
    'x-forwarded-for': '192.168.1.5'
  },
  body: JSON.stringify({
    email: 'test_ip_1@example.com',
    password: 'password123',
    hardwareInfo: { screenResolution: '2560x1440', deviceMemory: 16 }
  })
}).then(res => res.json()).then(console.log).catch(console.error);
