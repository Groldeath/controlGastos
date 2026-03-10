const http = require('http');
async function test() {
    console.log("Login...");
    const resLogin = await fetch('http://localhost:3000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'usariotest@email.com', contrasena: '123' }) // We don't know pwd, maybe it works if not we create one
    });
    // Let's just create a test user
    const resReg = await fetch('http://localhost:3000/api/users/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre_usuario: 'test-edit', email: 'edit@test.com', contrasena: '123' })
    });
    const regJson = await resReg.json();
    const token = regJson.token;

    if (!token) {
        console.log("No token:", regJson);
        const l = await fetch('http://localhost:3000/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'edit@test.com', contrasena: '123' })
        });
        const lj = await l.json();
        var myToken = lj.token;
    } else {
        var myToken = token;
    }

    console.log("Adding cat...");
    let catRes = await fetch('http://localhost:3000/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${myToken}` },
        body: JSON.stringify({ nombre: 'TEST_CAT' })
    });
    const cat = await catRes.json();
    console.log("Created:", cat);

    if (cat.id) {
        console.log("Editing cat ID:", cat.id);
        let editRes = await fetch(`http://localhost:3000/api/categories/${cat.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${myToken}` },
            body: JSON.stringify({ nombre: 'TEST_CAT_EDITADA' })
        });
        const txt = await editRes.text();
        console.log("Edit Res:", editRes.status, txt);

        console.log("Deleting cat...");
        let delRes = await fetch(`http://localhost:3000/api/categories/${cat.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${myToken}` }
        });
        console.log("Del Res:", delRes.status, await delRes.text());
    }
}
test().catch(console.error);
