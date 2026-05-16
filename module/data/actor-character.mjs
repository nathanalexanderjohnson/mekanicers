import MekanicersActorBase from "./base-actor.mjs";

export default class MekanicersCharacter extends MekanicersActorBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.level = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 1 })
    });

    schema.combatantRank = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 1, min: 0 })
    });

    schema.reputation = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 })
    });

    schema.pain = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      max: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 })
    });

    schema.stress = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      max: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 })
    });

    schema.stamina = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      max: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 })
    });

    schema.carryingCapacity = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      max: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 })
    });

    schema.speed = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 5, min: 0 })
    });

    schema.luck = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      max: new fields.NumberField({ ...requiredInteger, initial: 3, min: 0 })
    });

    schema.xp = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      max: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 })
    });

    return schema;
  }

  prepareDerivedData() {
    // Loop through attributes, and add their modifiers to our sheet output.
    for (const key in this.attributes) {
      // Calculate the modifier using d20 rules.
      this.attributes[key].mod = Math.floor((this.attributes[key].value - 10) / 2);
      // Handle attribute label localization.
      this.attributes[key].label = game.i18n.localize(CONFIG.MEKANICERS.attributes[key]) ?? key;
    }

    // Loop through skills
    for (const key in this.skills) {
      this.skills[key].label = game.i18n.localize(CONFIG.MEKANICERS.skills[key]) ?? key;
    }

    const rank = this.combatantRank?.value ?? 0;
    const strength = this.attributes?.str?.value ?? 0;
    const endurance = this.attributes?.end?.value ?? 0;
    const will = this.attributes?.wil?.value ?? 0;
    const insight = this.attributes?.ins?.value ?? 0;

    if (this.pain) {
      this.pain.value = 0;
      this.pain.max = rank + endurance + will;
    }

    if (this.stress) {
      this.stress.max = 4 + insight + will;
    }

    if (this.stamina) {
      this.stamina.max = strength + endurance + (2 * rank);
    }

    if (this.carryingCapacity) {
      this.carryingCapacity.value = 0;
      this.carryingCapacity.max = 4 + strength + endurance;
    }
  }

  getRollData() {
    const data = super.getRollData();

    data.lvl = this.level.value;

    return data
  }
}