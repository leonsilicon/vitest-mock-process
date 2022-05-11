/*
	eslint-disable
	node/prefer-global/process,
	@typescript-eslint/no-unsafe-assignment,
	@typescript-eslint/no-unsafe-call,
	@typescript-eslint/no-unsafe-return
*/

import deepCloneFunction from 'deep-clone-fn';
import type * as Vi from 'vitest';
import { vi } from 'vitest';

import type { MockedRunResult } from '~/types/result.js';

const maybeMockRestore = (a: any): void =>
	a.mockRestore && typeof a.mockRestore === 'function'
		? a.mockRestore()
		: undefined;

type FunctionPropertyNames<T> = {
	[K in keyof T]: T[K] extends (...args: any[]) => any ? K : never;
}[keyof T];
type ArgsType<T> = T extends (...args: infer A) => any ? A : never;

/**
	Helper function for manually creating new spy mocks of functions not supported by this module.

	@param target Object containing the function that will be mocked.
	@param property Name of the function that will be mocked.
	@param impl Mock implementation of the target's function. The return type must match the target function's.
*/
export function spyOnImplementing<
	// eslint-disable-next-line @typescript-eslint/ban-types
	T extends object,
	M extends FunctionPropertyNames<T>,
	F extends T[M] extends (...args: any[]) => any ? T[M] : never,
	I extends (...args: any[]) => ReturnType<F>
>(target: T, property: M, impl: I): Vi.SpyInstance<ArgsType<F>, ReturnType<F>> {
	maybeMockRestore(target[property]);
	const mock = vi.spyOn(target, property as any).mockImplementation(impl);
	return mock as any;
}

/**
	Helper function to create a mock of the Node.js method `process.exit(code: number)`.

	@param err Optional error to raise. If unspecified or falsy, calling `process.exit` will resume code execution instead of raising an error.
*/
export const mockProcessExit = (err?: any) =>
	spyOnImplementing(
		process,
		'exit',
		(err
			? () => {
					// eslint-disable-next-line @typescript-eslint/no-throw-literal
					throw err;
			  }
			: () => {
					/* noop */
			  }) as () => never
	);

/**
	Helper function to create a mock of the Node.js method `process.stdout.write(text: string, callback?: function): boolean`.
*/
export const mockProcessStdout = () =>
	spyOnImplementing(process.stdout, 'write', () => true);

/**
	Helper function to create a mock of the Node.js method `process.stderr.write(text: string, callback?: function): boolean`.
*/
export const mockProcessStderr = () =>
	spyOnImplementing(process.stderr, 'write', () => true);

/**
	Helper function to create a mock of the Node.js method `console.log(message: any)`.
*/
export const mockConsoleLog = () =>
	spyOnImplementing(console, 'log', () => {
		/* noop */
	});

/**
	Helper function to run a synchronous function with provided mocks in place, as a virtual environment.

	Every provided mock will be automatically restored when this function returns.
*/
export const mockedRun =
	(callers: Record<string, () => Vi.SpyInstance>) => (f: () => any) => {
		const mocks: MockedRunResult = {};
		const mockers: Record<string, Vi.SpyInstance> = Object.fromEntries(
			Object.entries(callers).map(([k, caller]) => [k, caller()])
		);

		try {
			mocks.result = f();
		} catch (error: unknown) {
			mocks.error = error;
		}

		for (const [k, mocker] of Object.entries(mockers)) {
			mocks[k] = deepCloneFunction(mocker);
			maybeMockRestore(mocker);
		}

		return mocks;
	};

/**
	Helper function to run an asynchronous function with provided mocks in place, as a virtual environment.

	Every provided mock will be automatically restored when this function returns.
*/
export const asyncMockedRun =
	(callers: Record<string, () => Vi.SpyInstance>) =>
	async (f: () => Promise<any>) => {
		const mocks: MockedRunResult = {};
		const mockers: Record<string, Vi.SpyInstance> = Object.fromEntries(
			Object.entries(callers).map(([k, caller]) => [k, caller()])
		);

		try {
			mocks.result = await f();
		} catch (error: unknown) {
			mocks.error = error;
		}

		for (const [k, mocker] of Object.entries(mockers)) {
			mocks[k] = deepCloneFunction(mocker);
			maybeMockRestore(mocker);
		}

		return mocks;
	};
