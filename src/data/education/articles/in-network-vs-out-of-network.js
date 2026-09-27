export default {
  slug: 'in-network-vs-out-of-network',
  category: 'networks',
  seo: {
    title: 'In-Network vs. Out-of-Network: What It Means for You',
    metaDescription:
      'Learn what in-network and out-of-network really mean, how negotiated rates work, and how to verify a doctor is in-network before you book.',
    primaryKeyword: 'in-network vs out-of-network',
    secondaryKeywords: [
      'what does in-network mean',
      'out-of-network coverage',
      'balance billing',
      'provider network insurance',
      'No Surprises Act',
    ],
  },
  h1: "In-Network vs. Out-of-Network: Why Your Doctor's Network Matters",
  dek: 'Whether a provider is in your plan\'s network can change what you pay by hundreds or thousands of dollars — here\'s what "in-network" actually means and how to check before you go.',
  readTime: '8 min read',
  sections: [
    {
      type: 'p',
      text: 'An "in-network" provider is a doctor, hospital, lab, or other facility that has signed a contract with your insurance company agreeing to accept negotiated, discounted rates for its services. An "out-of-network" provider has no such contract with your specific insurer. That single distinction — contracted or not — is usually the biggest factor in how much a visit actually costs you, often bigger than your deductible or copay amount alone.',
    },
    {
      type: 'p',
      text: 'This matters because your plan is generally designed around its network. Insurers build provider networks by negotiating rates with doctors and hospitals in exchange for sending those providers patient volume. When you stay in-network, you benefit from that negotiated rate. When you go out-of-network, you may lose some or all of that protection, and depending on your plan type, your insurer may pay very little — or nothing at all — toward the bill.',
    },
    { type: 'h2', text: 'What "In-Network" Actually Means' },
    {
      type: 'p',
      text: 'When a provider joins an insurer\'s network, they agree to charge that insurer\'s negotiated rate for each type of visit or procedure, rather than their full list price ("billed charges"). This negotiated rate is usually well below what an uninsured or out-of-network patient would be charged for the same service.',
    },
    {
      type: 'example',
      text: 'Suppose a specialist\'s standard billed charge for an office visit is $300. If that specialist is in-network with your plan, the insurer may have negotiated a rate of $150 for that same visit — the specialist has agreed to accept $150 as payment in full for the plan\'s members. Your cost-sharing (copay, coinsurance, or deductible) is then calculated based on that $150 negotiated rate, not the original $300 list price. This example is hypothetical; actual negotiated rates vary by insurer, provider, region, and plan.',
    },
    {
      type: 'p',
      text: 'Because in-network providers have agreed to this pricing structure in advance, your insurer can also process claims more predictably, and you\'re shielded from being billed the difference between the provider\'s list price and the negotiated rate (more on that below). This is part of why insurers publish a "provider directory" — a searchable list of the doctors, hospitals, and facilities considered in-network for a given plan.',
    },
    { type: 'h2', text: 'How Coverage Differs by Plan Type' },
    {
      type: 'p',
      text: 'Not all plans treat out-of-network care the same way. The plan type you choose — PPO, HMO, or EPO — determines how much flexibility you have to see a provider outside your network, and how much of the cost you\'ll be responsible for if you do.',
    },
    {
      type: 'table',
      headers: ['Plan Type', 'Out-of-Network Coverage', 'Typical Approach'],
      rows: [
        [
          'PPO (Preferred Provider Organization)',
          'Usually available',
          'Generally covers out-of-network care, but typically at a higher deductible, higher coinsurance, and higher out-of-pocket maximum than in-network care.',
        ],
        [
          'HMO (Health Maintenance Organization)',
          'Typically not covered',
          'Generally restricts coverage to in-network providers almost entirely, except in emergencies. Non-emergency out-of-network care is usually the member\'s full responsibility.',
        ],
        [
          'EPO (Exclusive Provider Organization)',
          'Typically not covered',
          'Similar to an HMO in that out-of-network care is generally excluded outside of emergencies, though EPOs often don\'t require referrals to see in-network specialists.',
        ],
      ],
    },
    {
      type: 'callout',
      text: 'These are general patterns, not guarantees. Every plan is different — always review your plan\'s Summary of Benefits and Coverage (SBC) to see exactly how it handles out-of-network care.',
    },
    {
      type: 'p',
      text: 'For a deeper comparison of how these plan structures work, including referral rules and cost differences, see our guide on PPO vs. HMO vs. EPO plans.',
    },
    { type: 'h2', text: 'Emergency Care Is Treated Differently' },
    {
      type: 'p',
      text: 'Emergencies are a notable exception to the network rules above. Federal protections under the No Surprises Act generally limit how much you can be billed for emergency services, even if you\'re treated at an out-of-network hospital or by an out-of-network provider — in many cases, you can generally only be charged what you\'d owe under your plan\'s in-network cost-sharing terms. The law also generally limits surprise billing from out-of-network providers (such as an anesthesiologist or radiologist) who happen to treat you at an in-network facility, in many common situations, even though you didn\'t choose that specific provider.',
    },
    {
      type: 'callout',
      text: 'The No Surprises Act includes a number of situations, exceptions, and notice-and-consent rules that vary by circumstance. This is a general overview, not a complete summary of the law. Review your plan documents and, if a bill seems incorrect, contact your insurer\'s member services line.',
    },
    { type: 'h2', text: 'Balance Billing: What It Is and Why the Network Matters' },
    {
      type: 'p',
      text: '"Balance billing" happens when an out-of-network provider bills you for the difference between what they charged and what your insurance actually paid. Because an out-of-network provider hasn\'t agreed to any negotiated rate, they aren\'t bound by one — they can bill their full list price, and your insurer may only pay a portion (or none) of it.',
    },
    {
      type: 'example',
      text: 'Suppose an out-of-network provider bills $1,000 for a procedure, and your insurer determines its "allowed amount" for an out-of-network version of that service is $400, paying $250 of that after your cost-sharing. Depending on your plan and state law, the provider may bill you for the remaining $750 — the balance between their charge and what insurance paid — not just your normal coinsurance. This is a simplified, hypothetical illustration; actual allowed amounts, payments, and balance-billing rules vary by plan, insurer, provider, service, and state.',
    },
    {
      type: 'p',
      text: 'This is the core reason staying in-network matters so much: in-network providers have already agreed to accept the negotiated rate as full payment (beyond your normal cost-sharing), so balance billing generally isn\'t a risk there. Outside of the emergency and surprise-billing protections described above, balance billing from out-of-network providers can still apply to many other kinds of care.',
    },
    { type: 'h2', text: 'Provider Directories Aren\'t Always Accurate' },
    {
      type: 'p',
      text: 'Every insurer maintains an online provider directory where you can search for doctors, specialists, hospitals, and facilities that are in-network for a given plan. It\'s a useful starting point — but directories are known to sometimes lag behind reality. A doctor may have left a practice, stopped accepting a particular plan, or joined a network after the directory was last updated. Relying on the directory alone, without double-checking, is one of the most common ways people end up with an unexpected out-of-network bill.',
    },
    {
      type: 'callout',
      text: 'A provider directory listing is a helpful reference point, not a guarantee. Verify network participation directly with the provider\'s office and your insurer before assuming a visit will be covered in-network.',
    },
    { type: 'h2', text: 'How to Verify a Provider Is In-Network' },
    {
      type: 'p',
      text: 'Before enrolling in a plan, or before booking an appointment with a new provider, take a few minutes to confirm network status directly. Verification is the single most reliable way to avoid a surprise bill.',
    },
    {
      type: 'list',
      ordered: true,
      items: [
        'Check the plan\'s own online provider directory, not a general internet search — search using the exact plan name and network (for example, a specific PPO or HMO product), since one insurer can offer multiple networks.',
        'Call the provider\'s office directly and ask whether they are in-network with your specific insurer and specific plan — not just whether they "take" that carrier broadly, since a provider can be in-network for some plans from an insurer but not others.',
        'Call the number on the back of your insurance card (member services) and ask them to confirm the provider\'s current network status for your plan.',
        'If you\'re choosing between plans during enrollment, confirm that your preferred doctors and any specialists you regularly see are in-network for each plan you\'re considering, before you enroll.',
        'Re-verify shortly before your appointment, especially if it\'s been a while since your last visit — provider networks can change during the plan year, and a provider who was in-network when you enrolled may not remain in-network later.',
        'Ask specifically about any additional providers involved in your care, such as an anesthesiologist, radiologist, or lab used by an in-network facility, since these can sometimes be separate, out-of-network entities.',
      ],
    },
    {
      type: 'p',
      text: 'Our glossary of common health insurance terms and our list of questions to ask before buying a plan can both help you prepare the right questions before you enroll or schedule care.',
    },
  ],
  faq: [
    {
      q: 'What does it mean if a doctor is out-of-network?',
      a: 'It means that doctor has not signed a contract agreeing to your insurer\'s negotiated rates. Depending on your plan type, care from that doctor may be covered at a reduced level, subject to a higher deductible and coinsurance, or in many cases not covered at all outside of emergencies.',
    },
    {
      q: 'Can I still see an out-of-network doctor with a PPO?',
      a: 'Generally, yes. PPO plans typically offer some out-of-network coverage, but usually with a higher deductible, higher coinsurance, and a higher out-of-pocket maximum than in-network care. Review your plan\'s Summary of Benefits and Coverage for the exact terms.',
    },
    {
      q: 'What happens if I go out-of-network with an HMO or EPO?',
      a: 'HMO and EPO plans typically don\'t cover non-emergency out-of-network care at all, meaning you\'d generally be responsible for the full billed charges. Emergency care is a common exception, subject to federal No Surprises Act protections.',
    },
    {
      q: 'What is balance billing?',
      a: 'Balance billing is when an out-of-network provider bills you for the difference between what they charged and what your insurance paid. In-network providers generally can\'t do this because they\'ve agreed to accept the negotiated rate as payment in full, beyond your normal cost-sharing.',
    },
    {
      q: 'How do I know if my doctor is in-network before I book an appointment?',
      a: 'Check your plan\'s own online provider directory for the specific plan name, then call the provider\'s office directly and ask if they\'re in-network with that specific plan. You can also call your insurer\'s member services line to confirm. It\'s worth re-checking close to your appointment date, since networks can change.',
    },
    {
      q: 'Does the No Surprises Act mean I\'ll never get an out-of-network bill?',
      a: 'No. It provides certain protections for emergency care and for out-of-network providers who treat you at an in-network facility in many common situations, but it doesn\'t eliminate all out-of-network costs. Review your plan documents and contact your insurer with questions about a specific bill.',
    },
  ],
  internalLinks: [
    { slug: 'ppo-vs-hmo-vs-epo', label: 'PPO vs. HMO vs. EPO: Which Health Insurance Network Is Right for You?' },
    { slug: 'health-insurance-terms-glossary', label: 'Health Insurance Terms Explained' },
    { slug: '10-questions-before-buying-health-insurance', label: '10 Questions You Should Ask Before Buying Health Insurance' },
    { slug: 'what-is-maximum-out-of-pocket', label: 'What Does Maximum Out-of-Pocket Mean?' },
  ],
  cta: { label: 'Get Help Navigating Your Coverage', href: '/otp-landing' },
  image: {
    suggestion:
      'A clean split-graphic showing a doctor\'s office or hospital icon on one side labeled "In-Network" with a checkmark and lower cost indicator, and the same icon on the other side labeled "Out-of-Network" with a caution indicator — modern, flat illustration style consistent with the brand, no stock photo of a stethoscope.',
    alt: 'Illustration comparing an in-network provider with lower cost-sharing against an out-of-network provider with higher, less predictable costs.',
  },
};
