// Clean URL handling - removes .html from browser address bar
(function() {
  'use strict';
  
  // Only run on page load, not during navigation
  if (window.location.pathname.endsWith('.html')) {
    const cleanUrl = window.location.pathname.replace('.html', '');
    window.history.replaceState({}, '', cleanUrl);
  }
  
  // Handle clicks on internal links
  document.addEventListener('click', function(e) {
    const link = e.target.closest('a');
    if (!link) return;
    
    // Only handle internal links
    if (link.hostname !== window.location.hostname) return;
    if (link.target === '_blank') return;
    
    // Clean up .html from href
    if (link.getAttribute('href')?.endsWith('.html')) {
      link.setAttribute('href', link.getAttribute('href').replace('.html', ''));
    }
  });
})();