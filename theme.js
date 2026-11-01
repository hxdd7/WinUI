(function SpicetifyThemeIndicator() {
  function initNavIndicator() {
    // Locate Spotify's Library grid container
    const gridContainer = document.querySelector('div[role="grid"][aria-label="Your Library"]') || 
                          document.querySelector('.main-yourLibraryX-libraryRootlist');

    if (!gridContainer) {
      setTimeout(initNavIndicator, 300);
      return;
    }

    // Check if indicator already exists in this fresh container, otherwise create it
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

      if (rowRect.bottom < containerRect.top || rowRect.top > containerRect.bottom) {
        indicator.style.opacity = '0';
        return;
      }

      const scrollTop = gridContainer.scrollTop || gridContainer.closest('.os-viewport')?.scrollTop || 0;
      const relativeTop = (rowRect.top - containerRect.top) + scrollTop + (rowRect.height - 24) / 2;
      
      indicator.style.transform = `translateY(${relativeTop}px)`;
      indicator.style.opacity = '1';
    }

    function syncActiveRow() {
      let activeRow = gridContainer.querySelector('div[role="row"][aria-selected="true"]');
      if (activeRow) {
        updatePosition(activeRow);
      }
    }

    gridContainer.addEventListener('click', (e) => {
      const targetRow = e.target.closest('div[role="row"]');
      if (targetRow) {
        gridContainer.querySelectorAll('div[role="row"]').forEach(r => r.setAttribute('aria-selected', 'false'));
        targetRow.setAttribute('aria-selected', 'true');
        setTimeout(() => updatePosition(targetRow), 10);
      }
    });

    const observer = new MutationObserver(() => {
      syncActiveRow();
    });

    observer.observe(gridContainer, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: ['aria-selected', 'style']
    });

    gridContainer.addEventListener('scroll', () => {
      syncActiveRow();
    }, { passive: true });

    syncActiveRow();
  }

  // Watch for global DOM changes (like mode switching) which wipe out the grid container
  function watchForGridRebuild() {
    const rootTarget = document.body;
    
    let lastKnownGrid = document.querySelector('div[role="grid"][aria-label="Your Library"]');

    const globalObserver = new MutationObserver(() => {
      const currentGrid = document.querySelector('div[role="grid"][aria-label="Your Library"]');
      // If the grid element reference changed (meaning Spotify rebuilt the view), re-initialize!
      if (currentGrid && currentGrid !== lastKnownGrid) {
        lastKnownGrid = currentGrid;
        setTimeout(initNavIndicator, 200);
      }
    });

    globalObserver.observe(rootTarget, {
      childList: true,
      subtree: true
    });
  }

  // Hook into Spicetify theme execution safely
  if (window.Spicetify && window.Spicetify.Platform) {
    initNavIndicator();
    watchForGridRebuild();
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      initNavIndicator();
      watchForGridRebuild();
    });
  }
})();