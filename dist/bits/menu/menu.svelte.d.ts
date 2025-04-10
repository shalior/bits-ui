import type { ReadableBoxedValues, WritableBoxedValues } from "../../internal/box.svelte.js";
import { CustomEventDispatcher } from "../../internal/events.js";
import type { AnyFn, BitsFocusEvent, BitsKeyboardEvent, BitsMouseEvent, BitsPointerEvent, WithRefProps } from "../../internal/types.js";
import { useRovingFocus } from "../../internal/use-roving-focus.svelte.js";
import type { Direction } from "../../shared/index.js";
import { IsUsingKeyboard } from "../../index.js";
export declare const CONTEXT_MENU_TRIGGER_ATTR = "data-context-menu-trigger";
type MenuVariant = "context-menu" | "dropdown-menu" | "menubar";
export type MenuRootStateProps = ReadableBoxedValues<{
    dir: Direction;
    variant: MenuVariant;
}> & {
    onClose: AnyFn;
};
export declare const MenuOpenEvent: CustomEventDispatcher<unknown>;
declare class MenuRootState {
    readonly opts: MenuRootStateProps;
    isUsingKeyboard: IsUsingKeyboard;
    ignoreCloseAutoFocus: boolean;
    isPointerInTransit: boolean;
    constructor(opts: MenuRootStateProps);
    getAttr(name: string): string;
}
type MenuMenuStateProps = WritableBoxedValues<{
    open: boolean;
}>;
declare class MenuMenuState {
    readonly opts: MenuMenuStateProps;
    readonly root: MenuRootState;
    readonly parentMenu: MenuMenuState | null;
    contentId: import("svelte-toolbelt").ReadableBox<string>;
    contentNode: HTMLElement | null;
    triggerNode: HTMLElement | null;
    constructor(opts: MenuMenuStateProps, root: MenuRootState, parentMenu: MenuMenuState | null);
    toggleOpen(): void;
    onOpen(): void;
    onClose(): void;
}
type MenuContentStateProps = WithRefProps & ReadableBoxedValues<{
    loop: boolean;
    onCloseAutoFocus: (event: Event) => void;
}> & {
    isSub?: boolean;
};
declare class MenuContentState {
    #private;
    readonly opts: MenuContentStateProps;
    readonly parentMenu: MenuMenuState;
    search: string;
    rovingFocusGroup: ReturnType<typeof useRovingFocus>;
    mounted: boolean;
    constructor(opts: MenuContentStateProps, parentMenu: MenuMenuState);
    onCloseAutoFocus: (e: Event) => void;
    handleTabKeyDown(e: BitsKeyboardEvent): void;
    onkeydown(e: BitsKeyboardEvent): void;
    onblur(e: BitsFocusEvent): void;
    onfocus(_: BitsFocusEvent): void;
    onItemEnter(): boolean;
    onItemLeave(e: BitsPointerEvent): void;
    onTriggerLeave(): boolean;
    onOpenAutoFocus: (e: Event) => void;
    handleInteractOutside(e: PointerEvent): void;
    snippetProps: {
        open: boolean;
    };
    props: {
        readonly [x: string]: string | ((e: BitsKeyboardEvent) => void) | ((e: BitsFocusEvent) => void) | {
            readonly pointerEvents: "auto";
        };
        readonly id: string;
        readonly role: "menu";
        readonly "aria-orientation": "horizontal" | "vertical";
        readonly "data-state": "open" | "closed";
        readonly onkeydown: (e: BitsKeyboardEvent) => void;
        readonly onblur: (e: BitsFocusEvent) => void;
        readonly onfocus: (_: BitsFocusEvent) => void;
        readonly dir: Direction;
        readonly style: {
            readonly pointerEvents: "auto";
        };
    };
    popperProps: {
        onCloseAutoFocus: (e: Event) => void;
    };
}
type MenuItemSharedStateProps = WithRefProps & ReadableBoxedValues<{
    disabled: boolean;
}>;
declare class MenuItemSharedState {
    #private;
    readonly opts: MenuItemSharedStateProps;
    readonly content: MenuContentState;
    constructor(opts: MenuItemSharedStateProps, content: MenuContentState);
    onpointermove(e: BitsPointerEvent): void;
    onpointerleave(e: BitsPointerEvent): void;
    onfocus(e: BitsFocusEvent): void;
    onblur(e: BitsFocusEvent): void;
    props: {
        readonly [x: string]: string | -1 | ((e: BitsPointerEvent) => void) | undefined;
        readonly id: string;
        readonly tabindex: -1;
        readonly role: "menuitem";
        readonly "aria-disabled": "true" | "false";
        readonly "data-disabled": "" | undefined;
        readonly "data-highlighted": "" | undefined;
        readonly onpointermove: (e: BitsPointerEvent) => void;
        readonly onpointerleave: (e: BitsPointerEvent) => void;
        readonly onfocus: (e: BitsFocusEvent) => void;
        readonly onblur: (e: BitsFocusEvent) => void;
    };
}
type MenuItemStateProps = ReadableBoxedValues<{
    onSelect: AnyFn;
    closeOnSelect: boolean;
}>;
declare class MenuItemState {
    #private;
    readonly opts: MenuItemStateProps;
    readonly item: MenuItemSharedState;
    root: MenuRootState;
    constructor(opts: MenuItemStateProps, item: MenuItemSharedState);
    onkeydown(e: BitsKeyboardEvent): void;
    onclick(_: BitsMouseEvent): void;
    onpointerup(e: BitsPointerEvent): void;
    onpointerdown(_: BitsPointerEvent): void;
    props: {
        readonly [x: string]: string | -1 | ((e: BitsPointerEvent) => void) | undefined;
        readonly id: string;
        readonly tabindex: -1;
        readonly role: "menuitem";
        readonly "aria-disabled": "true" | "false";
        readonly "data-disabled": "" | undefined;
        readonly "data-highlighted": "" | undefined;
        readonly onpointermove: (e: BitsPointerEvent) => void;
        readonly onpointerleave: (e: BitsPointerEvent) => void;
        readonly onfocus: (e: BitsFocusEvent) => void;
        readonly onblur: (e: BitsFocusEvent) => void;
    } & {
        onclick: (_: BitsMouseEvent) => void;
        onpointerdown: (_: BitsPointerEvent) => void;
        onpointerup: (e: BitsPointerEvent) => void;
        onkeydown: (e: BitsKeyboardEvent) => void;
    } & {
        style?: string;
    };
}
declare class MenuSubTriggerState {
    #private;
    readonly item: MenuItemSharedState;
    readonly content: MenuContentState;
    readonly submenu: MenuMenuState;
    constructor(item: MenuItemSharedState, content: MenuContentState, submenu: MenuMenuState);
    onpointermove(e: BitsPointerEvent): void;
    onpointerleave(e: BitsPointerEvent): void;
    onkeydown(e: BitsKeyboardEvent): void;
    onclick(e: BitsMouseEvent): void;
    props: {
        readonly [x: string]: string | -1 | ((e: BitsPointerEvent) => void) | undefined;
        readonly id: string;
        readonly tabindex: -1;
        readonly role: "menuitem";
        readonly "aria-disabled": "true" | "false";
        readonly "data-disabled": "" | undefined;
        readonly "data-highlighted": "" | undefined;
        readonly onpointermove: (e: BitsPointerEvent) => void;
        readonly onpointerleave: (e: BitsPointerEvent) => void;
        readonly onfocus: (e: BitsFocusEvent) => void;
        readonly onblur: (e: BitsFocusEvent) => void;
    } & {
        [x: string]: string | ((e: BitsPointerEvent) => void) | ((e: BitsKeyboardEvent) => void) | undefined;
        "aria-haspopup": string;
        "aria-expanded": "true" | "false";
        "data-state": "open" | "closed";
        "aria-controls": string | undefined;
        onclick: (e: BitsMouseEvent) => void;
        onpointermove: (e: BitsPointerEvent) => void;
        onpointerleave: (e: BitsPointerEvent) => void;
        onkeydown: (e: BitsKeyboardEvent) => void;
    } & {
        style?: string;
    };
}
type MenuCheckboxItemStateProps = WritableBoxedValues<{
    checked: boolean;
    indeterminate: boolean;
}>;
declare class MenuCheckboxItemState {
    readonly opts: MenuCheckboxItemStateProps;
    readonly item: MenuItemState;
    constructor(opts: MenuCheckboxItemStateProps, item: MenuItemState);
    toggleChecked(): void;
    snippetProps: {
        checked: boolean;
        indeterminate: boolean;
    };
    props: {
        readonly [x: string]: string | -1 | ((e: BitsPointerEvent) => void) | undefined;
        readonly role: "menuitemcheckbox";
        readonly "aria-checked": "true" | "false" | "mixed";
        readonly "data-state": "checked" | "indeterminate" | "unchecked";
        readonly id: string;
        readonly tabindex: -1;
        readonly "aria-disabled": "true" | "false";
        readonly "data-disabled": "" | undefined;
        readonly "data-highlighted": "" | undefined;
        readonly onpointermove: (e: BitsPointerEvent) => void;
        readonly onpointerleave: (e: BitsPointerEvent) => void;
        readonly onfocus: (e: BitsFocusEvent) => void;
        readonly onblur: (e: BitsFocusEvent) => void;
        readonly onclick: (_: BitsMouseEvent) => void;
        readonly onpointerdown: (_: BitsPointerEvent) => void;
        readonly onpointerup: (e: BitsPointerEvent) => void;
        readonly onkeydown: (e: BitsKeyboardEvent) => void;
        readonly style?: string;
    };
}
type MenuGroupStateProps = WithRefProps;
declare class MenuGroupState {
    readonly opts: MenuGroupStateProps;
    readonly root: MenuRootState;
    groupHeadingId: string | undefined;
    constructor(opts: MenuGroupStateProps, root: MenuRootState);
    props: {
        readonly [x: string]: string | undefined;
        readonly id: string;
        readonly role: "group";
        readonly "aria-labelledby": string | undefined;
    };
}
type MenuGroupHeadingStateProps = WithRefProps;
declare class MenuGroupHeadingState {
    readonly opts: MenuGroupHeadingStateProps;
    readonly group: MenuGroupState | MenuRadioGroupState;
    constructor(opts: MenuGroupHeadingStateProps, group: MenuGroupState | MenuRadioGroupState);
    props: {
        readonly [x: string]: string;
        readonly id: string;
        readonly role: "group";
    };
}
type MenuSeparatorStateProps = WithRefProps;
declare class MenuSeparatorState {
    readonly opts: MenuSeparatorStateProps;
    readonly root: MenuRootState;
    constructor(opts: MenuSeparatorStateProps, root: MenuRootState);
    props: {
        readonly [x: string]: string;
        readonly id: string;
        readonly role: "group";
    };
}
declare class MenuArrowState {
    readonly root: MenuRootState;
    constructor(root: MenuRootState);
    props: {
        readonly [x: string]: "";
    };
}
type MenuRadioGroupStateProps = WithRefProps & WritableBoxedValues<{
    value: string;
}>;
declare class MenuRadioGroupState {
    readonly opts: MenuRadioGroupStateProps;
    readonly content: MenuContentState;
    groupHeadingId: string | null;
    root: MenuRootState;
    constructor(opts: MenuRadioGroupStateProps, content: MenuContentState);
    setValue(v: string): void;
    props: {
        readonly [x: string]: string | null;
        readonly id: string;
        readonly role: "group";
        readonly "aria-labelledby": string | null;
    };
}
type MenuRadioItemStateProps = WithRefProps & ReadableBoxedValues<{
    value: string;
    closeOnSelect: boolean;
}>;
declare class MenuRadioItemState {
    readonly opts: MenuRadioItemStateProps;
    readonly item: MenuItemState;
    readonly group: MenuRadioGroupState;
    isChecked: boolean;
    constructor(opts: MenuRadioItemStateProps, item: MenuItemState, group: MenuRadioGroupState);
    selectValue(): void;
    props: {
        readonly role: "menuitemradio";
        readonly "aria-checked": "true" | "false" | "mixed";
        readonly "data-state": "checked" | "indeterminate" | "unchecked";
        readonly id: string;
        readonly tabindex: -1;
        readonly "aria-disabled": "true" | "false";
        readonly "data-disabled": "" | undefined;
        readonly "data-highlighted": "" | undefined;
        readonly onpointermove: (e: BitsPointerEvent) => void;
        readonly onpointerleave: (e: BitsPointerEvent) => void;
        readonly onfocus: (e: BitsFocusEvent) => void;
        readonly onblur: (e: BitsFocusEvent) => void;
        readonly onclick: (_: BitsMouseEvent) => void;
        readonly onpointerdown: (_: BitsPointerEvent) => void;
        readonly onpointerup: (e: BitsPointerEvent) => void;
        readonly onkeydown: (e: BitsKeyboardEvent) => void;
        readonly style?: string;
    };
}
type DropdownMenuTriggerStateProps = WithRefProps & ReadableBoxedValues<{
    disabled: boolean;
}>;
declare class DropdownMenuTriggerState {
    #private;
    readonly opts: DropdownMenuTriggerStateProps;
    readonly parentMenu: MenuMenuState;
    constructor(opts: DropdownMenuTriggerStateProps, parentMenu: MenuMenuState);
    onpointerdown(e: BitsPointerEvent): void;
    onpointerup(e: BitsPointerEvent): void;
    onkeydown(e: BitsKeyboardEvent): void;
    props: {
        readonly [x: string]: string | boolean | ((e: BitsPointerEvent) => void) | ((e: BitsKeyboardEvent) => void) | undefined;
        readonly id: string;
        readonly disabled: boolean;
        readonly "aria-haspopup": "menu";
        readonly "aria-expanded": "true" | "false";
        readonly "aria-controls": string | undefined;
        readonly "data-disabled": "" | undefined;
        readonly "data-state": "open" | "closed";
        readonly onpointerdown: (e: BitsPointerEvent) => void;
        readonly onpointerup: (e: BitsPointerEvent) => void;
        readonly onkeydown: (e: BitsKeyboardEvent) => void;
    };
}
type ContextMenuTriggerStateProps = WithRefProps & ReadableBoxedValues<{
    disabled: boolean;
}>;
declare class ContextMenuTriggerState {
    #private;
    readonly opts: ContextMenuTriggerStateProps;
    readonly parentMenu: MenuMenuState;
    virtualElement: import("svelte-toolbelt").WritableBox<{
        getBoundingClientRect: () => DOMRect;
    }>;
    constructor(opts: ContextMenuTriggerStateProps, parentMenu: MenuMenuState);
    oncontextmenu(e: BitsMouseEvent): void;
    onpointerdown(e: BitsPointerEvent): void;
    onpointermove(e: BitsPointerEvent): void;
    onpointercancel(e: BitsPointerEvent): void;
    onpointerup(e: BitsPointerEvent): void;
    props: {
        readonly id: string;
        readonly disabled: boolean;
        readonly "data-disabled": "" | undefined;
        readonly "data-state": "open" | "closed";
        readonly "data-context-menu-trigger": "";
        readonly tabindex: -1;
        readonly onpointerdown: (e: BitsPointerEvent) => void;
        readonly onpointermove: (e: BitsPointerEvent) => void;
        readonly onpointercancel: (e: BitsPointerEvent) => void;
        readonly onpointerup: (e: BitsPointerEvent) => void;
        readonly oncontextmenu: (e: BitsMouseEvent) => void;
    };
}
type MenuItemCombinedProps = MenuItemSharedStateProps & MenuItemStateProps;
export declare function useMenuRoot(props: MenuRootStateProps): MenuRootState;
export declare function useMenuMenu(root: MenuRootState, props: MenuMenuStateProps): MenuMenuState;
export declare function useMenuSubmenu(props: MenuMenuStateProps): MenuMenuState;
export declare function useMenuSubTrigger(props: MenuItemSharedStateProps): MenuSubTriggerState;
export declare function useMenuDropdownTrigger(props: DropdownMenuTriggerStateProps): DropdownMenuTriggerState;
export declare function useMenuContextTrigger(props: ContextMenuTriggerStateProps): ContextMenuTriggerState;
export declare function useMenuContent(props: MenuContentStateProps): MenuContentState;
export declare function useMenuItem(props: MenuItemCombinedProps): MenuItemState;
export declare function useMenuCheckboxItem(props: MenuItemCombinedProps & MenuCheckboxItemStateProps): MenuCheckboxItemState;
export declare function useMenuRadioGroup(props: MenuRadioGroupStateProps): MenuGroupState | MenuRadioGroupState;
export declare function useMenuRadioItem(props: MenuRadioItemStateProps & MenuItemCombinedProps): MenuRadioItemState;
export declare function useMenuGroup(props: MenuGroupStateProps): MenuGroupState | MenuRadioGroupState;
export declare function useMenuGroupHeading(props: MenuGroupHeadingStateProps): MenuGroupHeadingState;
export declare function useMenuSeparator(props: MenuSeparatorStateProps): MenuSeparatorState;
export declare function useMenuArrow(): MenuArrowState;
export {};
