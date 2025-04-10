/* eslint-disable @typescript-eslint/no-explicit-any */
import { box } from "svelte-toolbelt";
/**
 * The `useStateMachine` function is a TypeScript function that creates a state machine and returns the
 * current state and a dispatch function to update the state based on events.
 * @param initialState - The `initialState` parameter is the initial state of the state machine. It
 * represents the starting point of the state machine's state.
 * @param machine - The `machine` parameter is an object that represents a state machine. It should
 * have keys that correspond to the possible states of the machine, and the values should be objects
 * that represent the possible events and their corresponding next states.
 * @returns The `useStateMachine` function returns an object with two properties: `state` and
 * `dispatch`.
 */
export function useStateMachine(initialState, machine) {
    const state = box(initialState);
    function reducer(event) {
        // @ts-expect-error  state.value is keyof M
        const nextState = machine[state.current][event];
        return nextState ?? state.current;
    }
    const dispatch = (event) => {
        state.current = reducer(event);
    };
    return {
        state,
        dispatch,
    };
}
