(() => {
  const BUBBLE_SELECTOR = ".user-message-bubble-color";
  const NAV_CONTAINER_ID = "chat-navigator";
  let navContainer;
  let isCollapsed = false;
  let lastUrl = location.href;

  const BRAND_NAME = "PromptAnchor";
  const ICON_PATH = chrome.runtime.getURL("icons/fav.png");

  function createNavigator() {
    if (document.getElementById(NAV_CONTAINER_ID)) return;

    navContainer = document.createElement("div");
    navContainer.id = NAV_CONTAINER_ID;
    navContainer.innerHTML = `
      <div class="nav-header">
        <div class="nav-brand">
          <img src="${ICON_PATH}" class="nav-favicon" alt="icon" />
          <span class="nav-title">${BRAND_NAME}</span>
        </div>
        <div class="nav-controls">
          <button id="nav-collapse" title="Collapse">⇤</button>
          <button id="nav-refresh" title="Refresh">↻</button>
        </div>
      </div>
      <div id="nav-list"></div>
    `;
    document.body.appendChild(navContainer);

    document.getElementById("nav-refresh").addEventListener("click", buildNavigatorList);
    document.getElementById("nav-collapse").addEventListener("click", toggleCollapse);

    buildNavigatorList();
  }

  function buildNavigatorList() {
    const navList = document.getElementById("nav-list");
    if (!navList) return;
    navList.innerHTML = "";

    const bubbles = document.querySelectorAll(BUBBLE_SELECTOR);
    if (!bubbles.length) {
      const empty = document.createElement("div");
      empty.className = "nav-empty";
      empty.textContent = "No messages found.";
      navList.appendChild(empty);
      return;
    }

    bubbles.forEach((bubble, i) => {
      const text = bubble.innerText.trim().slice(0, 70) || "(empty message)";
      const item = document.createElement("div");
      item.className = "nav-item";
      item.textContent = `${i + 1}. ${text}`;
      item.title = bubble.innerText;

      item.addEventListener("click", () => {
        bubble.scrollIntoView({ behavior: "smooth", block: "center" });
        bubble.animate([{ outline: "2px solid #007bff" }, { outline: "none" }], {
          duration: 1200,
          easing: "ease-out"
        });
      });

      navList.appendChild(item);
    });
  }

  function toggleCollapse() {
    const collapseBtn = document.getElementById("nav-collapse");
    if (!collapseBtn) return;

    isCollapsed = !isCollapsed;

    if (isCollapsed) {
      navContainer.classList.add("collapsed");
      collapseBtn.textContent = "⇥";

      if (!document.getElementById("chat-navigator-floating")) {
        const floatBtn = document.createElement("div");
        floatBtn.id = "chat-navigator-floating";
        floatBtn.innerHTML = `
          <a href="#" id="expand-anchor" title="Open ${BRAND_NAME}">
            <img src="${ICON_PATH}" alt="logo" />
          </a>
        `;
        floatBtn.addEventListener("click", () => {
          navContainer.classList.remove("collapsed");
          collapseBtn.textContent = "⇤";
          isCollapsed = false;
          floatBtn.remove();
        });
        document.body.appendChild(floatBtn);
      }
    } else {
      navContainer.classList.remove("collapsed");
      collapseBtn.textContent = "⇤";

      const floatBtn = document.getElementById("chat-navigator-floating");
      if (floatBtn) floatBtn.remove();
    }
  }

  function watchUrlChange() {
    const observer = new MutationObserver(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        removeNavigator();
        setTimeout(createNavigator, 1500);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function removeNavigator() {
    const old = document.getElementById(NAV_CONTAINER_ID);
    if (old) old.remove();
    const floatBtn = document.getElementById("chat-navigator-floating");
    if (floatBtn) floatBtn.remove();
  }

  window.addEventListener("load", () => {
    if (location.hostname === "chatgpt.com") {
      setTimeout(createNavigator, 1500);
      watchUrlChange();
    }
  });
})();
