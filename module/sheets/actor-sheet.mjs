import {
  onManageActiveEffect,
  prepareActiveEffectCategories,
} from '../helpers/effects.mjs';

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class MekanicersActorSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['mekanicers', 'sheet', 'actor'],
      width: 1000,
      height: 1000,
      tabs: [
        {
          navSelector: '.sheet-tabs',
          contentSelector: '.sheet-body',
          initial: 'features',
        },
      ],
    });
  }

  /** @override */
  get defaultOptions() {
    const options = super.defaultOptions;
    options.tabs[0].initial = this.actor.type === 'character' ? 'features' : 'stats';
    return options;
  }

  /** @override */
  get template() {
    return `systems/mekanicers/templates/actor/actor-${this.actor.type}-sheet.hbs`;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    const context = super.getData();

    // Use a safe clone of the actor data for further operations.
    const actorData = this.document.toPlainObject();

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = actorData.system;
    context.flags = actorData.flags;

    // Adding a pointer to CONFIG.MEKANICERS
    context.config = CONFIG.MEKANICERS;

    // Prepare character data and items.
    if (actorData.type == 'character') {
      this._prepareItems(context);
      this._prepareCharacterData(context);
    }

    // Prepare NPC data and items.
    if (actorData.type == 'npc') {
      this._prepareItems(context);
    }

    // Enrich biography info for display
    // Enrichment turns text like `[[/r 1d20]]` into buttons
    context.enrichedBiography = await TextEditor.enrichHTML(
      this.actor.system.biography,
      {
        // Whether to show secret blocks in the finished html
        secrets: this.document.isOwner,
        // Necessary in v11, can be removed in v12
        async: true,
        // Data to fill in for inline rolls
        rollData: this.actor.getRollData(),
        // Relative UUID resolution
        relativeTo: this.actor,
      }
    );

    // Prepare active effects
    context.effects = prepareActiveEffectCategories(
      // A generator that returns all effects stored on the actor
      // as well as any items
      this.actor.allApplicableEffects()
    );

    // Prepare skills grouped by category for the features tab sidebar
    context.skillGroups = Object.entries(CONFIG.MEKANICERS.skillGroups).map(
      ([groupKey, group]) => ({
        key: groupKey,
        label: group.label,
        skills: group.skills.map(skillKey => ({
          key: skillKey,
          value: context.system.skills[skillKey]?.value ?? 0,
          label: context.system.skills[skillKey]?.label ?? skillKey,
        })),
      })
    );

    return context;
  }

  /**
   * Character-specific context modifications
   *
   * @param {object} context The context object to mutate
   */
  _prepareCharacterData(context) {
    // Sort gifts and aspects by level for display
    if (context.system.gifts) {
      context.system.gifts.sort((a, b) => (a.level ?? 0) - (b.level ?? 0));
    }
    if (context.system.aspects) {
      context.system.aspects.sort((a, b) => (a.level ?? 0) - (b.level ?? 0));
    }
  }

  /**
   * Organize and classify Items for Actor sheets.
   *
   * @param {object} context The context object to mutate
   */
  _prepareItems(context) {
    // Initialize containers.
    const gear = [];
    const features = [];
    const maneuvers = [];
    const boons = [];
    const banes = [];
    const wounds = [];
    const armors = [];
    const gadgets = [];
    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || Item.DEFAULT_ICON;
      // Append to gear.
      if (i.type === 'item') {
        gear.push(i);
      }
      // Append to features.
      else if (i.type === 'feature') {
        features.push(i);
      }
      // Append to maneuvers.
      else if (i.type === 'maneuver') {
        maneuvers.push(i);
      }
      // Append to wounds.
      else if (i.type === 'wound') {
        wounds.push(i);
      }
      // Append to armors.
      else if (i.type === 'armor') {
        armors.push(i);
      }
      // Append to boons or banes.
      else if (i.type === 'boon') {
        if (i.system.type === 'boon') {
          boons.push(i);
        } else if (i.system.type === 'bane') {
          banes.push(i);
        }
      }
      // Append to gadgets.
      else if (i.type === 'gadget') {
        i.system.totalComplexity = this.actor.items.get(i._id)?.system?.totalComplexity ?? 0;
        gadgets.push(i);
      }
    }

    // Compute armor tracker — highest AV per location from all equipped armor pieces.
    const makeZone = () => ({ avb: 0, avp: 0, avs: 0 });
    const armorTracker = {
      head:  makeZone(),
      arms:  makeZone(),
      chest: makeZone(),
      legs:  makeZone(),
    };
    for (const armor of armors) {
      if (!armor.system.equipped) continue;
      const { avb, avp, avs } = armor.system;
      const zones = [
        [armor.system.locationHead,  armorTracker.head],
        [armor.system.locationArms,  armorTracker.arms],
        [armor.system.locationChest, armorTracker.chest],
        [armor.system.locationLegs,  armorTracker.legs],
      ];
      for (const [active, zone] of zones) {
        if (!active) continue;
        zone.avb = Math.max(zone.avb, avb);
        zone.avp = Math.max(zone.avp, avp);
        zone.avs = Math.max(zone.avs, avs);
      }
    }

    // Assign and return
    context.gear = gear;
    context.features = features;
    context.maneuvers = maneuvers;
    context.wounds = wounds;
    context.boons = boons;
    context.banes = banes;
    context.armors = armors;
    context.armorTracker = armorTracker;
    context.gadgets = gadgets;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Render the item sheet for viewing/editing prior to the editable check.
    html.on('click', '.item-edit', (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.items.get(li.data('itemId'));
      item.sheet.render(true);
    });

    // Post item to chat
    html.on('click', '.item-use', (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.items.get(li.data('itemId'));
      this._postItemToChat(item);
    });

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Add Inventory Item
    html.on('click', '.item-create', this._onItemCreate.bind(this));

    // Toggle wound bleeding (only meaningful when not treated)
    html.on('click', '.wound-toggle-bleeding', (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.items.get(li.data('itemId'));
      if (item.system.treated) return; // treated wounds cannot bleed
      item.update({ 'system.bleeding': !item.system.bleeding });
    });

    // Toggle wound treated; clearing bleeding at the same time
    html.on('click', '.wound-toggle-treated', (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.items.get(li.data('itemId'));
      const newTreated = !item.system.treated;
      const updates = { 'system.treated': newTreated };
      if (newTreated) updates['system.bleeding'] = false;
      item.update(updates);
    });

    // Toggle armor equipped state
    html.on('click', '.armor-toggle-equipped', (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.items.get(li.data('itemId'));
      item.update({ 'system.equipped': !item.system.equipped });
    });

    // Toggle individual armor location
    html.on('click', '.armor-toggle-location', (ev) => {
      const a = ev.currentTarget;
      const location = a.dataset.location;
      const li = $(a).parents('.item');
      const item = this.actor.items.get(li.data('itemId'));
      item.update({ [`system.${location}`]: !item.system[location] });
    });

    // Sorcerer curse dot rating
    html.on('click', '.sorcerer-curse-dot', (ev) => {
      const value = parseInt(ev.currentTarget.dataset.value);
      const current = this.actor.system.curse ?? 0;
      const newValue = current === value ? 0 : value;
      this.actor.update({ 'system.curse': newValue });
    });

    // Sorcerer curse title inline editing
    html.on('dblclick', '.curse-label-display', (ev) => {
      const wrapper = $(ev.currentTarget).closest('.curse-label-wrapper');
      wrapper.addClass('editing');
      wrapper.find('.curse-title-input').focus().select();
    });

    html.on('click', '.curse-title-save', (ev) => {
      const wrapper = $(ev.currentTarget).closest('.curse-label-wrapper');
      const newValue = wrapper.find('.curse-title-input').val();
      this.actor.update({ 'system.curseTitle': newValue });
      wrapper.removeClass('editing');
    });

    html.on('click', '.curse-title-cancel', (ev) => {
      $(ev.currentTarget).closest('.curse-label-wrapper').removeClass('editing');
    });

    html.on('keydown', '.curse-title-input', (ev) => {
      const wrapper = $(ev.currentTarget).closest('.curse-label-wrapper');
      if (ev.key === 'Enter') {
        const newValue = wrapper.find('.curse-title-input').val();
        this.actor.update({ 'system.curseTitle': newValue });
        wrapper.removeClass('editing');
      }
      if (ev.key === 'Escape') {
        wrapper.removeClass('editing');
      }
    });

    // Sorcerer spell core management
    html.on('click', '.sorcerer-spellcore-create', (ev) => {
      const circle = ev.currentTarget.dataset.circle;
      const arr = [...(this.actor.system.spellCores[circle] || [])];
      arr.push({ name: 'New Spell Core', fieldOfStudy: '' });
      this.actor.update({ [`system.spellCores.${circle}`]: arr });
    });

    html.on('click', '.sorcerer-spellcore-delete', (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const circle = li.data('circle');
      const index = li.data('index');
      const arr = [...(this.actor.system.spellCores[circle] || [])];
      arr.splice(index, 1);
      this.actor.update({ [`system.spellCores.${circle}`]: arr });
    });

    // Sorcerer aspect management
    html.on('click', '.sorcerer-aspect-create', (ev) => {
      const arr = [...(this.actor.system.aspects || [])];
      arr.push({ name: 'New Aspect', level: 0 });
      arr.sort((a, b) => (a.level ?? 0) - (b.level ?? 0));
      this.actor.update({ 'system.aspects': arr });
    });

    html.on('click', '.sorcerer-aspect-delete', (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const index = li.data('index');
      const arr = [...(this.actor.system.aspects || [])];
      arr.splice(index, 1);
      this.actor.update({ 'system.aspects': arr });
    });

    html.on('change', '.aspect-level', (ev) => {
      const arr = [...(this.actor.system.aspects || [])];
      arr.sort((a, b) => (a.level ?? 0) - (b.level ?? 0));
      this.actor.update({ 'system.aspects': arr });
    });

    // Sorcerer gift management
    html.on('click', '.sorcerer-gift-create', (ev) => {
      const arr = [...(this.actor.system.gifts || [])];
      arr.push({ name: 'New Gift', level: 0 });
      arr.sort((a, b) => (a.level ?? 0) - (b.level ?? 0));
      this.actor.update({ 'system.gifts': arr });
    });

    html.on('click', '.sorcerer-gift-delete', (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const index = li.data('index');
      const arr = [...(this.actor.system.gifts || [])];
      arr.splice(index, 1);
      this.actor.update({ 'system.gifts': arr });
    });

    html.on('change', '.gift-level', (ev) => {
      const arr = [...(this.actor.system.gifts || [])];
      arr.sort((a, b) => (a.level ?? 0) - (b.level ?? 0));
      this.actor.update({ 'system.gifts': arr });
    });

    // Mekanicer breakthrough management
    html.on('click', '.mekanicer-breakthrough-create', (ev) => {
      const field = ev.currentTarget.dataset.field;
      const arr = [...(this.actor.system.breakthroughs[field] || [])];
      arr.push({ name: 'New Breakthrough' });
      this.actor.update({ [`system.breakthroughs.${field}`]: arr });
    });

    html.on('click', '.mekanicer-breakthrough-delete', (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const field = li.data('field');
      const index = li.data('index');
      const arr = [...(this.actor.system.breakthroughs[field] || [])];
      arr.splice(index, 1);
      this.actor.update({ [`system.breakthroughs.${field}`]: arr });
    });

    // Mekanicer expertise management
    html.on('click', '.mekanicer-expertise-create', (ev) => {
      const field = ev.currentTarget.dataset.field;
      const arr = [...(this.actor.system.expertise[field] || [])];
      arr.push({ name: 'New Expertise' });
      this.actor.update({ [`system.expertise.${field}`]: arr });
    });

    html.on('click', '.mekanicer-expertise-delete', (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const field = li.data('field');
      const index = li.data('index');
      const arr = [...(this.actor.system.expertise[field] || [])];
      arr.splice(index, 1);
      this.actor.update({ [`system.expertise.${field}`]: arr });
    });

    // Mekanicer gadget management (gadgets are Foundry Items)
    html.on('click', '.mekanicer-gadget-create', async (ev) => {
      await Item.create({
        name: 'New Gadget',
        type: 'gadget',
        system: { baseBlueprint: '', baseComplexity: 0, wireType: 'copper', augments: [] }
      }, { parent: this.actor });
    });

    html.on('click', '.mekanicer-gadget-delete', (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.items.get(li.data('itemId'));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    html.on('click', '.mekanicer-gadget-edit', (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.items.get(li.data('itemId'));
      item.sheet.render(true);
    });

    html.on('click', '.gadget-toggle', (ev) => {
      const li = $(ev.currentTarget).closest('.gadget-item');
      li.toggleClass('expanded');
    });

    // Delete Inventory Item
    html.on('click', '.item-delete', (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.items.get(li.data('itemId'));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    // Active Effect management
    html.on('click', '.effect-control', (ev) => {
      const row = ev.currentTarget.closest('li');
      const document =
        row.dataset.parentId === this.actor.id
          ? this.actor
          : this.actor.items.get(row.dataset.parentId);
      onManageActiveEffect(ev, document);
    });

    // Rollable attributes and skills.
    html.on('click', '.rollable', this._onRoll.bind(this));

    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = (ev) => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains('inventory-header')) return;
        li.setAttribute('draggable', true);
        li.addEventListener('dragstart', handler, false);
      });
    }
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      system: data,
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system['type'];
    
    // Handle boon-type data (rename to 'type' for the system)
    if (itemData.system['boonType']) {
      itemData.system['type'] = itemData.system['boonType'];
      delete itemData.system['boonType'];
    }

    // Finally, create the item!
    return await Item.create(itemData, { parent: this.actor });
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    const formatRollContent = (roll, tn = null) => {
      const allDice = roll.dice.flatMap(die => die.results.map(r => r.result));
      const tens = allDice.filter(r => r === 10).length;
      const critCount = Math.floor(tens / 2);
      const hasCrit = critCount > 0;
      const totalSuccesses = roll.total + (critCount * 2);

      let effectiveTn = tn;
      if (effectiveTn === null && roll.formula) {
        const match = roll.formula.match(/cs>=?(\d+)/);
        if (match) effectiveTn = parseInt(match[1]);
      }

      const diceHtml = allDice.map(result => {
        const classes = ['die-box', 'd10'];
        if (effectiveTn !== null && result >= effectiveTn) classes.push('success');
        if (result === 10) classes.push('max');
        return `<div class="${classes.join(' ')}">${result}</div>`;
      }).join('');

      const critHtml = hasCrit
        ? ` <span class="crit-tag">+${critCount * 2} CRIT${critCount > 1 ? 'S' : ''}</span>`
        : '';

      return `
        <div class="mekanicers-roll-result">
          <div class="dice-pool">${diceHtml}</div>
          <div class="success-summary ${hasCrit ? 'crit' : ''}">
            <span class="success-count">${totalSuccesses}</span> Successes${critHtml}
          </div>
        </div>
      `;
    };

    // Handle item rolls.
    if (dataset.rollType) {
      if (dataset.rollType == 'item') {
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) return item.roll();
      }
    }

    // Handle rolls that supply the formula directly.
    if (dataset.roll) {
      const label = dataset.label ? `[check] ${dataset.label}` : '';
      const roll = new Roll(dataset.roll, this.actor.getRollData());
      await roll.evaluate();
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label,
        content: formatRollContent(roll),
        rollMode: game.settings.get('core', 'rollMode'),
        flags: {
          mekanicers: {
            actorId: this.actor.id,
            tn: (() => {
              const match = roll.formula.match(/cs>=?(\d+)/);
              return match ? parseInt(match[1]) : null;
            })(),
          },
        },
      });
      return roll;
    }

    // Handle attribute and skill rolls
    if (dataset.rollType === 'attribute' || dataset.rollType === 'skill') {
      const key = dataset.key;
      const rollData = this.actor.getRollData();
      const value = rollData[key]?.value;
      if (!value) return;

      // Build options for second attribute/skill selector
      const buildOptions = () => {
        let options = '<option value="">None (Single Roll)</option>';
        
        // Add attributes
        for (const [attrKey, attrLabel] of Object.entries(CONFIG.MEKANICERS.attributes)) {
          const displayName = game.i18n.localize(attrLabel);
          const abbr = game.i18n.localize(CONFIG.MEKANICERS.attributeAbbreviations[attrKey]);
          options += `<option value="${attrKey}">${displayName} (${abbr})</option>`;
        }
        
        // Add skills
        for (const [skillKey, skillLabel] of Object.entries(CONFIG.MEKANICERS.skills)) {
          const displayName = game.i18n.localize(skillLabel);
          options += `<option value="${skillKey}">${displayName}</option>`;
        }
        
        return options;
      };

      // Show dialog for target number, dice modifier, and second attribute/skill
      const dialogContent = `
        <form>
          <div class="form-group">
            <label>Target Number:</label>
            <input type="number" name="tn" value="6" min="1" max="10"/>
          </div>
          <div class="form-group">
            <label>Dice Modifier:</label>
            <input type="number" name="diceMod" value="0"/>
          </div>
          <div class="form-group">
            <label>Combine with (optional):</label>
            <select name="secondKey">${buildOptions()}</select>
          </div>
        </form>
      `;

      new Dialog({
        title: `Roll ${dataset.label}`,
        content: dialogContent,
        classes: ['mekanicers', 'mekanicers-roll-dialog'],
        buttons: {
          roll: {
            label: "Roll",
            callback: async (html) => {
              const tn = parseInt(html.find('[name="tn"]').val()) || 6;
              const diceMod = parseInt(html.find('[name="diceMod"]').val()) || 0;
              const secondKey = html.find('[name="secondKey"]').val();

              let totalDice = value;
              let flavor = `${dataset.label} (TN ${tn})`;

              if (secondKey) {
                const secondValue = rollData[secondKey]?.value;
                if (secondValue) {
                  totalDice += secondValue;

                  // Determine display name for second key
                  let secondLabel = '';
                  if (CONFIG.MEKANICERS.attributes[secondKey]) {
                    secondLabel = game.i18n.localize(CONFIG.MEKANICERS.attributes[secondKey]);
                  } else if (CONFIG.MEKANICERS.skills[secondKey]) {
                    secondLabel = game.i18n.localize(CONFIG.MEKANICERS.skills[secondKey]);
                  }

                  flavor = `${dataset.label} + ${secondLabel} (TN ${tn})`;
                }
              }

              // Apply dice modifier and add it to the flavor text
              if (diceMod !== 0) {
                totalDice += diceMod;
                const modSign = diceMod > 0 ? `+${diceMod}` : `${diceMod}`;
                flavor += ` [${modSign} dice]`;
              }

              // Ensure we never roll fewer than 1 die
              totalDice = Math.max(1, totalDice);

              const formula = `${totalDice}d10cs>=${tn}`;
              const roll = new Roll(formula, rollData);
              await roll.evaluate();
              roll.toMessage({
                speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                flavor: flavor,
                content: formatRollContent(roll, tn),
                rollMode: game.settings.get('core', 'rollMode'),
                flags: {
                  mekanicers: {
                    actorId: this.actor.id,
                    tn: tn,
                  },
                },
              });
            }
          }
        },
        default: "roll"
      }).render(true);
      return;
    }
  }

  /**
   * Post an item to chat
   * @param {Item} item The item to post
   * @private
   */
  async _postItemToChat(item) {
    const enrichedDescription = await TextEditor.enrichHTML(
      item.system.description,
      {
        secrets: this.document.isOwner,
        async: true,
        rollData: this.actor.getRollData(),
        relativeTo: item,
      }
    );

    let content = '';
    
    // Add tags if present
    if (item.system.tags && item.system.tags.length > 0) {
      content += `<div class="tags-section"><strong>Tags:</strong> ${item.system.tags.join(', ')}</div>`;
    }
    
    // Add description
    content += enrichedDescription;

    const chatData = {
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: item.name,
      content: content,
      rollMode: game.settings.get('core', 'rollMode'),
    };

    ChatMessage.create(chatData);
  }
}
