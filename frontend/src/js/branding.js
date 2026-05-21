async function generateBrandIdentity() {

  const logoContainer = document.getElementById("logoContainer");
  const brandKit = document.getElementById("brandKit");

  const idea =
    document.getElementById("startupIdea")?.value ||
    "AI Startup";

  const industry =
    document.getElementById("industry")?.value ||
    "Technology";

  const vibe =
    document.getElementById("brandVibe")?.value ||
    "Modern";

  const color =
    document.getElementById("primaryColor")?.value ||
    "#7c3aed";

  const startupName = idea
    .split(" ")
    .slice(0, 2)
    .join("")
    .replace(/[^a-zA-Z]/g, "");

  const initials = startupName.substring(0, 2).toUpperCase();

  const randomShape = Math.floor(Math.random() * 3);

  let shapeSVG = "";

  if (randomShape === 0) {
    shapeSVG = `
    <circle cx="100" cy="100" r="60"
    fill="${color}" opacity="0.8"/>
    `;
  }

  if (randomShape === 1) {
    shapeSVG = `
    <rect x="40" y="40"
    width="120"
    height="120"
    rx="30"
    fill="${color}" opacity="0.8"/>
    `;
  }

  if (randomShape === 2) {
    shapeSVG = `
    <polygon points="100,20 180,180 20,180"
    fill="${color}" opacity="0.8"/>
    `;
  }

  const svgLogo = `
  <svg width="220" height="220"
  viewBox="0 0 200 200"
  xmlns="http://www.w3.org/2000/svg">

    <defs>
      <filter id="glow">
        <feGaussianBlur stdDeviation="6"
        result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>

    ${shapeSVG}

    <text
      x="100"
      y="115"
      text-anchor="middle"
      font-size="42"
      fill="white"
      font-family="Arial"
      font-weight="bold"
      filter="url(#glow)">
      ${initials}
    </text>

  </svg>
  `;

  logoContainer.innerHTML = svgLogo;

  brandKit.innerHTML = `
    <h3>${startupName}</h3>
    <p><strong>Industry:</strong> ${industry}</p>
    <p><strong>Brand Style:</strong> ${vibe}</p>
    <p><strong>Primary Color:</strong> ${color}</p>
    <p><strong>Tagline:</strong>
    Innovating the future with AI.</p>
  `;

  localStorage.setItem(
    "latestBrand",
    JSON.stringify({
      startupName,
      industry,
      vibe,
      color,
      svgLogo
    })
  );
}

window.generateBrandIdentity = generateBrandIdentity;

function downloadLogo() {

  const svg =
    document.getElementById("logoContainer").innerHTML;

  const blob = new Blob(
    [svg],
    { type: "image/svg+xml" }
  );

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");

  a.href = url;
  a.download = "startup-logo.svg";

  a.click();

  URL.revokeObjectURL(url);
}

window.downloadLogo = downloadLogo;
