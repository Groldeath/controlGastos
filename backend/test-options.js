async function run() {
    const res = await fetch('http://localhost:3000/api/categories/1', {
        method: 'OPTIONS',
        headers: {
            'Access-Control-Request-Method': 'PUT',
            'Access-Control-Request-Headers': 'authorization,content-type',
            'Origin': 'http://localhost:5173'
        }
    });
    console.log(res.status, await res.text());
}
run();
