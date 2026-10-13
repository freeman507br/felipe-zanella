const languageToggle = document.getElementById("language-toggle");
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
    resumeContent.innerHTML = resumeTemplate.innerHTML;
    localStorage.setItem("resume-language", language);
}

languageToggle.addEventListener("click", () => {
    const nextLanguage = document.documentElement.lang === "pt-BR" ? "english" : "portuguese";
    setLanguage(nextLanguage).catch(console.error);
});

const savedLanguage = localStorage.getItem("resume-language");
setLanguage(savedLanguage === "portuguese" || savedLanguage === "pt" ? "portuguese" : "english").catch(console.error);
