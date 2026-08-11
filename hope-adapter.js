/*
  Hope Specialist Adapter
  Version: 0.1.0
  Architecture: Noema -> NAIB -> Hope

  Hope is a compassionate companion and community navigator.
  This adapter is intentionally handoff-only.
  It does not grant permissions, perform remote execution,
  silently persist long-term memory, store sensitive documents,
  or guarantee eligibility, availability, funding, appointments, or outcomes.
*/

const MODES = Object.freeze([
  "listen",
  "stabilize",
  "navigate",
  "plan",
  "prepare"
]);

const NEED_DOMAINS = Object.freeze([
  {
    id: "family-caregiving",
    label: "Families & Caregivers",
    terms: [
      "family", "caregiver", "caregiving", "parent", "child",
      "household", "dependent", "family support"
    ]
  },
  {
    id: "veterans",
    label: "Veterans & Military Families",
    terms: [
      "veteran", "military", "va", "service member",
      "military family", "veterans benefits"
    ]
  },
  {
    id: "seniors",
    label: "Seniors & Older Adults",
    terms: [
      "senior", "older adult", "elder", "aging",
      "retirement", "medicare", "care for parent"
    ]
  },
  {
    id: "housing",
    label: "Housing & Shelter",
    terms: [
      "housing", "homeless", "homelessness", "shelter", "rent",
      "eviction", "landlord", "utilities", "temporary housing"
    ]
  },
  {
    id: "basic-needs",
    label: "Food & Basic Needs",
    terms: [
      "food", "groceries", "meal", "pantry", "clothing",
      "basic needs", "supplies", "transportation"
    ]
  },
  {
    id: "health-resources",
    label: "Health & Medication Resources",
    terms: [
      "health", "doctor", "clinic", "hospital", "medicine",
      "medication", "prescription", "insurance", "mental health"
    ]
  },
  {
    id: "benefits-financial",
    label: "Benefits & Financial Stability",
    terms: [
      "benefit", "benefits", "financial", "money", "income",
      "assistance", "disability", "snap", "ssi", "ssdi",
      "unemployment", "utility assistance"
    ]
  },
  {
    id: "employment-training",
    label: "Employment & Training",
    terms: [
      "job", "work", "employment", "career", "training",
      "resume", "interview", "workforce"
    ]
  },
  {
    id: "education",
    label: "Education",
    terms: [
      "school", "education", "student", "college", "ged",
      "class", "course", "training program", "tuition"
    ]
  },
  {
    id: "documents",
    label: "Identification & Documents",
    terms: [
      "id", "identification", "birth certificate", "social security",
      "document", "documents", "records", "proof of address"
    ]
  },
  {
    id: "legal-resources",
    label: "Legal Resource Preparation",
    terms: [
      "legal", "lawyer", "attorney", "court", "rights",
      "legal aid", "notice", "hearing", "appeal"
    ]
  },
  {
    id: "transition-planning",
    label: "Practical Transition Planning",
    terms: [
      "transition", "moving", "separation", "discharge", "release",
      "relocation", "crisis plan", "next step"
    ]
  }
]);

const RESOURCE_HINTS = Object.freeze([
  {
    id: "family-center",
    label: "Khaemenes Family Center",
    domains: ["family-caregiving", "education"]
  },
  {
    id: "veterans-hub",
    label: "Veterans Hub",
    domains: ["veterans", "health-resources", "housing", "employment-training"]
  },
  {
    id: "one-door",
    label: "One Door",
    domains: ["housing", "basic-needs", "documents", "benefits-financial"]
  },
  {
    id: "verifier",
    label: "The Verifier",
    domains: [
      "health-resources", "benefits-financial", "legal-resources",
      "housing", "documents", "veterans", "seniors"
    ]
  },
  {
    id: "khaemenes",
    label: "Khaemenes Academy",
    domains: ["education", "family-caregiving", "employment-training"]
  },
  {
    id: "plera-search",
    label: "PLERA Search",
    domains: [
      "housing", "basic-needs", "health-resources", "benefits-financial",
      "employment-training", "education", "documents", "legal-resources",
      "seniors", "veterans", "family-caregiving"
    ]
  }
]);

const BOUNDARIES = Object.freeze([
  "no-administrative-authority",
  "no-permission-elevation",
  "no-guaranteed-outcome-claims",
  "no-eligibility-guarantees",
  "no-availability-guarantees",
  "no-medical-diagnosis",
  "no-legal-representation",
  "no-emergency-service-impersonation",
  "no-sensitive-document-storage",
  "no-silent-long-term-memory",
  "no-remote-execution-claims",
  "preserve-user-choice-and-dignity"
]);

const URGENCY_TERMS = Object.freeze({
  emergency: [
    "immediate danger",
    "life threatening",
    "can't breathe",
    "cannot breathe",
    "overdose",
    "unconscious",
    "severe bleeding",
    "active fire",
    "someone is attacking",
    "being attacked"
  ],
  urgent: [
    "tonight", "today", "now", "no food", "no shelter", "locked out",
    "eviction today", "medication ran out", "without medication",
    "utilities shut off", "unsafe place", "nowhere to stay"
  ]
});

function normalize(value = "") {
  return String(value ?? "").trim().toLowerCase();
}

function normalizeMode(value = "listen") {
  const mode = normalize(value);
  return MODES.includes(mode) ? mode : "listen";
}

function scoreDomain(domain, text) {
  return domain.terms.reduce(
    (score, term) => score + (text.includes(term) ? 1 : 0),
    0
  );
}

function detectNeeds(message = "") {
  const text = normalize(message);

  return NEED_DOMAINS
    .map(domain => ({
      id: domain.id,
      label: domain.label,
      score: scoreDomain(domain, text)
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label));
}

function detectUrgency(message = "") {
  const text = normalize(message);

  if (URGENCY_TERMS.emergency.some(term => text.includes(term))) {
    return {
      level: "emergency",
      requiresImmediateQualifiedHelp: true,
      note:
        "Hope is not an emergency service. Immediate safety or medical emergencies require the appropriate local emergency or qualified service."
    };
  }

  if (URGENCY_TERMS.urgent.some(term => text.includes(term))) {
    return {
      level: "urgent",
      requiresImmediateQualifiedHelp: false,
      note:
        "The situation appears time-sensitive. Current availability and authoritative information should be checked before relying on a resource."
    };
  }

  return {
    level: "routine",
    requiresImmediateQualifiedHelp: false,
    note:
      "No emergency signal was identified by this lightweight intake. This is not a clinical or legal assessment."
  };
}

function rankResourceHints(needs = []) {
  const domainIds = new Set(needs.map(item => item.id));

  return RESOURCE_HINTS
    .map(resource => ({
      id: resource.id,
      label: resource.label,
      score: resource.domains.reduce(
        (score, domain) => score + (domainIds.has(domain) ? 1 : 0),
        0
      )
    }))
    .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label));
}

function chooseResourceHints(needs = [], limit = 4) {
  const ranked = rankResourceHints(needs);
  const positive = ranked.filter(item => item.score > 0);
  return (positive.length ? positive : ranked).slice(0, limit);
}

function requiresVerifier(needs = [], urgency = {}) {
  const consequentialDomains = new Set([
    "health-resources",
    "benefits-financial",
    "legal-resources",
    "housing",
    "documents",
    "veterans",
    "seniors"
  ]);

  return (
    urgency.level !== "routine" ||
    needs.some(item => consequentialDomains.has(item.id))
  );
}

function buildFirstStep(needs = [], urgency = {}) {
  if (urgency.level === "emergency") {
    return "Address immediate safety first through the appropriate qualified local service before continuing resource navigation.";
  }

  if (urgency.level === "urgent") {
    return "Identify the single most time-sensitive need, then verify a current authoritative resource before making the next move.";
  }

  if (!needs.length) {
    return "Name the one thing that would make today more manageable, then organize the next step around that need.";
  }

  return `Start with ${needs[0].label.toLowerCase()} and keep one backup pathway visible.`;
}

export const HopeAdapter = Object.freeze({
  id: "hope",
  name: "Hope",
  version: "0.1.0",

  capabilities: Object.freeze([
    "compassionate-intake",
    "needs-triage",
    "urgency-awareness",
    "family-and-caregiver-navigation",
    "veteran-resource-navigation",
    "senior-resource-navigation",
    "housing-and-shelter-navigation",
    "basic-needs-navigation",
    "health-resource-navigation",
    "benefits-and-financial-navigation",
    "employment-and-training-navigation",
    "education-navigation",
    "document-preparation-guidance",
    "legal-resource-preparation",
    "transition-planning",
    "question-preparation",
    "backup-option-planning",
    "structured-resource-handoff"
  ]),

  availability: "handoff-ready",
  authority: "compassionate-community-navigation-and-resource-handoff",
  boundaries: BOUNDARIES,

  canExecute() {
    return {
      allowed: false,
      reason: "handoff-ready-specialist",
      note:
        "Hope can prepare a humane resource-navigation handoff, but cannot execute external services, approve benefits, make appointments, or guarantee outcomes."
    };
  },

  prepare(context = {}) {
    const message = String(context.message ?? context.query ?? "");
    const mode = normalizeMode(context.mode);
    const needs = detectNeeds(message);
    const urgency = detectUrgency(message);
    const resourceHints = chooseResourceHints(needs);
    const verifierRequired = requiresVerifier(needs, urgency);

    return {
      specialist: "hope",
      version: "0.1.0",
      status: "prepared",
      mode,
      principle: "Receive · Listen · Connect · Follow Through",
      sourceText: message,
      needs,
      urgency,
      firstStep: buildFirstStep(needs, urgency),
      resourceHints,
      verifierRequired,
      requiresUserAction: true,
      requiresFederationResolution: true,
      authority: this.authority,
      boundaries: [...BOUNDARIES],
      memory: {
        persistent: false,
        sensitiveDocumentStorage: false,
        note:
          "This adapter does not silently store conversation history, long-term personal memory, identity documents, or sensitive case records."
      },
      outcomeClaims: {
        eligibilityGuaranteed: false,
        availabilityGuaranteed: false,
        fundingGuaranteed: false,
        appointmentGuaranteed: false,
        outcomeGuaranteed: false
      },
      dignity: {
        principle:
          "Offer choices without pressure, keep the first step manageable, and preserve the person's own decisions."
      },
      verification: {
        required: verifierRequired,
        note:
          verifierRequired
            ? "Current, changing, disputed, medical, legal, benefits, eligibility, or other consequential information should be verified through Noema's approved Verifier/research layer."
            : "If facts become time-sensitive or consequential, route through Noema's approved Verifier/research layer."
      },
      resourceRelationship: {
        role: "navigator",
        ownsResources: false,
        controlsResources: false,
        note:
          "Resource hints are identifiers only. Noema's approved federation resolves authoritative destinations."
      }
    };
  },

  async execute(context = {}) {
    return {
      specialist: "hope",
      version: "0.1.0",
      status: "handoff-required",
      executed: false,
      prepared: this.prepare(context),
      note:
        "No external service, application, appointment, benefit action, emergency action, or remote resource was executed."
    };
  }
});

export function getHopeNeeds(message = "") {
  return detectNeeds(message);
}

export function getHopeUrgency(message = "") {
  return detectUrgency(message);
}

export function getHopeResourceHints(message = "", limit = 4) {
  const needs = detectNeeds(message);
  const safeLimit = Math.max(
    1,
    Math.min(Number(limit) || 4, RESOURCE_HINTS.length)
  );
  return chooseResourceHints(needs, safeLimit);
}

export function getHopeModes() {
  return [...MODES];
}

export default HopeAdapter;
