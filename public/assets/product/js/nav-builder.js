document.addEventListener("DOMContentLoaded", function () {
    const contentContainer = document.querySelector(".workdocs__content");
    const navContainer = document.querySelector(".workdocs-nav");
    
    if (!contentContainer || !navContainer) {
        return;
    }

    // Select both h4 and h6 headers with ids
    const headers = contentContainer.querySelectorAll("h4[id], h6[id]");
    const headersArray = Array.from(headers);

    // Sort headers based on their position in the document
    headersArray.sort((a, b) => {
        if (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_PRECEDING) {
            return 1;
        }
        return -1;
    });

    // Create navigation links
    headersArray.forEach(header => {
        const id = header.id;
        let text = header.textContent.replace(":", ""); // Remove ":" from the text content
        const listItem = document.createElement("li");
        const anchor = document.createElement("a");

        anchor.href = `#${id}`;
        anchor.classList.add("link-to-section");
        anchor.textContent = text;

        listItem.appendChild(anchor);
        navContainer.appendChild(listItem);
    });
});
