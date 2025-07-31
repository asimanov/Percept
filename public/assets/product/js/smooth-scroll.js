document.addEventListener("DOMContentLoaded", function () {
    // Smooth scrolling function with offset adjustment
    function smoothScroll(target) {
        const element = document.querySelector(target);
        const headerOffset = 60; // Adjust this value to match the height of your fixed header
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        if (element) {
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
            console.log(`Scrolling to ${target}`);
        } else {
            console.log(`Element not found: ${target}`);
        }
    }

    // Add click event listener to navigation links
    document.querySelectorAll(".workdocs-nav a").forEach(anchor => {
        anchor.addEventListener("click", function (e) {
            e.preventDefault();
            const target = this.getAttribute("href");
            smoothScroll(target);
            console.log(`Clicked on ${target}`);
        });
    });

    console.log("Event listeners added");
});
