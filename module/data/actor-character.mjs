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

    schema.magicType = new fields.StringField({
      required: true,
      initial: 'none',
      choices: ['none', 'mekanicer', 'sorcerer']
    });

    schema.thesis = new fields.StringField({
      required: true,
      blank: true
    });

    schema.arithmeticSpark = new fields.NumberField({
      ...requiredInteger,
      initial: 0,
      min: 0,
      max: 10
    });

    schema.flux = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      max: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 })
    });

    schema.breakthroughs = new fields.SchemaField({
      kinetics: new fields.ArrayField(
        new fields.SchemaField({
          name: new fields.StringField({ initial: '' })
        })
      ),
      matrices: new fields.ArrayField(
        new fields.SchemaField({
          name: new fields.StringField({ initial: '' })
        })
      ),
      thermalworks: new fields.ArrayField(
        new fields.SchemaField({
          name: new fields.StringField({ initial: '' })
        })
      )
    });

    schema.expertise = new fields.SchemaField({
      kinetics: new fields.ArrayField(
        new fields.SchemaField({
          name: new fields.StringField({ initial: '' })
        })
      ),
      matrices: new fields.ArrayField(
        new fields.SchemaField({
          name: new fields.StringField({ initial: '' })
        })
      ),
      thermalworks: new fields.ArrayField(
        new fields.SchemaField({
          name: new fields.StringField({ initial: '' })
        })
      )
    });



    schema.curse = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 5 });
    schema.curseTitle = new fields.StringField({ required: true, blank: true, initial: 'Curse' });

    schema.arcaneMight = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 10 });

    schema.sorcererSource = new fields.StringField({ required: true, blank: true, initial: '' });

    schema.fieldOfStudy = new fields.StringField({ required: true, blank: true, initial: '' });

    schema.senseTheUnseen = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 })
    });

    schema.arcaneLore = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 })
    });

    schema.scourge = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      max: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 })
    });

    schema.mentalStrain = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      max: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 })
    });

    const makeSpellCoreEntry = () => new fields.SchemaField({
      name: new fields.StringField({ initial: '' }),
      fieldOfStudy: new fields.StringField({ initial: '' })
    });

    schema.spellCores = new fields.SchemaField({
      first:   new fields.ArrayField(makeSpellCoreEntry()),
      second:  new fields.ArrayField(makeSpellCoreEntry()),
      third:   new fields.ArrayField(makeSpellCoreEntry()),
      fourth:  new fields.ArrayField(makeSpellCoreEntry()),
      fifth:   new fields.ArrayField(makeSpellCoreEntry()),
      sixth:   new fields.ArrayField(makeSpellCoreEntry()),
      seventh: new fields.ArrayField(makeSpellCoreEntry())
    });

    schema.gifts = new fields.ArrayField(
      new fields.SchemaField({
        name: new fields.StringField({ initial: '' }),
        level: new fields.NumberField({ initial: 0, min: 0, integer: true })
      })
    );

    schema.aspects = new fields.ArrayField(
      new fields.SchemaField({
        name: new fields.StringField({ initial: '' }),
        level: new fields.NumberField({ initial: 0, min: 0, integer: true })
      })
    );

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