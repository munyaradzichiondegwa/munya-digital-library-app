// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock Firebase services for tests
jest.mock('./firebase', () => ({
  db: {
    collection: jest.fn().mockReturnValue({
      add: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      where: jest.fn().mockReturnThis(),
      onSnapshot: jest.fn(),
    }),
  },
}));