import { watch } from "runed";
import { on } from "svelte/events";
import { kbd } from "../../../internal/kbd.js";
import { noop } from "../../../internal/noop.js";
globalThis.bitsEscapeLayers ??= new Map();
export class EscapeLayerState {
    opts;
    constructor(opts) {
        this.opts = opts;
        let unsubEvents = noop;
        watch(() => opts.enabled.current, (enabled) => {
            if (enabled) {
                globalThis.bitsEscapeLayers.set(this, opts.escapeKeydownBehavior);
                unsubEvents = this.#addEventListener();
            }
            return () => {
                unsubEvents();
                globalThis.bitsEscapeLayers.delete(this);
            };
        });
    }
    #addEventListener = () => {
        return on(document, "keydown", this.#onkeydown, { passive: false });
    };
    #onkeydown = (e) => {
        if (e.key !== kbd.ESCAPE || !isResponsibleEscapeLayer(this))
            return;
        const clonedEvent = new KeyboardEvent(e.type, e);
        e.preventDefault();
        const behaviorType = this.opts.escapeKeydownBehavior.current;
        if (behaviorType !== "close" && behaviorType !== "defer-otherwise-close")
            return;
        this.opts.onEscapeKeydown.current(clonedEvent);
    };
}
export function useEscapeLayer(props) {
    return new EscapeLayerState(props);
}
function isResponsibleEscapeLayer(instance) {
    const layersArr = [...globalThis.bitsEscapeLayers];
    /**
     * We first check if we can find a top layer with `close` or `ignore`.
     * If that top layer was found and matches the provided node, then the node is
     * responsible for the escape. Otherwise, we know that all layers defer so
     * the first layer is the responsible one.
     */
    const topMostLayer = layersArr.findLast(([_, { current: behaviorType }]) => behaviorType === "close" || behaviorType === "ignore");
    if (topMostLayer)
        return topMostLayer[0] === instance;
    const [firstLayerNode] = layersArr[0];
    return firstLayerNode === instance;
}
