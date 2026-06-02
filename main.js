const data = window.portfolioData;

const heroLede = document.querySelector("#hero-lede");
const heroTitle = document.querySelector("#hero-title");
const identityRole = document.querySelector("#identity-role");
const portraitShell = document.querySelector("#portrait-shell");
const focusList = document.querySelector("#focus-list");
const proofStrip = document.querySelector("#proof-strip");
const projectGrid = document.querySelector("#project-grid");
const capabilityGrid = document.querySelector("#capability-grid");
const galleryRail = document.querySelector("#gallery-rail");
const contactLinks = document.querySelector("#contact-links");
const dialog = document.querySelector("#case-dialog");
const caseContent = document.querySelector("#case-content");
const caseClose = document.querySelector("#case-close");

function imageMarkup(image, className = "") {
  if (!image) {
    return `<div class="visual-placeholder ${className}" aria-hidden="true">MV</div>`;
  }

  return `<img class="${className}" src="${image.src}" alt="${image.alt}">`;
}

function linkMarkup(item, className = "button secondary") {
  const target = item.type === "email" || item.download ? "" : ` target="_blank" rel="noreferrer"`;
  const download = item.download ? ` download="${item.download}"` : "";
  return `<a class="${className}" href="${item.href}"${target}${download}>${item.label}</a>`;
}

function listMarkup(items) {
  return items.map((item) => `<li>${item}</li>`).join("");
}

function renderPortraitPlaceholder() {
  portraitShell.innerHTML = `
    <div class="portrait-placeholder" aria-label="Portrait placeholder">
      <span>MV</span>
    </div>
  `;
}

function renderHero() {
  heroTitle.textContent = data.personal.headline;
  heroLede.textContent = data.personal.intro;
  identityRole.textContent = data.personal.role;

  if (data.personal.portrait) {
    const portrait = new Image();
    portrait.alt = data.personal.portraitAlt;
    portrait.onload = () => {
      portraitShell.innerHTML = "";
      portraitShell.append(portrait);
    };
    portrait.onerror = renderPortraitPlaceholder;
    portrait.src = data.personal.portrait;
  } else {
    renderPortraitPlaceholder();
  }

  focusList.innerHTML = data.personal.focusAreas
    .map((item) => `<span>${item}</span>`)
    .join("");
}

function renderProof() {
  proofStrip.innerHTML = data.highlights
    .map(
      (item) => `
        <div class="proof-item">
          <strong>${item.value}</strong>
          <span>${item.label}</span>
        </div>
      `
    )
    .join("");
}

function renderProjects() {
  projectGrid.innerHTML = data.projects
    .map((project, index) => {
      const image = project.images[0];
      const number = String(index + 1).padStart(2, "0");

      return `
        <article class="project-card" data-project-id="${project.id}" tabindex="0">
          <div class="project-media">
            ${imageMarkup(image)}
          </div>
          <div class="project-card-body">
            <div class="project-meta">
              <span>${number}</span>
              <span>${project.kicker}</span>
            </div>
            <h3>${project.title}</h3>
            <p class="project-subtitle">${project.subtitle}</p>
            <p>${project.summary}</p>
            <div class="tag-row">
              ${project.tags.map((tag) => `<span>${tag}</span>`).join("")}
            </div>
            <div class="project-actions">
              <button class="card-action" type="button" data-open-project="${project.id}">
                View details
              </button>
              ${
                project.link
                  ? `<a class="card-action external" href="${project.link}" target="_blank" rel="noreferrer">Live site</a>`
                  : ""
              }
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderCapabilities() {
  capabilityGrid.innerHTML = data.capabilities
    .map(
      (item) => `
        <article class="capability-item">
          <h3>${item.title}</h3>
          <p>${item.body}</p>
        </article>
      `
    )
    .join("");
}

function renderGallery() {
  const images = data.projects.flatMap((project) =>
    project.images.map((image) => ({
      ...image,
      projectTitle: project.title,
    }))
  );

  galleryRail.innerHTML = images
    .map(
      (image) => `
        <figure class="gallery-item">
          <img src="${image.src}" alt="${image.alt}">
          <figcaption>
            <span>${image.projectTitle}</span>
            ${image.caption}
          </figcaption>
        </figure>
      `
    )
    .join("");
}

function renderContact() {
  contactLinks.innerHTML = data.contact
    .filter((item) => item.href)
    .map((item) => linkMarkup(item, "button secondary light"))
    .join("");
}

function renderCaseStudy(project) {
  const primaryImage = project.images[0];
  const secondaryImages = project.images.slice(1);

  caseContent.innerHTML = `
    <article class="case-study">
      <header class="case-header">
        <div class="case-title-block">
          <p class="eyebrow">${project.kicker}</p>
          <h2 id="case-title">${project.title}</h2>
          <p class="case-subtitle">${project.summary}</p>
          ${
            project.link
              ? `<a class="button primary case-link" href="${project.link}" target="_blank" rel="noreferrer">${project.linkLabel || "Open project"}</a>`
              : ""
          }
        </div>
      </header>

      <figure class="case-feature">
        ${imageMarkup(primaryImage)}
        ${primaryImage ? `<figcaption>${primaryImage.caption}</figcaption>` : ""}
      </figure>

      <section class="case-story">
        <div class="case-story-card">
          <span>Problem</span>
          <p>${project.challenge}</p>
        </div>
        <div class="case-story-card">
          <span>Solution</span>
          <p>${project.approach}</p>
        </div>
        <div class="case-story-card outcome">
          <span>Outcome</span>
          <p>${project.result}</p>
        </div>
      </section>

      ${
        secondaryImages.length
          ? `<section class="case-image-grid" aria-label="${project.title} supporting images">
              ${secondaryImages
                .map(
                  (image) => `
                    <figure>
                      <img src="${image.src}" alt="${image.alt}">
                      <figcaption>${image.caption}</figcaption>
                    </figure>
                  `
                )
                .join("")}
            </section>`
          : ""
      }

      <section class="case-details">
        <div>
          <span>Role</span>
          <p>${project.role}</p>
        </div>
        <div>
          <span>Status</span>
          <p>${project.status}</p>
        </div>
        <div>
          <span>Signals</span>
          <ul>${listMarkup(project.metrics)}</ul>
        </div>
        <div>
          <span>Key Tech</span>
          <ul>${listMarkup(project.tech)}</ul>
        </div>
        <div>
          <span>Applications</span>
          <ul>${listMarkup(project.applications)}</ul>
        </div>
      </section>
    </article>
  `;
}

function openProject(projectId) {
  const project = data.projects.find((item) => item.id === projectId);
  if (!project) return;

  renderCaseStudy(project);
  dialog.showModal();
  document.body.classList.add("modal-open");
}

function closeProject() {
  dialog.close();
  document.body.classList.remove("modal-open");
}

function bindInteractions() {
  projectGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-open-project]");
    const externalLink = event.target.closest("a");
    if (externalLink && !button) return;
    const card = event.target.closest("[data-project-id]");
    const projectId = button?.dataset.openProject || card?.dataset.projectId;
    if (projectId) openProject(projectId);
  });

  projectGrid.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    const card = event.target.closest("[data-project-id]");
    if (card) openProject(card.dataset.projectId);
  });

  caseClose.addEventListener("click", closeProject);

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeProject();
  });

  dialog.addEventListener("close", () => {
    document.body.classList.remove("modal-open");
  });
}

renderHero();
renderProof();
renderProjects();
renderCapabilities();
renderGallery();
renderContact();
bindInteractions();
