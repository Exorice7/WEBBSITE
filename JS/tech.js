document.addEventListener('DOMContentLoaded', () => {
    const burgerMenu = document.querySelector('.burger-menu');
    const nav = document.querySelector('header nav');

    if (burgerMenu && nav) {
        burgerMenu.addEventListener('click', () => {
            nav.classList.toggle('active');
            const isExpanded = nav.classList.contains('active');
            burgerMenu.setAttribute('aria-expanded', isExpanded);
            burgerMenu.classList.toggle('open', isExpanded);
        });
    }
});