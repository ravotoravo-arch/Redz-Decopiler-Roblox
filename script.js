function redzEngine(source) {
    let header = `-- [[ REDZ DECOMPILER V2.5 - POWER EDITION ]]\n`;
    header += `-- [[ STATUS: DEEP SCAN COMPLETE ]]\n\n`;
    
    let result = source;

    // STUFE 1: Dezimal-Decoder (z.B. \104 -> h)
    result = result.replace(/\\(\d{1,3})/g, (match, p1) => {
        return String.fromCharCode(parseInt(p1, 10));
    });

    // STUFE 2: Hexadezimal-Decoder (z.B. \x68 -> h)
    result = result.replace(/\\x([a-fA-F0-9]{2})/g, (match, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
    });

    // STUFE 3: String-Bereinigung & Formatter
    result = result
        .replace(/_0x[a-f0-9]+/g, (match) => {
            // Macht aus hässlichen Namen wie _0x5f2a etwas Lesbares
            return "var_" + match.substring(4, 8);
        })
        .replace(/(\w+)\["(\w+)"\]/g, "$1.$2") // Macht aus workspace["Part"] -> workspace.Part
        .replace(/task\.wait\(/g, "wait(") // Vereinheitlichung
        .replace(/\\n/g, "\n") // Fixt Zeilenumbrüche in Strings
        .replace(/\\t/g, "    "); // Fixt Tabs

    // Extra: Auto-Indent (macht den Code "hübsch" untereinander)
    let finalCode = "";
    let indent = 0;
    result.split("\n").forEach(line => {
        let trimmed = line.trim();
        if (trimmed.match(/^(end|else|elseif)/)) indent--;
        finalCode += "    ".repeat(Math.max(0, indent)) + trimmed + "\n";
        if (trimmed.match(/^(if|then|function|while|for|do|local\s+\w+\s*=\s*\{)/) && !trimmed.match(/end$/)) indent++;
    });

    return header + finalCode;
}
