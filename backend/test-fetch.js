async function run() {
    try {
        const config = {
            method: 'PUT',
            data: { nombre: 'test' },
            body: '{"nombre":"test"}',
            headers: new Headers({ 'Content-Type': 'application/json' })
        };
        const res = await fetch('http://localhost:3000/api/categories/1', config);
        console.log("Fetch success:", res.status);
    } catch (e) {
        console.error("Fetch failed:", e.message);
    }
}
run();
