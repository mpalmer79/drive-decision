export type ProtectionPackage = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  price: number;
  monthlyEquivalent: number; // Based on 60-month average
  buyBenefit: string;
  leaseBenefit: string;
  recommended: "buy" | "lease" | "both";
  priority: number; // Lower = more important
  coverage: string[];
};

export const PROTECTION_PACKAGES: ProtectionPackage[] = [
  {
    id: "gap",
    name: "GAP Insurance",
    shortName: "GAP",
    description: "Covers the difference between what you owe and the vehicle's value if totaled or stolen.",
    price: 495,
    monthlyEquivalent: 8,
    buyBenefit: "Protects you if you're upside-down on your loan after an accident.",
    leaseBenefit: "Often required by the lessor — avoid surprises at lease-end.",
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
    price: 599,
    monthlyEquivalent: 10,
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
    description: "Covers replacement of lost, stolen, or damaged key fobs.",
    price: 299,
    monthlyEquivalent: 5,
    buyBenefit: "Modern key fobs cost $300-$600 to replace at the dealer.",
    leaseBenefit: "Lost keys at lease-end can cost $400+ — this covers you.",
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
    id: "interior",
    name: "Interior Protection",
    shortName: "Interior",
    description: "Covers tears, burns, and stains on seats, carpet, and headliner.",
    price: 449,
    monthlyEquivalent: 7,
    buyBenefit: "Keep your interior looking new for higher resale value.",
    leaseBenefit: "Avoid interior wear charges at lease return.",
    recommended: "lease",
    priority: 6,
    coverage: [
      "Seat tears and burns",
      "Carpet stains",
      "Headliner repair",
      "Leather conditioning",
    ],
  },
  {
    id: "extended-warranty",
    name: "Extended Warranty",
    shortName: "Warranty",
    description: "Extends factory powertrain and comprehensive coverage beyond the original term.",
    price: 1299,
    monthlyEquivalent: 22,
    buyBenefit: "Peace of mind for years after factory warranty expires.",
    leaseBenefit: "Usually not needed for short-term leases under factory coverage.",
    recommended: "buy",
    priority: 7,
    coverage: [
      "Powertrain coverage",
      "Electrical systems",
      "A/C and heating",
      "Roadside assistance",
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
    priority: 8,
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
    // Extended warranty not recommended for short leases
    if (pkg.id === "extended-warranty" && verdict === "lease" && termMonths <= 36) {
      return false;
    }
    // Prepaid maintenance less valuable for short terms
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
