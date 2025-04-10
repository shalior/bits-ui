import type { PinInputCell, PinInputRootProps as RootComponentProps } from "./types.js";
import type { ReadableBoxedValues, WritableBoxedValues } from "../../internal/box.svelte.js";
import type { BitsEvent, BitsFocusEvent, BitsKeyboardEvent, BitsMouseEvent, WithRefProps } from "../../internal/types.js";
export declare const REGEXP_ONLY_DIGITS = "^\\d+$";
export declare const REGEXP_ONLY_CHARS = "^[a-zA-Z]+$";
export declare const REGEXP_ONLY_DIGITS_AND_CHARS = "^[a-zA-Z0-9]+$";
type PinInputRootStateProps = WithRefProps<WritableBoxedValues<{
    value: string;
}> & ReadableBoxedValues<{
    inputId: string;
    disabled: boolean;
    onComplete: (...args: any[]) => void;
    pasteTransformer?: (text: string) => string;
    pattern: any;
    maxLength: number;
    pushPasswordManagerStrategy: "increase-width" | "none";
    textAlign: RootComponentProps["textalign"];
    autocomplete: RootComponentProps["autocomplete"];
    inputmode: RootComponentProps["inputmode"];
}>>;
declare class PinInputRootState {
    #private;
    readonly opts: PinInputRootStateProps;
    constructor(opts: PinInputRootStateProps);
    onkeydown: (e: BitsKeyboardEvent) => void;
    rootProps: {
        readonly id: string;
        readonly "data-pin-input-root": "";
        readonly style: {
            position: string;
            cursor: string;
            userSelect: string;
            WebkitUserSelect: string;
            pointerEvents: string;
        };
    };
    inputWrapperProps: {
        readonly style: {
            readonly position: "absolute";
            readonly inset: 0;
            readonly pointerEvents: "none";
        };
    };
    oninput: (e: BitsEvent<InputEvent, HTMLInputElement>) => void;
    onfocus: (_: BitsFocusEvent<HTMLInputElement>) => void;
    onpaste: (e: BitsEvent<ClipboardEvent>) => void;
    onmouseover: (_: BitsMouseEvent) => void;
    onmouseleave: (_: BitsMouseEvent) => void;
    onblur: (_: BitsFocusEvent) => void;
    inputProps: {
        id: string;
        style: {
            position: string;
            inset: number;
            width: string;
            clipPath: string | undefined;
            height: string;
            display: string;
            textAlign: "left" | "center" | "right" | undefined;
            opacity: string;
            color: string;
            pointerEvents: string;
            background: string;
            caretColor: string;
            border: string;
            outline: string;
            boxShadow: string;
            lineHeight: string;
            letterSpacing: string;
            fontSize: string;
            fontFamily: string;
            fontVariantNumeric: string;
        };
        autocomplete: "name" | "off" | "on" | "additional-name" | "address-level1" | "address-level2" | "address-level3" | "address-level4" | "address-line1" | "address-line2" | "address-line3" | "bday-day" | "bday-month" | "bday-year" | "cc-csc" | "cc-exp" | "cc-exp-month" | "cc-exp-year" | "cc-family-name" | "cc-given-name" | "cc-name" | "cc-number" | "cc-type" | "country" | "country-name" | "current-password" | "family-name" | "given-name" | "honorific-prefix" | "honorific-suffix" | "new-password" | "one-time-code" | "organization" | "postal-code" | "street-address" | "transaction-amount" | "transaction-currency" | "username" | "email" | "tel" | "tel-area-code" | "tel-country-code" | "tel-extension" | "tel-local" | "tel-local-prefix" | "tel-local-suffix" | "tel-national" | "home email" | "home tel" | "home tel-area-code" | "home tel-country-code" | "home tel-extension" | "home tel-local" | "home tel-local-prefix" | "home tel-local-suffix" | "home tel-national" | "mobile email" | "mobile tel" | "mobile tel-area-code" | "mobile tel-country-code" | "mobile tel-extension" | "mobile tel-local" | "mobile tel-local-prefix" | "mobile tel-local-suffix" | "mobile tel-national" | "work email" | "work tel" | "work tel-area-code" | "work tel-country-code" | "work tel-extension" | "work tel-local" | "work tel-local-prefix" | "work tel-local-suffix" | "work tel-national" | "name webauthn" | "additional-name webauthn" | "address-level1 webauthn" | "address-level2 webauthn" | "address-level3 webauthn" | "address-level4 webauthn" | "address-line1 webauthn" | "address-line2 webauthn" | "address-line3 webauthn" | "bday-day webauthn" | "bday-month webauthn" | "bday-year webauthn" | "cc-csc webauthn" | "cc-exp webauthn" | "cc-exp-month webauthn" | "cc-exp-year webauthn" | "cc-family-name webauthn" | "cc-given-name webauthn" | "cc-name webauthn" | "cc-number webauthn" | "cc-type webauthn" | "country webauthn" | "country-name webauthn" | "current-password webauthn" | "family-name webauthn" | "given-name webauthn" | "honorific-prefix webauthn" | "honorific-suffix webauthn" | "new-password webauthn" | "one-time-code webauthn" | "organization webauthn" | "postal-code webauthn" | "street-address webauthn" | "transaction-amount webauthn" | "transaction-currency webauthn" | "username webauthn" | "email webauthn" | "tel webauthn" | "tel-area-code webauthn" | "tel-country-code webauthn" | "tel-extension webauthn" | "tel-local webauthn" | "tel-local-prefix webauthn" | "tel-local-suffix webauthn" | "tel-national webauthn" | "home email webauthn" | "home tel webauthn" | "home tel-area-code webauthn" | "home tel-country-code webauthn" | "home tel-extension webauthn" | "home tel-local webauthn" | "home tel-local-prefix webauthn" | "home tel-local-suffix webauthn" | "home tel-national webauthn" | "mobile email webauthn" | "mobile tel webauthn" | "mobile tel-area-code webauthn" | "mobile tel-country-code webauthn" | "mobile tel-extension webauthn" | "mobile tel-local webauthn" | "mobile tel-local-prefix webauthn" | "mobile tel-local-suffix webauthn" | "mobile tel-national webauthn" | "work email webauthn" | "work tel webauthn" | "work tel-area-code webauthn" | "work tel-country-code webauthn" | "work tel-extension webauthn" | "work tel-local webauthn" | "work tel-local-prefix webauthn" | "work tel-local-suffix webauthn" | "work tel-national webauthn" | "billing name" | "billing name webauthn" | "billing additional-name" | "billing additional-name webauthn" | "billing address-level1" | "billing address-level1 webauthn" | "billing address-level2" | "billing address-level2 webauthn" | "billing address-level3" | "billing address-level3 webauthn" | "billing address-level4" | "billing address-level4 webauthn" | "billing address-line1" | "billing address-line1 webauthn" | "billing address-line2" | "billing address-line2 webauthn" | "billing address-line3" | "billing address-line3 webauthn" | "billing bday-day" | "billing bday-day webauthn" | "billing bday-month" | "billing bday-month webauthn" | "billing bday-year" | "billing bday-year webauthn" | "billing cc-csc" | "billing cc-csc webauthn" | "billing cc-exp" | "billing cc-exp webauthn" | "billing cc-exp-month" | "billing cc-exp-month webauthn" | "billing cc-exp-year" | "billing cc-exp-year webauthn" | "billing cc-family-name" | "billing cc-family-name webauthn" | "billing cc-given-name" | "billing cc-given-name webauthn" | "billing cc-name" | "billing cc-name webauthn" | "billing cc-number" | "billing cc-number webauthn" | "billing cc-type" | "billing cc-type webauthn" | "billing country" | "billing country webauthn" | "billing country-name" | "billing country-name webauthn" | "billing current-password" | "billing current-password webauthn" | "billing family-name" | "billing family-name webauthn" | "billing given-name" | "billing given-name webauthn" | "billing honorific-prefix" | "billing honorific-prefix webauthn" | "billing honorific-suffix" | "billing honorific-suffix webauthn" | "billing new-password" | "billing new-password webauthn" | "billing one-time-code" | "billing one-time-code webauthn" | "billing organization" | "billing organization webauthn" | "billing postal-code" | "billing postal-code webauthn" | "billing street-address" | "billing street-address webauthn" | "billing transaction-amount" | "billing transaction-amount webauthn" | "billing transaction-currency" | "billing transaction-currency webauthn" | "billing username" | "billing username webauthn" | "billing email" | "billing email webauthn" | "billing tel" | "billing tel webauthn" | "billing tel-area-code" | "billing tel-area-code webauthn" | "billing tel-country-code" | "billing tel-country-code webauthn" | "billing tel-extension" | "billing tel-extension webauthn" | "billing tel-local" | "billing tel-local webauthn" | "billing tel-local-prefix" | "billing tel-local-prefix webauthn" | "billing tel-local-suffix" | "billing tel-local-suffix webauthn" | "billing tel-national" | "billing tel-national webauthn" | "billing home email" | "billing home email webauthn" | "billing home tel" | "billing home tel webauthn" | "billing home tel-area-code" | "billing home tel-area-code webauthn" | "billing home tel-country-code" | "billing home tel-country-code webauthn" | "billing home tel-extension" | "billing home tel-extension webauthn" | "billing home tel-local" | "billing home tel-local webauthn" | "billing home tel-local-prefix" | "billing home tel-local-prefix webauthn" | "billing home tel-local-suffix" | "billing home tel-local-suffix webauthn" | "billing home tel-national" | "billing home tel-national webauthn" | "billing mobile email" | "billing mobile email webauthn" | "billing mobile tel" | "billing mobile tel webauthn" | "billing mobile tel-area-code" | "billing mobile tel-area-code webauthn" | "billing mobile tel-country-code" | "billing mobile tel-country-code webauthn" | "billing mobile tel-extension" | "billing mobile tel-extension webauthn" | "billing mobile tel-local" | "billing mobile tel-local webauthn" | "billing mobile tel-local-prefix" | "billing mobile tel-local-prefix webauthn" | "billing mobile tel-local-suffix" | "billing mobile tel-local-suffix webauthn" | "billing mobile tel-national" | "billing mobile tel-national webauthn" | "billing work email" | "billing work email webauthn" | "billing work tel" | "billing work tel webauthn" | "billing work tel-area-code" | "billing work tel-area-code webauthn" | "billing work tel-country-code" | "billing work tel-country-code webauthn" | "billing work tel-extension" | "billing work tel-extension webauthn" | "billing work tel-local" | "billing work tel-local webauthn" | "billing work tel-local-prefix" | "billing work tel-local-prefix webauthn" | "billing work tel-local-suffix" | "billing work tel-local-suffix webauthn" | "billing work tel-national" | "billing work tel-national webauthn" | "shipping name" | "shipping name webauthn" | "shipping additional-name" | "shipping additional-name webauthn" | "shipping address-level1" | "shipping address-level1 webauthn" | "shipping address-level2" | "shipping address-level2 webauthn" | "shipping address-level3" | "shipping address-level3 webauthn" | "shipping address-level4" | "shipping address-level4 webauthn" | "shipping address-line1" | "shipping address-line1 webauthn" | "shipping address-line2" | "shipping address-line2 webauthn" | "shipping address-line3" | "shipping address-line3 webauthn" | "shipping bday-day" | "shipping bday-day webauthn" | "shipping bday-month" | "shipping bday-month webauthn" | "shipping bday-year" | "shipping bday-year webauthn" | "shipping cc-csc" | "shipping cc-csc webauthn" | "shipping cc-exp" | "shipping cc-exp webauthn" | "shipping cc-exp-month" | "shipping cc-exp-month webauthn" | "shipping cc-exp-year" | "shipping cc-exp-year webauthn" | "shipping cc-family-name" | "shipping cc-family-name webauthn" | "shipping cc-given-name" | "shipping cc-given-name webauthn" | "shipping cc-name" | "shipping cc-name webauthn" | "shipping cc-number" | "shipping cc-number webauthn" | "shipping cc-type" | "shipping cc-type webauthn" | "shipping country" | "shipping country webauthn" | "shipping country-name" | "shipping country-name webauthn" | "shipping current-password" | "shipping current-password webauthn" | "shipping family-name" | "shipping family-name webauthn" | "shipping given-name" | "shipping given-name webauthn" | "shipping honorific-prefix" | "shipping honorific-prefix webauthn" | "shipping honorific-suffix" | "shipping honorific-suffix webauthn" | "shipping new-password" | "shipping new-password webauthn" | "shipping one-time-code" | "shipping one-time-code webauthn" | "shipping organization" | "shipping organization webauthn" | "shipping postal-code" | "shipping postal-code webauthn" | "shipping street-address" | "shipping street-address webauthn" | "shipping transaction-amount" | "shipping transaction-amount webauthn" | "shipping transaction-currency" | "shipping transaction-currency webauthn" | "shipping username" | "shipping username webauthn" | "shipping email" | "shipping email webauthn" | "shipping tel" | "shipping tel webauthn" | "shipping tel-area-code" | "shipping tel-area-code webauthn" | "shipping tel-country-code" | "shipping tel-country-code webauthn" | "shipping tel-extension" | "shipping tel-extension webauthn" | "shipping tel-local" | "shipping tel-local webauthn" | "shipping tel-local-prefix" | "shipping tel-local-prefix webauthn" | "shipping tel-local-suffix" | "shipping tel-local-suffix webauthn" | "shipping tel-national" | "shipping tel-national webauthn" | "shipping home email" | "shipping home email webauthn" | "shipping home tel" | "shipping home tel webauthn" | "shipping home tel-area-code" | "shipping home tel-area-code webauthn" | "shipping home tel-country-code" | "shipping home tel-country-code webauthn" | "shipping home tel-extension" | "shipping home tel-extension webauthn" | "shipping home tel-local" | "shipping home tel-local webauthn" | "shipping home tel-local-prefix" | "shipping home tel-local-prefix webauthn" | "shipping home tel-local-suffix" | "shipping home tel-local-suffix webauthn" | "shipping home tel-national" | "shipping home tel-national webauthn" | "shipping mobile email" | "shipping mobile email webauthn" | "shipping mobile tel" | "shipping mobile tel webauthn" | "shipping mobile tel-area-code" | "shipping mobile tel-area-code webauthn" | "shipping mobile tel-country-code" | "shipping mobile tel-country-code webauthn" | "shipping mobile tel-extension" | "shipping mobile tel-extension webauthn" | "shipping mobile tel-local" | "shipping mobile tel-local webauthn" | "shipping mobile tel-local-prefix" | "shipping mobile tel-local-prefix webauthn" | "shipping mobile tel-local-suffix" | "shipping mobile tel-local-suffix webauthn" | "shipping mobile tel-national" | "shipping mobile tel-national webauthn" | "shipping work email" | "shipping work email webauthn" | "shipping work tel" | "shipping work tel webauthn" | "shipping work tel-area-code" | "shipping work tel-area-code webauthn" | "shipping work tel-country-code" | "shipping work tel-country-code webauthn" | "shipping work tel-extension" | "shipping work tel-extension webauthn" | "shipping work tel-local" | "shipping work tel-local webauthn" | "shipping work tel-local-prefix" | "shipping work tel-local-prefix webauthn" | "shipping work tel-local-suffix" | "shipping work tel-local-suffix webauthn" | "shipping work tel-national" | "shipping work tel-national webauthn" | `section-${string} name` | `section-${string} name webauthn` | `section-${string} additional-name` | `section-${string} additional-name webauthn` | `section-${string} address-level1` | `section-${string} address-level1 webauthn` | `section-${string} address-level2` | `section-${string} address-level2 webauthn` | `section-${string} address-level3` | `section-${string} address-level3 webauthn` | `section-${string} address-level4` | `section-${string} address-level4 webauthn` | `section-${string} address-line1` | `section-${string} address-line1 webauthn` | `section-${string} address-line2` | `section-${string} address-line2 webauthn` | `section-${string} address-line3` | `section-${string} address-line3 webauthn` | `section-${string} bday-day` | `section-${string} bday-day webauthn` | `section-${string} bday-month` | `section-${string} bday-month webauthn` | `section-${string} bday-year` | `section-${string} bday-year webauthn` | `section-${string} cc-csc` | `section-${string} cc-csc webauthn` | `section-${string} cc-exp` | `section-${string} cc-exp webauthn` | `section-${string} cc-exp-month` | `section-${string} cc-exp-month webauthn` | `section-${string} cc-exp-year` | `section-${string} cc-exp-year webauthn` | `section-${string} cc-family-name` | `section-${string} cc-family-name webauthn` | `section-${string} cc-given-name` | `section-${string} cc-given-name webauthn` | `section-${string} cc-name` | `section-${string} cc-name webauthn` | `section-${string} cc-number` | `section-${string} cc-number webauthn` | `section-${string} cc-type` | `section-${string} cc-type webauthn` | `section-${string} country` | `section-${string} country webauthn` | `section-${string} country-name` | `section-${string} country-name webauthn` | `section-${string} current-password` | `section-${string} current-password webauthn` | `section-${string} family-name` | `section-${string} family-name webauthn` | `section-${string} given-name` | `section-${string} given-name webauthn` | `section-${string} honorific-prefix` | `section-${string} honorific-prefix webauthn` | `section-${string} honorific-suffix` | `section-${string} honorific-suffix webauthn` | `section-${string} new-password` | `section-${string} new-password webauthn` | `section-${string} one-time-code` | `section-${string} one-time-code webauthn` | `section-${string} organization` | `section-${string} organization webauthn` | `section-${string} postal-code` | `section-${string} postal-code webauthn` | `section-${string} street-address` | `section-${string} street-address webauthn` | `section-${string} transaction-amount` | `section-${string} transaction-amount webauthn` | `section-${string} transaction-currency` | `section-${string} transaction-currency webauthn` | `section-${string} username` | `section-${string} username webauthn` | `section-${string} email` | `section-${string} email webauthn` | `section-${string} tel` | `section-${string} tel webauthn` | `section-${string} tel-area-code` | `section-${string} tel-area-code webauthn` | `section-${string} tel-country-code` | `section-${string} tel-country-code webauthn` | `section-${string} tel-extension` | `section-${string} tel-extension webauthn` | `section-${string} tel-local` | `section-${string} tel-local webauthn` | `section-${string} tel-local-prefix` | `section-${string} tel-local-prefix webauthn` | `section-${string} tel-local-suffix` | `section-${string} tel-local-suffix webauthn` | `section-${string} tel-national` | `section-${string} tel-national webauthn` | "bday" | "cc-additional-name" | "billing cc-additional-name" | "shipping cc-additional-name" | "nickname" | "language" | "organization-title" | "photo" | "sex" | "url";
        "data-pin-input-input": string;
        "data-pin-input-input-mss": number | null;
        "data-pin-input-input-mse": number | null;
        inputmode: "none" | "search" | "text" | "email" | "tel" | "url" | "numeric" | "decimal" | null | undefined;
        pattern: any;
        maxlength: number;
        value: string;
        disabled: true | undefined;
        onpaste: (e: BitsEvent<ClipboardEvent>) => void;
        oninput: (e: BitsEvent<InputEvent, HTMLInputElement>) => void;
        onkeydown: (e: BitsKeyboardEvent) => void;
        onmouseover: (_: BitsMouseEvent) => void;
        onmouseleave: (_: BitsMouseEvent) => void;
        onfocus: (_: BitsFocusEvent<HTMLInputElement>) => void;
        onblur: (_: BitsFocusEvent) => void;
    };
    snippetProps: {
        cells: {
            char: string | null;
            isActive: boolean;
            hasFakeCaret: boolean;
        }[];
        isFocused: boolean;
        isHovering: boolean;
    };
}
type PinInputCellStateProps = WithRefProps & ReadableBoxedValues<{
    cell: PinInputCell;
}>;
declare class PinInputCellState {
    readonly opts: PinInputCellStateProps;
    constructor(opts: PinInputCellStateProps);
    props: {
        readonly id: string;
        readonly "data-pin-input-cell": "";
        readonly "data-active": "" | undefined;
        readonly "data-inactive": "" | undefined;
    };
}
export declare function syncTimeouts(cb: (...args: any[]) => unknown): number[];
export declare function usePinInput(props: PinInputRootStateProps): PinInputRootState;
export declare function usePinInputCell(props: PinInputCellStateProps): PinInputCellState;
export {};
