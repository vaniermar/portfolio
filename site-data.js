window.portfolioData = {
  personal: {
    name: "Marion Vanier",
    role: "Applied ML & Embedded AI Engineer",
    portrait: "assets/images/marion-portrait.jpg",
    portraitAlt: "Portrait of Marion Vanier",
    headline: "I build applied AI for real-world systems.",
    intro:
      "I work across computer vision, sensing, robotics, embedded inference, and hardware-aware prototypes. My favorite problems start messy: noisy data, physical constraints, real users, and systems that need to work outside a notebook.",
    focusAreas: [
      "Computer vision systems",
      "Embedded AI deployments",
      "Synthetic data pipelines",
      "Robotics and sensing prototypes",
    ],
  },
  contact: [
    {
      label: "Email",
      href: "mailto:vaniermar@gmail.com",
      type: "email",
    },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/marion.vanier/",
    },
    {
      label: "GitHub",
      href: "https://github.com/vaniermar",
    },
    {
      label: "Resume",
      href: "assets/Marion_Vanier_Resume.pdf",
      download: "Marion_Vanier_Resume.pdf",
    },
  ],
  highlights: [
    {
      value: "100+",
      label: "cards scanned in prototype testing",
    },
    {
      value: "PSA 10",
      label: "one scanned card later graded perfect",
    },
    {
      value: "A100s",
      label: "distributed CUDA training for tomography",
    },
    {
      value: "8 -> 128",
      label: "NDT channel prototype with scaling path",
    },
  ],
  capabilities: [
    {
      title: "Model development",
      body:
        "Raw data, training loops, evaluation, and a prototype that real users can test.",
    },
    {
      title: "Embedded deployment",
      body:
        "Inference cost, sensors, latency, control systems, and physical setup are part of the design from day one.",
    },
    {
      title: "System validation",
      body:
        "Screenshots, metrics, diagrams, and system decisions make the work easier to evaluate quickly.",
    },
  ],
  projects: [
    {
      id: "should-i-slab-this",
      title: "Should I Slab This",
      kicker: "Collector tool / Edge CV",
      subtitle: "Instantly identify, value, and track cards in your collection.",
      tags: ["Computer Vision", "Card ID", "Condition Assessment", "Edge AI"],
      link: "https://shouldislabthis.com",
      linkLabel: "Visit Should I Slab This",
      role: "End-to-end prototype: model workflow, image processing, app logic, and embedded inference path.",
      status: "Functional prototype",
      timeframe: "2026",
      summary:
        "A computer vision app for collectors: take one photo, identify the card, estimate value, and inspect condition signals.",
      challenge:
        "TCG card collectors need to quickly assess a card they just pulled, bought, or are about to sell. Most downstream mechanisms are grading, marketplaces, or auction houses, with nothing directly in the hand of the collector.",
      approach:
        "Developed a software system that identifies, values, and assesses card condition from one image, combining segmentation, feature matching, centering analysis, and an embedded inference workflow.",
      result:
        "Created a functional prototype with 6 users and over 100 cards scanned successfully, including one card that was later graded a PSA 10.",
      metrics: ["6 users", "100+ scans", "PSA 10 validation signal", "No server-cost inference path"],
      tech: [
        "Segmentation model: Used a custom pretrained RF-DETR model to segment cards from noisy backgrounds.",
        "Feature matching model: Compared cards to digital copies for sub-pixel level centering.",
        "Jetson Orin Nano Super: Built an embedded workflow on NVIDIA Jetson Orin Nano Super to keep inference efficient with no server costs.",
        "OpenCV: Used edge detection for the initial cross-correlation implementation of card boundary detection.",
      ],
      applications: [
        "Auction house prescreening for authentic cards",
        "Instant card ID and lookup",
        "Vendor-based condition assessment",
        "Decentralized grading ecosystem",
      ],
      images: [
        {
          src: "assets/images/should-i-slab-overview.jpg",
          alt: "Should I Slab This card recognition interface",
          caption: "Card recognition workflow",
        },
        {
          src: "assets/images/should-i-slab-passport.png",
          alt: "Card passport with condition scoring",
          caption: "Card passport with condition",
        },
        {
          src: "assets/images/should-i-slab-condition-a.jpg",
          alt: "Card condition and passport detail screen",
          caption: "Condition assessment",
        },
        {
          src: "assets/images/should-i-slab-condition-b.jpg",
          alt: "Card segmentation and card ID result",
          caption: "Card segmentation and ID",
        },
      ],
    },
    {
      id: "tomography",
      title: "Tomography",
      kicker: "Sparse imaging / ML research",
      subtitle: "Enhancing the unseen.",
      tags: ["PyTorch", "CUDA", "Synthetic Data", "Attention U-Net"],
      role: "Model architecture, synthetic data generation, training, and evaluation.",
      status: "Research prototype",
      timeframe: "Grant support work",
      summary: "Enhancement of sparse tomographic images for clearer flaw and weld detection.",
      challenge:
        "Tomography is extremely sparse, noisy, and difficult to view with the human eye.",
      approach:
        "Developed a multi-head ML model trained on synthetic data inspired by real-world data, using curriculum training to move from obvious flaws to tiny sparse defects.",
      result:
        "Created a model that generalizes well to real-world data without seeing any during training, identifies critical flaws and weld seams, and returned strong outputs that were key to securing grant funding.",
      metrics: ["Synthetic-to-real transfer", "Critical flaw ID", "Weld seam detection", "Multi-GPU training"],
      tech: [
        "Multi-head attention U-Net: Built for fast runtime while accurately identifying critical flaws and welds.",
        "Synthetic data: Used curriculum training from large obvious flaws to sparse tiny flaws such as pitting and fretting.",
        "PyTorch & CUDA: Coded models from scratch in PyTorch and used distributed training over multiple NVIDIA A100s.",
      ],
      applications: [
        "Improving reconstruction of tomography in healthcare",
        "Improved flaw detection for NDT-based applications",
      ],
      images: [
        {
          src: "assets/images/tomography-architecture.png",
          alt: "Tomography model architecture diagram",
          caption: "Model architecture",
        },
        {
          src: "assets/images/tomography-real-sample.png",
          alt: "Sample plate data from real-world tomography",
          caption: "Sample plate data from the real world",
        },
        {
          src: "assets/images/tomography-synthetic.png",
          alt: "Synthetic tomography sample showing flaw and weld seam",
          caption: "Synthetic data example with flaw and weld seam",
        },
      ],
    },
    {
      id: "multiplexer",
      title: "Multiplexer",
      kicker: "Hardware / NDT control",
      subtitle: "NDT high-voltage remote trigger source generation.",
      tags: ["NDT", "KiCad", "C#", "Raspberry Pi", "Hardware Prototype"],
      role: "Circuit design, rapid prototyping, software compatibility, and remote trigger workflow.",
      status: "Functional hardware prototype",
      timeframe: "Internal NDT system",
      summary:
        "A high-voltage NDT multiplexer with built-in remote triggering for repeatable source generation.",
      challenge:
        "Source generation for NDT signals requires high voltage and precise control, but off-the-shelf solutions are expensive and not compatible with existing systems.",
      approach:
        "Developed a high-voltage NDT multiplexer with a built-in remote trigger that is compatible with the existing software system and wireless Raspberry Pi communication.",
      result:
        "Built a functional prototype that successfully controls up to 8 channels, improving repeatability with a design path toward 128 sensor control.",
      metrics: ["8 controlled channels", "128-channel scaling path", "Wireless trigger control", "Lower-cost prototype"],
      tech: [
        "KiCad: Developed and tested the circuit using KiCad.",
        "Rapid prototyping: Used perfboard to hand-solder and connect the circuit to an existing single-channel setup.",
        "C#: Designed compatibility with internal C# software and communication with a Raspberry Pi over a wireless connection.",
      ],
      applications: [
        "Repeatable NDT source generation",
        "Remote trigger control",
        "Multi-sensor testing workflows",
      ],
      images: [
        {
          src: "assets/images/multiplexer-setup.jpg",
          alt: "Multiplexer setup during real-world use",
          caption: "Setup during real-world usage",
        },
        {
          src: "assets/images/multiplexer-schematic.png",
          alt: "KiCad schematic for high-voltage multiplexer",
          caption: "KiCad schematic, with full schematic proprietary",
        },
        {
          src: "assets/images/multiplexer-control-app.png",
          alt: "Remote trigger control demo application",
          caption: "Remote trigger control demo app",
        },
      ],
    },
    {
      id: "tracker-drone",
      title: "Tracker Drone",
      kicker: "Robotics / Indoor autonomy",
      subtitle: "Small indoor drone system.",
      tags: ["Robotics", "Indoor Flight", "Computer Vision", "Optical Flow"],
      role: "Small-scale autonomous platform design, tracking logic, and sensing stack.",
      status: "Functional prototype",
      timeframe: "Prototype build",
      summary:
        "An indoor drone prototype focused on stability, safety, and autonomous tracking in small spaces where GPS is unavailable.",
      challenge:
        "Designing a small-scale drone capable of controlled indoor flight and tracking.",
      approach:
        "Developed a compact drone platform with optical flow sensors and a lightweight camera for indoor navigation, plus a custom tracking algorithm to follow subjects.",
      result:
        "Created a functional prototype that can autonomously hover and track a target within a confined indoor space.",
      metrics: ["Indoor hover", "Target tracking", "GPS-free navigation", "Safety-first frame"],
      tech: [
        "LiDAR & optical flow: Used downward-facing sensors to detect ground and maintain position and height.",
        "Computer vision: Used onboard processing to identify and follow targets.",
        "Safety: Used propeller guards and a lightweight design to help prevent damage or injury indoors.",
      ],
      applications: [
        "Indoor security and autonomous patrol",
        "Inventory management for scanning barcodes or tags in warehouses",
        "Personal assistant use cases, such as following the user to capture video or carry small items",
      ],
      images: [],
    },
  ],
};
