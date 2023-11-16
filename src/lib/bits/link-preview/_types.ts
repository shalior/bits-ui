/**
 * We define prop types without the HTMLAttributes here so that we can use them
 * to type-check our API documentation, which requires we document each prop,
 * but we don't want to document the HTML attributes.
 */

import type { OmitOpen, Expand, OnChangeFn, AsChild, OmitIds } from "$lib/internal/index.js";
import type { FloatingArrowProps, FloatingContentProps } from "$lib/shared/index.js";
import type { CreateLinkPreviewProps } from "@melt-ui/svelte";

type Props = Expand<
	OmitOpen<OmitIds<Omit<CreateLinkPreviewProps, "arrowSize">>> & {
		/**
		 * The open state of the link preview.
		 * You can bind this to a boolean value to programmatically control the open state.
		 *
		 * @defaultValue false
		 */
		open?: boolean;

		/**
		 * A callback function called when the open state changes.
		 */
		onOpenChange?: OnChangeFn<boolean>;
	}
>;

type TriggerProps = AsChild;

export type {
	Props,
	FloatingArrowProps as ArrowProps,
	FloatingContentProps as ContentProps,
	TriggerProps
};
