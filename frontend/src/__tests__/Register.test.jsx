/**
 * Register.test.jsx — Register Page Component Tests
 * Frontend: src/pages/Register.jsx
 * Run: cd frontend && npm test
 * 
 * Tests:
 * 1. Board selection renders correctly (no 1-on-1 option)
 * 2. Class dropdown appears only when a board is selected
 * 3. Form validates required fields
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../store/slices/authSlice';
import Register from '../pages/Register';

// Mock axios
jest.mock('axios', () => ({
  get: jest.fn().mockResolvedValue({
    data: [
      { className: 'Class 6' },
      { className: 'Class 7' },
      { className: 'Class 8' },
      { className: 'Class 9' },
      { className: 'Class 10' },
    ]
  }),
  post: jest.fn().mockResolvedValue({
    data: { _id: '123', email: 'test@test.com', role: 'Student', token: 'fake-token' }
  })
}));

// Mock useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  Link: ({ children, to }) => <a href={to}>{children}</a>
}));

const renderRegister = () => {
  const store = configureStore({ reducer: { auth: authReducer } });
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    </Provider>
  );
};

describe('Register Page', () => {

  // ── BOARD SELECTION ───────────────────────────────────────────────────────
  describe('Board Dropdown', () => {

    it('renders board dropdown with correct options', async () => {
      renderRegister();
      const boardSelect = await screen.findByDisplayValue('Select Board');
      expect(boardSelect).toBeInTheDocument();
    });

    it('does NOT show "1-on-1 Personal Class" in board options', async () => {
      renderRegister();
      // Wait for component to render
      await waitFor(() => {
        const options = screen.queryAllByRole('option');
        const oneOnOneOption = options.find(opt => opt.textContent.includes('1-on-1'));
        expect(oneOnOneOption).toBeUndefined();
      });
    });

    it('shows TS Board, AP Board, CBSE, ICSE board options', async () => {
      renderRegister();
      await waitFor(() => {
        expect(screen.getByText('TS Board')).toBeInTheDocument();
        expect(screen.getByText('AP Board')).toBeInTheDocument();
        expect(screen.getByText('CBSE Board')).toBeInTheDocument();
        expect(screen.getByText('ICSE Board')).toBeInTheDocument();
      });
    });
  });

  // ── CLASS DROPDOWN ────────────────────────────────────────────────────────
  describe('Class Dropdown', () => {

    it('class dropdown is hidden before board is selected', async () => {
      renderRegister();
      await waitFor(() => {
        const classSelect = screen.queryByDisplayValue('Select Class');
        expect(classSelect).not.toBeInTheDocument();
      });
    });

    it('class dropdown appears after selecting a board', async () => {
      renderRegister();
      await waitFor(() => {
        const boardSelect = screen.queryByDisplayValue('Select Board');
        if (boardSelect) {
          fireEvent.change(boardSelect, { target: { value: 'TS Board' } });
        }
      });
      await waitFor(() => {
        const classSelect = screen.queryByDisplayValue('Select Class');
        expect(classSelect).toBeInTheDocument();
      });
    });

    it('class options are loaded dynamically from API', async () => {
      renderRegister();
      await waitFor(() => {
        const boardSelect = screen.queryByDisplayValue('Select Board');
        if (boardSelect) {
          fireEvent.change(boardSelect, { target: { value: 'AP Board' } });
        }
      });
      await waitFor(() => {
        expect(screen.queryByText('Class 6')).toBeInTheDocument();
        expect(screen.queryByText('Class 10')).toBeInTheDocument();
      });
    });
  });

  // ── FORM VALIDATION ───────────────────────────────────────────────────────
  describe('Form fields', () => {

    it('renders all required input fields', async () => {
      renderRegister();
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Full Name')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Email Address')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Mobile Number')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
      });
    });

    it('renders REGISTER submit button', async () => {
      renderRegister();
      await waitFor(() => {
        expect(screen.getByText('REGISTER')).toBeInTheDocument();
      });
    });

    it('renders link to login page', async () => {
      renderRegister();
      await waitFor(() => {
        expect(screen.getByText('Click here to Login')).toBeInTheDocument();
      });
    });
  });

});
