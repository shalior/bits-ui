import type { Updater } from "svelte/store";
import type { DateValue } from "@internationalized/date";
import { type WritableBox } from "svelte-toolbelt";
import type { DateRangeFieldRootState } from "../date-range-field/date-range-field.svelte.js";
import type { ReadableBoxedValues, WritableBoxedValues } from "../../internal/box.svelte.js";
import type { BitsFocusEvent, BitsKeyboardEvent, BitsMouseEvent, WithRefProps } from "../../internal/types.js";
import type { DateAndTimeSegmentObj, DateOnInvalid, DateSegmentObj, DateSegmentPart, DateValidator, Granularity, HourCycle, SegmentPart, SegmentValueObj, TimeSegmentObj, TimeSegmentPart } from "../../shared/date/types.js";
import { type Formatter } from "../../internal/date-time/formatter.js";
import { type Announcer } from "../../internal/date-time/announcer.js";
export declare const DATE_FIELD_INPUT_ATTR = "data-date-field-input";
export type DateFieldRootStateProps = WritableBoxedValues<{
    value: DateValue | undefined;
    placeholder: DateValue;
}> & ReadableBoxedValues<{
    readonlySegments: SegmentPart[];
    validate: DateValidator | undefined;
    onInvalid: DateOnInvalid | undefined;
    minValue: DateValue | undefined;
    maxValue: DateValue | undefined;
    disabled: boolean;
    readonly: boolean;
    granularity: Granularity | undefined;
    hourCycle: HourCycle | undefined;
    locale: string;
    hideTimeZone: boolean;
    required: boolean;
    errorMessageId: string | undefined;
    isInvalidProp: boolean | undefined;
}>;
export declare class DateFieldRootState {
    #private;
    value: DateFieldRootStateProps["value"];
    placeholder: WritableBox<DateValue>;
    validate: DateFieldRootStateProps["validate"];
    minValue: DateFieldRootStateProps["minValue"];
    maxValue: DateFieldRootStateProps["maxValue"];
    disabled: DateFieldRootStateProps["disabled"];
    readonly: DateFieldRootStateProps["readonly"];
    granularity: DateFieldRootStateProps["granularity"];
    readonlySegments: DateFieldRootStateProps["readonlySegments"];
    hourCycle: DateFieldRootStateProps["hourCycle"];
    locale: DateFieldRootStateProps["locale"];
    hideTimeZone: DateFieldRootStateProps["hideTimeZone"];
    required: DateFieldRootStateProps["required"];
    onInvalid: DateFieldRootStateProps["onInvalid"];
    errorMessageId: DateFieldRootStateProps["errorMessageId"];
    isInvalidProp: DateFieldRootStateProps["isInvalidProp"];
    descriptionId: string;
    formatter: Formatter;
    initialSegments: SegmentValueObj;
    segmentValues: SegmentValueObj;
    announcer: Announcer;
    readonlySegmentsSet: Set<SegmentPart>;
    segmentStates: import("../../internal/date-time/field/types.js").SegmentStateMap;
    descriptionNode: HTMLElement | null;
    validationNode: HTMLElement | null;
    states: import("../../internal/date-time/field/types.js").SegmentStateMap;
    dayPeriodNode: HTMLElement | null;
    rangeRoot: DateRangeFieldRootState | undefined;
    name: string;
    constructor(props: DateFieldRootStateProps, rangeRoot?: DateRangeFieldRootState);
    setName(name: string): void;
    /**
     * Sets the field node for the `DateFieldRootState` instance. We use this method so we can
     * keep `#fieldNode` private to prevent accidental usage of the incorrect field node.
     */
    setFieldNode(node: HTMLElement | null): void;
    /**
     * Gets the correct field node for the date field regardless of whether it's being
     * used in a standalone context or within a `DateRangeField` component.
     */
    getFieldNode(): HTMLElement | null;
    /**
     * Sets the label node for the `DateFieldRootState` instance. We use this method so we can
     * keep `#labelNode` private to prevent accidental usage of the incorrect label node.
     */
    setLabelNode(node: HTMLElement | null): void;
    /**
     * Gets the correct label node for the date field regardless of whether it's being used in
     * a standalone context or within a `DateRangeField` component.
     */
    getLabelNode(): HTMLElement | null;
    setValue(value: DateValue | undefined): void;
    syncSegmentValues(value: DateValue): void;
    validationStatus: false | {
        readonly reason: "custom";
        readonly message: string | string[];
    } | {
        readonly reason: "min";
        readonly message?: undefined;
    } | {
        readonly reason: "max";
        readonly message?: undefined;
    };
    isInvalid: boolean;
    inferredGranularity: Granularity;
    allSegmentContent: {
        obj: import("../../internal/date-time/field/types.js").SegmentContentObj;
        arr: {
            part: import("../../internal/date-time/field/types.js").SegmentPart;
            value: string;
        }[];
    };
    segmentContents: {
        part: import("../../internal/date-time/field/types.js").SegmentPart;
        value: string;
    }[];
    sharedSegmentAttrs: {
        role: string;
        contenteditable: string;
        tabindex: number;
        spellcheck: boolean;
        inputmode: string;
        autocorrect: string;
        enterkeyhint: string;
        style: {
            caretColor: string;
        };
    };
    updateSegment<T extends keyof DateAndTimeSegmentObj>(part: T, cb: T extends DateSegmentPart ? Updater<DateSegmentObj[T]> : T extends TimeSegmentPart ? Updater<TimeSegmentObj[T]> : Updater<DateAndTimeSegmentObj[T]>): void;
    handleSegmentClick(e: BitsMouseEvent): void;
    getBaseSegmentAttrs(part: SegmentPart, segmentId: string): {
        "aria-invalid": "true" | undefined;
        "aria-disabled": "true" | "false";
        "aria-readonly": "true" | "false";
        "data-invalid": "" | undefined;
        "data-disabled": "" | undefined;
        "data-readonly": "" | undefined;
        "data-segment": string;
    } | {
        "aria-labelledby": string;
        contenteditable: string | undefined;
        "aria-describedby": string | undefined;
        tabindex: number | undefined;
        "aria-invalid": "true" | undefined;
        "aria-disabled": "true" | "false";
        "aria-readonly": "true" | "false";
        "data-invalid": "" | undefined;
        "data-disabled": "" | undefined;
        "data-readonly": "" | undefined;
        "data-segment": string;
    };
}
type DateFieldInputStateProps = WithRefProps & ReadableBoxedValues<{
    name: string;
}>;
export declare class DateFieldInputState {
    #private;
    readonly opts: DateFieldInputStateProps;
    readonly root: DateFieldRootState;
    constructor(opts: DateFieldInputStateProps, root: DateFieldRootState);
    props: {
        readonly id: string;
        readonly role: "group";
        readonly "aria-labelledby": string | undefined;
        readonly "aria-describedby": string | undefined;
        readonly "aria-disabled": "true" | "false";
        readonly "data-invalid": "" | undefined;
        readonly "data-disabled": "" | undefined;
        readonly "data-date-field-input": "";
    };
}
declare class DateFieldHiddenInputState {
    readonly root: DateFieldRootState;
    shouldRender: boolean;
    isoValue: string;
    constructor(root: DateFieldRootState);
    props: {
        name: string;
        value: string;
        required: boolean;
    };
}
type DateFieldLabelStateProps = WithRefProps;
declare class DateFieldLabelState {
    readonly opts: DateFieldLabelStateProps;
    readonly root: DateFieldRootState;
    constructor(opts: DateFieldLabelStateProps, root: DateFieldRootState);
    onclick(_: BitsMouseEvent): void;
    props: {
        readonly id: string;
        readonly "data-invalid": "" | undefined;
        readonly "data-disabled": "" | undefined;
        readonly "data-date-field-label": "";
        readonly onclick: (_: BitsMouseEvent) => void;
    };
}
type DateFieldDaySegmentStateProps = WithRefProps;
declare class DateFieldDaySegmentState {
    #private;
    readonly opts: DateFieldDaySegmentStateProps;
    readonly root: DateFieldRootState;
    constructor(opts: DateFieldDaySegmentStateProps, root: DateFieldRootState);
    onkeydown(e: BitsKeyboardEvent): void;
    onfocusout(_: BitsFocusEvent): void;
    props: {
        "aria-invalid": "true" | undefined;
        "aria-disabled": "true" | "false";
        "aria-readonly": "true" | "false";
        "data-invalid": "" | undefined;
        "data-disabled": "" | undefined;
        "data-readonly": "" | undefined;
        "data-segment": string;
        id: string;
        "aria-label": string;
        "aria-valuemin": number;
        "aria-valuemax": number;
        "aria-valuenow": number;
        "aria-valuetext": string;
        onkeydown: (e: BitsKeyboardEvent) => void;
        onfocusout: (_: BitsFocusEvent) => void;
        onclick: (e: BitsMouseEvent) => void;
        role: string;
        contenteditable: string;
        tabindex: number;
        spellcheck: boolean;
        inputmode: string;
        autocorrect: string;
        enterkeyhint: string;
        style: {
            caretColor: string;
        };
    } | {
        "aria-labelledby": string;
        contenteditable: string | undefined;
        "aria-describedby": string | undefined;
        tabindex: number | undefined;
        "aria-invalid": "true" | undefined;
        "aria-disabled": "true" | "false";
        "aria-readonly": "true" | "false";
        "data-invalid": "" | undefined;
        "data-disabled": "" | undefined;
        "data-readonly": "" | undefined;
        "data-segment": string;
        id: string;
        "aria-label": string;
        "aria-valuemin": number;
        "aria-valuemax": number;
        "aria-valuenow": number;
        "aria-valuetext": string;
        onkeydown: (e: BitsKeyboardEvent) => void;
        onfocusout: (_: BitsFocusEvent) => void;
        onclick: (e: BitsMouseEvent) => void;
        role: string;
        spellcheck: boolean;
        inputmode: string;
        autocorrect: string;
        enterkeyhint: string;
        style: {
            caretColor: string;
        };
    };
}
type DateFieldMonthSegmentStateProps = WithRefProps;
declare class DateFieldMonthSegmentState {
    #private;
    readonly opts: DateFieldMonthSegmentStateProps;
    readonly root: DateFieldRootState;
    constructor(opts: DateFieldMonthSegmentStateProps, root: DateFieldRootState);
    onkeydown(e: BitsKeyboardEvent): void;
    onfocusout(_: BitsFocusEvent): void;
    props: {
        readonly "aria-invalid": "true" | undefined;
        readonly "aria-disabled": "true" | "false";
        readonly "aria-readonly": "true" | "false";
        readonly "data-invalid": "" | undefined;
        readonly "data-disabled": "" | undefined;
        readonly "data-readonly": "" | undefined;
        readonly "data-segment": string;
        readonly id: string;
        readonly "aria-label": "month, ";
        readonly contenteditable: "true";
        readonly "aria-valuemin": 1;
        readonly "aria-valuemax": 12;
        readonly "aria-valuenow": number;
        readonly "aria-valuetext": string;
        readonly onkeydown: (e: BitsKeyboardEvent) => void;
        readonly onfocusout: (_: BitsFocusEvent) => void;
        readonly onclick: (e: BitsMouseEvent) => void;
        readonly role: string;
        readonly tabindex: number;
        readonly spellcheck: boolean;
        readonly inputmode: string;
        readonly autocorrect: string;
        readonly enterkeyhint: string;
        readonly style: {
            caretColor: string;
        };
    } | {
        readonly "aria-labelledby": string;
        readonly contenteditable: string | undefined;
        readonly "aria-describedby": string | undefined;
        readonly tabindex: number | undefined;
        readonly "aria-invalid": "true" | undefined;
        readonly "aria-disabled": "true" | "false";
        readonly "aria-readonly": "true" | "false";
        readonly "data-invalid": "" | undefined;
        readonly "data-disabled": "" | undefined;
        readonly "data-readonly": "" | undefined;
        readonly "data-segment": string;
        readonly id: string;
        readonly "aria-label": "month, ";
        readonly "aria-valuemin": 1;
        readonly "aria-valuemax": 12;
        readonly "aria-valuenow": number;
        readonly "aria-valuetext": string;
        readonly onkeydown: (e: BitsKeyboardEvent) => void;
        readonly onfocusout: (_: BitsFocusEvent) => void;
        readonly onclick: (e: BitsMouseEvent) => void;
        readonly role: string;
        readonly spellcheck: boolean;
        readonly inputmode: string;
        readonly autocorrect: string;
        readonly enterkeyhint: string;
        readonly style: {
            caretColor: string;
        };
    };
}
type DateFieldYearSegmentStateProps = WithRefProps;
declare class DateFieldYearSegmentState {
    #private;
    readonly opts: DateFieldYearSegmentStateProps;
    readonly root: DateFieldRootState;
    constructor(opts: DateFieldYearSegmentStateProps, root: DateFieldRootState);
    onkeydown(e: BitsKeyboardEvent): void;
    onfocusout(_: BitsFocusEvent): void;
    props: {
        "aria-invalid": "true" | undefined;
        "aria-disabled": "true" | "false";
        "aria-readonly": "true" | "false";
        "data-invalid": "" | undefined;
        "data-disabled": "" | undefined;
        "data-readonly": "" | undefined;
        "data-segment": string;
        id: string;
        "aria-label": string;
        "aria-valuemin": number;
        "aria-valuemax": number;
        "aria-valuenow": number;
        "aria-valuetext": string;
        onkeydown: (e: BitsKeyboardEvent) => void;
        onclick: (e: BitsMouseEvent) => void;
        onfocusout: (_: BitsFocusEvent) => void;
        role: string;
        contenteditable: string;
        tabindex: number;
        spellcheck: boolean;
        inputmode: string;
        autocorrect: string;
        enterkeyhint: string;
        style: {
            caretColor: string;
        };
    } | {
        "aria-labelledby": string;
        contenteditable: string | undefined;
        "aria-describedby": string | undefined;
        tabindex: number | undefined;
        "aria-invalid": "true" | undefined;
        "aria-disabled": "true" | "false";
        "aria-readonly": "true" | "false";
        "data-invalid": "" | undefined;
        "data-disabled": "" | undefined;
        "data-readonly": "" | undefined;
        "data-segment": string;
        id: string;
        "aria-label": string;
        "aria-valuemin": number;
        "aria-valuemax": number;
        "aria-valuenow": number;
        "aria-valuetext": string;
        onkeydown: (e: BitsKeyboardEvent) => void;
        onclick: (e: BitsMouseEvent) => void;
        onfocusout: (_: BitsFocusEvent) => void;
        role: string;
        spellcheck: boolean;
        inputmode: string;
        autocorrect: string;
        enterkeyhint: string;
        style: {
            caretColor: string;
        };
    };
}
type DateFieldHourSegmentStateProps = WithRefProps;
declare class DateFieldHourSegmentState {
    #private;
    readonly opts: DateFieldHourSegmentStateProps;
    readonly root: DateFieldRootState;
    constructor(opts: DateFieldHourSegmentStateProps, root: DateFieldRootState);
    onkeydown(e: BitsKeyboardEvent): void;
    onfocusout(_: BitsFocusEvent): void;
    props: {};
}
type DateFieldMinuteSegmentStateProps = WithRefProps;
declare class DateFieldMinuteSegmentState {
    #private;
    readonly opts: DateFieldMinuteSegmentStateProps;
    readonly root: DateFieldRootState;
    constructor(opts: DateFieldMinuteSegmentStateProps, root: DateFieldRootState);
    onkeydown(e: BitsKeyboardEvent): void;
    onfocusout(_: BitsFocusEvent): void;
    props: {};
}
type DateFieldSecondSegmentStateProps = WithRefProps;
declare class DateFieldSecondSegmentState {
    #private;
    readonly opts: DateFieldSecondSegmentStateProps;
    readonly root: DateFieldRootState;
    constructor(opts: DateFieldSecondSegmentStateProps, root: DateFieldRootState);
    onkeydown(e: BitsKeyboardEvent): void;
    onfocusout(_: BitsFocusEvent): void;
    props: {};
}
type DateFieldDayPeriodSegmentStateProps = WithRefProps;
declare class DateFieldDayPeriodSegmentState {
    #private;
    readonly opts: DateFieldDayPeriodSegmentStateProps;
    readonly root: DateFieldRootState;
    constructor(opts: DateFieldDayPeriodSegmentStateProps, root: DateFieldRootState);
    onkeydown(e: BitsKeyboardEvent): void;
    props: {
        "aria-invalid": "true" | undefined;
        "aria-disabled": "true" | "false";
        "aria-readonly": "true" | "false";
        "data-invalid": "" | undefined;
        "data-disabled": "" | undefined;
        "data-readonly": "" | undefined;
        "data-segment": string;
        id: string;
        inputmode: string;
        "aria-label": string;
        "aria-valuemin": number;
        "aria-valuemax": number;
        "aria-valuenow": number | "AM" | "PM";
        "aria-valuetext": "AM" | "PM";
        onkeydown: (e: BitsKeyboardEvent) => void;
        onclick: (e: BitsMouseEvent) => void;
        role: string;
        contenteditable: string;
        tabindex: number;
        spellcheck: boolean;
        autocorrect: string;
        enterkeyhint: string;
        style: {
            caretColor: string;
        };
    } | {
        "aria-labelledby": string;
        contenteditable: string | undefined;
        "aria-describedby": string | undefined;
        tabindex: number | undefined;
        "aria-invalid": "true" | undefined;
        "aria-disabled": "true" | "false";
        "aria-readonly": "true" | "false";
        "data-invalid": "" | undefined;
        "data-disabled": "" | undefined;
        "data-readonly": "" | undefined;
        "data-segment": string;
        id: string;
        inputmode: string;
        "aria-label": string;
        "aria-valuemin": number;
        "aria-valuemax": number;
        "aria-valuenow": number | "AM" | "PM";
        "aria-valuetext": "AM" | "PM";
        onkeydown: (e: BitsKeyboardEvent) => void;
        onclick: (e: BitsMouseEvent) => void;
        role: string;
        spellcheck: boolean;
        autocorrect: string;
        enterkeyhint: string;
        style: {
            caretColor: string;
        };
    } | undefined;
}
type DateFieldLiteralSegmentStateProps = WithRefProps;
declare class DateFieldDayLiteralSegmentState {
    readonly opts: DateFieldLiteralSegmentStateProps;
    readonly root: DateFieldRootState;
    constructor(opts: DateFieldLiteralSegmentStateProps, root: DateFieldRootState);
    props: {
        readonly "aria-invalid": "true" | undefined;
        readonly "aria-disabled": "true" | "false";
        readonly "aria-readonly": "true" | "false";
        readonly "data-invalid": "" | undefined;
        readonly "data-disabled": "" | undefined;
        readonly "data-readonly": "" | undefined;
        readonly "data-segment": string;
        readonly id: string;
        readonly "aria-hidden": "true" | undefined;
    } | {
        readonly "aria-labelledby": string;
        readonly contenteditable: string | undefined;
        readonly "aria-describedby": string | undefined;
        readonly tabindex: number | undefined;
        readonly "aria-invalid": "true" | undefined;
        readonly "aria-disabled": "true" | "false";
        readonly "aria-readonly": "true" | "false";
        readonly "data-invalid": "" | undefined;
        readonly "data-disabled": "" | undefined;
        readonly "data-readonly": "" | undefined;
        readonly "data-segment": string;
        readonly id: string;
        readonly "aria-hidden": "true" | undefined;
    };
}
declare class DateFieldTimeZoneSegmentState {
    readonly opts: DateFieldMinuteSegmentStateProps;
    readonly root: DateFieldRootState;
    constructor(opts: DateFieldMinuteSegmentStateProps, root: DateFieldRootState);
    onkeydown(e: BitsKeyboardEvent): void;
    props: {
        readonly "data-readonly": "" | undefined;
        readonly "aria-invalid": "true" | undefined;
        readonly "aria-disabled": "true" | "false";
        readonly "aria-readonly": "true" | "false";
        readonly "data-invalid": "" | undefined;
        readonly "data-disabled": "" | undefined;
        readonly "data-segment": string;
        readonly role: "textbox";
        readonly id: string;
        readonly "aria-label": "timezone, ";
        readonly style: {
            readonly caretColor: "transparent";
        };
        readonly onkeydown: (e: BitsKeyboardEvent) => void;
        readonly tabindex: 0;
    } | {
        readonly "data-readonly": "" | undefined;
        readonly "aria-labelledby": string;
        readonly contenteditable: string | undefined;
        readonly "aria-describedby": string | undefined;
        readonly tabindex: number | undefined;
        readonly "aria-invalid": "true" | undefined;
        readonly "aria-disabled": "true" | "false";
        readonly "aria-readonly": "true" | "false";
        readonly "data-invalid": "" | undefined;
        readonly "data-disabled": "" | undefined;
        readonly "data-segment": string;
        readonly role: "textbox";
        readonly id: string;
        readonly "aria-label": "timezone, ";
        readonly style: {
            readonly caretColor: "transparent";
        };
        readonly onkeydown: (e: BitsKeyboardEvent) => void;
    };
}
export declare function useDateFieldRoot(props: DateFieldRootStateProps, rangeRoot?: DateRangeFieldRootState): DateFieldRootState;
export declare function useDateFieldInput(props: DateFieldInputStateProps): DateFieldInputState;
export declare function useDateFieldHiddenInput(): DateFieldHiddenInputState;
export declare function useDateFieldSegment(part: SegmentPart, props: WithRefProps): DateFieldDaySegmentState | DateFieldMonthSegmentState | DateFieldYearSegmentState | DateFieldHourSegmentState | DateFieldMinuteSegmentState | DateFieldSecondSegmentState | DateFieldDayPeriodSegmentState | DateFieldDayLiteralSegmentState | DateFieldTimeZoneSegmentState;
export declare function useDateFieldLabel(props: DateFieldLabelStateProps): DateFieldLabelState;
export {};
