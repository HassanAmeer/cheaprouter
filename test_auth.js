fetch('http://localhost:4000/api/auth/signup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'Test-Agent/1.0',
    'x-forwarded-for': '192.168.1.1'
  },
  body: JSON.stringify({
    email: 'test_ip_1@example.com',
    password: 'password123',
    name: 'Test IP',
    hardwareInfo: { screenResolution: '1920x1080', deviceMemory: 8 }
  })
}).then(res => res.json()).then(console.log).catch(console.error);
