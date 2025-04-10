import { Previous } from "runed";
import type { Box, ReadableBoxedValues, WritableBoxedValues } from "../../internal/box.svelte.js";
import type { BitsEvent, BitsFocusEvent, BitsKeyboardEvent, BitsMouseEvent, BitsPointerEvent, WithRefProps } from "../../internal/types.js";
export declare const INTERACTION_KEYS: string[];
export declare const FIRST_KEYS: string[];
export declare const LAST_KEYS: string[];
export declare const FIRST_LAST_KEYS: string[];
export declare const SELECTION_KEYS: string[];
export declare const CONTENT_MARGIN = 10;
type SelectBaseRootStateProps = ReadableBoxedValues<{
    disabled: boolean;
    required: boolean;
    name: string;
    loop: boolean;
    scrollAlignment: "nearest" | "center";
    items: {
        value: string;
        label: string;
        disabled?: boolean;
    }[];
    allowDeselect: boolean;
}> & WritableBoxedValues<{
    open: boolean;
}> & {
    isCombobox: boolean;
};
declare class SelectBaseRootState {
    readonly opts: SelectBaseRootStateProps;
    touchedInput: boolean;
    inputValue: string;
    inputNode: HTMLElement | null;
    contentNode: HTMLElement | null;
    triggerNode: HTMLElement | null;
    valueId: string;
    highlightedNode: HTMLElement | null;
    highlightedValue: string | null;
    highlightedId: string | undefined;
    highlightedLabel: string | null;
    isUsingKeyboard: boolean;
    isCombobox: boolean;
    bitsAttrs: SelectBitsAttrs;
    constructor(opts: SelectBaseRootStateProps);
    setHighlightedNode(node: HTMLElement | null, initial?: boolean): void;
    getCandidateNodes(): HTMLElement[];
    setHighlightedToFirstCandidate(): void;
    getNodeByValue(value: string): HTMLElement | null;
    setOpen(open: boolean): void;
    toggleOpen(): void;
    handleOpen(): void;
    handleClose(): void;
    toggleMenu(): void;
}
type SelectSingleRootStateProps = SelectBaseRootStateProps & WritableBoxedValues<{
    value: string;
}>;
declare class SelectSingleRootState extends SelectBaseRootState {
    readonly opts: SelectSingleRootStateProps;
    isMulti: false;
    hasValue: boolean;
    currentLabel: string;
    candidateLabels: string[];
    dataTypeaheadEnabled: boolean;
    constructor(opts: SelectSingleRootStateProps);
    includesItem(itemValue: string): boolean;
    toggleItem(itemValue: string, itemLabel?: string): void;
    setInitialHighlightedNode(): void;
}
type SelectMultipleRootStateProps = SelectBaseRootStateProps & WritableBoxedValues<{
    value: string[];
}>;
declare class SelectMultipleRootState extends SelectBaseRootState {
    readonly opts: SelectMultipleRootStateProps;
    isMulti: true;
    hasValue: boolean;
    constructor(opts: SelectMultipleRootStateProps);
    includesItem(itemValue: string): boolean;
    toggleItem(itemValue: string, itemLabel?: string): void;
    setInitialHighlightedNode(): void;
}
type SelectRootState = SelectSingleRootState | SelectMultipleRootState;
type SelectInputStateProps = WithRefProps & ReadableBoxedValues<{
    clearOnDeselect: boolean;
}>;
declare class SelectInputState {
    readonly opts: SelectInputStateProps;
    readonly root: SelectRootState;
    constructor(opts: SelectInputStateProps, root: SelectRootState);
    onkeydown(e: BitsKeyboardEvent): void;
    oninput(e: BitsEvent<Event, HTMLInputElement>): void;
    props: {
        readonly [x: string]: string | true | ((e: BitsKeyboardEvent) => void) | ((e: BitsEvent<Event, HTMLInputElement>) => void) | undefined;
        readonly id: string;
        readonly role: "combobox";
        readonly disabled: true | undefined;
        readonly "aria-activedescendant": string | undefined;
        readonly "aria-autocomplete": "list";
        readonly "aria-expanded": "true" | "false";
        readonly "data-state": "open" | "closed";
        readonly "data-disabled": "" | undefined;
        readonly onkeydown: (e: BitsKeyboardEvent) => void;
        readonly oninput: (e: BitsEvent<Event, HTMLInputElement>) => void;
    };
}
type SelectComboTriggerStateProps = WithRefProps;
declare class SelectComboTriggerState {
    readonly opts: SelectComboTriggerStateProps;
    readonly root: SelectBaseRootState;
    constructor(opts: SelectComboTriggerStateProps, root: SelectBaseRootState);
    onkeydown(e: BitsKeyboardEvent): void;
    /**
     * `pointerdown` fires before the `focus` event, so we can prevent the default
     * behavior of focusing the button and keep focus on the input.
     */
    onpointerdown(e: BitsPointerEvent): void;
    props: {
        readonly [x: string]: string | true | ((e: BitsKeyboardEvent) => void) | ((e: BitsPointerEvent) => void) | undefined;
        readonly id: string;
        readonly disabled: true | undefined;
        readonly "aria-haspopup": "listbox";
        readonly "data-state": "open" | "closed";
        readonly "data-disabled": "" | undefined;
        readonly onpointerdown: (e: BitsPointerEvent) => void;
        readonly onkeydown: (e: BitsKeyboardEvent) => void;
    };
}
type SelectTriggerStateProps = WithRefProps;
declare class SelectTriggerState {
    #private;
    readonly opts: SelectTriggerStateProps;
    readonly root: SelectRootState;
    constructor(opts: SelectTriggerStateProps, root: SelectRootState);
    onkeydown(e: BitsKeyboardEvent): void;
    onclick(e: BitsMouseEvent): void;
    onpointerdown(e: BitsPointerEvent): void;
    onpointerup(e: BitsPointerEvent): void;
    props: {
        readonly [x: string]: string | true | ((e: BitsKeyboardEvent) => void) | ((e: BitsPointerEvent) => void) | undefined;
        readonly id: string;
        readonly disabled: true | undefined;
        readonly "aria-haspopup": "listbox";
        readonly "aria-expanded": "true" | "false";
        readonly "aria-activedescendant": string | undefined;
        readonly "data-state": "open" | "closed";
        readonly "data-disabled": "" | undefined;
        readonly "data-placeholder": "" | undefined;
        readonly onpointerdown: (e: BitsPointerEvent) => void;
        readonly onkeydown: (e: BitsKeyboardEvent) => void;
        readonly onclick: (e: BitsMouseEvent) => void;
        readonly onpointerup: (e: BitsPointerEvent) => void;
    };
}
type SelectContentStateProps = WithRefProps & ReadableBoxedValues<{
    onInteractOutside: (e: PointerEvent) => void;
    onEscapeKeydown: (e: KeyboardEvent) => void;
}>;
declare class SelectContentState {
    #private;
    readonly opts: SelectContentStateProps;
    readonly root: SelectRootState;
    viewportNode: HTMLElement | null;
    isPositioned: boolean;
    constructor(opts: SelectContentStateProps, root: SelectRootState);
    onpointermove(_: BitsPointerEvent): void;
    onInteractOutside: (e: PointerEvent) => void;
    onEscapeKeydown: (e: KeyboardEvent) => void;
    onOpenAutoFocus: (e: Event) => void;
    onCloseAutoFocus: (e: Event) => void;
    snippetProps: {
        open: boolean;
    };
    props: {
        readonly [x: string]: string | ((_: BitsPointerEvent) => void) | {
            readonly display: "flex";
            readonly flexDirection: "column";
            readonly outline: "none";
            readonly boxSizing: "border-box";
            readonly pointerEvents: "auto";
        } | undefined;
        readonly id: string;
        readonly role: "listbox";
        readonly "aria-multiselectable": "true" | undefined;
        readonly "data-state": "open" | "closed";
        readonly style: {
            readonly display: "flex";
            readonly flexDirection: "column";
            readonly outline: "none";
            readonly boxSizing: "border-box";
            readonly pointerEvents: "auto";
        };
        readonly onpointermove: (_: BitsPointerEvent) => void;
    };
    popperProps: {
        onInteractOutside: (e: PointerEvent) => void;
        onEscapeKeydown: (e: KeyboardEvent) => void;
        onOpenAutoFocus: (e: Event) => void;
        onCloseAutoFocus: (e: Event) => void;
        trapFocus: boolean;
        loop: boolean;
        onPlaced: () => void;
    };
}
type SelectItemStateProps = WithRefProps<ReadableBoxedValues<{
    value: string;
    disabled: boolean;
    label: string;
    onHighlight: () => void;
    onUnhighlight: () => void;
}>>;
declare class SelectItemState {
    readonly opts: SelectItemStateProps;
    readonly root: SelectRootState;
    isSelected: boolean;
    isHighlighted: boolean;
    prevHighlighted: Previous<boolean>;
    mounted: boolean;
    constructor(opts: SelectItemStateProps, root: SelectRootState);
    handleSelect(): void;
    snippetProps: {
        selected: boolean;
        highlighted: boolean;
    };
    onpointerdown(e: BitsPointerEvent): void;
    /**
     * Using `pointerup` instead of `click` allows power users to pointerdown
     * the trigger, then release pointerup on an item to select it vs having to do
     * multiple clicks.
     */
    onpointerup(e: BitsPointerEvent): void;
    onpointermove(e: BitsPointerEvent): void;
    props: {
        readonly [x: string]: string | ((e: BitsPointerEvent) => void) | undefined;
        readonly id: string;
        readonly role: "option";
        readonly "aria-selected": "true" | undefined;
        readonly "data-value": string;
        readonly "data-disabled": "" | undefined;
        readonly "data-highlighted": "" | undefined;
        readonly "data-selected": "" | undefined;
        readonly "data-label": string;
        readonly onpointermove: (e: BitsPointerEvent) => void;
        readonly onpointerdown: (e: BitsPointerEvent) => void;
        readonly onpointerup: (e: BitsPointerEvent) => void;
    };
}
type SelectGroupStateProps = WithRefProps;
declare class SelectGroupState {
    readonly opts: SelectGroupStateProps;
    readonly root: SelectBaseRootState;
    labelNode: HTMLElement | null;
    constructor(opts: SelectGroupStateProps, root: SelectBaseRootState);
    props: {
        readonly [x: string]: string | undefined;
        readonly id: string;
        readonly role: "group";
        readonly "aria-labelledby": string | undefined;
    };
}
type SelectGroupHeadingStateProps = WithRefProps;
declare class SelectGroupHeadingState {
    readonly opts: SelectGroupHeadingStateProps;
    readonly group: SelectGroupState;
    constructor(opts: SelectGroupHeadingStateProps, group: SelectGroupState);
    props: {
        readonly [x: string]: string;
        readonly id: string;
    };
}
type SelectHiddenInputStateProps = ReadableBoxedValues<{
    value: string;
}>;
declare class SelectHiddenInputState {
    readonly opts: SelectHiddenInputStateProps;
    readonly root: SelectBaseRootState;
    shouldRender: boolean;
    constructor(opts: SelectHiddenInputStateProps, root: SelectBaseRootState);
    onfocus(e: BitsFocusEvent): void;
    props: {
        readonly disabled: true | undefined;
        readonly required: true | undefined;
        readonly name: string;
        readonly value: string;
        readonly onfocus: (e: BitsFocusEvent) => void;
    };
}
type SelectViewportStateProps = WithRefProps;
declare class SelectViewportState {
    readonly opts: SelectViewportStateProps;
    readonly content: SelectContentState;
    root: SelectBaseRootState;
    prevScrollTop: number;
    constructor(opts: SelectViewportStateProps, content: SelectContentState);
    props: {
        readonly [x: string]: string | {
            readonly position: "relative";
            readonly flex: 1;
            readonly overflow: "auto";
        };
        readonly id: string;
        readonly role: "presentation";
        readonly style: {
            readonly position: "relative";
            readonly flex: 1;
            readonly overflow: "auto";
        };
    };
}
type SelectScrollButtonImplStateProps = WithRefProps;
declare class SelectScrollButtonImplState {
    readonly opts: SelectScrollButtonImplStateProps;
    readonly content: SelectContentState;
    root: SelectBaseRootState;
    autoScrollInterval: number | null;
    userScrollTimer: number;
    isUserScrolling: boolean;
    onAutoScroll: () => void;
    mounted: boolean;
    constructor(opts: SelectScrollButtonImplStateProps, content: SelectContentState);
    handleUserScroll(): void;
    clearAutoScrollInterval(): void;
    onpointerdown(_: BitsPointerEvent): void;
    onpointermove(_: BitsPointerEvent): void;
    onpointerleave(_: BitsPointerEvent): void;
    props: {
        readonly id: string;
        readonly "aria-hidden": "true" | undefined;
        readonly style: {
            readonly flexShrink: 0;
        };
        readonly onpointerdown: (_: BitsPointerEvent) => void;
        readonly onpointermove: (_: BitsPointerEvent) => void;
        readonly onpointerleave: (_: BitsPointerEvent) => void;
    };
}
declare class SelectScrollDownButtonState {
    readonly state: SelectScrollButtonImplState;
    content: SelectContentState;
    root: SelectBaseRootState;
    canScrollDown: boolean;
    scrollIntoViewTimer: ReturnType<typeof globalThis.setTimeout> | null;
    constructor(state: SelectScrollButtonImplState);
    /**
     * @param manual - if true, it means the function was invoked manually outside of an event
     * listener, so we don't call `handleUserScroll` to prevent the auto scroll from kicking in.
     */
    handleScroll: (manual?: boolean) => void;
    handleAutoScroll: () => void;
    props: {
        readonly id: string;
        readonly "aria-hidden": "true" | undefined;
        readonly style: {
            readonly flexShrink: 0;
        };
        readonly onpointerdown: (_: BitsPointerEvent) => void;
        readonly onpointermove: (_: BitsPointerEvent) => void;
        readonly onpointerleave: (_: BitsPointerEvent) => void;
    };
}
declare class SelectScrollUpButtonState {
    readonly state: SelectScrollButtonImplState;
    content: SelectContentState;
    root: SelectBaseRootState;
    canScrollUp: boolean;
    constructor(state: SelectScrollButtonImplState);
    /**
     * @param manual - if true, it means the function was invoked manually outside of an event
     * listener, so we don't call `handleUserScroll` to prevent the auto scroll from kicking in.
     */
    handleScroll: (manual?: boolean) => void;
    handleAutoScroll: () => void;
    props: {
        readonly id: string;
        readonly "aria-hidden": "true" | undefined;
        readonly style: {
            readonly flexShrink: 0;
        };
        readonly onpointerdown: (_: BitsPointerEvent) => void;
        readonly onpointermove: (_: BitsPointerEvent) => void;
        readonly onpointerleave: (_: BitsPointerEvent) => void;
    };
}
type InitSelectProps = {
    type: "single" | "multiple";
    value: Box<string> | Box<string[]>;
} & ReadableBoxedValues<{
    disabled: boolean;
    required: boolean;
    loop: boolean;
    scrollAlignment: "nearest" | "center";
    name: string;
    items: {
        value: string;
        label: string;
        disabled?: boolean;
    }[];
    allowDeselect: boolean;
}> & WritableBoxedValues<{
    open: boolean;
}> & {
    isCombobox: boolean;
};
export declare function useSelectRoot(props: InitSelectProps): SelectRootState;
export declare function useSelectInput(props: SelectInputStateProps): SelectInputState;
export declare function useSelectContent(props: SelectContentStateProps): SelectContentState;
export declare function useSelectTrigger(props: SelectTriggerStateProps): SelectTriggerState;
export declare function useSelectComboTrigger(props: SelectComboTriggerStateProps): SelectComboTriggerState;
export declare function useSelectItem(props: SelectItemStateProps): SelectItemState;
export declare function useSelectViewport(props: SelectViewportStateProps): SelectViewportState;
export declare function useSelectScrollUpButton(props: SelectScrollButtonImplStateProps): SelectScrollUpButtonState;
export declare function useSelectScrollDownButton(props: SelectScrollButtonImplStateProps): SelectScrollDownButtonState;
export declare function useSelectGroup(props: SelectGroupStateProps): SelectGroupState;
export declare function useSelectGroupHeading(props: SelectGroupHeadingStateProps): SelectGroupHeadingState;
export declare function useSelectHiddenInput(props: SelectHiddenInputStateProps): SelectHiddenInputState;
declare const selectParts: readonly ["trigger", "content", "item", "viewport", "scroll-up-button", "scroll-down-button", "group", "group-label", "separator", "arrow", "input", "content-wrapper", "item-text", "value"];
type SelectBitsAttrs = Record<(typeof selectParts)[number], string>;
export declare function getSelectBitsAttrs(root: SelectBaseRootState): SelectBitsAttrs;
export {};
