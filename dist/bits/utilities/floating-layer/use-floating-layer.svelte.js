import { arrow, autoUpdate, flip, hide, limitShift, offset, shift, size, } from "@floating-ui/dom";
import { box, cssToStyleObj, styleToString, useRefById } from "svelte-toolbelt";
import { Context, ElementSize, watch } from "runed";
import { isNotNull } from "../../../internal/is.js";
import { useId } from "../../../internal/use-id.js";
import { useFloating } from "../../../internal/floating-svelte/use-floating.svelte.js";
export const SIDE_OPTIONS = ["top", "right", "bottom", "left"];
export const ALIGN_OPTIONS = ["start", "center", "end"];
const OPPOSITE_SIDE = {
    top: "bottom",
    right: "left",
    bottom: "top",
    left: "right",
};
class FloatingRootState {
    anchorNode = box(null);
    customAnchorNode = box(null);
    triggerNode = box(null);
    constructor() {
        $effect(() => {
            if (this.customAnchorNode.current) {
                if (typeof this.customAnchorNode.current === "string") {
                    this.anchorNode.current = document.querySelector(this.customAnchorNode.current);
                }
                else {
                    this.anchorNode.current = this.customAnchorNode.current;
                }
            }
            else {
                this.anchorNode.current = this.triggerNode.current;
            }
        });
    }
}
class FloatingContentState {
    opts;
    root;
    // nodes
    contentRef = box(null);
    wrapperRef = box(null);
    arrowRef = box(null);
    // ids
    arrowId = box(useId());
    #transformedStyle = $derived.by(() => {
        if (typeof this.opts.style === "string")
            return cssToStyleObj(this.opts.style);
        if (!this.opts.style)
            return {};
    });
    #updatePositionStrategy = undefined;
    #arrowSize = new ElementSize(() => this.arrowRef.current ?? undefined);
    #arrowWidth = $derived(this.#arrowSize?.width ?? 0);
    #arrowHeight = $derived(this.#arrowSize?.height ?? 0);
    #desiredPlacement = $derived.by(() => (this.opts.side?.current +
        (this.opts.align.current !== "center"
            ? `-${this.opts.align.current}`
            : "")));
    #boundary = $derived.by(() => Array.isArray(this.opts.collisionBoundary.current)
        ? this.opts.collisionBoundary.current
        : [this.opts.collisionBoundary.current]);
    hasExplicitBoundaries = $derived(this.#boundary.length > 0);
    detectOverflowOptions = $derived.by(() => ({
        padding: this.opts.collisionPadding.current,
        boundary: this.#boundary.filter(isNotNull),
        altBoundary: this.hasExplicitBoundaries,
    }));
    #availableWidth = $state(undefined);
    #availableHeight = $state(undefined);
    #anchorWidth = $state(undefined);
    #anchorHeight = $state(undefined);
    middleware = $derived.by(() => [
        offset({
            mainAxis: this.opts.sideOffset.current + this.#arrowHeight,
            alignmentAxis: this.opts.alignOffset.current,
        }),
        this.opts.avoidCollisions.current &&
            shift({
                mainAxis: true,
                crossAxis: false,
                limiter: this.opts.sticky.current === "partial" ? limitShift() : undefined,
                ...this.detectOverflowOptions,
            }),
        this.opts.avoidCollisions.current && flip({ ...this.detectOverflowOptions }),
        size({
            ...this.detectOverflowOptions,
            apply: ({ rects, availableWidth, availableHeight }) => {
                const { width: anchorWidth, height: anchorHeight } = rects.reference;
                this.#availableWidth = availableWidth;
                this.#availableHeight = availableHeight;
                this.#anchorWidth = anchorWidth;
                this.#anchorHeight = anchorHeight;
            },
        }),
        this.arrowRef.current &&
            arrow({
                element: this.arrowRef.current,
                padding: this.opts.arrowPadding.current,
            }),
        transformOrigin({ arrowWidth: this.#arrowWidth, arrowHeight: this.#arrowHeight }),
        this.opts.hideWhenDetached.current &&
            hide({ strategy: "referenceHidden", ...this.detectOverflowOptions }),
    ].filter(Boolean));
    floating;
    placedSide = $derived.by(() => getSideFromPlacement(this.floating.placement));
    placedAlign = $derived.by(() => getAlignFromPlacement(this.floating.placement));
    arrowX = $derived.by(() => this.floating.middlewareData.arrow?.x ?? 0);
    arrowY = $derived.by(() => this.floating.middlewareData.arrow?.y ?? 0);
    cannotCenterArrow = $derived.by(() => this.floating.middlewareData.arrow?.centerOffset !== 0);
    contentZIndex = $state();
    arrowBaseSide = $derived(OPPOSITE_SIDE[this.placedSide]);
    wrapperProps = $derived.by(() => ({
        id: this.opts.wrapperId.current,
        "data-bits-floating-content-wrapper": "",
        style: {
            ...this.floating.floatingStyles,
            // keep off page when measuring
            transform: this.floating.isPositioned
                ? this.floating.floatingStyles.transform
                : "translate(0, -200%)",
            minWidth: "max-content",
            zIndex: this.contentZIndex,
            "--bits-floating-transform-origin": `${this.floating.middlewareData.transformOrigin?.x} ${this.floating.middlewareData.transformOrigin?.y}`,
            "--bits-floating-available-width": `${this.#availableWidth}px`,
            "--bits-floating-available-height": `${this.#availableHeight}px`,
            "--bits-floating-anchor-width": `${this.#anchorWidth}px`,
            "--bits-floating-anchor-height": `${this.#anchorHeight}px`,
            // hide the content if using the hide middleware and should be hidden
            ...(this.floating.middlewareData.hide?.referenceHidden && {
                visibility: "hidden",
                "pointer-events": "none",
            }),
            ...this.#transformedStyle,
        },
        // Floating UI calculates logical alignment based the `dir` attribute
        dir: this.opts.dir.current,
    }));
    props = $derived.by(() => ({
        "data-side": this.placedSide,
        "data-align": this.placedAlign,
        style: styleToString({
            ...this.#transformedStyle,
            // if the FloatingContent hasn't been placed yet (not all measurements done)
            // we prevent animations so that users's animation don't kick in too early referring wrong sides
            // animation: !this.floating.isPositioned ? "none" : undefined,
        }),
    }));
    arrowStyle = $derived({
        position: "absolute",
        left: this.arrowX ? `${this.arrowX}px` : undefined,
        top: this.arrowY ? `${this.arrowY}px` : undefined,
        [this.arrowBaseSide]: 0,
        "transform-origin": {
            top: "",
            right: "0 0",
            bottom: "center 0",
            left: "100% 0",
        }[this.placedSide],
        transform: {
            top: "translateY(100%)",
            right: "translateY(50%) rotate(90deg) translateX(-50%)",
            bottom: "rotate(180deg)",
            left: "translateY(50%) rotate(-90deg) translateX(50%)",
        }[this.placedSide],
        visibility: this.cannotCenterArrow ? "hidden" : undefined,
    });
    constructor(opts, root) {
        this.opts = opts;
        this.root = root;
        if (opts.customAnchor) {
            this.root.customAnchorNode.current = opts.customAnchor.current;
        }
        watch(() => opts.customAnchor.current, (customAnchor) => {
            this.root.customAnchorNode.current = customAnchor;
        });
        useRefById({
            id: this.opts.wrapperId,
            ref: this.wrapperRef,
            deps: () => this.opts.enabled.current,
        });
        useRefById({
            id: this.opts.id,
            ref: this.contentRef,
            deps: () => this.opts.enabled.current,
        });
        this.floating = useFloating({
            strategy: () => this.opts.strategy.current,
            placement: () => this.#desiredPlacement,
            middleware: () => this.middleware,
            reference: this.root.anchorNode,
            whileElementsMounted: (...args) => {
                const cleanup = autoUpdate(...args, {
                    animationFrame: this.#updatePositionStrategy?.current === "always",
                });
                return cleanup;
            },
            open: () => this.opts.enabled.current,
        });
        $effect(() => {
            if (!this.floating.isPositioned)
                return;
            this.opts.onPlaced?.current();
        });
        watch(() => this.contentRef.current, (contentNode) => {
            if (!contentNode)
                return;
            this.contentZIndex = window.getComputedStyle(contentNode).zIndex;
        });
        $effect(() => {
            this.floating.floating.current = this.wrapperRef.current;
        });
    }
}
class FloatingArrowState {
    opts;
    content;
    constructor(opts, content) {
        this.opts = opts;
        this.content = content;
        useRefById({
            ...opts,
            onRefChange: (node) => {
                this.content.arrowRef.current = node;
            },
            deps: () => this.content.opts.enabled.current,
        });
    }
    props = $derived.by(() => ({
        id: this.opts.id.current,
        style: this.content.arrowStyle,
        "data-side": this.content.placedSide,
    }));
}
class FloatingAnchorState {
    opts;
    root;
    ref = box(null);
    constructor(opts, root) {
        this.opts = opts;
        this.root = root;
        if (opts.virtualEl && opts.virtualEl.current) {
            root.triggerNode = box.from(opts.virtualEl.current);
        }
        else {
            useRefById({
                id: opts.id,
                ref: this.ref,
                onRefChange: (node) => {
                    root.triggerNode.current = node;
                },
            });
        }
    }
}
const FloatingRootContext = new Context("Floating.Root");
const FloatingContentContext = new Context("Floating.Content");
export function useFloatingRootState() {
    return FloatingRootContext.set(new FloatingRootState());
}
export function useFloatingContentState(props) {
    return FloatingContentContext.set(new FloatingContentState(props, FloatingRootContext.get()));
}
export function useFloatingArrowState(props) {
    return new FloatingArrowState(props, FloatingContentContext.get());
}
export function useFloatingAnchorState(props) {
    return new FloatingAnchorState(props, FloatingRootContext.get());
}
//
// HELPERS
//
function transformOrigin(options) {
    return {
        name: "transformOrigin",
        options,
        fn(data) {
            const { placement, rects, middlewareData } = data;
            const cannotCenterArrow = middlewareData.arrow?.centerOffset !== 0;
            const isArrowHidden = cannotCenterArrow;
            const arrowWidth = isArrowHidden ? 0 : options.arrowWidth;
            const arrowHeight = isArrowHidden ? 0 : options.arrowHeight;
            const [placedSide, placedAlign] = getSideAndAlignFromPlacement(placement);
            const noArrowAlign = { start: "0%", center: "50%", end: "100%" }[placedAlign];
            const arrowXCenter = (middlewareData.arrow?.x ?? 0) + arrowWidth / 2;
            const arrowYCenter = (middlewareData.arrow?.y ?? 0) + arrowHeight / 2;
            let x = "";
            let y = "";
            if (placedSide === "bottom") {
                x = isArrowHidden ? noArrowAlign : `${arrowXCenter}px`;
                y = `${-arrowHeight}px`;
            }
            else if (placedSide === "top") {
                x = isArrowHidden ? noArrowAlign : `${arrowXCenter}px`;
                y = `${rects.floating.height + arrowHeight}px`;
            }
            else if (placedSide === "right") {
                x = `${-arrowHeight}px`;
                y = isArrowHidden ? noArrowAlign : `${arrowYCenter}px`;
            }
            else if (placedSide === "left") {
                x = `${rects.floating.width + arrowHeight}px`;
                y = isArrowHidden ? noArrowAlign : `${arrowYCenter}px`;
            }
            return { data: { x, y } };
        },
    };
}
function getSideAndAlignFromPlacement(placement) {
    const [side, align = "center"] = placement.split("-");
    return [side, align];
}
export function getSideFromPlacement(placement) {
    return getSideAndAlignFromPlacement(placement)[0];
}
export function getAlignFromPlacement(placement) {
    return getSideAndAlignFromPlacement(placement)[1];
}
