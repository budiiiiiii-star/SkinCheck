/**
 * app.js
 * Entry point aplikasi frontend SkinCheck.
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log("SkinCheck Application Initialized.");
    
    // Apply saved theme on page load (for authenticated pages via layout)
    const saved = localStorage.getItem('sc-theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
});
