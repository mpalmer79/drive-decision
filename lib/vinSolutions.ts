// lib/vinSolutions.ts
// VIN Solutions CRM Integration for Quirk Auto Dealers
// Supports ADF/XML lead submission via email and webhook

import { generateADFXml, validateADFXml, type ADFLeadData, type ADFProviderInfo } from "./adfXml";

// ============================================
// CONFIGURATION TYPES
// ============================================

export interface DealerConfig {
  dealerId: string;
  dealerName: string;
  crmEmail: string; // VIN Solutions CRM import email
  notificationEmails: string[]; // Internal notification emails
  isActive: boolean;
}

export interface VinSolutionsConfig {
  // Provider info for ADF XML
  providerName: string;
  providerService: string;
  providerUrl: string;
  providerEmail: string;
  
  // Email configuration (for Resend, SendGrid, etc.)
  emailApiKey: string;
  emailFromAddress: string;
  emailFromName: string;
  
  // Dealer configurations
  dealers: Record<string, DealerConfig>;
  
  // Default dealer if none specified
  defaultDealerId: string;
  
  // Feature flags
  enableCrmSubmission: boolean;
  enableNotifications: boolean;
  enableLogging: boolean;
}

export interface LeadSubmissionResult {
  success: boolean;
  leadId: string;
  crmSubmitted: boolean;
  notificationSent: boolean;
  errors: string[];
  adfXml?: string;
}

// ============================================
// QUIRK DEALERS CONFIGURATION
// ============================================

// Default configuration - Override with environment variables in production
export const QUIRK_DEALERS: Record<string, DealerConfig> = {
  // Chevrolet Dealerships
  "quirk-chevy-braintree": {
    dealerId: "quirk-chevy-braintree",
    dealerName: "Quirk Chevrolet Braintree",
    crmEmail: process.env.CRM_EMAIL_CHEVY_BRAINTREE || "",
    notificationEmails: ["internet@quirkchevrolet.com"],
    isActive: true,
  },
  "quirk-chevy-manchester": {
    dealerId: "quirk-chevy-manchester",
    dealerName: "Quirk Chevrolet Manchester",
    crmEmail: process.env.CRM_EMAIL_CHEVY_MANCHESTER || "",
    notificationEmails: ["internet@quirkchevrolet.com"],
    isActive: true,
  },
  // Add more dealers as needed...
  
  // Default/Generic entry for pilot
  "quirk-default": {
    dealerId: "quirk-default",
    dealerName: "Quirk Auto Dealers",
    crmEmail: process.env.CRM_EMAIL_DEFAULT || "",
    notificationEmails: [process.env.NOTIFICATION_EMAIL || "leads@quirkautodealers.com"],
    isActive: true,
  },
};

// ============================================
// MAIN INTEGRATION CLASS
// ============================================

export class VinSolutionsIntegration {
  private config: VinSolutionsConfig;

  constructor(config?: Partial<VinSolutionsConfig>) {
    this.config = {
      providerName: "DriveDecision by Quirk AI",
      providerService: "Buy vs Lease Decision Tool",
      providerUrl: process.env.NEXT_PUBLIC_APP_URL || "https://drivedecision.quirkautodealers.com",
      providerEmail: process.env.PROVIDER_EMAIL || "drivedecision@quirkautodealers.com",
      emailApiKey: process.env.EMAIL_API_KEY || "",
      emailFromAddress: process.env.EMAIL_FROM_ADDRESS || "noreply@quirkautodealers.com",
      emailFromName: process.env.EMAIL_FROM_NAME || "DriveDecision",
      dealers: QUIRK_DEALERS,
      defaultDealerId: "quirk-default",
      enableCrmSubmission: process.env.ENABLE_CRM_SUBMISSION === "true",
      enableNotifications: process.env.ENABLE_NOTIFICATIONS !== "false",
      enableLogging: process.env.NODE_ENV !== "production",
      ...config,
    };
  }

  /**
   * Submit a lead to VIN Solutions CRM
   */
  async submitLead(leadData: {
    name: string;
    email: string;
    phone: string;
    contactMethod: "phone" | "email" | "text";
    notes: string;
    verdict: "buy" | "lease";
    vehiclePrice: number;
    monthlyPayment: number;
    downPayment?: number;
    financeTerm?: number;
    dealerId?: string;
    vehicleYear?: string;
    vehicleMake?: string;
    vehicleModel?: string;
    vehicleVin?: string;
    submittedAt: string;
  }): Promise<LeadSubmissionResult> {
    const leadId = `DD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const errors: string[] = [];
    let crmSubmitted = false;
    let notificationSent = false;
    let adfXml = "";

    // Get dealer config
    const dealerId = leadData.dealerId || this.config.defaultDealerId;
    const dealer = this.config.dealers[dealerId] || this.config.dealers[this.config.defaultDealerId];

    if (!dealer) {
      errors.push(`Dealer not found: ${dealerId}`);
      return { success: false, leadId, crmSubmitted, notificationSent, errors };
    }

    // Generate ADF XML
    try {
      const adfLeadData: ADFLeadData = {
        customerName: leadData.name,
        email: leadData.email,
        phone: leadData.phone,
        contactPreference: leadData.contactMethod,
        verdict: leadData.verdict,
        vehiclePrice: leadData.vehiclePrice,
        monthlyPayment: leadData.monthlyPayment,
        downPayment: leadData.downPayment,
        financeTerm: leadData.financeTerm,
        vehicleYear: leadData.vehicleYear,
        vehicleMake: leadData.vehicleMake,
        vehicleModel: leadData.vehicleModel,
        vehicleVin: leadData.vehicleVin,
        notes: leadData.notes,
        leadSource: "DriveDecision",
        dealerId: dealer.dealerId,
        dealerName: dealer.dealerName,
        submittedAt: leadData.submittedAt,
      };

      const providerInfo: ADFProviderInfo = {
        name: this.config.providerName,
        service: this.config.providerService,
        url: this.config.providerUrl,
        email: this.config.providerEmail,
      };

      adfXml = generateADFXml(adfLeadData, providerInfo);

      // Validate ADF XML
      const validation = validateADFXml(adfXml);
      if (!validation.valid) {
        errors.push(...validation.errors);
      }
    } catch (err) {
      errors.push(`ADF generation failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    }

    // Submit to CRM via email
    if (this.config.enableCrmSubmission && dealer.crmEmail && adfXml) {
      try {
        crmSubmitted = await this.sendCrmEmail(dealer.crmEmail, adfXml, leadId, dealer);
        if (!crmSubmitted) {
          errors.push("CRM email submission failed");
        }
      } catch (err) {
        errors.push(`CRM submission error: ${err instanceof Error ? err.message : "Unknown error"}`);
      }
    }

    // Send internal notification
    if (this.config.enableNotifications && dealer.notificationEmails.length > 0) {
      try {
        notificationSent = await this.sendNotificationEmail(
          dealer.notificationEmails,
          leadData,
          leadId,
          dealer
        );
      } catch (err) {
        errors.push(`Notification error: ${err instanceof Error ? err.message : "Unknown error"}`);
      }
    }

    // Log the lead
    if (this.config.enableLogging) {
      this.logLead(leadId, leadData, dealer, { crmSubmitted, notificationSent, errors });
    }

    return {
      success: errors.length === 0 || crmSubmitted || notificationSent,
      leadId,
      crmSubmitted,
      notificationSent,
      errors,
      adfXml: this.config.enableLogging ? adfXml : undefined,
    };
  }

  /**
   * Send ADF XML to VIN Solutions CRM import email
   */
  private async sendCrmEmail(
    crmEmail: string,
    adfXml: string,
    leadId: string,
    dealer: DealerConfig
  ): Promise<boolean> {
    // Use Resend API (recommended for Next.js)
    if (this.config.emailApiKey.startsWith("re_")) {
      return this.sendViaResend(crmEmail, adfXml, leadId, dealer);
    }
    
    // Use SendGrid API
    if (this.config.emailApiKey.startsWith("SG.")) {
      return this.sendViaSendGrid(crmEmail, adfXml, leadId, dealer);
    }

    // Fallback: Log for manual processing
    console.log("=== CRM LEAD (No email provider configured) ===");
    console.log(`Lead ID: ${leadId}`);
    console.log(`CRM Email: ${crmEmail}`);
    console.log(`ADF XML:\n${adfXml}`);
    console.log("===============================================");
    
    return false;
  }

  /**
   * Send email via Resend API
   */
  private async sendViaResend(
    to: string,
    adfXml: string,
    leadId: string,
    dealer: DealerConfig
  ): Promise<boolean> {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.config.emailApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `${this.config.emailFromName} <${this.config.emailFromAddress}>`,
          to: [to],
          subject: `New Lead - DriveDecision - ${leadId}`,
          text: adfXml, // ADF XML in body for CRM parsing
          headers: {
            "X-Lead-ID": leadId,
            "X-Lead-Source": "DriveDecision",
            "X-Dealer-ID": dealer.dealerId,
          },
        }),
      });

      return response.ok;
    } catch (err) {
      console.error("Resend API error:", err);
      return false;
    }
  }

  /**
   * Send email via SendGrid API
   */
  private async sendViaSendGrid(
    to: string,
    adfXml: string,
    leadId: string,
    dealer: DealerConfig
  ): Promise<boolean> {
    try {
      const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.config.emailApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: {
            email: this.config.emailFromAddress,
            name: this.config.emailFromName,
          },
          subject: `New Lead - DriveDecision - ${leadId}`,
          content: [
            {
              type: "text/plain",
              value: adfXml,
            },
          ],
          custom_args: {
            lead_id: leadId,
            dealer_id: dealer.dealerId,
          },
        }),
      });

      return response.ok;
    } catch (err) {
      console.error("SendGrid API error:", err);
      return false;
    }
  }

  /**
   * Send internal notification email to sales team
   */
  private async sendNotificationEmail(
    emails: string[],
    leadData: any,
    leadId: string,
    dealer: DealerConfig
  ): Promise<boolean> {
    const verdictEmoji = leadData.verdict === "buy" ? "🔑" : "✨";
    const verdictText = leadData.verdict === "buy" ? "FINANCE/BUY" : "EXPLORE LEASE";

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981, #14b8a6); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
    .verdict { font-size: 24px; font-weight: bold; margin: 10px 0; }
    .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
    .stat { background: white; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; }
    .stat-label { font-size: 12px; color: #6b7280; text-transform: uppercase; }
    .stat-value { font-size: 20px; font-weight: bold; color: #111827; }
    .contact-info { background: #10b981; color: white; padding: 15px; border-radius: 8px; margin: 20px 0; }
    .footer { font-size: 12px; color: #6b7280; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin:0;">🚗 New DriveDecision Lead</h1>
      <p style="margin:5px 0 0 0;">Lead ID: ${leadId}</p>
    </div>
    <div class="content">
      <div class="verdict">
        ${verdictEmoji} Recommendation: ${verdictText}
      </div>
      
      <div class="contact-info">
        <strong>📞 Contact Now:</strong><br>
        <strong>${leadData.name}</strong><br>
        ${leadData.email ? `📧 ${leadData.email}<br>` : ""}
        ${leadData.phone ? `📱 ${leadData.phone}<br>` : ""}
        Preferred: ${leadData.contactMethod}
      </div>
      
      <div class="stat-grid">
        <div class="stat">
          <div class="stat-label">Vehicle Price</div>
          <div class="stat-value">$${leadData.vehiclePrice.toLocaleString()}</div>
        </div>
        <div class="stat">
          <div class="stat-label">Est. Monthly</div>
          <div class="stat-value">$${leadData.monthlyPayment.toLocaleString()}</div>
        </div>
        <div class="stat">
          <div class="stat-label">Down Payment</div>
          <div class="stat-value">$${(leadData.downPayment || 0).toLocaleString()}</div>
        </div>
        <div class="stat">
          <div class="stat-label">Term</div>
          <div class="stat-value">${leadData.financeTerm || "TBD"} mo</div>
        </div>
      </div>
      
      ${leadData.notes ? `
      <div style="background:#f3f4f6; padding:15px; border-radius:8px; margin:15px 0;">
        <strong>Customer Notes:</strong><br>
        ${leadData.notes}
      </div>
      ` : ""}
      
      <div class="footer">
        <p>This lead was generated by DriveDecision, the AI-powered buy vs lease decision tool.</p>
        <p>Dealer: ${dealer.dealerName} | Source: DriveDecision | Time: ${new Date(leadData.submittedAt).toLocaleString()}</p>
      </div>
    </div>
  </div>
</body>
</html>`;

    const textContent = `
NEW DRIVEDECISION LEAD
======================
Lead ID: ${leadId}
Recommendation: ${verdictText}

CONTACT INFORMATION
-------------------
Name: ${leadData.name}
Email: ${leadData.email || "Not provided"}
Phone: ${leadData.phone || "Not provided"}
Preferred Contact: ${leadData.contactMethod}

DEAL DETAILS
------------
Vehicle Price: $${leadData.vehiclePrice.toLocaleString()}
Est. Monthly: $${leadData.monthlyPayment.toLocaleString()}
Down Payment: $${(leadData.downPayment || 0).toLocaleString()}
Term: ${leadData.financeTerm || "TBD"} months

${leadData.notes ? `NOTES: ${leadData.notes}` : ""}

---
Dealer: ${dealer.dealerName}
Source: DriveDecision
Time: ${new Date(leadData.submittedAt).toLocaleString()}
`;

    // Use Resend API
    if (this.config.emailApiKey.startsWith("re_")) {
      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${this.config.emailApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: `${this.config.emailFromName} <${this.config.emailFromAddress}>`,
            to: emails,
            subject: `🚗 New Lead: ${leadData.name} - ${verdictText} - $${leadData.vehiclePrice.toLocaleString()}`,
            html: htmlContent,
            text: textContent,
          }),
        });
        return response.ok;
      } catch (err) {
        console.error("Notification email error:", err);
        return false;
      }
    }

    // Use SendGrid API
    if (this.config.emailApiKey.startsWith("SG.")) {
      try {
        const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${this.config.emailApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            personalizations: [{ to: emails.map(e => ({ email: e })) }],
            from: {
              email: this.config.emailFromAddress,
              name: this.config.emailFromName,
            },
            subject: `🚗 New Lead: ${leadData.name} - ${verdictText} - $${leadData.vehiclePrice.toLocaleString()}`,
            content: [
              { type: "text/plain", value: textContent },
              { type: "text/html", value: htmlContent },
            ],
          }),
        });
        return response.ok;
      } catch (err) {
        console.error("Notification email error:", err);
        return false;
      }
    }

    // Fallback: Console log
    console.log("=== NOTIFICATION (No email provider) ===");
    console.log(textContent);
    console.log("========================================");
    
    return true; // Return true for logging
  }

  /**
   * Log lead for debugging/analytics
   */
  private logLead(
    leadId: string,
    leadData: any,
    dealer: DealerConfig,
    result: { crmSubmitted: boolean; notificationSent: boolean; errors: string[] }
  ): void {
    console.log("=== DRIVEDECISION LEAD ===");
    console.log(JSON.stringify({
      leadId,
      timestamp: new Date().toISOString(),
      dealer: dealer.dealerName,
      customer: {
        name: leadData.name,
        hasEmail: !!leadData.email,
        hasPhone: !!leadData.phone,
        contactPreference: leadData.contactMethod,
      },
      deal: {
        verdict: leadData.verdict,
        vehiclePrice: leadData.vehiclePrice,
        monthlyPayment: leadData.monthlyPayment,
      },
      result,
    }, null, 2));
    console.log("==========================");
  }
}

// Export singleton instance
export const vinSolutions = new VinSolutionsIntegration();
