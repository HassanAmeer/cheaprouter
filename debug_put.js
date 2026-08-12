const fs = require('fs');

async function test() {
  const providersRes = await fetch('http://localhost:4000/api/admin/providers', {
    headers: {
      'Authorization': 'Bearer test'
    }
  });
  if (!providersRes.ok) {
    console.log("Cannot fetch providers");
    // Generate a dummy payload
    const dummy = [{
        id: "test", name: "test", status: true, key: "test", priority: 0, models: []
    }];
    const putRes = await fetch('http://localhost:4000/api/admin/providers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer asdf' },
        body: JSON.stringify(dummy)
    });
    console.log("Status:", putRes.status);
    console.log("Body:", await putRes.text());
  }
}
test();
