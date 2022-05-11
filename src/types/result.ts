import type * as Vi from 'vitest';

export interface MockedRunResult {
	[_: string]: Vi.SpyInstance;
	error?: any;
	result?: any;
}
