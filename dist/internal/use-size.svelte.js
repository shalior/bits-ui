/// <reference types="resize-observer-browser" />
import { untrack } from "svelte";
import { afterTick } from "svelte-toolbelt";
export function useSize(node) {
    let size = $state(undefined);
    $effect(() => {
        const currNode = node.current;
        if (!currNode) {
            size = undefined;
            return;
        }
        afterTick(() => {
            if (!currNode)
                return;
            size = {
                width: currNode.offsetWidth,
                height: currNode.offsetHeight,
            };
        });
        const resizeObserver = new ResizeObserver((entries) => {
            if (!Array.isArray(entries) || !entries.length)
                return;
            const entry = entries[0];
            if (!entry)
                return;
            let width;
            let height;
            if ("borderBoxSize" in entry) {
                const borderSizeEntry = entry.borderBoxSize;
                const borderSize = Array.isArray(borderSizeEntry)
                    ? borderSizeEntry[0]
                    : borderSizeEntry;
                width = borderSize.inlineSize;
                height = borderSize.blockSize;
            }
            else {
                width = currNode.offsetWidth;
                height = currNode.offsetHeight;
            }
            untrack(() => (size = { width, height }));
        });
        resizeObserver.observe(currNode, { box: "border-box" });
        return () => {
            if (!currNode)
                return;
            resizeObserver.unobserve(currNode);
        };
    });
    return {
        get value() {
            return size;
        },
    };
}
