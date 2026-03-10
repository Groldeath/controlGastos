const http = require('http');

async function test() {
    console.log("Fetching GET /ping...");
    const ping = await fetch('http://localhost:3000/ping');
    console.log("Ping:", await ping.json());

    // 1. Setup user inside the db directly or by registering/logging in
    console.log("Intentando login...");
    let res = await fetch('http://localhost:3000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@admin.com', contrasena: '123' })
    });

    // If it fails, maybe user doesn't exist, register it
    if (!res.ok) {
        console.log("Login fallo, registrando admin@admin.com...");
        res = await fetch('http://localhost:3000/api/users/setup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre_usuario: 'admin', email: 'admin@admin.com', contrasena: '123' })
        });
    }

    const { token } = await res.json();
    console.log("Token obtenido.");

    // POST Category
    console.log("Creando categoria...");
    let catRes = await fetch('http://localhost:3000/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ nombre: 'TEST_CAT' })
    });
    const cat = await catRes.json();
    console.log("Categoria Creada:", cat);

    // PUT Category
    if (cat.id) {
        console.log("Editando categoria ID:", cat.id);
        let editRes = await fetch(`http://localhost:3000/api/categories/${cat.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ nombre: 'TEST_CAT_EDITADA' })
        });
        const edited = await editRes.json();
        console.log("Categoria Editada:", edited);

        // DELETE Category
        console.log("Borrando categoria...");
        let delRes = await fetch(`http://localhost:3000/api/categories/${cat.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const deleted = await delRes.json();
        console.log("Categoria Borrada:", deleted);
    }
}

test().catch(console.error);
