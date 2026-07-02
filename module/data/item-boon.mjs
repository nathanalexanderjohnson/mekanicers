import MekanicersItemBase from "./base-item.mjs";

export default class MekanicersBoon extends MekanicersItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.type = new fields.StringField({ required: true, initial: "boon", choices: { boon: "MEKANICERS.Item.Boon.Boon", bane: "MEKANICERS.Item.Boon.Bane" } });
    schema.cost = new fields.NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 });

    return schema;
  }
}