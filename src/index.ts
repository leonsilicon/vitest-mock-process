export type { MockedRunResult } from './types/result.js';
export {
	asyncMockedRun,
	mockConsoleLog,
	mockedRun,
	mockProcessExit,
	mockProcessStderr,
	mockProcessStdout,
	spyOnImplementing,
} from './utils/vitest-mock-process.js';
