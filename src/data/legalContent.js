// ============================================================================
// LEGAL PAGE CONTENT
// ----------------------------------------------------------------------------
// Written to match what this funnel actually does (the fields it collects,
// the OTP/consent flow, the CRM + Meta CAPI integrations documented in
// ARCHITECTURE.md and server/README.md). This is not a substitute for
// periodic review by a licensed attorney and your compliance team as the
// funnel, states served, or integrations change.
// ============================================================================

export const CONTACT_EMAIL = 'info@veritassolutions.io';

// Used for the "Speak With an Agent" CTAs on the results page. Kept as a
// single tel: value + a matching display string so the two never drift.
export const AGENT_PHONE_TEL = 'tel:+13024055243';
export const AGENT_PHONE_DISPLAY = '(302) 405-5243';

export const PRIVACY_POLICY = {
  title: 'Privacy Policy',
  effectiveDate: 'September 14, 2026',
  intro:
    'This Privacy Policy explains how Atlas Health, a Veritas company (“Atlas Health,” ' +
    '“we,” “us”) collects, uses, and shares information when you use this website and ' +
    'coverage-assessment tool (the “Service”).',
  sections: [
    {
      heading: 'Information We Collect',
      body: [
        'Information you provide: your name, email address, phone number, date of birth, ZIP ' +
          'code, household composition, current coverage status, budget and coverage-timing ' +
          'preferences, and general health-related answers (e.g., typical healthcare usage, ' +
          'whether anyone in your household takes regular medication) that you enter into the ' +
          'coverage-assessment questions.',
        'Verification data: when you enter a phone number, we send a one-time passcode (OTP) to ' +
          'confirm it belongs to you before your submission is treated as a qualified lead.',
        'Automatically collected data: IP address, device and browser type, pages viewed, and ' +
          'referral/attribution data (such as which ad or link brought you here), collected via ' +
          'cookies and similar technologies.',
      ],
    },
    {
      heading: 'How We Use Information',
      body: [
        'To match you with licensed insurance agents and present coverage options that may fit ' +
          'your household, budget, and timing.',
        'To contact you by call, text (SMS/MMS), and email about health insurance options, as ' +
          'described in the consent language you agreed to before submitting the form.',
        'To operate, secure, and improve the Service, and to measure and optimize our advertising ' +
          '(including sharing limited, hashed or pseudonymous conversion data with ad platforms ' +
          'such as Meta via their Conversions API).',
        'To comply with legal, regulatory, and insurance-licensing obligations.',
      ],
    },
    {
      heading: 'How We Share Information',
      body: [
        'Licensed insurance agents and carriers who may contact you about coverage that matches ' +
          'your answers.',
        'Service providers who support our operations, including our customer-relationship-' +
          'management (CRM) platform, SMS/verification provider, and hosting providers.',
        'Advertising partners, in de-identified or hashed form where required, to measure ad ' +
          'performance and improve targeting.',
        'Regulators, law enforcement, or other parties when required by law, or to protect the ' +
          'rights, safety, or property of Atlas Health or others.',
        'We do not sell your health-related quiz answers to unrelated third parties for their own ' +
          'independent marketing purposes.',
      ],
    },
    {
      heading: 'Your Choices',
      body: [
        'Text messages: reply STOP to any text to opt out, or HELP for help. You may still receive ' +
          'a final confirmation message after opting out.',
        'Calls: you can ask any agent who contacts you to add you to our internal do-not-call list.',
        'Access, correction, or deletion: depending on your state of residence, you may have the ' +
          'right to request access to, correction of, or deletion of your personal information. ' +
          `Submit requests to ${CONTACT_EMAIL}.`,
        'Cookies: most browsers let you block or delete cookies; doing so may affect how the ' +
          'Service functions.',
      ],
    },
    {
      heading: 'Data Retention & Security',
      body:
        'We retain personal information for as long as needed to fulfill the purposes described ' +
        'here, satisfy legal or regulatory retention requirements, and resolve disputes. We use ' +
        'reasonable administrative, technical, and physical safeguards designed to protect your ' +
        'information, but no method of transmission or storage is 100% secure.',
    },
    {
      heading: "Children's Privacy",
      body:
        'The Service is intended for individuals age 18 and older and is not directed to children. ' +
        'We do not knowingly collect personal information from anyone under 18.',
    },
    {
      heading: 'Changes to This Policy',
      body:
        'We may update this Privacy Policy from time to time. The “Effective date” above ' +
        'reflects the most recent revision.',
    },
    {
      heading: 'Contact Us',
      body: `Questions about this Privacy Policy can be sent to ${CONTACT_EMAIL}.`,
    },
  ],
};

export const TERMS_CONDITIONS = {
  title: 'Terms & Conditions',
  effectiveDate: 'September 14, 2026',
  intro:
    'These Terms & Conditions (“Terms”) govern your use of this website and coverage-' +
    'assessment tool operated by Atlas Health, a Veritas company. By using the Service, you ' +
    'agree to these Terms.',
  sections: [
    {
      heading: 'Who We Are',
      body:
        'Atlas Health, a Veritas company, is a lead-generation service that connects consumers ' +
        'with licensed insurance agents contracted with Veritas Insurance Solutions. Atlas ' +
        'Health does not sell insurance directly, is not an insurance carrier, is not itself a ' +
        'licensed insurance agency, and is not affiliated with or endorsed by any government ' +
        'agency (including the federal Health Insurance Marketplace or Medicare). We do not ' +
        'guarantee enrollment, eligibility, or pricing for any plan.',
    },
    {
      heading: 'The Service',
      body:
        'The Service asks a short set of questions about your household and coverage needs and ' +
        'connects your answers with a licensed insurance agent contracted with Veritas Insurance ' +
        'Solutions, who may contact you with options. Completing the questions is not an ' +
        'application for insurance and does not guarantee you will receive or qualify for any ' +
        'specific plan or price. Plan availability and pricing vary by state, carrier, and ' +
        'individual eligibility.',
    },
    {
      heading: 'Eligibility & Accuracy',
      body:
        'You must be at least 18 years old to use the Service. You agree to provide accurate, ' +
        'current information and understand that agents will rely on your answers to identify ' +
        'potential coverage options.',
    },
    {
      heading: 'No Insurance or Financial Advice',
      body:
        'Content on the Service is for general informational purposes only and is not insurance, ' +
        'legal, financial, or medical advice. Speak with a licensed agent about your specific ' +
        'situation before making coverage decisions.',
    },
    {
      heading: 'Intellectual Property',
      body:
        'All content, branding, and trademarks on the Service are the property of Atlas Health ' +
        'or its licensors and may not be used without permission.',
    },
    {
      heading: 'Third-Party Links',
      body:
        'The Service may link to third-party sites we do not control. We are not responsible for ' +
        'the content or practices of those sites.',
    },
    {
      heading: 'Disclaimer of Warranties',
      body:
        'The Service is provided “as is” without warranties of any kind, express or ' +
        'implied, to the fullest extent permitted by law.',
    },
    {
      heading: 'Limitation of Liability',
      body:
        'To the fullest extent permitted by law, Atlas Health will not be liable for any ' +
        'indirect, incidental, or consequential damages arising from your use of the Service.',
    },
    {
      heading: 'Governing Law',
      body: 'These Terms are governed by the laws of the State of Delaware, without regard to conflict-of-law principles.',
    },
    {
      heading: 'Changes to These Terms',
      body:
        'We may update these Terms from time to time. Continued use of the Service after changes ' +
        'take effect constitutes acceptance of the updated Terms.',
    },
    {
      heading: 'Contact Us',
      body: `Questions about these Terms can be sent to ${CONTACT_EMAIL}.`,
    },
  ],
};
