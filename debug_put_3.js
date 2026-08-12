const fs = require('fs');
async function test() {
  const providersRes = await fetch('http://localhost:4000/api/admin/providers');
  const data = await providersRes.json();
  const providerWithModels = data.find(p => p.models && p.models.length > 0);
  console.log(typeof providerWithModels.models);
  if (typeof providerWithModels.models === 'string') {
    providerWithModels.models = JSON.parse(providerWithModels.models);
  }
  providerWithModels.models[0].icon = "test_icon";
  const putRes = await fetch('http://localhost:4000/api/admin/providers', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  console.log("Status:", putRes.status);
  console.log("Body:", await putRes.text());
}
test();
