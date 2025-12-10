import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import App from './App';
import BookList from './components/BookList';
import * as booksService from './services/books'; // Mock the service

// Mock the service
jest.mock('./services/books');

describe('Digital Library App', () => {
  const mockBooks = [
    { id: '1', title: 'Book One', author: 'Author A', genre: 'Fiction', publicationYear: 2020, status: 'Available' },
    { id: '2', title: 'Book Two', author: 'Author B', genre: 'Non-Fiction', publicationYear: 2021, status: 'Borrowed' },
  ];

  beforeEach(() => {
    booksService.getBooks.mockImplementation((genre, callback) => {
      callback(mockBooks); // Simulate onSnapshot callback
      return jest.fn(); // Mock unsubscribe
    });
    booksService.deleteBook.mockResolvedValue();
  });

  test('renders Digital Library header', () => {
    render(<App />);
    const header = screen.getByText(/Digital Library/i);
    expect(header).toBeInTheDocument();
  });

  test('renders BookList component with mocked books', async () => {
    render(<BookList genre={null} refreshTrigger={0} />);

    await waitFor(() => {
      expect(screen.getByText('Book One')).toBeInTheDocument();
    });

    expect(screen.getByText('Book Two')).toBeInTheDocument();

    // Check table headers including new Actions column
    expect(screen.getByText(/Title/i)).toBeInTheDocument();
    expect(screen.getByText(/Actions/i)).toBeInTheDocument();
  });

  test('deletes a book when button is clicked', async () => {
    render(<BookList genre={null} refreshTrigger={0} />);

    await waitFor(() => {
      expect(screen.getByText('Book One')).toBeInTheDocument();
    });

    // Simulate delete click (assumes confirm() returns true)
    global.confirm = jest.fn(() => true);
    const deleteButton = screen.getAllByText('Delete')[0]; // First delete button
    fireEvent.click(deleteButton);

    expect(booksService.deleteBook).toHaveBeenCalledWith('1'); // First book's ID
  });
});