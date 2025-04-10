import { afterSleep, afterTick, box, executeCallbacks, useRefById } from "svelte-toolbelt";
import { Context, watch } from "runed";
import { on } from "svelte/events";
import { createFocusScopeAPI, createFocusScopeStack, removeLinks, } from "./focus-scope-stack.svelte.js";
import { focus, focusFirst, getTabbableCandidates, getTabbableEdges } from "../../../internal/focus.js";
import { CustomEventDispatcher } from "../../../internal/events.js";
import { isHTMLElement } from "../../../internal/is.js";
import { kbd } from "../../../internal/kbd.js";
import { isTabbable } from "tabbable";
const AutoFocusOnMountEvent = new CustomEventDispatcher("focusScope.autoFocusOnMount", {
    bubbles: false,
    cancelable: true,
});
const AutoFocusOnDestroyEvent = new CustomEventDispatcher("focusScope.autoFocusOnDestroy", {
    bubbles: false,
    cancelable: true,
});
export const FocusScopeContext = new Context("FocusScope");
export function useFocusScope({ id, loop, enabled, onOpenAutoFocus, onCloseAutoFocus, forceMount, }) {
    const focusScopeStack = createFocusScopeStack();
    const focusScope = createFocusScopeAPI();
    const ref = box(null);
    const ctx = FocusScopeContext.getOr({ ignoreCloseAutoFocus: false });
    let lastFocusedElement = null;
    useRefById({
        id,
        ref,
        deps: () => enabled.current,
    });
    function manageFocus(event) {
        if (focusScope.paused || !ref.current || focusScope.isHandlingFocus)
            return;
        focusScope.isHandlingFocus = true;
        try {
            const target = event.target;
            if (!isHTMLElement(target))
                return;
            const isWithinActiveScope = ref.current.contains(target);
            if (event.type === "focusin") {
                if (isWithinActiveScope) {
                    lastFocusedElement = target;
                }
                else {
                    if (ctx.ignoreCloseAutoFocus)
                        return;
                    focus(lastFocusedElement, { select: true });
                }
            }
            else if (event.type === "focusout") {
                if (!isWithinActiveScope && !ctx.ignoreCloseAutoFocus) {
                    focus(lastFocusedElement, { select: true });
                }
            }
        }
        finally {
            focusScope.isHandlingFocus = false;
        }
    }
    // When the focused element gets removed from the DOM, browsers move focus
    // back to the document.body. In this case, we move focus to the container
    // to keep focus trapped correctly.
    // instead of leaning on document.activeElement, we use lastFocusedElement to check
    // if the element still exists inside the container,
    // if not then we focus to the container
    function handleMutations(_) {
        const lastFocusedElementExists = ref.current?.contains(lastFocusedElement);
        if (!lastFocusedElementExists && ref.current) {
            focus(ref.current);
        }
    }
    watch([() => ref.current, () => enabled.current], ([container, enabled]) => {
        if (!container || !enabled)
            return;
        const removeEvents = executeCallbacks(on(document, "focusin", manageFocus), on(document, "focusout", manageFocus));
        const mutationObserver = new MutationObserver(handleMutations);
        mutationObserver.observe(container, { childList: true, subtree: true });
        return () => {
            removeEvents();
            mutationObserver.disconnect();
        };
    });
    watch([() => forceMount.current, () => ref.current], ([forceMount, container]) => {
        if (forceMount)
            return;
        const prevFocusedElement = document.activeElement;
        handleOpen(container, prevFocusedElement);
        return () => {
            if (!container)
                return;
            handleClose(prevFocusedElement);
        };
    });
    watch([() => forceMount.current, () => ref.current, () => enabled.current], ([forceMount, container]) => {
        if (!forceMount)
            return;
        const prevFocusedElement = document.activeElement;
        handleOpen(container, prevFocusedElement);
        return () => {
            if (!container)
                return;
            handleClose(prevFocusedElement);
        };
    });
    function handleOpen(container, prevFocusedElement) {
        if (!container)
            container = document.getElementById(id.current);
        if (!container || !enabled.current)
            return;
        focusScopeStack.add(focusScope);
        const hasFocusedCandidate = container.contains(prevFocusedElement);
        if (!hasFocusedCandidate) {
            const mountEvent = AutoFocusOnMountEvent.createEvent();
            onOpenAutoFocus.current(mountEvent);
            if (!mountEvent.defaultPrevented) {
                afterTick(() => {
                    if (!container)
                        return;
                    focusFirst(removeLinks(getTabbableCandidates(container)), { select: true });
                    if (document.activeElement === prevFocusedElement) {
                        focus(container);
                    }
                });
            }
        }
    }
    function handleClose(prevFocusedElement) {
        const destroyEvent = AutoFocusOnDestroyEvent.createEvent();
        onCloseAutoFocus.current?.(destroyEvent);
        const shouldIgnore = ctx.ignoreCloseAutoFocus;
        afterSleep(0, () => {
            if (!destroyEvent.defaultPrevented && prevFocusedElement && !shouldIgnore) {
                focus(isTabbable(prevFocusedElement) ? prevFocusedElement : document.body, {
                    select: true,
                });
            }
            focusScopeStack.remove(focusScope);
        });
    }
    function handleKeydown(e) {
        if (!enabled.current)
            return;
        if (!loop.current && !enabled.current)
            return;
        if (focusScope.paused)
            return;
        const isTabKey = e.key === kbd.TAB && !e.ctrlKey && !e.altKey && !e.metaKey;
        const focusedElement = document.activeElement;
        if (!(isTabKey && focusedElement))
            return;
        const container = ref.current;
        if (!container)
            return;
        const [first, last] = getTabbableEdges(container);
        const hasTabbableElementsInside = first && last;
        if (!hasTabbableElementsInside) {
            if (focusedElement === container) {
                e.preventDefault();
            }
        }
        else {
            if (!e.shiftKey && focusedElement === last) {
                e.preventDefault();
                if (loop.current)
                    focus(first, { select: true });
            }
            else if (e.shiftKey && focusedElement === first) {
                e.preventDefault();
                if (loop.current)
                    focus(last, { select: true });
            }
        }
    }
    const props = $derived.by(() => ({
        id: id.current,
        tabindex: -1,
        onkeydown: handleKeydown,
    }));
    return {
        get props() {
            return props;
        },
    };
}
