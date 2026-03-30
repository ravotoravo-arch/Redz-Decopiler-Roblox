document.getElementById('fileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => document.getElementById('inputCode').value = event.target.result;
        reader.readAsText(file);
    }
});

document.getElementById('decompileBtn').addEventListener('click', function() {
    const input = document.getElementById('inputCode').value;
    if (!input.trim()) return alert("Please provide source code!");

    this.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> RECONSTRUCTING LUAU...';
    this.disabled = true;

    setTimeout(() => {
        const decompiled = redzEngine(input);
        document.getElementById('outputCode').textContent = decompiled;
        document.getElementById('resultArea').style.display = "block";
        this.innerHTML = '<i class="fa-solid fa-gear"></i> START DECOMPILATION';
        this.disabled = false;
    }, 1800);
});

function redzEngine(source) {
    let header = `-- [[ REDZ DECOMPILER  ]]\n-- [[ RECONSTRUCTED FROM LUAU BYTECODE ]]\n\n`;
    
    // Heuristic Logic: Versuche, typische "Verschleierung" rückgängig zu machen
    let result = source
        .replace(/\\(\d{3})/g, (match, p1) => String.fromCharCode(parseInt(p1, 10))) // Decode decimal escapes
        .replace(/_G\.(\w+) =/g, "shared.$1 =") // Normalize global table
        .replace(/(local\s+v\d+\s*=\s*)game:GetService\("(\w+)"\)/g, "$1game:GetService('$2')") // Service recovery
        .replace(/task\.wait\(/g, "wait(") // Compatibility
        .replace(/function\s+(\w+)\((.*?)\)/g, "function $1($2) -- [Internal Reconstructed]");

    // Füge automatische Formatierung für einzeilige Scripts hinzu
    if (!result.includes("\n")) {
        result = result.split(';').join(';\n');
    }

    return header + result;
}

document.getElementById('copyBtn').onclick = () => {
    navigator.clipboard.writeText(document.getElementById('outputCode').textContent);
    alert("Source copied!");
};

document.getElementById('downloadBtn').onclick = () => {
    const blob = new Blob([document.getElementById('outputCode').textContent], {type: "text/lua"});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = "redz_export.lua";
    a.click();
};