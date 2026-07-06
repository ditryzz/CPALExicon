var activeCategory = 'All';
var expanded = null;
var CATS = ['All', 'Auditing', 'Financial Accounting and Reporting', 'Management Accounting and Control', 'Law', 'Latin Maxims', 'Tax'];
var DOTS = {
  All: 'dot-all',
  Auditing: 'dot-auditing',
  'Financial Accounting and Reporting': 'dot-far',
  'Management Accounting and Control': 'dot-mac',
  Law: 'dot-law',
  Tax: 'dot-tax',
  'Latin Maxims': 'dot-latin'
};
var BADGE_LABEL = {
  'Financial Accounting and Reporting': 'FAR',
  'Management Accounting and Control': 'MAS'
};
function badgeLabel(category){ return BADGE_LABEL[category] || category; }

var FAVORITES_KEY = 'cpalexicon-favorites';
var favorites = new Set();
try {
  favorites = new Set(JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]'));
} catch(e) { favorites = new Set(); }

function isFavorite(term){ return favorites.has(term); }

function saveFavorites(){
  try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(favorites))); } catch(e) {}
}

function toggleFavorite(term){
  if(favorites.has(term)) favorites.delete(term); else favorites.add(term);
  saveFavorites();
  renderSidebars();
  render();
}
 
var currentSuggestions = [];
var currentSuggestionIndex = -1;
 
function slugify(text){
  return text.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
}

function countFor(c){ return c==='All'?allTerms.length:allTerms.filter(function(t){return t.category===c}).length; }
 
function sidebarHTML(showSearch, includeThemeToggle){
  var html = '<p class="org-tag">TSU JPIA | Illyrthion Federation Academic Year 2026-2027</p><p class="sidebar-title">CPALexicon</p>';
  if(showSearch){
    html += '<div class="search-wrap"><i class="ti ti-search" aria-hidden="true"></i>';
    html += '<input type="text" id="search" class="search-input" placeholder="Search terms..." autocomplete="off" oninput="render(); updateSearchSuggestions(this.value)" />';
    html += '<div class="suggestions" id="search-suggestions" aria-live="polite"></div></div>';
  }
  html += '<p class="section-label">Favorites</p><div class="filter-btns">';
  html += `
<button
    type="button"
    class="filter-btn favorites-btn ${activeCategory === 'Favorites' ? 'active' : ''}"
    onclick="setCategory('Favorites')">
    <span class="fav-star-icon" aria-hidden="true">&#9733;</span>
    Favorites
    <span class="fcount">${favorites.size}</span>
</button>`;
  html += '</div><hr class="sidebar-divider"/>';
  html += '<p class="section-label">Category</p><div class="filter-btns">';
  CATS.forEach(function(c){
    html += `
<button
    type="button"
    class="filter-btn ${activeCategory === c ? 'active' : ''}"
    data-category="${c}"
    onclick="setCategory('${c}')">
    <span class="dot ${DOTS[c]}"></span>
    ${c}
    <span class="fcount">${countFor(c)}</span>
</button>`;
  });
  html += '</div><hr class="sidebar-divider"/>';
  html += '<p class="section-label">Source</p><div class="filter-btns">';
  html += '<button type="button" class="filter-btn citation-btn" onclick="openCitationsModal()" title="View all citations">';
  html += '<span class="dot dot-latin" aria-hidden="true"></span>';
  html += 'Citations &amp; Credits';
  html += '<i class="ti ti-info-circle citation-dl-icon" aria-hidden="true"></i>';
  html += '</button>';
  html += '</div>';
  html += '<hr class="sidebar-divider"/>';
  if(includeThemeToggle){
    html += '<div class="sidebar-theme-block drawer-theme-block">';
    html += '<p class="section-label theme-section-label">Theme</p>';
    html += '<button type="button" class="theme-toggle sidebar-theme-toggle drawer-theme-toggle" aria-label="Toggle dark mode">';
    html += '<i class="ti ti-moon" aria-hidden="true"></i><span class="theme-label">Dark mode</span>';
    html += '</button>';
    html += '</div>';
  }
  return html;
}

function openCitationsModal(){
  var existing = document.getElementById('citations-modal');
  if(existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.id = 'citations-modal';
  overlay.className = 'citations-overlay';
  overlay.innerHTML = `
    <div class="citations-dialog" role="dialog" aria-modal="true" aria-label="Citations and Credits">
      <button class="citations-close" onclick="closeCitationsModal()" aria-label="Close"><i class="ti ti-x"></i></button>
      <h2 class="citations-title"><i class="ti ti-book-2"></i> Citations &amp; Credits</h2>
      <hr class="citations-rule"/>

      <p class="citations-section-label">Primary Source</p>
      <div class="citations-card">
        <p class="citations-entry"><strong>Author:</strong> iCPA (Interactive CPA Review)</p>
        <p class="citations-entry"><strong>Title:</strong> Accounting Dictionary</p>
        <p class="citations-entry"><strong>Format:</strong> PDF Reference Material</p>
        <a class="citations-download" href="./Accounting_Dictionary.pdf" download>
          <i class="ti ti-download"></i> Download PDF
        </a>
      </div>

      <p class="citations-section-label" style="margin-top:1.1rem">Latin Maxims Source</p>
      <div class="citations-card">
        <p class="citations-entry"><strong>Title:</strong> Legal Latin Maxims Relevant to Obligations and Contracts</p>
        <p class="citations-entry"><strong>Coverage:</strong> ObliCon — Civil Law Latin Terminology</p>
      </div>

      <p class="citations-section-label" style="margin-top:1.1rem">Compiled By</p>
      <div class="citations-card">
        <p class="citations-entry"><strong>Organization:</strong> TSU JPIA — Junior Philippine Institute of Accountants</p>
        <p class="citations-entry"><strong>Department:</strong> Academics Department</p>
        <p class="citations-entry"><strong>Federation:</strong> Illyrthion Federation</p>
        <p class="citations-entry"><strong>Academic Year:</strong> 2026&ndash;2027</p>
      </div>

      <p class="citations-section-label" style="margin-top:1.1rem">App</p>
      <div class="citations-card">
        <p class="citations-entry"><strong>Name:</strong> CPALexicon</p>
        <p class="citations-entry"><strong>Purpose:</strong> Accounting Dictionary for TSU JPIA Members</p>
        <p class="citations-entry"><strong>Institution:</strong> Tarlac State University</p>
      </div>

      <div class="citations-disclaimer">
        <p>This app compiles accounting and legal terms for educational purposes only, with credit given to the original authors and publishers above. The compilers claim no ownership or copyright over the source material — all rights remain with the respective original authors and organizations. Any unintentional oversight in attribution will be corrected upon notice.</p>
      </div>
    </div>`;

  overlay.addEventListener('click', function(e){ if(e.target === overlay) closeCitationsModal(); });
  document.body.appendChild(overlay);
  requestAnimationFrame(function(){ overlay.classList.add('open'); });
}

function closeCitationsModal(){
  var overlay = document.getElementById('citations-modal');
  if(!overlay) return;
  overlay.classList.remove('open');
  setTimeout(function(){ if(overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 250);
}
 
function renderSidebars(){
  document.getElementById('sidebar-inner').innerHTML = sidebarHTML(true, false);
  document.getElementById('drawer-content').innerHTML = sidebarHTML(false, true);
  attachSearchHandlers();
  if(typeof attachThemeHandlers === 'function') attachThemeHandlers();
  if(typeof updateThemeButtons === 'function') updateThemeButtons(document.body.classList.contains('dark') ? 'dark' : 'light');
}
 
function setCategory(c){ activeCategory=c; renderSidebars(); render(); }
function openDrawer(){ document.getElementById('drawer').classList.add('open'); document.getElementById('drawer-overlay').classList.add('open'); }
function closeDrawer(){ document.getElementById('drawer').classList.remove('open'); document.getElementById('drawer-overlay').classList.remove('open'); }
 
function getQuery(){
  var mob = document.getElementById('mob-search');
  var des = document.getElementById('search');
  return (window.innerWidth<=700 && mob ? mob.value : des ? des.value : '').trim().toLowerCase();
}

function updateSearchSuggestions(query){
  currentSuggestionIndex = -1;
  currentSuggestions = [];
  if(query){
    var lower = query.toLowerCase();
    currentSuggestions = allTerms.filter(function(t){
      return t.term.toLowerCase().indexOf(lower) >= 0;
    }).slice(0,6);
  }

  renderSuggestionList('search-suggestions', currentSuggestions);
  renderSuggestionList('mob-search-suggestions', currentSuggestions);
}

function renderSuggestionList(id, suggestions){
  var container = document.getElementById(id);
  if(!container) return;
  container.innerHTML = suggestions.length ? suggestions.map(function(t, i){
    return '<button type="button" class="suggestion-item' + (i===currentSuggestionIndex ? ' active' : '') + '" onclick="selectSuggestion(\'' + t.term.replace(/'/g,"\\'") + '\')">'+
      '<strong>'+t.term+'</strong></button>';
  }).join('') : '';
  container.style.display = suggestions.length ? 'block' : 'none';
}

function changeSuggestionIndex(delta){
  if(!currentSuggestions.length) return;
  currentSuggestionIndex = Math.min(Math.max(currentSuggestionIndex + delta, 0), currentSuggestions.length - 1);
  renderSuggestionList('search-suggestions', currentSuggestions);
  renderSuggestionList('mob-search-suggestions', currentSuggestions);
}

function acceptSuggestion(){
  if(currentSuggestionIndex >= 0 && currentSuggestionIndex < currentSuggestions.length){
    selectSuggestion(currentSuggestions[currentSuggestionIndex].term);
  }
}

function selectSuggestion(term){
  var searchInput = document.getElementById('search');
  var mobInput = document.getElementById('mob-search');
  if(window.innerWidth<=700 && mobInput){
    mobInput.value = term;
  } else if(searchInput){
    searchInput.value = term;
  }
  render();
  updateSearchSuggestions(term);
}

function attachSearchHandlers(){
  var searchInput = document.getElementById('search');
  if(searchInput){
    searchInput.oninput = function(){ render(); updateSearchSuggestions(this.value); };
    searchInput.onfocus = function(){ updateSearchSuggestions(this.value); };
    searchInput.onblur = function(){ setTimeout(function(){ var sug = document.getElementById('search-suggestions'); if(sug) sug.style.display='none'; }, 150); };
    searchInput.onkeydown = function(event){
      if(event.key === 'ArrowDown'){
        event.preventDefault();
        if(currentSuggestionIndex < currentSuggestions.length - 1) {
          changeSuggestionIndex(1);
        } else if(currentSuggestions.length){
          currentSuggestionIndex = 0;
          changeSuggestionIndex(0);
        }
      }
      if(event.key === 'ArrowUp'){
        event.preventDefault();
        if(currentSuggestionIndex > 0) {
          changeSuggestionIndex(-1);
        }
      }
      if(event.key === 'Enter'){
        event.preventDefault();
        if(currentSuggestions.length && currentSuggestionIndex === -1){
          currentSuggestionIndex = 0;
        }
        acceptSuggestion();
        var sug = document.getElementById('search-suggestions');
        if(sug) sug.style.display='none';
      }
      if(event.key === 'Tab' || event.key === 'ArrowRight'){
        if(currentSuggestions.length){
          event.preventDefault();
          if(currentSuggestionIndex === -1) currentSuggestionIndex = 0;
          acceptSuggestion();
        }
      }
    };
  }

  var mobInput = document.getElementById('mob-search');
  if(mobInput){
    mobInput.oninput = function(){ render(); updateSearchSuggestions(this.value); };
    mobInput.onfocus = function(){ updateSearchSuggestions(this.value); };
    mobInput.onblur = function(){ setTimeout(function(){ var sug = document.getElementById('mob-search-suggestions'); if(sug) sug.style.display='none'; }, 150); };
    mobInput.onkeydown = function(event){
      if(event.key === 'ArrowDown'){
        event.preventDefault();
        if(currentSuggestionIndex < currentSuggestions.length - 1) {
          changeSuggestionIndex(1);
        } else if(currentSuggestions.length){
          currentSuggestionIndex = 0;
          changeSuggestionIndex(0);
        }
      }
      if(event.key === 'ArrowUp'){
        event.preventDefault();
        if(currentSuggestionIndex > 0) {
          changeSuggestionIndex(-1);
        }
      }
      if(event.key === 'Enter'){
        event.preventDefault();
        if(currentSuggestions.length && currentSuggestionIndex === -1){
          currentSuggestionIndex = 0;
        }
        acceptSuggestion();
        var sug = document.getElementById('mob-search-suggestions');
        if(sug) sug.style.display='none';
      }
      if(event.key === 'Tab' || event.key === 'ArrowRight'){
        if(currentSuggestions.length){
          event.preventDefault();
          if(currentSuggestionIndex === -1) currentSuggestionIndex = 0;
          acceptSuggestion();
        }
      }
    };
  }
}

function hl(text,q){
  if(!q) return text;
  return text.replace(new RegExp('('+q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','gi'),'<mark>$1</mark>');
}
 
function render(){
  var q = getQuery();
  var sort = document.getElementById('sort-select').value;
  var filtered = allTerms.filter(function(t){
    var mc = activeCategory==='All' ? true : (activeCategory==='Favorites' ? isFavorite(t.term) : t.category===activeCategory);
    var mq = !q||t.term.toLowerCase().indexOf(q)>=0;
    return mc&&mq;
  });
  if(sort==='az') filtered.sort(function(a,b){return a.term.localeCompare(b.term)});
  if(sort==='za') filtered.sort(function(a,b){return b.term.localeCompare(a.term)});
  if(sort==='cat') filtered.sort(function(a,b){return a.category.localeCompare(b.category)||a.term.localeCompare(b.term)});
  document.getElementById('stats').textContent = filtered.length===allTerms.length ? allTerms.length+' terms' : filtered.length+' of '+allTerms.length+' terms';
  var list = document.getElementById('terms-list');
  if(!filtered.length){
    list.innerHTML = activeCategory==='Favorites'
      ? '<div class="no-results"><i class="ti ti-star" aria-hidden="true"></i><p>No favorites yet. Tap the star on any term to save it here.</p></div>'
      : '<div class="no-results"><i class="ti ti-search-off" aria-hidden="true"></i><p>No terms match your search.</p></div>';
    return;
  }
  list.innerHTML = filtered.map(function(t){
    var isOpen = expanded===t.term;
    var isFav = isFavorite(t.term);
    var snippet = t.definition.length>80 ? t.definition.slice(0,80)+'\u2026' : t.definition;
    var esc = t.term.replace(/'/g,"\\'");
    return '<div class="term-card '+(isOpen?'expanded':'')+'" role="listitem">'+
      '<button type="button" class="fav-btn fav-btn-corner '+(isFav?'is-fav':'')+'" onclick="event.stopPropagation();toggleFavorite(\'' + esc + '\')" aria-label="'+(isFav?'Remove from favorites':'Add to favorites')+'" aria-pressed="'+isFav+'">'+
      '<span class="fav-star-glyph" aria-hidden="true">'+(isFav?'&#9733;':'&#9734;')+'</span></button>'+
      '<div class="term-header" onclick="toggle(\'' + esc + '\');closeDrawer()" tabindex="0" aria-expanded="'+isOpen+'" onkeydown="if(event.key===\'Enter\' || event.key===\' \'){event.preventDefault();toggle(\'' + esc + '\');}">'+
      '<div class="term-initial" aria-hidden="true">'+t.term.charAt(0)+'</div>'+
      '<div class="term-info"><div class="term-name">'+hl(t.term,q)+'</div>'+
      '<div class="term-snippet">'+(isOpen?'':hl(snippet,q))+'</div></div>'+
      '<div class="term-right">'+
      '<span class="badge '+('badge-'+slugify(t.category))+'">'+badgeLabel(t.category)+'</span>'+ 
      '<i class="ti ti-chevron-down chevron '+(isOpen?'open':'')+'" aria-hidden="true"></i></div></div>'+
      '<div class="term-body '+(isOpen?'show':'')+'"><hr class="term-divider"/>'+
      '<p class="definition">'+hl(t.definition,q)+'</p>'+      
      '</div></div>';
  }).join('');
}
 
function toggle(term){ expanded=expanded===term?null:term; render(); }

renderSidebars();
render();