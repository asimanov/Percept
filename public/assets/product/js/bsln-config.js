document.addEventListener("DOMContentLoaded", function() {
    cssPropWrite();
    lightDark();

    const labels = document.querySelectorAll('.navigation__color-scheme label');

    labels.forEach(label => {
        label.addEventListener('click', function() {
            const radio = this.querySelector('input[name="color-scheme"]');
            const icon = this.querySelector('i'); // Select the icon inside the label
            if (radio) {
                radio.checked = true;
                applyTheme(radio.value); // Apply the selected theme
                localStorage.setItem('theme', radio.value); // Save the user-selected theme
                addShakeAnimation(icon); // Add shake animation to the icon
            }
        });
    });
});

function addShakeAnimation(icon) {
    // Add the "fa-shake" class
    icon.classList.add('fa-shake');

    // Remove the class after 500ms (adjust timing based on the animation duration)
    setTimeout(() => {
        icon.classList.remove('fa-shake');
    }, 500); // Set the duration to match the animation length
}

function cssPropWrite() {  
    document.documentElement.style.setProperty('--add-font-sans', 'Archivo Black');
    document.documentElement.style.setProperty('--add-font-serif', 'PT Sans');
    document.documentElement.style.setProperty('--add-font-mono', 'Cousine');
    document.documentElement.style.setProperty('--set-color-primary', 'var(--set-color-cyan)');
    document.documentElement.style.setProperty('--set-color-secondary', 'var(--set-color-red)');
}

function lightDark() { 
    const lightModeRadio = document.querySelector('input[name="color-scheme"][value="light"]');
    const darkModeRadio = document.querySelector('input[name="color-scheme"][value="dark"]');

    const savedTheme = localStorage.getItem('theme'); // Check if a theme has been saved by the user
    if (savedTheme) {
        if (savedTheme === 'dark') {
            darkModeRadio.checked = true;
            applyTheme('dark');
        } else if (savedTheme === 'light') {
            lightModeRadio.checked = true;
            applyTheme('light');
        }
    } else {
        // If no theme is saved, fall back to system preference
        const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const prefersLightScheme = window.matchMedia("(prefers-color-scheme: light)").matches;

        if (prefersDarkScheme) {
            darkModeRadio.checked = true;
            applyTheme('dark');
        } else if (prefersLightScheme) {
            lightModeRadio.checked = true;
            applyTheme('light');
        }
    }

    window.matchMedia("(prefers-color-scheme: dark)").addEventListener('change', e => {
        if (!localStorage.getItem('theme')) { // Only update if the user hasn't selected a theme manually
            if (e.matches) {
                darkModeRadio.checked = true;
                applyTheme('dark');
            }
        }
    });

    window.matchMedia("(prefers-color-scheme: light)").addEventListener('change', e => {
        if (!localStorage.getItem('theme')) { // Only update if the user hasn't selected a theme manually
            if (e.matches) {
                lightModeRadio.checked = true;
                applyTheme('light');
            }
        }
    });
}

function applyTheme(theme) {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark-mode');
        document.documentElement.classList.remove('light-mode');
    } else if (theme === 'light') {
        document.documentElement.classList.add('light-mode');
        document.documentElement.classList.remove('dark-mode');
    }
}