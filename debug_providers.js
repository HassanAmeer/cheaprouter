const fs = require('fs');
fetch('http://localhost:3000/api/admin/providers', {
  headers: {
    'Authorization': 'Bearer admin123'
  }
}).then(async r => {
  const data = await r.json();
  
  // Try sending it back unmodified with one icon added
  data[0].models[0].icon = "test";
  
  const putRes = await fetch('http://localhost:3000/api/admin/providers', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer admin123'
    },
    body: JSON.stringify(data)
  });
  console.log('PUT Status:', putRes.status);
  console.log('PUT Response:', await putRes.text());
});
