async function generateLink() {
    const text = document.getElementById('secretInput').value;
    if (!text) return alert("Please enter text first.");

    try {
        const response = await fetch('/api/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text })
        });

        const data = await response.json();
        
        document.getElementById('result').classList.remove('hidden');
        document.getElementById('linkOutput').value = data.url;
    } catch (err) {
        alert("Error creating link.");
    }
}

function copyLink() {
    const copyText = document.getElementById("linkOutput");
    copyText.select();
    document.execCommand("copy");
    alert("Copied to clipboard!");
}
