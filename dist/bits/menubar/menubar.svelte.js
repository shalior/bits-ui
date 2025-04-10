import { afterTick, box, useRefById } from "svelte-toolbelt";
import { Context, watch } from "runed";
import { useRovingFocus, } from "../../internal/use-roving-focus.svelte.js";
import { getAriaExpanded, getDataDisabled, getDataOpenClosed } from "../../internal/attrs.js";
import { kbd } from "../../internal/kbd.js";
import { wrapArray } from "../../internal/arrays.js";
import { FocusScopeContext, } from "../utilities/focus-scope/use-focus-scope.svelte.js";
import { onMount } from "svelte";
const MENUBAR_ROOT_ATTR = "data-menubar-root";
const MENUBAR_TRIGGER_ATTR = "data-menubar-trigger";
class MenubarRootState {
    opts;
    rovingFocusGroup;
    wasOpenedByKeyboard = $state(false);
    triggerIds = $state([]);
    valueToChangeHandler = new Map();
    constructor(opts) {
        this.opts = opts;
        useRefById(opts);
        this.rovingFocusGroup = useRovingFocus({
            rootNodeId: this.opts.id,
            candidateAttr: MENUBAR_TRIGGER_ATTR,
            loop: this.opts.loop,
            orientation: box.with(() => "horizontal"),
        });
        this.onMenuClose = this.onMenuClose.bind(this);
        this.onMenuOpen = this.onMenuOpen.bind(this);
        this.onMenuToggle = this.onMenuToggle.bind(this);
        this.registerTrigger = this.registerTrigger.bind(this);
    }
    /**
     * @param id - the id of the trigger to register
     * @returns - a function to de-register the trigger
     */
    registerTrigger(id) {
        this.triggerIds.push(id);
        return () => {
            this.triggerIds = this.triggerIds.filter((triggerId) => triggerId !== id);
        };
    }
    /**
     * @param value - the value of the menu to register
     * @param contentId - the content id to associate with the value
     * @returns - a function to de-register the menu
     */
    registerMenu(value, onOpenChange) {
        this.valueToChangeHandler.set(value, onOpenChange);
        return () => {
            this.valueToChangeHandler.delete(value);
        };
    }
    updateValue(value) {
        const currValue = this.opts.value.current;
        const currHandler = this.valueToChangeHandler.get(currValue)?.current;
        const nextHandler = this.valueToChangeHandler.get(value)?.current;
        this.opts.value.current = value;
        if (currHandler && currValue !== value) {
            currHandler(false);
        }
        if (nextHandler) {
            nextHandler(true);
        }
    }
    getTriggers() {
        const node = this.opts.ref.current;
        if (!node)
            return [];
        return Array.from(node.querySelectorAll(`[${MENUBAR_TRIGGER_ATTR}]`));
    }
    onMenuOpen(id, triggerId) {
        this.updateValue(id);
        this.rovingFocusGroup.setCurrentTabStopId(triggerId);
    }
    onMenuClose() {
        this.updateValue("");
    }
    onMenuToggle(id) {
        this.updateValue(this.opts.value.current ? "" : id);
    }
    props = $derived.by(() => ({
        id: this.opts.id.current,
        role: "menubar",
        [MENUBAR_ROOT_ATTR]: "",
    }));
}
class MenubarMenuState {
    opts;
    root;
    open = $derived.by(() => this.root.opts.value.current === this.opts.value.current);
    wasOpenedByKeyboard = $state(false);
    triggerNode = $state(null);
    contentNode = $state(null);
    constructor(opts, root) {
        this.opts = opts;
        this.root = root;
        watch(() => this.open, () => {
            if (!this.open) {
                this.wasOpenedByKeyboard = false;
            }
        });
        onMount(() => {
            return this.root.registerMenu(this.opts.value.current, opts.onOpenChange);
        });
    }
    getTriggerNode() {
        return this.triggerNode;
    }
    openMenu() {
        this.root.onMenuOpen(this.opts.value.current, this.triggerNode?.id ?? "");
    }
}
class MenubarTriggerState {
    opts;
    menu;
    root;
    isFocused = $state(false);
    #tabIndex = $state(0);
    constructor(opts, menu) {
        this.opts = opts;
        this.menu = menu;
        this.root = menu.root;
        this.onpointerdown = this.onpointerdown.bind(this);
        this.onpointerenter = this.onpointerenter.bind(this);
        this.onkeydown = this.onkeydown.bind(this);
        this.onfocus = this.onfocus.bind(this);
        this.onblur = this.onblur.bind(this);
        useRefById({
            ...opts,
            onRefChange: (node) => {
                this.menu.triggerNode = node;
            },
        });
        onMount(() => {
            return this.root.registerTrigger(opts.id.current);
        });
        $effect(() => {
            if (this.root.triggerIds.length) {
                this.#tabIndex = this.root.rovingFocusGroup.getTabIndex(this.menu.getTriggerNode());
            }
        });
    }
    onpointerdown(e) {
        // only call if the left button but not when the CTRL key is pressed
        if (!this.opts.disabled.current && e.button === 0 && e.ctrlKey === false) {
            // prevent trigger from focusing when opening
            // which allows the content to focus without competition
            if (!this.menu.open) {
                e.preventDefault();
            }
            this.menu.openMenu();
        }
    }
    onpointerenter(_) {
        const isMenubarOpen = Boolean(this.root.opts.value.current);
        if (isMenubarOpen && !this.menu.open) {
            this.menu.openMenu();
            this.menu.getTriggerNode()?.focus();
        }
    }
    onkeydown(e) {
        if (this.opts.disabled.current)
            return;
        if (e.key === kbd.TAB)
            return;
        if (e.key === kbd.ENTER || e.key === kbd.SPACE) {
            this.root.onMenuToggle(this.menu.opts.value.current);
        }
        if (e.key === kbd.ARROW_DOWN) {
            this.menu.openMenu();
        }
        // prevent keydown from scrolling window / first focused item
        // from inadvertently closing the menu
        if (e.key === kbd.ENTER || e.key === kbd.SPACE || e.key === kbd.ARROW_DOWN) {
            this.menu.wasOpenedByKeyboard = true;
            e.preventDefault();
        }
        this.root.rovingFocusGroup.handleKeydown(this.menu.getTriggerNode(), e);
    }
    onfocus(_) {
        this.isFocused = true;
    }
    onblur(_) {
        this.isFocused = false;
    }
    props = $derived.by(() => ({
        type: "button",
        role: "menuitem",
        id: this.opts.id.current,
        "aria-haspopup": "menu",
        "aria-expanded": getAriaExpanded(this.menu.open),
        "aria-controls": this.menu.open ? this.menu.contentNode?.id : undefined,
        "data-highlighted": this.isFocused ? "" : undefined,
        "data-state": getDataOpenClosed(this.menu.open),
        "data-disabled": getDataDisabled(this.opts.disabled.current),
        "data-menu-value": this.menu.opts.value.current,
        disabled: this.opts.disabled.current ? true : undefined,
        tabindex: this.#tabIndex,
        [MENUBAR_TRIGGER_ATTR]: "",
        onpointerdown: this.onpointerdown,
        onpointerenter: this.onpointerenter,
        onkeydown: this.onkeydown,
        onfocus: this.onfocus,
        onblur: this.onblur,
    }));
}
class MenubarContentState {
    opts;
    menu;
    root;
    focusScopeContext;
    constructor(opts, menu) {
        this.opts = opts;
        this.menu = menu;
        this.root = menu.root;
        this.focusScopeContext = FocusScopeContext.get();
        this.onkeydown = this.onkeydown.bind(this);
        useRefById({
            ...opts,
            onRefChange: (node) => {
                this.menu.contentNode = node;
            },
            deps: () => this.menu.open,
        });
    }
    onCloseAutoFocus = (e) => {
        this.opts.onCloseAutoFocus.current(e);
        if (e.defaultPrevented)
            return;
    };
    onFocusOutside = (e) => {
        const target = e.target;
        const isMenubarTrigger = this.root
            .getTriggers()
            .some((trigger) => trigger.contains(target));
        if (isMenubarTrigger)
            e.preventDefault();
        this.opts.onFocusOutside.current(e);
    };
    onInteractOutside = (e) => {
        this.opts.onInteractOutside.current(e);
    };
    onOpenAutoFocus = (e) => {
        this.opts.onOpenAutoFocus.current(e);
        if (e.defaultPrevented)
            return;
        afterTick(() => this.opts.ref.current?.focus());
    };
    onkeydown(e) {
        if (e.key !== kbd.ARROW_LEFT && e.key !== kbd.ARROW_RIGHT)
            return;
        const target = e.target;
        const targetIsSubTrigger = target.hasAttribute("data-menu-sub-trigger");
        const isKeydownInsideSubMenu = target.closest("[data-menu-content]") !== e.currentTarget;
        const prevMenuKey = this.root.opts.dir.current === "rtl" ? kbd.ARROW_RIGHT : kbd.ARROW_LEFT;
        const isPrevKey = prevMenuKey === e.key;
        const isNextKey = !isPrevKey;
        // prevent navigation when opening a submenu
        if (isNextKey && targetIsSubTrigger)
            return;
        // or if we're inside a submenu and moving back to close it
        if (isKeydownInsideSubMenu && isPrevKey)
            return;
        const items = this.root.getTriggers().filter((trigger) => !trigger.disabled);
        let candidates = items.map((item) => ({
            value: item.getAttribute("data-menu-value"),
            triggerId: item.id ?? "",
        }));
        if (isPrevKey)
            candidates.reverse();
        const candidateValues = candidates.map(({ value }) => value);
        const currentIndex = candidateValues.indexOf(this.menu.opts.value.current);
        candidates = this.root.opts.loop.current
            ? wrapArray(candidates, currentIndex + 1)
            : candidates.slice(currentIndex + 1);
        const [nextValue] = candidates;
        if (nextValue)
            this.menu.root.onMenuOpen(nextValue.value, nextValue.triggerId);
    }
    props = $derived.by(() => ({
        id: this.opts.id.current,
        "aria-labelledby": this.menu.triggerNode?.id,
        style: {
            "--bits-menubar-content-transform-origin": "var(--bits-floating-transform-origin)",
            "--bits-menubar-content-available-width": "var(--bits-floating-available-width)",
            "--bits-menubar-content-available-height": "var(--bits-floating-available-height)",
            "--bits-menubar-anchor-width": "var(--bits-floating-anchor-width)",
            "--bits-menubar-anchor-height": "var(--bits-floating-anchor-height)",
        },
        onkeydown: this.onkeydown,
        "data-menu-content": "",
    }));
    popperProps = {
        onCloseAutoFocus: this.onCloseAutoFocus,
        onFocusOutside: this.onFocusOutside,
        onInteractOutside: this.onInteractOutside,
        onOpenAutoFocus: this.onOpenAutoFocus,
    };
}
const MenubarRootContext = new Context("Menubar.Root");
const MenubarMenuContext = new Context("Menubar.Menu");
export function useMenubarRoot(props) {
    return MenubarRootContext.set(new MenubarRootState(props));
}
export function useMenubarMenu(props) {
    return MenubarMenuContext.set(new MenubarMenuState(props, MenubarRootContext.get()));
}
export function useMenubarTrigger(props) {
    return new MenubarTriggerState(props, MenubarMenuContext.get());
}
export function useMenubarContent(props) {
    return new MenubarContentState(props, MenubarMenuContext.get());
}
