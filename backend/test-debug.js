const API_URL = 'http://localhost:3000';

async function test() {
    console.log("Iniciando test de CRUD de Categorias...");
    // 1. Auth con uariotest
    const loginRes = await fetch(`${API_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'usariotest@email.com', password: 'keinelust1' })
    });

    if (!loginRes.ok) {
        console.error("Login fallo:", await loginRes.text());
        return;
    }

    const { token } = await loginRes.json();
    console.log("Token obtenido. Creando categoria...");

    // 2. Create
    const createRes = await fetch(`${API_URL}/api/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ nombre: 'Bugs Bunny' })
    });
    const cat = await createRes.json();
    console.log("Categoria Creada:", cat);

    if (cat.id) {
        // 3. Edit
        console.log(`Editando categoria ID: ${cat.id}...`);
        const editRes = await fetch(`${API_URL}/api/categories/${cat.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ nombre: 'Daffy Duck' })
        });
        const editStatus = editRes.status;
        const editBody = await editRes.text();
        console.log(`Edit Response (${editStatus}):`, editBody);

        // 4. Delete
        console.log(`Eliminando categoria ID: ${cat.id}...`);
        const delRes = await fetch(`${API_URL}/api/categories/${cat.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const delStatus = delRes.status;
        const delBody = await delRes.text();
        console.log(`Delete Response (${delStatus}):`, delBody);
    }
}
test().catch(console.error);
