const data = window.portfolioData;

const projectList = document.querySelector("#project-list");
const galleryGrid = document.querySelector("#gallery-grid");
const contactLinks = document.querySelector("#contact-links");

function createList(title, items) {
  if (!items.length) return "";

  return `
    <div class="detail-list">
      <h4>${title}</h4>
      <ul>
        ${items.map((item) => `<li>${item}</li>`).join("")}
      </ul>
    </div>
  `;
}

function renderProjects() {
  projectList.innerHTML = data.projects
    .map((project, index) => {
      const heroImage = project.images[0];
      const projectNumber = String(index + 1).padStart(2, "0");
      const imageMarkup = heroImage
        ? `<img src="${heroImage.src}" alt="${heroImage.alt}">`
        : `<div class="image-placeholder" aria-hidden="true">${projectNumber}</div>`;

      return `
        <article class="project-card" id="${project.id}">
          <div class="project-visual">
            ${imageMarkup}
          </div>
          <div class="project-content">
            <div class="project-kicker">
              <span>${projectNumber}</span>
              <span>${project.tags.join(" / ")}</span>
            </div>
            <h3>${project.title}</h3>
            <p class="project-subtitle">${project.subtitle}</p>
            <p>${project.summary}</p>

            <div class="project-proof">
              <div>
                <span>Challenge</span>
                <p>${project.challenge}</p>
              </div>
              <div>
                <span>Approach</span>
                <p>${project.approach}</p>
              </div>
              <div>
                <span>Result</span>
                <p>${project.result}</p>
              </div>
            </div>

            <div class="project-details">
              ${createList("Key Tech", project.tech)}
              ${createList("Applications", project.applications)}
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderGallery() {
  const images = data.projects.flatMap((project) =>
    project.images.map((image) => ({
      ...image,
      projectTitle: project.title,
    }))
  );

  galleryGrid.innerHTML = images
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
    .map((item) => `<a class="button secondary" href="${item.href}" target="_blank" rel="noreferrer">${item.label}</a>`)
    .join("");
}

renderProjects();
renderGallery();
renderContact();
