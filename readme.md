# vitest-mock-process 

[![npm version](https://badge.fury.io/js/vitest-mock-process.svg)](https://www.npmjs.com/package/vitest-mock-process)

Easily mock Node.js process properties in Vitest.

This repo is a port of EpicEric's amazing [jest-mock-process package for Jest](https://github.com/EpicEric/jest-mock-process).

## Installation

```bash
npm install --save-dev vitest-mock-process
```

## Usage

Make sure to add the following to your `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // ...
  test: {
    deps: {
      inline: ['vitest-mock-process'],
    }
    // ...
  },
});
```

### JavaScript

```javascript
import * as mockProcess from 'vitest-mock-process';

let mockExit = mockProcess.mockProcessExit();
process.exit(1);
expect(mockExit).toHaveBeenCalledWith(1);
mockExit = mockProcess.mockProcessExit(new Error('Mock'));
expect(() => process.exit(0)).toThrowError('Mock');

let mockStdout = mockProcess.mockProcessStdout();
process.stdout.write('Hello, world!');
expect(mockStdout).toHaveBeenCalledWith('Hello, world!');

let mockStderr = mockProcess.mockProcessStderr();
process.stderr.write('Error');
expect(mockStderr).toHaveBeenCalledWith('Error');

let mockLog = mockProcess.mockConsoleLog();
console.log('Browser log');
expect(mockLog).toHaveBeenCalledWith('Browser log');

mockExit.mockRestore();
mockStdout.mockRestore();
mockStderr.mockRestore();
mockLog.mockRestore();
```

### TypeScript

```typescript
import { mockProcessExit, mockProcessStdout, mockProcessStderr, mockConsoleLog } from 'vitest-mock-process';

let mockExit = mockProcessExit();
process.exit(1);
expect(mockExit).toHaveBeenCalledWith(1);
mockExit = mockProcessExit(new Error('Mock'));
expect(() => process.exit(0)).toThrowError('Mock');

const mockStdout = mockProcessStdout();
process.stdout.write('Hello, world!');
expect(mockStdout).toHaveBeenCalledWith('Hello, world!');

const mockStderr = mockProcessStderr();
process.stderr.write('Error');
expect(mockStderr).toHaveBeenCalledWith('Error');

const mockLog = mockConsoleLog();
console.log('Browser log');
expect(mockLog).toHaveBeenCalledWith('Browser log');

mockExit.mockRestore();
mockStdout.mockRestore();
mockStderr.mockRestore();
mockLog.mockRestore();
```

### Advanced usage

* You can use `mockedRun` (or `asyncMockedRun`) to set-up a virtual environment that will automatically create and restore provided mocks:

```typescript
import { mockedRun, MockedRunResult } from 'vitest-mock-process';

const mockRun: (_: () => any) => MockedRunResult = mockedRun({
    stdout: mockProcessStdout,
    stderr: mockProcessStderr,
    exit: mockProcessExit,
    log: mockConsoleLog,
});
const mocks: MockedRunResult = mockRun(() => {
    process.stdout.write('stdout payload');
    process.stderr.write('stderr payload');
    process.exit(-1);
    console.log('log payload');
});
expect(mocks.stdout).toHaveBeenCalledTimes(1);
expect(mocks.log).toHaveBeenCalledWith('log payload');
```

* You can mock generic methods not supported by default in `vitest-mock-process` with the `spyOnImplementing` function:

```typescript
import { spyOnImplementing } from 'vitest-mock-process';

const mockStdin = spyOnImplementing(process.stdin, 'read', () => '');
process.stdin.read(1024);
expect(mockStdin).toHaveBeenCalledWith(1024);
```
