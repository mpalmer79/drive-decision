export type ProtectionPackage = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  price: number;
  monthlyEquivalent: number;
  buyBenefit: string;
  leaseBenefit: string;
  recommended: "buy" | "lease" | "both";
  priority: number;
  coverage: string[];
};

export const PROTECTION_PACKAGES: ProtectionPackage[] = [
  {
    id: "extended-service",
    name: "Extended Service Contract",
    shortName: "ESC",
    description: "Extended mechanical protection beyond your factory warranty for long-term peace of mind.",
    price: 2495,
    monthlyEquivalent: 42,
    buyBenefit: "Covers costly repairs after your factory warranty expires.",
    leaseBenefit: "Added protection for mechanical failures during your lease term.",
    recommended: "buy",
    priority: 0,
    coverage: [
      "Engine and transmission coverage",
      "Electrical system repairs",
      "Air conditioning and heating",
      "Roadside assistance included",
      "Transferable to new owner",
    ],
  },
  {
    id: "gap",
    name: "Balance Deficiency Protection",
    shortName: "GAP",
    description: "Covers the difference between what you owe and the vehicle's value if totaled or stolen.",
    price: 795,
    monthlyEquivalent: 13,
    buyBenefit: "Highly recommended if not applying 25% initial investment.",
    leaseBenefit: "Highly recommended if not applying 25% initial investment.",
    recommended: "both",
    priority: 1,
    coverage: [
      "Pays difference if vehicle is totaled",
      "Covers theft situations",
      "Up to $50,000 in coverage",
    ],
  },
  {
    id: "tire-wheel",
    name: "Tire & Wheel Protection",
    shortName: "Tire & Wheel",
    description: "Covers repair or replacement of tires and wheels damaged by road hazards.",
    price: 849,
    monthlyEquivalent: 14,
    buyBenefit: "New England roads are tough — potholes and debris are everywhere.",
    leaseBenefit: "Avoid paying for wheel damage at lease return (often $200-400/wheel).",
    recommended: "both",
    priority: 2,
    coverage: [
      "Pothole damage repair",
      "Curb damage to wheels",
      "Road hazard tire replacement",
      "No deductible",
    ],
  },
  {
    id: "key-replacement",
    name: "Key Replacement",
    shortName: "Key Fob",
    description: "Lost keys can cost up to $400 per occurrence. Stay protected!",
    price: 575,
    monthlyEquivalent: 10,
    buyBenefit: "Lost keys can cost up to $400 per occurrence. Stay protected!",
    leaseBenefit: "Lost keys can cost up to $400 per occurrence. Stay protected!",
    recommended: "both",
    priority: 3,
    coverage: [
      "Lost key replacement",
      "Stolen key replacement",
      "Damaged key fob repair",
      "Programming included",
    ],
  },
  {
    id: "dent-ding",
    name: "Dent & Ding Shield",
    shortName: "Dent Shield",
    description: "Paintless dent repair for door dings and minor dents.",
    price: 399,
    monthlyEquivalent: 7,
    buyBenefit: "Preserves resale value — dings can reduce trade-in by $500+.",
    leaseBenefit: "Avoid excess wear charges at lease return ($50-150 per dent).",
    recommended: "lease",
    priority: 4,
    coverage: [
      "Paintless dent repair",
      "Door dings and minor dents",
      "Unlimited repairs",
      "Mobile service available",
    ],
  },
  {
    id: "windshield",
    name: "Windshield Protection",
    shortName: "Windshield",
    description: "Covers windshield repair and replacement from chips and cracks.",
    price: 349,
    monthlyEquivalent: 6,
    buyBenefit: "One rock chip can spread — repair early or face $500+ replacement.",
    leaseBenefit: "Cracked windshield at lease-end is an automatic charge.",
    recommended: "both",
    priority: 5,
    coverage: [
      "Chip repair",
      "Crack repair",
      "Full replacement if needed",
      "OEM glass",
    ],
  },
  {
    id: "maintenance",
    name: "Prepaid Maintenance",
    shortName: "Maintenance",
    description: "Covers scheduled maintenance like oil changes, tire rotations, and inspections.",
    price: 699,
    monthlyEquivalent: 12,
    buyBenefit: "Lock in today's prices — maintenance costs always go up.",
    leaseBenefit: "Many leases require dealer maintenance records.",
    recommended: "buy",
    priority: 6,
    coverage: [
      "Oil changes",
      "Tire rotations",
      "Multi-point inspections",
      "Fluid top-offs",
    ],
  },
];

export function getRecommendedPackages(
  verdict: "buy" | "lease",
  termMonths: number
): ProtectionPackage[] {
  return PROTECTION_PACKAGES.filter((pkg) => {
    if (pkg.id === "extended-service" && verdict === "lease" && termMonths <= 36) {
      return false;
    }
    if (pkg.id === "maintenance" && termMonths < 24) {
      return false;
    }
    return pkg.recommended === verdict || pkg.recommended === "both";
  }).sort((a, b) => a.priority - b.priority);
}

export function calculatePackageTotal(selectedIds: string[]): number {
  return PROTECTION_PACKAGES.filter((pkg) => selectedIds.includes(pkg.id)).reduce(
    (sum, pkg) => sum + pkg.price,
    0
  );
}

export function calculateMonthlyImpact(selectedIds: string[], termMonths: number): number {
  const total = calculatePackageTotal(selectedIds);
  return total / termMonths;
}
