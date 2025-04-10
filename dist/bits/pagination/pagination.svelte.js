import { useRefById } from "svelte-toolbelt";
import { Context } from "runed";
import { getDataOrientation } from "../../internal/attrs.js";
import { getElemDirection } from "../../internal/locale.js";
import { kbd } from "../../internal/kbd.js";
import { getDirectionalKeys } from "../../internal/get-directional-keys.js";
import { useId } from "../../shared/index.js";
const PAGINATION_ROOT_ATTR = "data-pagination-root";
const PAGINATION_PAGE_ATTR = "data-pagination-page";
const PAGINATION_PREV_ATTR = "data-pagination-prev";
const PAGINATION_NEXT_ATTR = "data-pagination-next";
class PaginationRootState {
    opts;
    totalPages = $derived.by(() => {
        if (this.opts.count.current === 0)
            return 1;
        return Math.ceil(this.opts.count.current / this.opts.perPage.current);
    });
    range = $derived.by(() => {
        const start = (this.opts.page.current - 1) * this.opts.perPage.current;
        const end = Math.min(start + this.opts.perPage.current, this.opts.count.current);
        return { start: start + 1, end };
    });
    pages = $derived.by(() => getPageItems({
        page: this.opts.page.current,
        totalPages: this.totalPages,
        siblingCount: this.opts.siblingCount.current,
    }));
    constructor(opts) {
        this.opts = opts;
        useRefById(opts);
    }
    setPage(page) {
        this.opts.page.current = page;
    }
    getPageTriggerNodes() {
        const node = this.opts.ref.current;
        if (!node)
            return [];
        return Array.from(node.querySelectorAll("[data-pagination-page]"));
    }
    getButtonNode(type) {
        const node = this.opts.ref.current;
        if (!node)
            return;
        return node.querySelector(`[data-pagination-${type}]`);
    }
    hasPrevPage = $derived.by(() => this.opts.page.current > 1);
    hasNextPage = $derived.by(() => this.opts.page.current < this.totalPages);
    prevPage() {
        this.opts.page.current = Math.max(this.opts.page.current - 1, 1);
    }
    nextPage() {
        this.opts.page.current = Math.min(this.opts.page.current + 1, this.totalPages);
    }
    snippetProps = $derived.by(() => ({
        pages: this.pages,
        range: this.range,
        currentPage: this.opts.page.current,
    }));
    props = $derived.by(() => ({
        id: this.opts.id.current,
        "data-orientation": getDataOrientation(this.opts.orientation.current),
        [PAGINATION_ROOT_ATTR]: "",
    }));
}
class PaginationPageState {
    opts;
    root;
    #isSelected = $derived.by(() => this.opts.page.current.value === this.root.opts.page.current);
    constructor(opts, root) {
        this.opts = opts;
        this.root = root;
        useRefById(opts);
        this.onclick = this.onclick.bind(this);
        this.onkeydown = this.onkeydown.bind(this);
    }
    onclick(e) {
        if (this.opts.disabled.current)
            return;
        if (e.button !== 0)
            return;
        this.root.setPage(this.opts.page.current.value);
    }
    onkeydown(e) {
        if (e.key === kbd.SPACE || e.key === kbd.ENTER) {
            e.preventDefault();
            this.root.setPage(this.opts.page.current.value);
        }
        else {
            handleTriggerKeydown(e, this.opts.ref.current, this.root);
        }
    }
    props = $derived.by(() => ({
        id: this.opts.id.current,
        "aria-label": `Page ${this.opts.page.current.value}`,
        "data-value": `${this.opts.page.current.value}`,
        "data-selected": this.#isSelected ? "" : undefined,
        [PAGINATION_PAGE_ATTR]: "",
        //
        onclick: this.onclick,
        onkeydown: this.onkeydown,
    }));
}
class PaginationButtonState {
    opts;
    root;
    constructor(opts, root) {
        this.opts = opts;
        this.root = root;
        useRefById(opts);
        this.onclick = this.onclick.bind(this);
        this.onkeydown = this.onkeydown.bind(this);
    }
    #action() {
        this.opts.type === "prev" ? this.root.prevPage() : this.root.nextPage();
    }
    #isDisabled = $derived.by(() => {
        if (this.opts.disabled.current)
            return true;
        if (this.opts.type === "prev")
            return !this.root.hasPrevPage;
        if (this.opts.type === "next")
            return !this.root.hasNextPage;
        return false;
    });
    onclick(e) {
        if (this.opts.disabled.current)
            return;
        if (e.button !== 0)
            return;
        this.#action();
    }
    onkeydown(e) {
        if (e.key === kbd.SPACE || e.key === kbd.ENTER) {
            e.preventDefault();
            this.#action();
        }
        else {
            handleTriggerKeydown(e, this.opts.ref.current, this.root);
        }
    }
    props = $derived.by(() => ({
        id: this.opts.id.current,
        [PAGINATION_PREV_ATTR]: this.opts.type === "prev" ? "" : undefined,
        [PAGINATION_NEXT_ATTR]: this.opts.type === "next" ? "" : undefined,
        disabled: this.#isDisabled,
        //
        onclick: this.onclick,
        onkeydown: this.onkeydown,
    }));
}
//
// HELPERS
//
/**
 * Shared logic for handling keyboard navigation on
 * pagination page triggers and prev/next buttons.
 *
 *
 * @param e - KeyboardEvent
 * @param node - The HTMLElement that triggered the event.
 * @param root - The root pagination state instance
 */
function handleTriggerKeydown(e, node, root) {
    if (!node || !root.opts.ref.current)
        return;
    const items = root.getPageTriggerNodes();
    const nextButton = root.getButtonNode("next");
    const prevButton = root.getButtonNode("prev");
    if (prevButton) {
        items.unshift(prevButton);
    }
    if (nextButton) {
        items.push(nextButton);
    }
    const currentIndex = items.indexOf(node);
    const dir = getElemDirection(root.opts.ref.current);
    const { nextKey, prevKey } = getDirectionalKeys(dir, root.opts.orientation.current);
    const loop = root.opts.loop.current;
    const keyToIndex = {
        [nextKey]: currentIndex + 1,
        [prevKey]: currentIndex - 1,
        [kbd.HOME]: 0,
        [kbd.END]: items.length - 1,
    };
    let itemIndex = keyToIndex[e.key];
    if (itemIndex === undefined)
        return;
    e.preventDefault();
    if (itemIndex < 0 && loop) {
        itemIndex = items.length - 1;
    }
    else if (itemIndex === items.length && loop) {
        itemIndex = 0;
    }
    const itemToFocus = items[itemIndex];
    if (!itemToFocus)
        return;
    itemToFocus.focus();
}
/**
 * Returns an array of page items used to render out the
 * pagination page triggers.
 *
 * Credit: https://github.com/melt-ui/melt-ui
 */
function getPageItems({ page = 1, totalPages, siblingCount = 1 }) {
    const pageItems = [];
    const pagesToShow = new Set([1, totalPages]);
    const firstItemWithSiblings = 3 + siblingCount;
    const lastItemWithSiblings = totalPages - 2 - siblingCount;
    if (firstItemWithSiblings > lastItemWithSiblings) {
        for (let i = 2; i <= totalPages - 1; i++) {
            pagesToShow.add(i);
        }
    }
    else if (page < firstItemWithSiblings) {
        for (let i = 2; i <= Math.min(firstItemWithSiblings, totalPages); i++) {
            pagesToShow.add(i);
        }
    }
    else if (page > lastItemWithSiblings) {
        for (let i = totalPages - 1; i >= Math.max(lastItemWithSiblings, 2); i--) {
            pagesToShow.add(i);
        }
    }
    else {
        for (let i = Math.max(page - siblingCount, 2); i <= Math.min(page + siblingCount, totalPages); i++) {
            pagesToShow.add(i);
        }
    }
    function addPage(value) {
        pageItems.push({ type: "page", value, key: `page-${value}` });
    }
    function addEllipsis() {
        const id = useId();
        pageItems.push({ type: "ellipsis", key: `ellipsis-${id}` });
    }
    let lastNumber = 0;
    for (const p of Array.from(pagesToShow).sort((a, b) => a - b)) {
        if (p - lastNumber > 1) {
            addEllipsis();
        }
        addPage(p);
        lastNumber = p;
    }
    return pageItems;
}
const PaginationRootContext = new Context("Pagination.Root");
export function usePaginationRoot(props) {
    return PaginationRootContext.set(new PaginationRootState(props));
}
export function usePaginationPage(props) {
    return new PaginationPageState(props, PaginationRootContext.get());
}
export function usePaginationButton(props) {
    return new PaginationButtonState(props, PaginationRootContext.get());
}
