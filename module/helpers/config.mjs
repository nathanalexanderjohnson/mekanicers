export const MEKANICERS = {};

/**
 * Body locations shared by wounds (single-value dropdown) and armor (per-location checkboxes).
 * Each entry exposes:
 *   label – the human-readable name used as the wound bodyLocation value and display text.
 *   field – the corresponding boolean field name on the armor data model.
 * @type {Array<{label: string, field: string}>}
 */
MEKANICERS.bodyLocations = [
  { label: 'Head',  field: 'locationHead'  },
  { label: 'Arms',  field: 'locationArms'  },
  { label: 'Chest', field: 'locationChest' },
  { label: 'Legs',  field: 'locationLegs'  },
];

/**
 * The set of Attributes used within the system.
 * @type {Object}
 */
MEKANICERS.attributes = {
  str: 'MEKANICERS.Attribute.Str.long',
  agi: 'MEKANICERS.Attribute.Agi.long',
  end: 'MEKANICERS.Attribute.End.long',
  wil: 'MEKANICERS.Attribute.Wil.long',
  wit: 'MEKANICERS.Attribute.Wit.long',
  ins: 'MEKANICERS.Attribute.Ins.long',
};

MEKANICERS.attributeAbbreviations = {
  str: 'MEKANICERS.Attribute.Str.abbr',
  agi: 'MEKANICERS.Attribute.Agi.abbr',
  end: 'MEKANICERS.Attribute.End.abbr',
  wil: 'MEKANICERS.Attribute.Wil.abbr',
  wit: 'MEKANICERS.Attribute.Wit.abbr',
  ins: 'MEKANICERS.Attribute.Ins.abbr',
};

/**
 * The set of Skills used within the system.
 * @type {Object}
 */
MEKANICERS.skills = {
  athletics: 'MEKANICERS.Skill.Athletics',
  unarmed: 'MEKANICERS.Skill.Unarmed',
  melee: 'MEKANICERS.Skill.Melee',
  ranged: 'MEKANICERS.Skill.Ranged',
  stealth: 'MEKANICERS.Skill.Stealth',
  survival: 'MEKANICERS.Skill.Survival',
  riding: 'MEKANICERS.Skill.Riding',
  persuasion: 'MEKANICERS.Skill.Persuasion',
  intimidation: 'MEKANICERS.Skill.Intimidation',
  subterfuge: 'MEKANICERS.Skill.Subterfuge',
  performance: 'MEKANICERS.Skill.Performance',
  etiquette: 'MEKANICERS.Skill.Etiquette',
  awareness: 'MEKANICERS.Skill.Awareness',
  empathy: 'MEKANICERS.Skill.Empathy',
  leadership: 'MEKANICERS.Skill.Leadership',
  tactics: 'MEKANICERS.Skill.Tactics',
  scholarship: 'MEKANICERS.Skill.Scholarship',
  stewardship: 'MEKANICERS.Skill.Stewardship',
  crafting: 'MEKANICERS.Skill.Crafting',
  medicine: 'MEKANICERS.Skill.Medicine',
};

/**
 * Canonical list of maneuver tags available system-wide.
 * These are merged with any tags found on existing world maneuver items
 * when building the tag picker in the maneuver sheet.
 * @type {string[]}
 */
MEKANICERS.maneuverTags = [
  'Attack',
  'Area',
  'Defensive',
  'Disarm',
  'Grapple',
  'Melee',
  'Movement',
  'Offensive',
  'Ranged',
  'Reaction',
  'Social',
  'Support',
  'Utility',
];

/**
 * Skills grouped by category for display on the character sheet.
 * @type {Object}
 */
MEKANICERS.skillGroups = {
  physical: {
    label: 'Physical',
    skills: ['athletics', 'unarmed', 'melee', 'ranged', 'stealth', 'survival', 'riding'],
  },
  social: {
    label: 'Social',
    skills: ['persuasion', 'intimidation', 'subterfuge', 'performance', 'etiquette', 'awareness', 'empathy'],
  },
  professional: {
    label: 'Professional',
    skills: ['leadership', 'tactics', 'scholarship', 'stewardship', 'crafting', 'medicine'],
  },
};
