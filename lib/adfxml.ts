// lib/adfXml.ts
// ADF/XML (Auto-lead Data Format) generator for automotive CRM integration
// Supports VIN Solutions, DealerSocket, ELEAD, and other automotive CRMs

export interface ADFLeadData {
  // Customer info
  customerName: string;
  email?: string;
  phone?: string;
  contactPreference: "phone" | "email" | "text";
  
  // Lead context
  verdict: "buy" | "lease";
  vehiclePrice: number;
  monthlyPayment: number;
  downPayment?: number;
  financeTerm?: number;
  
  // Optional vehicle info
  vehicleYear?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleVin?: string;
  vehicleStock?: string;
  
  // Additional context
  notes?: string;
  leadSource: string;
  dealerId: string;
  dealerName: string;
  
  // Metadata
  submittedAt: string;
}

export interface ADFProviderInfo {
  name: string;
  service: string;
  url?: string;
  email?: string;
  phone?: string;
}

/**
 * Escapes special XML characters
 */
function escapeXml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Parses a full name into first and last name
 */
function parseName(fullName: string): { first: string; last: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { first: parts[0], last: "" };
  }
  const first = parts[0];
  const last = parts.slice(1).join(" ");
  return { first, last };
}

/**
 * Formats a phone number for ADF XML
 */
function formatPhone(phone: string): string {
  // Remove all non-numeric characters
  const digits = phone.replace(/\D/g, "");
  
  // Format as (XXX) XXX-XXXX if 10 digits
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  
  // Return as-is if different length
  return phone;
}

/**
 * Generates ADF 1.0 XML for automotive CRM integration
 * Compatible with VIN Solutions, DealerSocket, ELEAD, and other CRMs
 */
export function generateADFXml(
  lead: ADFLeadData,
  provider: ADFProviderInfo
): string {
  const { first, last } = parseName(lead.customerName);
  const timestamp = new Date(lead.submittedAt).toISOString();
  const requestDate = timestamp.split("T")[0];
  
  // Build interest type and comments based on verdict
  const interestType = lead.verdict === "buy" ? "buy" : "lease";
  const interestDescription = lead.verdict === "buy" 
    ? "Customer interested in purchasing/financing" 
    : "Customer interested in exploring lease options";
  
  // Build comprehensive comments
  const comments = [
    `DriveDecision Analysis Results:`,
    `- Recommendation: ${lead.verdict === "buy" ? "FINANCE/BUY" : "EXPLORE LEASE"}`,
    `- Vehicle Price: $${lead.vehiclePrice.toLocaleString()}`,
    `- Estimated Monthly Payment: $${lead.monthlyPayment.toLocaleString()}`,
    lead.downPayment ? `- Down Payment: $${lead.downPayment.toLocaleString()}` : null,
    lead.financeTerm ? `- Finance Term: ${lead.financeTerm} months` : null,
    `- Contact Preference: ${lead.contactPreference}`,
    lead.notes ? `\nCustomer Notes: ${lead.notes}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  // Build vehicle section if vehicle info is provided
  const vehicleSection = (lead.vehicleYear || lead.vehicleMake || lead.vehicleModel) 
    ? `
      <vehicle interest="${interestType}" status="new">
        ${lead.vehicleYear ? `<year>${escapeXml(lead.vehicleYear)}</year>` : ""}
        ${lead.vehicleMake ? `<make>${escapeXml(lead.vehicleMake)}</make>` : ""}
        ${lead.vehicleModel ? `<model>${escapeXml(lead.vehicleModel)}</model>` : ""}
        ${lead.vehicleVin ? `<vin>${escapeXml(lead.vehicleVin)}</vin>` : ""}
        ${lead.vehicleStock ? `<stock>${escapeXml(lead.vehicleStock)}</stock>` : ""}
        <price type="quote" currency="USD">${lead.vehiclePrice}</price>
        <finance>
          <method>${interestType}</method>
          ${lead.downPayment ? `<amount type="downpayment" currency="USD">${lead.downPayment}</amount>` : ""}
        </finance>
      </vehicle>`
    : `
      <vehicle interest="${interestType}" status="new">
        <price type="quote" currency="USD">${lead.vehiclePrice}</price>
        <finance>
          <method>${interestType}</method>
          ${lead.downPayment ? `<amount type="downpayment" currency="USD">${lead.downPayment}</amount>` : ""}
        </finance>
      </vehicle>`;

  // Build phone contact section
  const phoneSection = lead.phone
    ? `<phone type="voice" time="day">${escapeXml(formatPhone(lead.phone))}</phone>`
    : "";

  // Build email contact section
  const emailSection = lead.email
    ? `<email>${escapeXml(lead.email)}</email>`
    : "";

  // Determine preferred contact
  const preferredContact = lead.contactPreference === "phone" || lead.contactPreference === "text"
    ? "phone"
    : "email";

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?ADF version="1.0"?>
<adf>
  <prospect status="new">
    <id sequence="1" source="${escapeXml(provider.name)}">${Date.now()}</id>
    <requestdate>${timestamp}</requestdate>
    ${vehicleSection}
    <customer>
      <contact primarycontact="1">
        <name part="first">${escapeXml(first)}</name>
        <name part="last">${escapeXml(last)}</name>
        <name part="full">${escapeXml(lead.customerName)}</name>
        ${emailSection}
        ${phoneSection}
        <contact preferredcontact="${preferredContact}" />
      </contact>
      <comments>${escapeXml(comments)}</comments>
    </customer>
    <vendor>
      <id sequence="1" source="${escapeXml(provider.name)}">${escapeXml(lead.dealerId)}</id>
      <vendorname>${escapeXml(lead.dealerName)}</vendorname>
    </vendor>
    <provider>
      <id sequence="1" source="${escapeXml(provider.name)}">${escapeXml(provider.name)}</id>
      <name part="full">${escapeXml(provider.name)}</name>
      <service>${escapeXml(provider.service)}</service>
      ${provider.url ? `<url>${escapeXml(provider.url)}</url>` : ""}
      ${provider.email ? `<email>${escapeXml(provider.email)}</email>` : ""}
      ${provider.phone ? `<phone>${escapeXml(provider.phone)}</phone>` : ""}
    </provider>
  </prospect>
</adf>`;

  return xml.trim();
}

/**
 * Validates ADF XML structure (basic validation)
 */
export function validateADFXml(xml: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check for required elements
  if (!xml.includes("<?ADF version")) {
    errors.push("Missing ADF version declaration");
  }
  if (!xml.includes("<adf>")) {
    errors.push("Missing <adf> root element");
  }
  if (!xml.includes("<prospect")) {
    errors.push("Missing <prospect> element");
  }
  if (!xml.includes("<customer>")) {
    errors.push("Missing <customer> element");
  }
  if (!xml.includes("<vendor>")) {
    errors.push("Missing <vendor> element");
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
