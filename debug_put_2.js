const fs = require('fs');

async function test() {
  const providersRes = await fetch('http://localhost:4000/api/admin/providers');
  const data = await providersRes.json();
  if (!data || data.length === 0) return console.log("no data");
  
  // Set landingPagePriority and icon on the first model of the first provider
  data[0].models[0].icon = "test_icon";
  data[0].models[0].landingPagePriority = 1;
  
  const putRes = await fetch('http://localhost:4000/api/admin/providers', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  console.log("Status:", putRes.status);
  console.log("Body:", await putRes.text());
}
test();
