(() => {
  const config = window.__PREVIEW_README__;
  const content = document.getElementById("preview-content");
  const status = document.getElementById("preview-status");
  const reload = document.getElementById("preview-reload");

  function setStatus(message) {
    status.textContent = message;
  }

  function showError(error) {
    const message = error instanceof Error ? error.message : String(error);
    content.innerHTML = "";
    const panel = document.createElement("pre");
    panel.className = "preview-error";
    panel.textContent = message;
    content.appendChild(panel);
    setStatus("加载失败");
  }

  async function renderReadme() {
    if (window.location.protocol === "file:") {
      showError(config.fileProtocolMessage);
      return;
    }

    if (!window.marked) {
      showError("marked 未加载。请检查网络或 CDN 可用性。");
      return;
    }

    setStatus("加载 README.md");
    reload.disabled = true;

    try {
      const response = await fetch(`${config.readmePath}?t=${Date.now()}`, {
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error(`README 加载失败：HTTP ${response.status}`);
      }

      const markdown = await response.text();
      content.innerHTML = window.marked.parse(markdown, {
        gfm: true,
        breaks: false,
      });
      setStatus(`已加载 · ${new Date().toLocaleTimeString(config.language)}`);
    } catch (error) {
      showError(error);
    } finally {
      reload.disabled = false;
    }
  }

  reload.addEventListener("click", renderReadme);
  renderReadme();
})();
