(function SpicetifyThemeIndicator() {
  function initNavIndicator() {
    const gridContainer = document.querySelector('div[role="grid"][aria-label="Your Library"]') || 
                          document.querySelector('.main-yourLibraryX-libraryRootlist');

    if (!gridContainer) {
      setTimeout(initNavIndicator, 500);
      return;
    }

    let indicator = gridContainer.querySelector('.spicetify-nav-indicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.className = 'spicetify-nav-indicator';
      gridContainer.appendChild(indicator);
    }

    function updatePosition(row) {
      if (!row) {
        indicator.style.opacity = '0';
        return;
      }
      
      const containerRect = gridContainer.getBoundingClientRect();
      const rowRect = row.getBoundingClientRect();

      // Ensure the target row is inside the visible viewport bounds
      if (rowRect.bottom < containerRect.top || rowRect.top > containerRect.bottom) {
        indicator.style.opacity = '0';
        return;
      }

      // Special handling for Liked Songs or items with layout shifts: 
      // Ensure we use the container's current scrollTop safely
      const scrollTop = gridContainer.scrollTop || gridContainer.closest('.os-viewport')?.scrollTop || 0;
      const relativeTop = (rowRect.top - containerRect.top) + scrollTop + (rowRect.height - 24) / 2;
      
      indicator.style.transform = `translateY(${relativeTop}px)`;
      indicator.style.opacity = '1';
    }

    function syncActiveRow() {
      // Find active row by selection state or fallback to matching Liked Songs if selected
      let activeRow = gridContainer.querySelector('div[role="row"][aria-selected="true"]');
      
      if (activeRow) {
        updatePosition(activeRow);
      }
    }

    // Immediate click visual feedback
    gridContainer.addEventListener('click', (e) => {
      const targetRow = e.target.closest('div[role="row"]');
      if (targetRow) {
        gridContainer.querySelectorAll('div[role="row"]').forEach(r => r.setAttribute('aria-selected', 'false'));
        targetRow.setAttribute('aria-selected', 'true');
        // Small delay to let Spotify finish its internal class/DOM toggle for Liked Songs
        setTimeout(() => updatePosition(targetRow), 10);
      }
    });

    // Track dynamic updates
    const observer = new MutationObserver(() => {
      syncActiveRow();
    });

    observer.observe(gridContainer, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: ['aria-selected', 'style']
    });

    // Handle container scroll events
    gridContainer.addEventListener('scroll', () => {
      syncActiveRow();
    }, { passive: true });

    // Initial positioning sync
    syncActiveRow();
  }

  if (window.Spicetify && window.Spicetify.Platform) {
    initNavIndicator();
  } else {
    document.addEventListener('DOMContentLoaded', initNavIndicator);
  }
})();