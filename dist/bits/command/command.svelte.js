import { afterSleep, afterTick, srOnlyStyles, useRefById } from "svelte-toolbelt";
import { Context, watch } from "runed";
import { findNextSibling, findPreviousSibling } from "./utils.js";
import { kbd } from "../../internal/kbd.js";
import { getAriaDisabled, getAriaExpanded, getAriaSelected, getDataDisabled, getDataSelected, } from "../../internal/attrs.js";
import { getFirstNonCommentChild } from "../../internal/dom.js";
import { computeCommandScore } from "./index.js";
import { noop } from "../../internal/noop.js";
// attributes
const COMMAND_ROOT_ATTR = "data-command-root";
const COMMAND_LIST_ATTR = "data-command-list";
const COMMAND_INPUT_ATTR = "data-command-input";
const COMMAND_SEPARATOR_ATTR = "data-command-separator";
const COMMAND_LOADING_ATTR = "data-command-loading";
const COMMAND_EMPTY_ATTR = "data-command-empty";
const COMMAND_GROUP_ATTR = "data-command-group";
const COMMAND_GROUP_ITEMS_ATTR = "data-command-group-items";
const COMMAND_GROUP_HEADING_ATTR = "data-command-group-heading";
const COMMAND_ITEM_ATTR = "data-command-item";
const COMMAND_VIEWPORT_ATTR = "data-command-viewport";
const COMMAND_INPUT_LABEL_ATTR = "data-command-input-label";
const COMMAND_VALUE_ATTR = "data-value";
// selectors
const COMMAND_GROUP_SELECTOR = `[${COMMAND_GROUP_ATTR}]`;
const COMMAND_GROUP_ITEMS_SELECTOR = `[${COMMAND_GROUP_ITEMS_ATTR}]`;
const COMMAND_GROUP_HEADING_SELECTOR = `[${COMMAND_GROUP_HEADING_ATTR}]`;
const COMMAND_ITEM_SELECTOR = `[${COMMAND_ITEM_ATTR}]`;
const COMMAND_VALID_ITEM_SELECTOR = `${COMMAND_ITEM_SELECTOR}:not([aria-disabled="true"])`;
const CommandRootContext = new Context("Command.Root");
const CommandListContext = new Context("Command.List");
const CommandGroupContainerContext = new Context("Command.Group");
const defaultState = {
    /** Value of the search query */
    search: "",
    /** Currently selected item value */
    value: "",
    filtered: {
        /** The count of all visible items. */
        count: 0,
        /** Map from visible item id to its search store. */
        items: new Map(),
        /** Set of groups with at least one visible item. */
        groups: new Set(),
    },
};
class CommandRootState {
    opts;
    #updateScheduled = false;
    sortAfterTick = false;
    sortAndFilterAfterTick = false;
    allItems = new Set();
    allGroups = new Map();
    allIds = new Map();
    // attempt to prevent the harsh delay when user is typing fast
    key = $state(0);
    viewportNode = $state(null);
    inputNode = $state(null);
    labelNode = $state(null);
    // published state that the components and other things can react to
    commandState = $state.raw(defaultState);
    // internal state that we mutate in batches and publish to the `state` at once
    _commandState = $state(defaultState);
    // whether the search has had a value other than ""
    searchHasHadValue = $state(false);
    #snapshot() {
        return $state.snapshot(this._commandState);
    }
    #scheduleUpdate() {
        if (this.#updateScheduled)
            return;
        this.#updateScheduled = true;
        afterTick(() => {
            this.#updateScheduled = false;
            const currentState = this.#snapshot();
            const hasStateChanged = !Object.is(this.commandState, currentState);
            if (hasStateChanged) {
                this.commandState = currentState;
                this.opts.onStateChange?.current?.(currentState);
            }
        });
    }
    setState(key, value, opts) {
        if (Object.is(this._commandState[key], value))
            return;
        this._commandState[key] = value;
        if (key === "search") {
            // Filter synchronously before emitting back to children
            this.#filterItems();
            this.#sort();
            this.#selectFirstItem();
            afterTick(() => {
                this.#selectFirstItem();
            });
        }
        else if (key === "value") {
            // opts is a boolean referring to whether it should NOT be scrolled into view
            if (!opts) {
                // Scroll the selected item into view
                this.#scrollSelectedIntoView();
            }
        }
        this.#scheduleUpdate();
    }
    constructor(opts) {
        this.opts = opts;
        const defaults = { ...this._commandState, value: this.opts.value.current ?? "" };
        this._commandState = defaults;
        this.commandState = defaults;
        useRefById(opts);
        this.onkeydown = this.onkeydown.bind(this);
        $effect(() => {
            if (this._commandState.search !== "") {
                this.searchHasHadValue = true;
            }
        });
    }
    /**
     * Calculates score for an item based on search text and keywords.
     * Higher score = better match.
     *
     * @param value - Item's display text
     * @param keywords - Optional keywords to boost scoring
     * @returns Score from 0-1, where 0 = no match
     */
    #score(value, keywords) {
        const filter = this.opts.filter.current ?? computeCommandScore;
        const score = value ? filter(value, this._commandState.search, keywords) : 0;
        return score;
    }
    /**
     * Sorts items and groups based on search scores.
     * Groups are sorted by their highest scoring item.
     * When no search active, selects first item.
     */
    #sort() {
        if (!this._commandState.search || this.opts.shouldFilter.current === false) {
            // If no search and no selection yet, select first item
            if (!this.commandState.value)
                this.#selectFirstItem();
            return;
        }
        const scores = this._commandState.filtered.items;
        // sort the groups
        const groups = [];
        for (const value of this._commandState.filtered.groups) {
            const items = this.allGroups.get(value);
            let max = 0;
            if (!items) {
                groups.push([value, max]);
                continue;
            }
            // get the max score of the group's items
            for (const item of items) {
                const score = scores.get(item);
                max = Math.max(score ?? 0, max);
            }
            groups.push([value, max]);
        }
        // Sort items within groups to bottom
        // Sort items outside of groups
        // Sort groups to bottom (pushes all non-grouped items to the top)
        const listInsertionElement = this.viewportNode;
        const sorted = this.getValidItems().sort((a, b) => {
            const valueA = a.getAttribute("id");
            const valueB = b.getAttribute("id");
            const scoresA = scores.get(valueA) ?? 0;
            const scoresB = scores.get(valueB) ?? 0;
            return scoresB - scoresA;
        });
        for (const item of sorted) {
            const group = item.closest(COMMAND_GROUP_ITEMS_SELECTOR);
            if (group) {
                const itemToAppend = item.parentElement === group
                    ? item
                    : item.closest(`${COMMAND_GROUP_ITEMS_SELECTOR} > *`);
                if (itemToAppend) {
                    group.appendChild(itemToAppend);
                }
            }
            else {
                const itemToAppend = item.parentElement === listInsertionElement
                    ? item
                    : item.closest(`${COMMAND_GROUP_ITEMS_SELECTOR} > *`);
                if (itemToAppend) {
                    listInsertionElement?.appendChild(itemToAppend);
                }
            }
        }
        const sortedGroups = groups.sort((a, b) => b[1] - a[1]);
        for (const group of sortedGroups) {
            const element = listInsertionElement?.querySelector(`${COMMAND_GROUP_SELECTOR}[${COMMAND_VALUE_ATTR}="${encodeURIComponent(group[0])}"]`);
            element?.parentElement?.appendChild(element);
        }
    }
    /**
     * Sets current value and triggers re-render if cleared.
     *
     * @param value - New value to set
     */
    setValue(value, opts) {
        if (value !== this.opts.value.current && value === "") {
            afterTick(() => {
                this.key++;
            });
        }
        this.setState("value", value, opts);
        this.opts.value.current = value;
    }
    /**
     * Selects first non-disabled item on next tick.
     */
    #selectFirstItem() {
        afterTick(() => {
            const item = this.getValidItems().find((item) => item.getAttribute("aria-disabled") !== "true");
            const value = item?.getAttribute(COMMAND_VALUE_ATTR);
            this.setValue(value || "");
        });
    }
    /**
     * Updates filtered items/groups based on search.
     * Recalculates scores and filtered count.
     */
    #filterItems() {
        if (!this._commandState.search || this.opts.shouldFilter.current === false) {
            this._commandState.filtered.count = this.allItems.size;
            return;
        }
        // reset the groups
        this._commandState.filtered.groups = new Set();
        let itemCount = 0;
        // Check which items should be included
        for (const id of this.allItems) {
            const value = this.allIds.get(id)?.value ?? "";
            const keywords = this.allIds.get(id)?.keywords ?? [];
            const rank = this.#score(value, keywords);
            this._commandState.filtered.items.set(id, rank);
            if (rank > 0)
                itemCount++;
        }
        // Check which groups have at least 1 item shown
        for (const [groupId, group] of this.allGroups) {
            for (const itemId of group) {
                const currItem = this._commandState.filtered.items.get(itemId);
                if (currItem && currItem > 0) {
                    this._commandState.filtered.groups.add(groupId);
                    break;
                }
            }
        }
        this._commandState.filtered.count = itemCount;
    }
    /**
     * Gets all non-disabled, visible command items.
     *
     * @returns Array of valid item elements
     * @remarks Exposed for direct item access and bound checking
     */
    getValidItems() {
        const node = this.opts.ref.current;
        if (!node)
            return [];
        const validItems = Array.from(node.querySelectorAll(COMMAND_VALID_ITEM_SELECTOR)).filter((el) => !!el);
        return validItems;
    }
    /**
     * Gets currently selected command item.
     *
     * @returns Selected element or undefined
     */
    #getSelectedItem() {
        const node = this.opts.ref.current;
        if (!node)
            return;
        const selectedNode = node.querySelector(`${COMMAND_VALID_ITEM_SELECTOR}[data-selected]`);
        if (!selectedNode)
            return;
        return selectedNode;
    }
    /**
     * Scrolls selected item into view.
     * Special handling for first items in groups.
     */
    #scrollSelectedIntoView() {
        afterTick(() => {
            const item = this.#getSelectedItem();
            if (!item)
                return;
            const grandparent = item.parentElement?.parentElement;
            if (!grandparent)
                return;
            const firstChildOfParent = getFirstNonCommentChild(grandparent);
            if (firstChildOfParent && firstChildOfParent.dataset?.value === item.dataset?.value) {
                const closestGroupHeader = item
                    ?.closest(COMMAND_GROUP_SELECTOR)
                    ?.querySelector(COMMAND_GROUP_HEADING_SELECTOR);
                closestGroupHeader?.scrollIntoView({ block: "nearest" });
                return;
            }
            item.scrollIntoView({ block: "nearest" });
        });
    }
    /**
     * Sets selection to item at specified index in valid items array.
     * If index is out of bounds, does nothing.
     *
     * @param index - Zero-based index of item to select
     * @remarks
     * Uses `getValidItems()` to get selectable items, filtering out disabled/hidden ones.
     * Access valid items directly via `getValidItems()` to check bounds before calling.
     *
     * @example
     * // get valid items length for bounds check
     * const items = getValidItems()
     * if (index < items.length) {
     *   updateSelectedToIndex(index)
     * }
     */
    updateSelectedToIndex(index) {
        const items = this.getValidItems();
        const item = items[index];
        if (item) {
            this.setValue(item.getAttribute(COMMAND_VALUE_ATTR) ?? "");
        }
    }
    /**
     * Updates selected item by moving up/down relative to current selection.
     * Handles wrapping when loop option is enabled.
     *
     * @param change - Direction to move: 1 for next item, -1 for previous item
     * @remarks
     * The loop behavior wraps:
     * - From last item to first when moving next
     * - From first item to last when moving previous
     *
     * Uses `getValidItems()` to get all selectable items, which filters out disabled/hidden items.
     * You can call `getValidItems()` directly to get the current valid items array.
     *
     * @example
     * // select next item
     * updateSelectedByItem(1)
     *
     * // get all valid items
     * const items = getValidItems()
     */
    updateSelectedByItem(change) {
        const selected = this.#getSelectedItem();
        const items = this.getValidItems();
        const index = items.findIndex((item) => item === selected);
        // Get item at this index
        let newSelected = items[index + change];
        if (this.opts.loop.current) {
            newSelected =
                index + change < 0
                    ? items[items.length - 1]
                    : index + change === items.length
                        ? items[0]
                        : items[index + change];
        }
        if (newSelected) {
            this.setValue(newSelected.getAttribute(COMMAND_VALUE_ATTR) ?? "");
        }
    }
    /**
     * Moves selection to the first valid item in the next/previous group.
     * If no group is found, falls back to selecting the next/previous item globally.
     *
     * @param change - Direction to move: 1 for next group, -1 for previous group
     * @example
     * // move to first item in next group
     * updateSelectedByGroup(1)
     *
     * // move to first item in previous group
     * updateSelectedByGroup(-1)
     */
    updateSelectedByGroup(change) {
        const selected = this.#getSelectedItem();
        let group = selected?.closest(COMMAND_GROUP_SELECTOR);
        let item;
        while (group && !item) {
            group =
                change > 0
                    ? findNextSibling(group, COMMAND_GROUP_SELECTOR)
                    : findPreviousSibling(group, COMMAND_GROUP_SELECTOR);
            item = group?.querySelector(COMMAND_VALID_ITEM_SELECTOR);
        }
        if (item) {
            this.setValue(item.getAttribute(COMMAND_VALUE_ATTR) ?? "");
        }
        else {
            this.updateSelectedByItem(change);
        }
    }
    /**
     * Maps item id to display value and search keywords.
     * Returns cleanup function to remove mapping.
     *
     * @param id - Unique item identifier
     * @param value - Display text
     * @param keywords - Optional search boost terms
     * @returns Cleanup function
     */
    registerValue(id, value, keywords) {
        if (value === this.allIds.get(id)?.value)
            return noop;
        this.allIds.set(id, { value, keywords });
        this._commandState.filtered.items.set(id, this.#score(value, keywords));
        // Schedule sorting to run after this tick when all items are added not each time an item is added
        if (!this.sortAfterTick) {
            this.sortAfterTick = true;
            afterTick(() => {
                this.#sort();
                this.sortAfterTick = false;
            });
        }
        return () => {
            this.allIds.delete(id);
        };
    }
    /**
     * Registers item in command list and its group.
     * Handles filtering, sorting and selection updates.
     *
     * @param id - Item identifier
     * @param groupId - Optional group to add item to
     * @returns Cleanup function that handles selection
     */
    registerItem(id, groupId) {
        this.allItems.add(id);
        // Track this item within the group
        if (groupId) {
            if (!this.allGroups.has(groupId)) {
                this.allGroups.set(groupId, new Set([id]));
            }
            else {
                this.allGroups.get(groupId).add(id);
            }
        }
        // Schedule sorting and filtering to run after this tick when all items are added not each time an item is added
        if (!this.sortAndFilterAfterTick) {
            this.sortAndFilterAfterTick = true;
            afterTick(() => {
                this.#filterItems();
                this.#sort();
                this.sortAndFilterAfterTick = false;
            });
        }
        this.#scheduleUpdate();
        return () => {
            const selectedItem = this.#getSelectedItem();
            this.allIds.delete(id);
            this.allItems.delete(id);
            this.commandState.filtered.items.delete(id);
            this.#filterItems();
            // The item removed have been the selected one,
            // so selection should be moved to the first
            if (selectedItem?.getAttribute("id") === id) {
                this.#selectFirstItem();
            }
            this.#scheduleUpdate();
        };
    }
    /**
     * Creates empty group if not exists.
     *
     * @param id - Group identifier
     * @returns Cleanup function
     */
    registerGroup(id) {
        if (!this.allGroups.has(id)) {
            this.allGroups.set(id, new Set());
        }
        return () => {
            this.allIds.delete(id);
            this.allGroups.delete(id);
        };
    }
    /**
     * Selects last valid item.
     */
    #last() {
        return this.updateSelectedToIndex(this.getValidItems().length - 1);
    }
    /**
     * Handles next item selection:
     * - Meta: Jump to last
     * - Alt: Next group
     * - Default: Next item
     *
     * @param e - Keyboard event
     */
    #next(e) {
        e.preventDefault();
        if (e.metaKey) {
            this.#last();
        }
        else if (e.altKey) {
            this.updateSelectedByGroup(1);
        }
        else {
            this.updateSelectedByItem(1);
        }
    }
    /**
     * Handles previous item selection:
     * - Meta: Jump to first
     * - Alt: Previous group
     * - Default: Previous item
     *
     * @param e - Keyboard event
     */
    #prev(e) {
        e.preventDefault();
        if (e.metaKey) {
            // First item
            this.updateSelectedToIndex(0);
        }
        else if (e.altKey) {
            // Previous group
            this.updateSelectedByGroup(-1);
        }
        else {
            // Previous item
            this.updateSelectedByItem(-1);
        }
    }
    onkeydown(e) {
        switch (e.key) {
            case kbd.n:
            case kbd.j: {
                // vim down
                if (this.opts.vimBindings.current && e.ctrlKey) {
                    this.#next(e);
                }
                break;
            }
            case kbd.ARROW_DOWN:
                this.#next(e);
                break;
            case kbd.p:
            case kbd.k: {
                // vim up
                if (this.opts.vimBindings.current && e.ctrlKey) {
                    this.#prev(e);
                }
                break;
            }
            case kbd.ARROW_UP:
                this.#prev(e);
                break;
            case kbd.HOME:
                // first item
                e.preventDefault();
                this.updateSelectedToIndex(0);
                break;
            case kbd.END:
                // last item
                e.preventDefault();
                this.#last();
                break;
            case kbd.ENTER: {
                /**
                 * Check if IME composition is finished before triggering the select event.
                 * This prevents unwanted triggering while user is still inputting text with IME.
                 * e.keyCode === 229 is for the Japanese IME && Safari as `isComposing` does not
                 * work with Japanese IME and Safari in combination.
                 */
                if (!e.isComposing && e.keyCode !== 229) {
                    e.preventDefault();
                    const item = this.#getSelectedItem();
                    if (item) {
                        item?.click();
                    }
                }
            }
        }
    }
    props = $derived.by(() => ({
        id: this.opts.id.current,
        role: "application",
        [COMMAND_ROOT_ATTR]: "",
        tabindex: -1,
        onkeydown: this.onkeydown,
    }));
}
class CommandEmptyState {
    opts;
    root;
    #isInitialRender = true;
    shouldRender = $derived.by(() => {
        return ((this.root._commandState.filtered.count === 0 &&
            this.#isInitialRender === false &&
            this.root.searchHasHadValue) ||
            this.opts.forceMount.current);
    });
    constructor(opts, root) {
        this.opts = opts;
        this.root = root;
        $effect.pre(() => {
            this.#isInitialRender = false;
        });
        useRefById({
            ...opts,
            deps: () => this.shouldRender,
        });
    }
    props = $derived.by(() => ({
        id: this.opts.id.current,
        role: "presentation",
        [COMMAND_EMPTY_ATTR]: "",
    }));
}
class CommandGroupContainerState {
    opts;
    root;
    headingNode = $state(null);
    shouldRender = $derived.by(() => {
        if (this.opts.forceMount.current)
            return true;
        if (this.root.opts.shouldFilter.current === false)
            return true;
        if (!this.root.commandState.search)
            return true;
        return this.root.commandState.filtered.groups.has(this.opts.id.current);
    });
    trueValue = $state("");
    constructor(opts, root) {
        this.opts = opts;
        this.root = root;
        this.trueValue = opts.value.current;
        useRefById({
            ...opts,
            deps: () => this.shouldRender,
        });
        watch(() => this.opts.id.current, () => {
            return this.root.registerGroup(this.opts.id.current);
        });
        $effect(() => {
            if (this.opts.value.current) {
                this.trueValue = this.opts.value.current;
                return this.root.registerValue(this.opts.id.current, this.opts.value.current);
            }
            else if (this.headingNode && this.headingNode.textContent) {
                this.trueValue = this.headingNode.textContent.trim().toLowerCase();
                return this.root.registerValue(this.opts.id.current, this.trueValue);
            }
            else if (this.opts.ref.current?.textContent) {
                this.trueValue = this.opts.ref.current.textContent.trim().toLowerCase();
                return this.root.registerValue(this.opts.id.current, this.trueValue);
            }
        });
    }
    props = $derived.by(() => ({
        id: this.opts.id.current,
        role: "presentation",
        hidden: this.shouldRender ? undefined : true,
        "data-value": this.trueValue,
        [COMMAND_GROUP_ATTR]: "",
    }));
}
class CommandGroupHeadingState {
    opts;
    group;
    constructor(opts, group) {
        this.opts = opts;
        this.group = group;
        useRefById({
            ...opts,
            onRefChange: (node) => {
                this.group.headingNode = node;
            },
        });
    }
    props = $derived.by(() => ({
        id: this.opts.id.current,
        [COMMAND_GROUP_HEADING_ATTR]: "",
    }));
}
class CommandGroupItemsState {
    opts;
    group;
    constructor(opts, group) {
        this.opts = opts;
        this.group = group;
        useRefById(opts);
    }
    props = $derived.by(() => ({
        id: this.opts.id.current,
        role: "group",
        [COMMAND_GROUP_ITEMS_ATTR]: "",
        "aria-labelledby": this.group.headingNode?.id ?? undefined,
    }));
}
class CommandInputState {
    opts;
    root;
    #selectedItemId = $derived.by(() => {
        const item = this.root.viewportNode?.querySelector(`${COMMAND_ITEM_SELECTOR}[${COMMAND_VALUE_ATTR}="${encodeURIComponent(this.root.opts.value.current)}"]`);
        if (!item)
            return;
        return item?.getAttribute("id") ?? undefined;
    });
    constructor(opts, root) {
        this.opts = opts;
        this.root = root;
        useRefById({
            ...opts,
            onRefChange: (node) => {
                this.root.inputNode = node;
            },
        });
        watch(() => this.opts.ref.current, () => {
            const node = this.opts.ref.current;
            if (node && this.opts.autofocus.current) {
                afterSleep(10, () => node.focus());
            }
        });
        watch(() => this.opts.value.current, () => {
            if (this.root.commandState.search !== this.opts.value.current) {
                this.root.setState("search", this.opts.value.current);
            }
        });
    }
    props = $derived.by(() => ({
        id: this.opts.id.current,
        type: "text",
        [COMMAND_INPUT_ATTR]: "",
        autocomplete: "off",
        autocorrect: "off",
        spellcheck: false,
        "aria-autocomplete": "list",
        role: "combobox",
        "aria-expanded": getAriaExpanded(true),
        "aria-controls": this.root.viewportNode?.id ?? undefined,
        "aria-labelledby": this.root.labelNode?.id ?? undefined,
        "aria-activedescendant": this.#selectedItemId,
    }));
}
class CommandItemState {
    opts;
    root;
    #group = null;
    #trueForceMount = $derived.by(() => {
        return this.opts.forceMount.current || this.#group?.opts.forceMount.current === true;
    });
    trueValue = $state("");
    shouldRender = $derived.by(() => {
        this.opts.ref.current;
        if (this.#trueForceMount ||
            this.root.opts.shouldFilter.current === false ||
            !this.root.commandState.search) {
            return true;
        }
        const currentScore = this.root.commandState.filtered.items.get(this.opts.id.current);
        if (currentScore === undefined)
            return false;
        return currentScore > 0;
    });
    isSelected = $derived.by(() => this.root.opts.value.current === this.trueValue && this.trueValue !== "");
    constructor(opts, root) {
        this.opts = opts;
        this.root = root;
        this.#group = CommandGroupContainerContext.getOr(null);
        this.trueValue = opts.value.current;
        useRefById({
            ...opts,
            deps: () => Boolean(this.root.commandState.search),
        });
        watch([
            () => this.opts.id.current,
            () => this.#group?.opts.id.current,
            () => this.opts.forceMount.current,
            () => this.opts.ref.current,
        ], () => {
            if (this.opts.forceMount.current)
                return;
            return this.root.registerItem(this.opts.id.current, this.#group?.opts.id.current);
        });
        watch([() => this.opts.value.current, () => this.opts.ref.current], () => {
            if (!this.opts.ref.current)
                return;
            if (!this.opts.value.current && this.opts.ref.current.textContent) {
                this.trueValue = this.opts.ref.current.textContent.trim();
            }
            this.root.registerValue(this.opts.id.current, this.trueValue, opts.keywords.current.map((kw) => kw.trim()));
            this.opts.ref.current.setAttribute(COMMAND_VALUE_ATTR, this.trueValue);
        });
        // bindings
        this.onclick = this.onclick.bind(this);
        this.onpointermove = this.onpointermove.bind(this);
    }
    #onSelect() {
        if (this.opts.disabled.current)
            return;
        this.#select();
        this.opts.onSelect?.current();
    }
    #select() {
        if (this.opts.disabled.current)
            return;
        this.root.setValue(this.trueValue, true);
    }
    onpointermove(_) {
        if (this.opts.disabled.current || this.root.opts.disablePointerSelection.current)
            return;
        this.#select();
    }
    onclick(_) {
        if (this.opts.disabled.current)
            return;
        this.#onSelect();
    }
    props = $derived.by(() => ({
        id: this.opts.id.current,
        "aria-disabled": getAriaDisabled(this.opts.disabled.current),
        "aria-selected": getAriaSelected(this.isSelected),
        "data-disabled": getDataDisabled(this.opts.disabled.current),
        "data-selected": getDataSelected(this.isSelected),
        "data-value": this.trueValue,
        [COMMAND_ITEM_ATTR]: "",
        role: "option",
        onpointermove: this.onpointermove,
        onclick: this.onclick,
    }));
}
class CommandLoadingState {
    opts;
    constructor(opts) {
        this.opts = opts;
        useRefById(opts);
    }
    props = $derived.by(() => ({
        id: this.opts.id.current,
        role: "progressbar",
        "aria-valuenow": this.opts.progress.current,
        "aria-valuemin": 0,
        "aria-valuemax": 100,
        "aria-label": "Loading...",
        [COMMAND_LOADING_ATTR]: "",
    }));
}
class CommandSeparatorState {
    opts;
    root;
    shouldRender = $derived.by(() => !this.root._commandState.search || this.opts.forceMount.current);
    constructor(opts, root) {
        this.opts = opts;
        this.root = root;
        useRefById({
            ...opts,
            deps: () => this.shouldRender,
        });
    }
    props = $derived.by(() => ({
        id: this.opts.id.current,
        // role="separator" cannot belong to a role="listbox"
        "aria-hidden": "true",
        [COMMAND_SEPARATOR_ATTR]: "",
    }));
}
class CommandListState {
    opts;
    root;
    constructor(opts, root) {
        this.opts = opts;
        this.root = root;
        useRefById(opts);
    }
    props = $derived.by(() => ({
        id: this.opts.id.current,
        role: "listbox",
        "aria-label": this.opts.ariaLabel.current,
        [COMMAND_LIST_ATTR]: "",
    }));
}
class CommandLabelState {
    opts;
    root;
    constructor(opts, root) {
        this.opts = opts;
        this.root = root;
        useRefById({
            ...opts,
            onRefChange: (node) => {
                this.root.labelNode = node;
            },
        });
    }
    props = $derived.by(() => ({
        id: this.opts.id.current,
        [COMMAND_INPUT_LABEL_ATTR]: "",
        for: this.opts.for?.current,
        style: srOnlyStyles,
    }));
}
class CommandViewportState {
    opts;
    list;
    constructor(opts, list) {
        this.opts = opts;
        this.list = list;
        useRefById({
            ...opts,
            onRefChange: (node) => {
                this.list.root.viewportNode = node;
            },
        });
        $effect(() => {
            const node = this.opts.ref.current;
            const listNode = this.list.opts.ref.current;
            if (!node || !listNode)
                return;
            let aF;
            const observer = new ResizeObserver(() => {
                aF = requestAnimationFrame(() => {
                    const height = node.offsetHeight;
                    listNode.style.setProperty("--bits-command-list-height", `${height.toFixed(1)}px`);
                });
            });
            observer.observe(node);
            return () => {
                cancelAnimationFrame(aF);
                observer.unobserve(node);
            };
        });
    }
    props = $derived.by(() => ({
        id: this.opts.id.current,
        [COMMAND_VIEWPORT_ATTR]: "",
    }));
}
export function useCommandRoot(props) {
    return CommandRootContext.set(new CommandRootState(props));
}
export function useCommandEmpty(props) {
    return new CommandEmptyState(props, CommandRootContext.get());
}
export function useCommandItem(props) {
    const group = CommandGroupContainerContext.getOr(null);
    return new CommandItemState({ ...props, group }, CommandRootContext.get());
}
export function useCommandGroupContainer(props) {
    return CommandGroupContainerContext.set(new CommandGroupContainerState(props, CommandRootContext.get()));
}
export function useCommandGroupHeading(props) {
    return new CommandGroupHeadingState(props, CommandGroupContainerContext.get());
}
export function useCommandGroupItems(props) {
    return new CommandGroupItemsState(props, CommandGroupContainerContext.get());
}
export function useCommandInput(props) {
    return new CommandInputState(props, CommandRootContext.get());
}
export function useCommandLoading(props) {
    return new CommandLoadingState(props);
}
export function useCommandSeparator(props) {
    return new CommandSeparatorState(props, CommandRootContext.get());
}
export function useCommandList(props) {
    return CommandListContext.set(new CommandListState(props, CommandRootContext.get()));
}
export function useCommandViewport(props) {
    return new CommandViewportState(props, CommandListContext.get());
}
export function useCommandLabel(props) {
    return new CommandLabelState(props, CommandRootContext.get());
}
