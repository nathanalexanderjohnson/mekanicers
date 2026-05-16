/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  return loadTemplates([
    // Actor partials.
    'systems/mekanicers/templates/actor/parts/actor-features.hbs',
    'systems/mekanicers/templates/actor/parts/actor-items.hbs',
    'systems/mekanicers/templates/actor/parts/actor-boons.hbs',
    'systems/mekanicers/templates/actor/parts/actor-maneuvers.hbs',
    'systems/mekanicers/templates/actor/parts/actor-effects.hbs',
    'systems/mekanicers/templates/actor/parts/actor-armor.hbs',
    'systems/mekanicers/templates/actor/parts/actor-armor-tracker.hbs',
    // Item partials
    'systems/mekanicers/templates/item/parts/item-effects.hbs',
  ]);
};
