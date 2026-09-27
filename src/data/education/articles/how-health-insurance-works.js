export default {
  slug: 'how-health-insurance-works',
  category: 'basics',
  seo: {
    title: 'Health Insurance 101: How It Actually Works',
    metaDescription:
      "A plain-language guide to premiums, deductibles, copays, coinsurance, and out-of-pocket maximums — how health insurance really works, step by step.",
    primaryKeyword: 'how health insurance works',
    secondaryKeywords: [
      'health insurance basics',
      'health insurance for beginners',
      'deductible vs copay vs coinsurance',
      'how does health insurance work',
    ],
  },
  h1: 'Health Insurance 101: How Health Insurance Actually Works',
  dek: "A plain-language walkthrough of premiums, networks, deductibles, copays, coinsurance, and out-of-pocket maximums — how the pieces fit together every time you use your coverage.",
  updated: '2026-09',
  readTime: '12 min read',
  sections: [
    {
      type: 'p',
      text: "Health insurance is a cost-sharing agreement. You pay a set amount every month, and in exchange, your insurer agrees to pay a share of your medical bills for the rest of the year — usually a growing share, the more you spend. Almost everything confusing about a health plan comes down to figuring out who pays what, and when. This guide walks through each piece in order, then puts them together with two real-world examples: an office visit and an ER trip.",
    },
    {
      type: 'p',
      text: "Clarity before coverage: once you understand the handful of terms below, reading any plan's Summary of Benefits and Coverage becomes a lot less intimidating.",
    },
    {
      type: 'h2',
      text: 'The Short Version: Six Terms That Explain Almost Everything',
    },
    {
      type: 'p',
      text: "Before the details, here is the big picture. Every health plan uses some combination of these six mechanics to determine your bill. The exact dollar amounts vary by plan, insurer, and state, but the roles each term plays are consistent across nearly every plan sold in the United States.",
    },
    {
      type: 'table',
      headers: ['Term', 'What it means'],
      rows: [
        ['Premium', "The fixed amount you pay each month to keep your coverage active, whether or not you use any care."],
        ['Network', "The group of doctors, hospitals, and pharmacies that have agreed to a negotiated rate with your insurer."],
        ['Deductible', "The amount you typically pay out of your own pocket before your plan starts sharing the cost of most care."],
        ['Copay', "A flat dollar amount you pay for a specific service, like $30 for a primary care visit."],
        ['Coinsurance', "A percentage of the cost you pay after your deductible is met, like 20%, with the insurer paying the rest."],
        ['Out-of-pocket maximum', "The most you can pay in a plan year for covered, in-network care before your plan pays 100%."],
      ],
    },
    {
      type: 'h2',
      text: 'Premiums: The Cost of Having Coverage at All',
    },
    {
      type: 'p',
      text: "Your premium is the membership fee for your health plan. It's due every month regardless of whether you visit a doctor at all that month, and it's separate from — and in addition to — anything you pay when you actually receive care. If you have an employer-sponsored plan, your employer typically pays part of the premium and the rest is deducted from your paycheck. If you buy a plan on the Marketplace or directly from an insurer, you pay the full premium yourself, though you may qualify for a premium tax credit that lowers it, depending on your income and household size.",
    },
    {
      type: 'callout',
      text: "A lower premium usually means higher cost-sharing elsewhere in the plan (a higher deductible, higher copays, or higher coinsurance), and vice versa. Neither structure is automatically better — the right balance depends on how much care you expect to use in a given year. Coverage details and pricing vary by insurer, plan, and state.",
    },
    {
      type: 'h2',
      text: 'Networks: Why the Same Visit Can Cost Very Different Amounts',
    },
    {
      type: 'p',
      text: "A network is the list of doctors, specialists, hospitals, labs, and pharmacies that have signed a contract with your insurance company. In that contract, the provider agrees to accept a negotiated rate for each service — usually far less than what they'd charge someone with no insurance — in exchange for being listed as an in-network provider that the insurer's members are steered toward.",
    },
    {
      type: 'p',
      text: "This is the mechanism behind one of the most important facts in health insurance: your cost-sharing (deductible, copay, and coinsurance) is almost always calculated as a percentage or flat amount of the negotiated rate, not the provider's full sticker price. When you go out-of-network, that negotiated rate often doesn't apply, your plan may pay a smaller share, and the provider may be allowed to bill you for the difference between what they charged and what your insurer paid — a practice sometimes called balance billing. Depending on your plan type, out-of-network care may not be covered at all outside of emergencies.",
    },
    {
      type: 'p',
      text: "Plans differ in how strictly they enforce network rules. An HMO generally requires you to stay in-network and often to get referrals from a primary care doctor, while a PPO typically covers out-of-network care too, at a higher cost to you. An EPO sits in between. Because the plan type you pick determines how much flexibility you have to see any doctor you want, it's worth understanding the differences before you enroll.",
    },
    {
      type: 'h2',
      text: 'Deductibles: What You Pay Before Cost-Sharing Kicks In',
    },
    {
      type: 'p',
      text: "Your deductible is the amount you generally pay out of your own pocket for covered care before your plan starts paying its share of most services. Deductibles reset every plan year, typically on January 1.",
    },
    {
      type: 'example',
      text: "Suppose your plan has a $2,000 deductible. Early in the year, you have an outpatient procedure with a negotiated (in-network) cost of $2,500. Because you haven't met your deductible yet, you're generally responsible for the first $2,000 of that bill. Your plan's cost-sharing — copay or coinsurance — typically applies to the remaining $500. This is a hypothetical example; actual cost-sharing depends on your specific plan design.",
    },
    {
      type: 'p',
      text: "Not every service requires you to meet your deductible first. Many plans cover certain preventive care, and sometimes a set number of primary care or telehealth visits, with only a copay — or no charge at all — even before you've paid anything toward your deductible. Whether a specific service works that way depends entirely on your plan, so it's worth checking your plan's Summary of Benefits and Coverage rather than assuming.",
    },
    {
      type: 'h2',
      text: 'Copays vs. Coinsurance: Two Different Ways You Share the Cost',
    },
    {
      type: 'p',
      text: "Once your deductible is met (or for services that don't require it), most plans use one of two methods — a copay or coinsurance — to determine your share of the remaining bill.",
    },
    {
      type: 'p',
      text: "A copay is a flat dollar amount tied to a type of visit — for example, $30 for a primary care visit or $75 for a specialist visit — regardless of how much the visit actually costs the insurer. Coinsurance is a percentage instead of a flat amount. If your plan has 20% coinsurance, you generally pay 20% of the plan's negotiated cost for a covered service, and the insurer pays the remaining 80%, subject to the terms of your plan. Some plans use copays for routine, predictable care (office visits, prescriptions) and coinsurance for larger or more variable costs (surgery, hospital stays, imaging).",
    },
    {
      type: 'example',
      text: "Suppose you've already met your deductible for the year, and your plan has 20% coinsurance. You have an in-network MRI with a negotiated cost of $1,000. Under 20% coinsurance, you'd generally owe about $200, and your insurer would pay the remaining $800. If instead your plan charged a flat $250 copay for imaging, you'd owe $250 regardless of the MRI's exact negotiated cost. This is a hypothetical illustration; actual costs depend on your plan.",
    },
    {
      type: 'h2',
      text: 'Maximum Out-of-Pocket: Your Annual Ceiling',
    },
    {
      type: 'p',
      text: "Every ACA-compliant plan includes a maximum out-of-pocket limit — the most you can be required to pay in a plan year for covered, in-network care through deductibles, copays, and coinsurance combined. Once you hit that number, your plan generally pays 100% of covered, in-network costs for the rest of the plan year. Premiums don't count toward this limit, and neither do out-of-network costs on most plans.",
    },
    {
      type: 'p',
      text: "For the 2026 plan year, the ACA maximum out-of-pocket limit for non-grandfathered plans is $10,600 for an individual and $21,200 for a family, up from $9,200 and $18,400 in 2025. That figure was revised upward by a CMS final rule issued in June 2025, after federal regulators initially proposed lower numbers.",
    },
    {
      type: 'callout',
      text: "Don't confuse the general ACA out-of-pocket maximum above with the separate, lower IRS limit that applies specifically to HSA-eligible high-deductible health plans (HDHPs): $8,500 individual / $17,000 family for 2026. A plan has to meet that stricter IRS limit — not just the general ACA limit — to qualify as HSA-eligible. Confirm which limit applies to your specific plan.",
    },
    {
      type: 'h2',
      text: 'Putting It Together, Example One: A Routine Doctor Visit',
    },
    {
      type: 'p',
      text: "Here's how these pieces work together in practice. Suppose you have a plan with a $1,500 deductible, a $35 primary care copay that applies even before the deductible is met, 20% coinsurance after the deductible, and a $9,000 out-of-pocket maximum. This is a hypothetical plan design for illustration only.",
    },
    {
      type: 'list',
      ordered: true,
      items: [
        "You schedule an annual physical with an in-network primary care doctor. Because many plans cover preventive visits like this at no cost, you may owe nothing for the visit itself — but check your plan's Summary of Benefits and Coverage to confirm which services qualify.",
        "A few weeks later, you come down with a sinus infection and see the same doctor for a non-preventive visit. Because your plan copay applies regardless of your deductible, you pay the flat $35 copay at checkout.",
        "Your insurer receives the claim from the doctor's office, applies the negotiated in-network rate, and confirms your $35 copay covered your responsibility — no additional bill follows for a straightforward office visit like this one.",
        "Later that year, you need a $600 diagnostic test related to a different issue. Since you haven't met your $1,500 deductible, you pay the full negotiated cost of the test out of pocket, and that $600 also counts toward both your deductible and your out-of-pocket maximum.",
      ],
    },
    {
      type: 'h2',
      text: 'Putting It Together, Example Two: An Emergency Room Visit',
    },
    {
      type: 'p',
      text: "Now suppose, later the same year, you go to an in-network emergency room after a fall. Using the same hypothetical plan — $1,500 deductible, 20% coinsurance after the deductible, $9,000 out-of-pocket maximum — and assume you've already paid $900 toward your deductible so far this year from other care.",
    },
    {
      type: 'list',
      ordered: true,
      items: [
        "The ER visit, including imaging and treatment, has a negotiated in-network cost of $4,000.",
        "You have $600 left on your deductible ($1,500 minus the $900 you already paid), so you owe that $600 first.",
        "Coinsurance applies to the remaining $3,400 of the bill. At 20%, you'd generally owe about $680, and your plan would pay the remaining $2,720.",
        "Your total responsibility for this visit is roughly $1,280 ($600 + $680), added to the $900 you'd already paid this year — putting you at about $2,180 toward your $9,000 out-of-pocket maximum.",
        "If a later claim in the same year pushed your total covered, in-network out-of-pocket spending up to $9,000, your plan would generally pay 100% of additional covered, in-network costs for the rest of that plan year.",
      ],
    },
    {
      type: 'callout',
      text: "These numbers are entirely hypothetical and used only to illustrate how deductibles, coinsurance, and the out-of-pocket maximum interact. Actual costs depend on your specific plan, insurer, state, and the services you receive. Review your plan's Summary of Benefits and Coverage or contact your insurer for your actual cost-sharing terms.",
    },
    {
      type: 'h2',
      text: 'How Claims Actually Get Processed',
    },
    {
      type: 'p',
      text: "You rarely pay your full share at the moment of care, and here's why: your provider doesn't actually know your final cost until your insurer processes the claim. After your visit, the provider submits a claim to your insurer describing what was done. Your insurer reviews it, applies your plan's negotiated rate, subtracts anything you already paid, and calculates what's left for the deductible, copay, or coinsurance. The result is summarized in a document called an Explanation of Benefits, or EOB, which is not a bill — it's a record of how the claim was processed. The provider then bills you separately for whatever portion you owe, which is why a bill can arrive weeks after your appointment.",
    },
    {
      type: 'h2',
      text: 'Prescription Drug Coverage',
    },
    {
      type: 'p',
      text: "Most health plans cover prescription drugs through a separate cost-sharing structure organized into tiers, typically arranged from lowest cost to highest: generic drugs, preferred brand-name drugs, non-preferred brand-name drugs, and specialty drugs. Each tier usually carries its own copay or coinsurance amount, and higher tiers generally cost more. Some plans apply a separate drug deductible before prescription coverage kicks in; others fold prescription costs into the same deductible as medical care. Because tier structures and covered medications (the plan's formulary) vary significantly by insurer and plan, it's worth checking whether a specific medication is covered — and at what tier — before assuming a cost.",
    },
    {
      type: 'h2',
      text: 'Preventive Care: Often Covered Before You Pay Anything',
    },
    {
      type: 'p',
      text: "Many ACA-compliant plans cover a defined set of preventive services — things like annual wellness visits, many vaccinations, and certain screenings — at no cost to you when you use an in-network provider, even if you haven't met your deductible. The idea is to remove cost as a barrier to care that can catch problems early. What counts as preventive, however, is specific: a visit that starts as a routine checkup can turn into a billable visit if your doctor addresses or treats a new problem during it. Depending on your plan, coverage details vary, so review your Summary of Benefits and Coverage for the exact list of covered preventive services.",
    },
    {
      type: 'h2',
      text: 'How Insurers Negotiate Rates With Providers',
    },
    {
      type: 'p',
      text: "The negotiated rates behind your network are the result of ongoing contracts between insurers and providers. A large insurer with millions of members represents significant patient volume, which gives it leverage to negotiate lower per-service rates in exchange for including a hospital system or doctor's group in its network. Providers accept these lower rates because being in-network with major insurers brings them a steady stream of patients who are financially incentivized to choose them over an out-of-network alternative.",
    },
    {
      type: 'p',
      text: "This negotiated number — sometimes called the allowed amount — is what most of the cost-sharing math in this guide is actually based on. It's typically well below what a provider might charge a self-pay patient with no insurance at all, which is part of why having coverage matters even for people who rarely need care: it locks in access to negotiated pricing before you need it.",
    },
    {
      type: 'h2',
      text: 'How Costs Are Shared, End to End',
    },
    {
      type: 'p',
      text: "Zooming out, the entire system is designed around shared risk over a plan year. You pay a predictable monthly premium regardless of how much care you use. When you do use care, the negotiated network rate sets the real price of the service. Your deductible determines how much of the early cost falls to you. Copays and coinsurance determine your share after that. And the out-of-pocket maximum caps your total exposure for the year, so a serious illness or injury can't create unlimited financial liability under covered, in-network care. Every plan combines these pieces differently, which is exactly why comparing plans on premium alone tends to miss the bigger picture.",
    },
    {
      type: 'p',
      text: "This guide is educational and general in nature — it isn't personalized insurance, legal, or tax advice. For the specifics of your own coverage, review your plan's Summary of Benefits and Coverage or speak directly with your insurer.",
    },
  ],
  faq: [
    {
      q: 'What is the difference between a premium and a deductible?',
      a: "A premium is the fixed amount you pay every month just to keep your coverage active, whether or not you use any care. A deductible is the amount you typically pay out of pocket for covered services before your plan starts sharing costs through copays or coinsurance. They're two separate, unrelated payments that both contribute to your total health care spending.",
    },
    {
      q: 'Do I have to meet my deductible before insurance pays anything?',
      a: "Not always. Many plans cover certain services — like preventive care, and sometimes a limited number of primary care or telehealth visits — with only a copay or no charge at all, even before your deductible is met. For most other services, though, you generally pay the full negotiated cost until you reach your deductible. Coverage details vary by plan, so check your Summary of Benefits and Coverage.",
    },
    {
      q: 'What happens once I hit my out-of-pocket maximum?',
      a: "Once your covered, in-network spending for the year reaches your plan's out-of-pocket maximum, your plan generally pays 100% of additional covered, in-network costs for the rest of that plan year. Premiums and most out-of-network costs typically don't count toward this limit. For 2026, the ACA maximum is $10,600 for an individual and $21,200 for a family.",
    },
    {
      q: 'Why does the same test cost different amounts at different providers?',
      a: "Because each provider has negotiated its own rate with your insurer, and that negotiated rate is what your cost-sharing is based on. An in-network provider's negotiated rate is typically lower than an out-of-network provider's charge, which is why the same test or procedure can cost you very different amounts depending on which provider you use.",
    },
    {
      q: 'Is coinsurance always worse than a copay?',
      a: "Not necessarily — it depends on the cost of the service. A flat copay is predictable regardless of the total bill, while coinsurance scales with cost, which can work in your favor for a cheap service and against you for an expensive one. Comparing the two requires knowing roughly what a service costs, which your insurer or provider can generally tell you in advance.",
    },
    {
      q: 'What is an Explanation of Benefits (EOB) and why did I get one?',
      a: "An EOB is a statement your insurer sends after processing a claim, showing what was billed, what the negotiated rate was, what your plan paid, and what portion (if any) you owe. It is not a bill — it's a record of how the claim was handled. The actual bill, if you owe anything, typically comes separately from your provider.",
    },
  ],
  internalLinks: [
    { slug: 'health-insurance-terms-glossary', label: 'Health Insurance Terms Explained' },
    { slug: 'what-is-a-health-insurance-deductible', label: 'What Is a Health Insurance Deductible?' },
    { slug: 'what-is-maximum-out-of-pocket', label: 'What Does Maximum Out-of-Pocket Mean?' },
    { slug: 'ppo-vs-hmo-vs-epo', label: 'PPO vs. HMO vs. EPO: Which Network Is Right for You?' },
    { slug: 'copay-vs-coinsurance', label: 'Copay vs. Coinsurance: What\'s the Difference?' },
  ],
  cta: { label: 'Understand Your Options', href: '/otp-landing' },
  image: {
    suggestion:
      'A clean, modern infographic-style photo or illustration showing a simple visual funnel of premium → deductible → copay/coinsurance → out-of-pocket maximum, or a warm photo of a patient reviewing a bill or benefits statement at home.',
    alt: 'Illustration of the health insurance cost-sharing process, from monthly premium through deductible, copay, coinsurance, and out-of-pocket maximum.',
  },
  sources: [
    { label: 'HealthCare.gov', url: 'https://www.healthcare.gov' },
    { label: 'CMS.gov — Marketplace Integrity and Affordability final rule (June 25, 2025)', url: 'https://www.cms.gov' },
    { label: 'IRS.gov — Rev. Proc. governing 2026 HSA/HDHP limits', url: 'https://www.irs.gov' },
    {
      label: '8 Big Changes Reshaping Marketplace Health Coverage in 2026 — healthinsurance.org',
      url: 'https://www.healthinsurance.org/blog/8-big-changes-reshaping-marketplace-health-coverage-in-2026/',
    },
    {
      label: '2026 Out-of-Pocket Expense Limits — WTW',
      url: 'https://www.wtwco.com/en-us/insights/2025/07/cms-releases-revised-2026-out-of-pocket-expense-limits',
    },
  ],
};
