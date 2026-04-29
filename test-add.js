async function test() {
  const res = await fetch("http://127.0.0.1:3000/api/students/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-user-role": "ADMIN"
    },
    body: JSON.stringify({
      name: "test",
      rollNumber: "test-roll-" + Date.now(),
      email: "test@example.com",
      faceDescriptor: []
    })
  });
  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Response:", text);
}
test();
