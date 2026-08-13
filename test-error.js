const res = await fetch("http://localhost:4000/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-session-id": "test-session",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3ODY1OTIxNzExNTh9.9VFOZSapjdlQ7Jin99eIGpyPc0GbZfEXwrpVm9N8cwU"
  },
  body: JSON.stringify({"model": "ling-3.0-flash-free", "messages": [{"role": "user", "content": "hy"}]})
});
console.log(await res.text());
