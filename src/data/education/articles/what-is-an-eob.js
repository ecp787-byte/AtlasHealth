export default {
  slug: 'what-is-an-eob',
  category: 'using',
  seo: {
    title: 'What Is an Explanation of Benefits (EOB)?',
    metaDescription:
      'An EOB shows how your insurer processed a claim — but it is not a bill. Learn how to read every line, from billed charges to patient responsibility.',
    primaryKeyword: 'what is an explanation of benefits',
    secondaryKeywords: [
      'EOB meaning',
      'how to read an EOB',
      'explanation of benefits vs bill',
      'EOB reason codes',
    ],
  },
  h1: 'What Is an Explanation of Benefits (EOB)?',
  dek: 'An Explanation of Benefits is a summary of how your insurer processed a claim — not a bill, and not necessarily what you\'ll ultimately owe.',
  updated: '2026-09',
  readTime: '8 min read',
  sections: [
    {
      type: 'p',
      text: 'An Explanation of Benefits, usually called an EOB, is a document your health insurer sends after a claim is processed for care you received. It breaks down what the provider charged, what the insurer\'s contract actually allows for that service, how much the plan paid, and what portion — if any — you may still owe. Insurers typically send an EOB by mail or make it available in your online member portal shortly after a claim is processed, whether or not you owe anything.',
    },
    {
      type: 'callout',
      text: 'An EOB is not a bill. It is a summary of how a claim was processed. The actual bill — the document that tells you where to send payment — comes separately from your provider. Wait for that bill before paying anything, but compare it against your EOB to make sure the numbers match and nothing looks out of order.',
    },
    {
      type: 'p',
      text: 'That distinction trips up a lot of people, partly because an EOB can look and feel like a bill — it has your name, a provider, a dollar figure, and language about what you owe. But the EOB comes from your insurance company, not your provider\'s billing office, and providers sometimes adjust charges, apply payments, or catch errors after the EOB is generated. Paying directly from an EOB, before the provider\'s bill arrives, can mean paying the wrong amount — or paying twice.',
    },
    { type: 'h2', text: 'Why EOBs exist' },
    {
      type: 'p',
      text: 'When a provider submits a claim, the insurer runs it through a set of rules: is the service covered under the plan, was the provider in-network, has the deductible been met, does a copay or coinsurance apply, and so on. The EOB is the output of that process — a paper trail showing exactly how the insurer arrived at its payment decision for that specific visit or service. Keeping your EOBs gives you a record you can check against provider bills, use for tax or reimbursement purposes, and reference if you ever need to dispute a charge or file an appeal. For more on how a claim moves from the doctor\'s office to this point, see how health insurance claims work.',
    },
    { type: 'h2', text: 'The line items on an EOB, explained' },
    {
      type: 'p',
      text: 'EOB formats vary by insurer, but nearly all of them include the same core pieces of information for each service billed. Here\'s what each one means.',
    },
    { type: 'h3', text: 'Provider charge (billed amount)' },
    {
      type: 'p',
      text: 'This is the amount the provider billed for the service — sometimes called the "billed charge" or "provider charge." It reflects the provider\'s standard rate, not necessarily what anyone actually pays. For in-network care, the billed amount is often significantly higher than what the insurer actually recognizes.',
    },
    { type: 'h3', text: 'Allowed amount' },
    {
      type: 'p',
      text: 'The allowed amount is the maximum amount the insurer recognizes for that service under its contract with the provider. For in-network providers, this is a negotiated rate the provider has agreed to accept as payment in full (between the insurer\'s payment and your cost-sharing). Everything else on the EOB — the plan payment, the deductible applied, the coinsurance — is generally calculated as a percentage or portion of this allowed amount, not the original billed charge.',
    },
    { type: 'h3', text: 'Network discount' },
    {
      type: 'p',
      text: 'The network discount is the difference between the billed amount and the allowed amount for in-network care. It represents savings created by the insurer\'s contract with the provider, and for in-network services, the patient generally isn\'t responsible for this difference. Out-of-network care often doesn\'t include a negotiated discount at all, which is one reason out-of-network bills can be higher and less predictable.',
    },
    { type: 'h3', text: 'Amount insurance paid' },
    {
      type: 'p',
      text: 'This is the dollar amount the plan actually paid the provider for the service, based on the allowed amount, the plan\'s benefit terms, and how much of the deductible or out-of-pocket maximum had already been met.',
    },
    { type: 'h3', text: 'Deductible applied' },
    {
      type: 'p',
      text: 'If any portion of the allowed amount was counted toward your annual deductible, it typically shows up as its own line. Amounts applied to the deductible are generally the patient\'s responsibility until the full deductible has been met for the year. For a full explanation of how deductibles work, see what is a health insurance deductible.',
    },
    { type: 'h3', text: 'Copay' },
    {
      type: 'p',
      text: 'A copay is a flat dollar amount your plan charges for certain services, regardless of the size of the underlying bill. If a copay applied to this visit, it usually appears as a fixed figure — for example, $30 or $50 — separate from any deductible or coinsurance calculation.',
    },
    { type: 'h3', text: 'Coinsurance' },
    {
      type: 'p',
      text: 'Coinsurance is your percentage share of the allowed amount after any deductible has been met — for example, 20% of the allowed cost, with the plan covering the rest. See copay vs. coinsurance for a closer look at how these two cost-sharing types differ and when each one typically applies.',
    },
    { type: 'h3', text: 'Patient responsibility' },
    {
      type: 'p',
      text: 'This line totals what the EOB estimates you may still owe the provider — generally the sum of any deductible applied, copay, and coinsurance, minus anything already paid. It\'s an important number, but it\'s an estimate from the insurer\'s side of the transaction, not a final invoice. Providers sometimes bill a different amount due to timing, adjustments, or their own account records.',
    },
    { type: 'h3', text: 'Claim number' },
    {
      type: 'p',
      text: 'Every processed claim gets a unique claim number (sometimes called a claim ID). This is the reference number to use any time you call your insurer or provider about a specific visit — it lets both sides pull up the exact same record instead of searching by date or provider name alone.',
    },
    { type: 'h3', text: 'Reason codes' },
    {
      type: 'p',
      text: 'Reason codes are short alphanumeric codes (and a plain-language description) explaining how a specific line item was processed — for example, that a service was applied to the deductible, paid at the in-network rate, or reduced because of the negotiated allowed amount. When a claim or line item is denied, a reason code explains why: the service wasn\'t covered under the plan, the provider was out-of-network, additional information was needed from the provider, or the claim was submitted after the filing deadline, among other possibilities. If you see a denial code you don\'t understand, the EOB itself usually includes a short definition, and your insurer\'s member services line can explain it in more detail and outline your appeal rights.',
    },
    { type: 'h2', text: 'A fictional example EOB' },
    {
      type: 'p',
      text: 'The table below is a fictional example created for illustration only — it does not reflect any real insurer, provider, or plan. Use it to see how the pieces connect, not as a reference for actual costs.',
    },
    {
      type: 'table',
      headers: ['Service', 'Billed Amount', 'Allowed Amount', 'Plan Paid', 'Your Responsibility'],
      rows: [
        ['Office visit, established patient', '$220', '$140', '$110', '$30 (copay)'],
        ['Basic metabolic panel (lab work)', '$180', '$45', '$45', '$0'],
        ['X-ray, single view', '$310', '$150', '$0', '$150 (applied to deductible)'],
      ],
    },
    {
      type: 'example',
      text: 'In this fictional example, the office visit shows a $220 billed charge reduced to a $140 allowed amount — an $80 network discount. The plan paid $110, and the patient\'s $30 copay covers the rest. The X-ray shows a $150 allowed amount that went entirely toward the deductible, meaning the plan paid $0 on that line and the full $150 became the patient\'s responsibility, assuming the deductible hadn\'t already been met. Once the deductible is satisfied, later claims in the same plan year would likely be processed differently.',
    },
    {
      type: 'callout',
      text: 'These figures are entirely hypothetical and used only to demonstrate how an EOB is structured. Actual billed charges, allowed amounts, and cost-sharing depend on your specific plan, insurer, provider contract, and the services rendered. Review your own EOB and Summary of Benefits and Coverage for the terms that apply to you.',
    },
    { type: 'h2', text: 'What to do when you receive an EOB' },
    {
      type: 'p',
      text: 'Start by checking that the provider, date of service, and type of visit match your own records — EOBs occasionally get sent for the wrong person or contain a data-entry error. Next, compare the "your responsibility" figure to the actual bill once it arrives from the provider\'s office. If the two don\'t match, that\'s worth a phone call: sometimes the provider\'s bill is generated before the EOB is finalized, and other times it reflects a genuine discrepancy worth resolving before you pay.',
    },
    {
      type: 'p',
      text: 'If a line item was denied and you believe it shouldn\'t have been, the EOB\'s reason code is the starting point for a phone call to your insurer or a formal appeal. Most plans have a defined appeals process and a deadline for filing, so don\'t set a denial aside for too long. Clarity before coverage also means clarity after a claim is filed — understanding your EOB is part of using the coverage you already have.',
    },
    {
      type: 'p',
      text: 'For a broader look at how a visit turns into a claim and, eventually, an EOB, see how health insurance claims work. And if any of the terminology on your EOB still isn\'t clear, the health insurance terms glossary covers the vocabulary used throughout this process.',
    },
  ],
  faq: [
    {
      q: 'Is an EOB a bill I need to pay?',
      a: 'No. An EOB is a summary from your insurer showing how a claim was processed — it is not an invoice and not a request for payment. The actual bill comes separately from your provider. Compare the two once the provider\'s bill arrives, but don\'t pay based on the EOB alone.',
    },
    {
      q: 'Why is the billed amount on my EOB so much higher than what I actually owe?',
      a: 'The billed amount is the provider\'s standard charge before any insurance contract is applied. For in-network care, the insurer\'s negotiated allowed amount is typically much lower, and the difference (the network discount) generally isn\'t something the patient owes. Your responsibility is based on the allowed amount, not the original billed charge.',
    },
    {
      q: 'What does "patient responsibility" mean on an EOB?',
      a: 'It\'s the insurer\'s estimate of what you may still owe the provider after deductible, copay, and coinsurance are applied. It\'s a useful estimate, but the provider\'s actual bill is the final word — compare the two and contact the provider\'s billing office if they don\'t match.',
    },
    {
      q: 'What should I do if my EOB shows a denied claim?',
      a: 'Check the reason code on the EOB, which explains why the line item was denied — common reasons include the service not being covered, an out-of-network provider, or missing information. From there, you can call your insurer for clarification or file a formal appeal; most plans have a specific appeals process and deadline.',
    },
    {
      q: 'Do I get an EOB even if I don\'t owe anything?',
      a: 'Often, yes. Insurers commonly generate an EOB any time a claim is processed, even when the plan pays the full allowed amount and the patient owes nothing. It still documents how the claim was handled and is worth keeping for your records.',
    },
    {
      q: 'Where can I find my EOBs?',
      a: 'Most insurers mail a paper EOB and also post an electronic version in your online member portal or mobile app shortly after a claim is processed. Check your portal\'s claims or statements section, or contact member services if you can\'t locate one for a specific visit.',
    },
  ],
  internalLinks: [
    { slug: 'how-health-insurance-claims-work', label: 'How Health Insurance Claims Work: From the Doctor\'s Office to Your EOB' },
    { slug: 'health-insurance-terms-glossary', label: 'Health Insurance Terms Explained' },
    { slug: 'what-is-a-health-insurance-deductible', label: 'What Is a Health Insurance Deductible — and Do You Always Have to Meet It First?' },
    { slug: 'copay-vs-coinsurance', label: 'Copay vs. Coinsurance: What\'s the Difference?' },
  ],
  cta: { label: 'Talk With a Coverage Guide', href: '/otp-landing' },
  image: {
    suggestion: 'A clean, annotated mock-up of an Explanation of Benefits document with callout labels pointing to key fields — billed amount, allowed amount, plan paid, and patient responsibility — in the brand\'s color palette.',
    alt: 'Annotated example of an Explanation of Benefits showing billed amount, allowed amount, plan paid, and patient responsibility',
  },
};
