import { Container, Graphics, Text, TextStyle } from "pixi.js";
import { RESOURCE_TYPES, createResourceStore, addResource } from "./resources.js";

const BASE_ACTION_OPTIONS = ["Use", "Drop", "Mark for Trade"];
const RED_ORE_ACTION_OPTIONS = ["Use", "Convert to Fuel", "Drop", "Mark for Trade"];

export function createInventorySystem(screenWidth, screenHeight) {
  const container = new Container();
  container.visible = false;

  const state = {
    isOpen: false,
    selectedIndex: 0,
    actionMenuOpen: false,
    selectedActionIndex: 0,
    fuel: 100,
    resources: createResourceStore()
  };

  const panel = new Graphics();
  panel.roundRect(0, 0, 340, 240, 12);
  panel.fill({ color: 0x050814, alpha: 0.92 });
  panel.stroke({ color: 0x66aaff, width: 2 });
  panel.x = (screenWidth - 340) / 2;
  panel.y = (screenHeight - 240) / 2;
  container.addChild(panel);

  const title = new Text({
    text: "Inventory (I)",
    style: new TextStyle({ fill: 0xffffff, fontSize: 20, fontWeight: "bold" })
  });
  title.x = panel.x + 16;
  title.y = panel.y + 14;
  container.addChild(title);

  const hint = new Text({
    text: "↑/↓ item  |  Space menu/action  |  ←/→ action",
    style: new TextStyle({ fill: 0xa8b2cc, fontSize: 12 })
  });
  hint.x = panel.x + 16;
  hint.y = panel.y + 42;
  container.addChild(hint);

  const rowTexts = [];
  const resourceList = Object.values(RESOURCE_TYPES);
  resourceList.forEach((resource, index) => {
    const row = new Text({
      text: "",
      style: new TextStyle({ fill: 0xffffff, fontSize: 18 })
    });
    row.x = panel.x + 20;
    row.y = panel.y + 72 + index * 34;
    rowTexts.push(row);
    container.addChild(row);
  });

  const menuText = new Text({
    text: "",
    style: new TextStyle({ fill: 0x8de7ff, fontSize: 13 })
  });
  menuText.x = panel.x + 20;
  menuText.y = panel.y + 72 + rowTexts.length * 34 + 8;
  container.addChild(menuText);

  function getSelectedResource() {
    return resourceList[state.selectedIndex] ?? null;
  }

  function getActionOptions() {
    const selectedResource = getSelectedResource();
    if (!selectedResource) return BASE_ACTION_OPTIONS;
    return selectedResource.id === "red_ore" ? RED_ORE_ACTION_OPTIONS : BASE_ACTION_OPTIONS;
  }

  function executeSelectedAction() {
    const selectedResource = getSelectedResource();
    if (!selectedResource) return;

    const actions = getActionOptions();
    const action = actions[state.selectedActionIndex];
    if (action === "Convert to Fuel" && selectedResource.id === "red_ore") {
      if ((state.resources.red_ore ?? 0) > 0) {
        state.resources.red_ore -= 1;
        state.fuel += 1;
      }
    }
  }

  function updateUI() {
    rowTexts.forEach((row, index) => {
      const resource = resourceList[index];
      const amount = state.resources[resource.id] ?? 0;
      const isSelected = state.selectedIndex === index;
      row.text = `${isSelected ? "▶ " : "  "}${resource.icon} ${resource.name}   x${amount}`;
      row.style.fill = isSelected ? 0x9de3ff : 0xffffff;
    });

    if (!state.actionMenuOpen) {
      menuText.text = "";
      return;
    }

    const actions = getActionOptions();
    menuText.text = actions
      .map((action, index) => (index === state.selectedActionIndex ? `[${action}]` : action))
      .join("  |  ");
  }

  function toggle() {
    state.isOpen = !state.isOpen;
    container.visible = state.isOpen;
    if (!state.isOpen) {
      state.actionMenuOpen = false;
      state.selectedActionIndex = 0;
    }
    updateUI();
  }

  function moveSelection(delta) {
    if (!state.isOpen || rowTexts.length === 0) return;
    state.selectedIndex = (state.selectedIndex + delta + rowTexts.length) % rowTexts.length;
    state.actionMenuOpen = false;
    state.selectedActionIndex = 0;
    updateUI();
  }

  function moveActionSelection(delta) {
    if (!state.isOpen || !state.actionMenuOpen) return;
    const actions = getActionOptions();
    if (actions.length === 0) return;
    state.selectedActionIndex = (state.selectedActionIndex + delta + actions.length) % actions.length;
    updateUI();
  }

  function triggerActionMenu() {
    if (!state.isOpen) return;
    if (!state.actionMenuOpen) {
      state.actionMenuOpen = true;
      state.selectedActionIndex = 0;
    } else {
      executeSelectedAction();
      state.actionMenuOpen = false;
      state.selectedActionIndex = 0;
    }
    updateUI();
  }

  function add(resourceId, amount = 1) {
    addResource(state.resources, resourceId, amount);
    updateUI();
  }

  updateUI();

  return {
    container,
    state,
    toggle,
    moveSelection,
    moveActionSelection,
    triggerActionMenu,
    add
  };
}
