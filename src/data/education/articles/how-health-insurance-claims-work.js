export default {
  slug: 'how-health-insurance-claims-work',
  category: 'using',
  seo: {
    title: 'How Health Insurance Claims Work, Step by Step',
    metaDescription:
      'From your appointment to your EOB: how a health insurance claim gets submitted, processed, paid, and what to do if it\'s denied.',
    primaryKeyword: 'how health insurance claims work',
    secondaryKeywords: [
      'health insurance claim process',
      'what is an allowed amount',
      'why was my claim denied',
      'health insurance claim appeal',
    ],
  },
  h1: 'How Health Insurance Claims Work: From the Doctor\'s Office to Your EOB',
  dek: 'A single doctor\'s visit sets off a whole behind-the-scenes process between your provider and your insurer before you ever see a bill — here\'s what happens at each step.',
  updated: '2026-09',
  readTime: '8 min read',
  sections: [
    {
      type: 'p',
      text: 'When you see a doctor, the bill doesn\'t just show up. There\'s a whole process happening behind the scenes between your provider, your insurance company, and eventually you — one that determines what your plan pays, what you owe, and why. Understanding that process makes the paperwork that follows a visit (and the occasional denied claim) a lot less confusing.',
    },
    {
      type: 'p',
      text: 'Here\'s the claims process from start to finish, followed by a closer look at the steps that tend to cause the most confusion.',
    },
    { type: 'h2', text: 'The claims process, step by step' },
    {
      type: 'list',
      ordered: true,
      items: [
        'You receive care. You see a doctor, visit urgent care, have a procedure, or fill a prescription.',
        'The provider documents the visit and assigns billing codes. Your provider\'s office translates what happened during your visit — the diagnosis, the services performed — into standardized medical codes used for billing.',
        'The provider submits a claim to your insurer. This is typically done electronically, listing the codes, the charges, and your plan information.',
        'The insurer receives and processes the claim. The insurer checks your coverage, confirms the services are covered under your plan, and applies its negotiated or "allowed" rate for each service.',
        'Cost-sharing is applied. Depending on your plan\'s terms, your deductible, copay, and/or coinsurance are applied to determine how much the plan pays and how much is your responsibility.',
        'The insurer pays the provider. For in-network care, the insurer generally pays its portion directly to the provider rather than reimbursing you.',
        'The insurer sends you an Explanation of Benefits (EOB). This document shows what was billed, what the plan paid, and what portion (if any) you owe — it is not a bill.',
        'The provider bills you for your remaining responsibility. Once the provider has received the insurer\'s payment, they send you a bill for any deductible, copay, or coinsurance you owe.',
        'You pay your portion. You pay the provider directly, according to their billing and payment terms.',
      ],
    },
    {
      type: 'callout',
      text: 'This sequence describes a typical in-network claim. Out-of-network care, prescriptions filled at a pharmacy, and services requiring prior authorization can follow a different path. Review your plan\'s Summary of Benefits and Coverage or member portal for how claims work under your specific plan.',
    },
    { type: 'h2', text: 'Billing codes: how a visit becomes a claim' },
    {
      type: 'p',
      text: 'After your appointment, your provider\'s office converts the visit into a set of standardized codes — one set for the diagnosis (what was wrong or being checked) and another for the procedures or services performed. These codes are what insurers actually process; they\'re the language a claim is written in. An error here, like a mismatched or missing code, is one of the more common reasons a claim gets delayed or denied, which is why double-checking a denial letter for a coding issue is often worth doing before assuming a service simply wasn\'t covered.',
    },
    { type: 'h2', text: 'Allowed amount vs. billed amount' },
    {
      type: 'p',
      text: 'One of the most important — and most misunderstood — concepts in the claims process is the difference between what a provider bills and what the insurer actually allows.',
    },
    {
      type: 'p',
      text: 'The billed amount (sometimes called the "charge") is the provider\'s standard rate for a service — essentially, their sticker price. The allowed amount is the negotiated rate your insurer has agreed to pay an in-network provider for that same service, which is often lower than the billed amount. Your deductible, copay, and coinsurance are generally calculated based on the allowed amount, not the original billed charge.',
    },
    {
      type: 'example',
      text: 'Suppose a provider bills $1,000 for an outpatient procedure, but your insurer\'s negotiated allowed amount for that same procedure is $600. If the provider is in-network, they generally agree to accept the $600 allowed amount as payment in full (from the plan and you combined), and the remaining $400 is written off rather than billed to you. If your plan has 20% coinsurance and you\'ve met your deductible, you\'d generally owe 20% of $600 ($120), not 20% of the original $1,000 bill.',
    },
    {
      type: 'callout',
      text: 'This write-off protection generally applies to in-network care. Out-of-network providers haven\'t agreed to an allowed amount and may bill you for the difference between their charge and whatever the insurer pays — sometimes called balance billing. Verify provider network participation directly with your insurer before a scheduled service whenever possible.',
    },
    { type: 'h2', text: 'Claim status: what "pending," "paid," and "denied" actually mean' },
    {
      type: 'p',
      text: 'While a claim moves through the insurer\'s system, it typically carries one of a few statuses, often visible in your insurer\'s member portal.',
    },
    {
      type: 'table',
      headers: ['Status', 'What it means'],
      rows: [
        ['Submitted', 'The provider has sent the claim to the insurer, and it hasn\'t yet been reviewed.'],
        ['In-process / pending', 'The insurer is reviewing the claim — checking eligibility, coding, and whether the service is covered.'],
        ['Paid', 'The insurer has approved and paid its portion of the claim; the EOB reflects the outcome.'],
        ['Denied', 'The insurer has determined it will not pay for the service as submitted, for one or more specific reasons stated in the EOB or denial letter.'],
      ],
    },
    {
      type: 'p',
      text: 'A "pending" claim isn\'t necessarily a problem — many claims sit in this status briefly as a routine part of processing. It\'s worth following up with your insurer if a claim stays pending for an unusually long time relative to their typical processing window, which you can generally find in your plan documents.',
    },
    { type: 'h2', text: 'Why claims get denied or pended' },
    {
      type: 'p',
      text: 'A denial doesn\'t always mean the service wasn\'t covered — it often means something about how the claim was submitted needs to be fixed or clarified. Common reasons include:',
    },
    {
      type: 'list',
      items: [
        'Missing prior authorization: some services require the insurer\'s approval before they\'re performed; a claim can be denied if that step was skipped, even if the service itself is generally covered.',
        'Coding errors or mismatches: an incorrect, outdated, or inconsistent billing code can cause an automatic denial, since the insurer\'s system may not be able to match the code to a covered benefit.',
        'Out-of-network provider: if the provider isn\'t in your plan\'s network, the claim may be denied outright or paid at a much lower out-of-network rate, depending on your plan type.',
        'Service not covered under the plan: some services are excluded from a given plan\'s benefits entirely, or covered only under specific conditions that weren\'t met.',
        'Missing or incomplete information: a claim submitted with missing details, such as an incorrect member ID or date of service, may be returned or denied until it\'s corrected and resubmitted.',
      ],
    },
    {
      type: 'p',
      text: 'The EOB or denial letter you receive should state the specific reason for a denial. That reason is the starting point for figuring out whether the issue is something the provider\'s office can simply correct and resubmit, or something you may need to formally appeal.',
    },
    { type: 'h2', text: 'What is an EOB, and what should you do with it?' },
    {
      type: 'p',
      text: 'The Explanation of Benefits is the document your insurer sends after processing a claim. It lays out what was billed, the allowed amount, what the plan paid, and what portion (if any) is your responsibility. It is a summary, not an invoice — you don\'t pay the insurer based on an EOB. The actual bill comes separately from your provider, and it\'s worth comparing the two to make sure the amount the provider is charging you matches what the EOB says you owe.',
    },
    { type: 'h2', text: 'If your claim is denied: appeals and external review' },
    {
      type: 'p',
      text: 'If a claim is denied and you believe it shouldn\'t have been, you generally have the right to appeal. The first step is an internal appeal directly with your insurer, where you (or your provider, on your behalf) ask the insurer to formally reconsider the decision, typically in writing and within a deadline stated in your denial letter.',
    },
    {
      type: 'p',
      text: 'If the internal appeal doesn\'t resolve things in your favor, many plans also offer external review — an independent review of the decision by a third party outside the insurer, separate from its own appeals process. Availability, deadlines, and the exact process for both internal appeals and external review vary by state and by plan, so check your denial letter, your Summary of Benefits and Coverage, or your state\'s department of insurance for the specific steps and timelines that apply to you.',
    },
    {
      type: 'callout',
      text: 'This is general educational information about how the claims and appeals process typically works, not personalized insurance, legal, or tax advice. Always follow the specific instructions and deadlines in your own EOB, denial letter, and plan documents.',
    },
    { type: 'h2', text: 'Why understanding this process matters' },
    {
      type: 'p',
      text: 'Most claims move through this process without any drama — care happens, the claim is processed, the insurer pays its share, and you pay yours. But when something looks off, whether that\'s a surprisingly large bill or a denial you didn\'t expect, knowing the sequence above helps you figure out where in the process to start asking questions: was it a coding issue at the provider\'s office, a network issue, a missing authorization, or a coverage exclusion? Clarity before coverage also means clarity after the visit, when the paperwork actually arrives.',
    },
  ],
  faq: [
    {
      q: 'How long does it take for a health insurance claim to be processed?',
      a: 'Processing times vary by insurer and by the type of claim, but many electronic claims are processed within a couple of weeks. Check your plan documents or member portal for your insurer\'s typical timeline, and follow up directly with the insurer if a claim seems to be taking unusually long.',
    },
    {
      q: 'Do I need to submit my own claims?',
      a: 'For in-network care, your provider\'s office typically submits the claim directly to your insurer on your behalf, and you don\'t need to do anything at the time of service. For out-of-network care, or in some less common situations, you may need to submit a claim yourself — check with your insurer about its process and required forms.',
    },
    {
      q: 'What\'s the difference between a claim being "denied" and "pending"?',
      a: 'Pending (or "in-process") means the insurer is still reviewing the claim and hasn\'t made a final decision. Denied means the insurer has reviewed the claim and decided not to pay for the service as submitted, for a specific stated reason. A denial can often be corrected and resubmitted, or formally appealed.',
    },
    {
      q: 'Is an Explanation of Benefits (EOB) a bill?',
      a: 'No. An EOB is a summary from your insurer showing how a claim was processed — what was billed, what the plan paid, and what you may owe. The actual bill comes separately from your provider. It\'s a good idea to compare the two documents to make sure they match.',
    },
    {
      q: 'What should I do if my claim is denied?',
      a: 'Start by reading the specific reason for the denial in your EOB or denial letter. Some denials can be resolved by having your provider\'s office correct and resubmit the claim (for example, a coding error). If you believe the denial was incorrect, you generally have the right to file an internal appeal with your insurer, and, depending on your state and plan, request an external review afterward.',
    },
    {
      q: 'Why did my insurer pay less than what my doctor billed?',
      a: 'For in-network care, insurers pay based on a negotiated "allowed amount," which is often lower than the provider\'s standard billed charge. The provider generally agrees to accept that allowed amount as full payment (combined from the plan and you), rather than billing you the difference. This is different from out-of-network care, where balance billing for the difference is more common.',
    },
  ],
  internalLinks: [
    { slug: 'what-is-an-eob', label: 'What Is an Explanation of Benefits (EOB)?' },
    { slug: 'health-insurance-terms-glossary', label: 'Health Insurance Terms Explained' },
    { slug: 'in-network-vs-out-of-network', label: 'In-Network vs. Out-of-Network: Why Your Doctor\'s Network Matters' },
    { slug: 'copay-vs-coinsurance', label: 'Copay vs. Coinsurance: What\'s the Difference?' },
  ],
  cta: { label: 'Get Help Navigating Your Coverage', href: '/otp-landing' },
  image: {
    suggestion: 'A simple horizontal flow graphic showing the claims journey as connected icons: doctor visit, billing codes/document, insurer processing, EOB document, final bill — in the brand\'s color palette.',
    alt: 'Diagram showing the health insurance claims process from a doctor visit through to an Explanation of Benefits and final bill',
  },
};
