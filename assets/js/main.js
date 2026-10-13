const languageToggle = document.getElementById("language-toggle");
const printButton = document.getElementById("print-button");
const downloadButton = document.getElementById("download-button");
const resumeContent = document.getElementById("resume-content");
const description = document.querySelector('meta[name="description"]');

async function setLanguage(language) {
    const response = await fetch(`assets/i18n/${language}.html`);
    if (!response.ok) {
        throw new Error(`Could not load ${language}.html`);
    }

    const localizedDocument = new DOMParser().parseFromString(await response.text(), "text/html");
    const metadata = localizedDocument.getElementById("locale-metadata");
    const resumeTemplate = localizedDocument.getElementById("resume-content");

    document.documentElement.lang = metadata.dataset.lang;
    document.title = metadata.dataset.title;
    description.content = metadata.dataset.description;
    languageToggle.textContent = metadata.dataset.toggleLabel;
    languageToggle.setAttribute("aria-label", metadata.dataset.toggleAriaLabel);
    printButton.textContent = metadata.dataset.printLabel;
    printButton.setAttribute("aria-label", metadata.dataset.printAriaLabel);
    downloadButton.textContent = metadata.dataset.downloadLabel;
    downloadButton.setAttribute("aria-label", metadata.dataset.downloadAriaLabel);
    resumeContent.innerHTML = resumeTemplate.innerHTML;
    localStorage.setItem("resume-language", language);
}

languageToggle.addEventListener("click", () => {
    const nextLanguage = document.documentElement.lang === "pt-BR" ? "english" : "portuguese";
    setLanguage(nextLanguage).catch(console.error);
});

printButton.addEventListener("click", () => window.print());

function resumeAsPlainText(element) {
    const lines = [];
    const blockTags = new Set(["ADDRESS", "ARTICLE", "DIV", "H1", "H2", "H3", "HEADER", "LI", "MAIN", "P", "SECTION", "SPAN"]);

    function visit(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            lines.push(node.nodeValue.replace(/\s+/g, " "));
            return;
        }
        if (node.nodeType !== Node.ELEMENT_NODE || node.matches(".photo, img")) return;

        const tag = node.tagName;
        if (tag === "LI") lines.push("\n- ");
        else if (blockTags.has(tag) && lines.length) lines.push("\n");
        for (const child of node.childNodes) visit(child);
        if (tag === "STRONG") lines.push(": ");
        if (blockTags.has(tag)) lines.push("\n");
    }

    visit(element);
    return lines.join("")
        .replace(/[ \t]*\n[ \t]*/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim() + "\n";
}

downloadButton.addEventListener("click", () => {
    const language = document.documentElement.lang === "pt-BR" ? "pt-BR" : "en";
    const blob = new Blob(["\uFEFF", resumeAsPlainText(resumeContent)], {type: "text/plain;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Felipe-de-Siqueira-Zanella-CV-${language}-ATS.txt`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
});

const savedLanguage = localStorage.getItem("resume-language");
setLanguage(savedLanguage === "portuguese" || savedLanguage === "pt" ? "portuguese" : "english").catch(console.error);
