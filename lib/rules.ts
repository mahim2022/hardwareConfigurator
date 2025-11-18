export type RequirementsPayload = {
  usageType:
    | "office"
    | "web"
    | "editing"
    | "rendering"
    | "coding"
    | "data analysis"
    | "gaming"
    | "server"
    | "mixed";
  budgetRange: string;
  quantity: "1" | "5-20" | "20-50" | "50-200" | "200+";
  formFactor: "laptop" | "desktop" | "SFF" | "workstation" | "ultrabook" | "server";
  requiredSoftware: string[];
  brandConstraints: string;
  performancePriority: "cpu" | "gpu" | "ram" | "balanced";
  storageRequirements?: string;
  networkingNeeds?: string;
  durabilityNeeds?: string;
  warrantyPreferences?: string;
  powerPreferences?: string;
  complianceNotes?: string;
};

export type BaselineSpec = {
  cpu: string;
  gpu: string;
  ram: string;
  storage: string;
  networking: string;
  display?: string;
  accessories?: string[];
  recommendedVendors: string[];
  estimatedUnitPrice: string;
  notes: string[];
};

type UsagePreset = {
  cpu: string;
  gpu: string;
  ram: string;
  storage: string;
  networking: string;
  display?: string;
};

const USAGE_PRESETS: Record<RequirementsPayload["usageType"], UsagePreset> = {
  office: {
    cpu: "Intel Core i5 14500T / AMD Ryzen 5 Pro 8650HS",
    gpu: "Integrated Intel UHD 770 / Radeon 780M",
    ram: "16 GB DDR5",
    storage: "512 GB NVMe PCIe Gen4 SSD",
    networking: "Dual-band Wi-Fi 6E, 1x RJ45 2.5GbE",
    display: "14-15.6\" FHD IPS, low blue-light",
  },
  web: {
    cpu: "Intel Core i5 13500H / Ryzen 5 7640U",
    gpu: "Integrated Intel Iris Xe",
    ram: "16 GB DDR5",
    storage: "512 GB NVMe SSD",
    networking: "Wi-Fi 6E, 1x RJ45",
    display: "13-15\" FHD IPS",
  },
  editing: {
    cpu: "Intel Core i7 14700K / Ryzen 9 7900",
    gpu: "NVIDIA RTX 4060 / RTX A2000",
    ram: "32 GB DDR5",
    storage: "1 TB NVMe + 2 TB SATA SSD",
    networking: "Wi-Fi 7, Dual 2.5GbE",
    display: "27\" QHD wide-gamut (external)",
  },
  rendering: {
    cpu: "AMD Threadripper Pro 7965WX / Intel Xeon W-2400",
    gpu: "NVIDIA RTX 5000 Ada / RTX 4500",
    ram: "64 GB DDR5 ECC",
    storage: "2 TB NVMe Gen4 + 4 TB NVMe scratch",
    networking: "Dual 10GbE, Wi-Fi 7",
    display: "Dual 27\" 4K HDR",
  },
  coding: {
    cpu: "Intel Core Ultra 7 165H / Ryzen 7 Pro 8845HS",
    gpu: "Integrated Intel Arc / Radeon 780M",
    ram: "32 GB LPDDR5x",
    storage: "1 TB NVMe SSD",
    networking: "Wi-Fi 7, 1x RJ45 (dock)",
    display: "14-16\" 2.5K 120Hz",
  },
  "data analysis": {
    cpu: "Intel Xeon Gold 5515+ / AMD EPYC 8324P",
    gpu: "NVIDIA L40S / Tesla T4 (depends on budget)",
    ram: "64 GB DDR5 ECC",
    storage: "2 TB NVMe + 4 TB NVMe scratch + 8 TB HDD",
    networking: "Dual 10GbE, optional Fibre Channel",
    display: "Rack/remote console",
  },
  gaming: {
    cpu: "Intel Core i7 14700KF / Ryzen 7 7800X3D",
    gpu: "NVIDIA RTX 4070 Super / Radeon RX 7900 GRE",
    ram: "32 GB DDR5 6000MHz",
    storage: "1 TB NVMe + 2 TB NVMe",
    networking: "Wi-Fi 7, 2.5GbE",
    display: "27\" 1440p 165Hz",
  },
  server: {
    cpu: "Dual Intel Xeon Silver 4514Y+ / Dual AMD EPYC 9334",
    gpu: "Optional NVIDIA L4 (virtualization)",
    ram: "128 GB DDR5 ECC (expandable)",
    storage: "4x 1.92 TB NVMe U.2 + 8x 4 TB SAS",
    networking: "4x 10GbE SFP+ + OCP 3.0 slot",
    display: "Remote (iDRAC/ILO)",
  },
  mixed: {
    cpu: "Intel Core i7 14700 / Ryzen 9 7900",
    gpu: "NVIDIA RTX 4060 Ti",
    ram: "32 GB DDR5",
    storage: "1 TB NVMe + 2 TB SATA SSD",
    networking: "Wi-Fi 6E, 2.5GbE",
    display: "24\" QHD IPS",
  },
};

const PERFORMANCE_NOTES: Record<RequirementsPayload["performancePriority"], string> = {
  cpu: "Prioritize higher-core-count CPUs and sustained boost clocks.",
  gpu: "Allocate more budget toward discrete GPUs with ample VRAM.",
  ram: "Ensure higher capacity (>=32 GB) and faster DDR5 modules.",
  balanced: "Distribute budget across CPU, GPU, and memory for all-rounder builds.",
};

const QUANTITY_NOTES: Record<RequirementsPayload["quantity"], string> = {
  "1": "Single-unit procurement—focus on best possible fit.",
  "5-20": "Small batch—standard warranty uplift and imaging support.",
  "20-50": "Department rollout—consider vendor-managed inventory.",
  "50-200": "Campus/site refresh—negotiate volume discounts and staging.",
  "200+": "Enterprise-wide deployment—engage OEM bid teams and logistic SLAs.",
};

export const deriveBaselineSpec = (
  requirements: RequirementsPayload
): BaselineSpec => {
  const preset = USAGE_PRESETS[requirements.usageType];

  const accessories: string[] = [];
  if (requirements.formFactor === "laptop" || requirements.formFactor === "ultrabook") {
    accessories.push("USB-C dock with RJ45 + DP/HDMI");
  }
  if (requirements.quantity !== "1") {
    accessories.push("Imaging + asset tagging kit");
  }

  if (requirements.networkingNeeds) {
    accessories.push(`Networking add-ons: ${requirements.networkingNeeds}`);
  }

  const estimatedUnitPrice = (() => {
    switch (requirements.usageType) {
      case "office":
      case "web":
        return "$800 - $1,100";
      case "coding":
      case "mixed":
        return "$1,300 - $1,700";
      case "editing":
      case "gaming":
        return "$1,800 - $2,400";
      case "rendering":
      case "data analysis":
        return "$4,000 - $6,500";
      case "server":
        return "$6,000+";
      default:
        return "Request quote";
    }
  })();

  const notes = [
    PERFORMANCE_NOTES[requirements.performancePriority],
    QUANTITY_NOTES[requirements.quantity],
  ];

  if (requirements.durabilityNeeds) {
    notes.push(`Durability: ${requirements.durabilityNeeds}`);
  }
  if (requirements.warrantyPreferences) {
    notes.push(`Warranty: ${requirements.warrantyPreferences}`);
  }
  if (requirements.powerPreferences) {
    notes.push(`Power targets: ${requirements.powerPreferences}`);
  }
  if (requirements.complianceNotes) {
    notes.push(`Compliance: ${requirements.complianceNotes}`);
  }

  return {
    ...preset,
    storage: requirements.storageRequirements || preset.storage,
    networking: requirements.networkingNeeds || preset.networking,
    accessories,
    recommendedVendors:
      requirements.brandConstraints.trim().length > 0
        ? requirements.brandConstraints.split(",").map((item) => item.trim())
        : ["Dell", "HP", "Lenovo"],
    estimatedUnitPrice,
    notes,
  };
};

