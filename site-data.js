window.portfolioData = {
  contact: [
    {
      label: "GitHub",
      href: "https://github.com/vaniermar",
    },
    {
      label: "LinkedIn",
      href: "",
    },
    {
      label: "Email",
      href: "",
    },
  ],
  projects: [
    {
      id: "should-i-slab-this",
      title: "Should I Slab This",
      subtitle: "Instantly identify, value, and track cards in your collection.",
      tags: ["Computer Vision", "Card ID", "Condition Assessment", "Edge AI"],
      summary:
        "Should I Slab This is an app that helps collectors know what is in their binder by instantly identifying, valuing, and assessing the condition of their cards from a single photo.",
      challenge:
        "TCG card collectors need to quickly assess a card they just pulled, bought, or are about to sell. Most downstream mechanisms are grading, marketplaces, or auction houses, with nothing directly in the hand of the collector.",
      approach:
        "Developed a software system that identifies, values, and assesses card condition from a single photo.",
      result:
        "Created a functional prototype with 6 users and over 100 cards scanned successfully, including one card that was later graded a PSA 10.",
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
      subtitle: "Enhancing the unseen.",
      tags: ["PyTorch", "CUDA", "Synthetic Data", "Attention U-Net"],
      summary: "Enhancement of sparse tomographic images for clearer flaw and weld detection.",
      challenge:
        "Tomography is extremely sparse, noisy, and difficult to view with the human eye.",
      approach:
        "Developed a multi-head ML model trained on synthetic data inspired by real-world data.",
      result:
        "Created a model that generalizes well to real-world data without seeing any during training, identifies critical flaws and weld seams, and returned strong outputs that were key to securing grant funding.",
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
      subtitle: "NDT high-voltage remote trigger source generation.",
      tags: ["NDT", "KiCad", "C#", "Raspberry Pi", "Hardware Prototype"],
      summary:
        "A high-voltage NDT multiplexer with a built-in remote trigger, designed to work with an existing software system.",
      challenge:
        "Source generation for NDT signals requires high voltage and precise control, but off-the-shelf solutions are expensive and not compatible with existing systems.",
      approach:
        "Developed a high-voltage NDT multiplexer with a built-in remote trigger that is compatible with the software system.",
      result:
        "Built a functional prototype that successfully controls up to 8 channels, improving repeatability with a design path toward 128 sensor control.",
      tech: [
        "KiCad: Developed and tested the circuit using KiCad.",
        "Rapid prototyping: Used perfboard to hand-solder and connect the circuit to an existing single-channel setup.",
        "C#: Designed compatibility with internal C# software and communication with a Raspberry Pi over a wireless connection.",
      ],
      applications: [],
      images: [
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
        {
          src: "assets/images/multiplexer-setup.jpg",
          alt: "Multiplexer setup during real-world use",
          caption: "Setup during real-world usage",
        },
      ],
    },
    {
      id: "tracker-drone",
      title: "Tracker Drone",
      subtitle: "Small indoor drone system.",
      tags: ["Robotics", "Indoor Flight", "Computer Vision", "Optical Flow"],
      summary:
        "An indoor drone prototype focused on stability, safety, and autonomous tracking in small spaces where GPS is unavailable.",
      challenge:
        "Designing a small-scale drone capable of controlled indoor flight and tracking.",
      approach:
        "Developed a compact drone platform with optical flow sensors and a lightweight camera for indoor navigation, plus a custom tracking algorithm to follow subjects.",
      result:
        "Created a functional prototype that can autonomously hover and track a target within a confined indoor space.",
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
