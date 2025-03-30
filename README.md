# CRM Customer Management Application

A React TypeScript application for managing and filtering customer data with a clean, intuitive user interface.

## Features

- **Customer Data Display**: View customer information in a clean tabular format
- **Real-time Filtering**:
  - Search by name (first or last name) with 1-second debounce for optimal performance
  - Filter by city using a dropdown populated with available cities
- **Highlight Feature**: Option to highlight the oldest customer in each city
- **Responsive Design**: Works well on desktop and mobile devices


## Technologies Used

- React
- TypeScript
- CSS
- [DummyJSON API](https://dummyjson.com/) for mock data

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repository-url>
   cd <repository-folder>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Project Structure

- `src/App.tsx` - Main application component with filtering and display logic
- `src/App.css` - Styling for the application

## Key Implementation Details

### Custom useDebounce Hook

The application uses a custom hook to implement debouncing for the name filter, optimizing performance by reducing the number of filter operations:

```typescript
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

### Data Fetching

The application fetches user data from the DummyJSON API and extracts unique cities for the dropdown filter:

```typescript
useEffect(() => {
  const fetchUsers = async () => {
    try {
      const response = await fetch('https://dummyjson.com/users');
      const data = await response.json();
      
      if (data && data.users) {
        setUsers(data.users);
        setFilteredUsers(data.users);
        
        // Extract unique cities for dropdown
        const uniqueCities = Array.from(
          new Set(data.users.map((user: User) => user.address.city))
        ).sort();
        
        setCities(uniqueCities as string[]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  fetchUsers();
}, []);
```

### Determining the Oldest Customer

The application identifies the oldest customer in each city using birth date comparison:

```typescript
const isOldestInCity = (user: User): boolean => {
  if (!highlightOldest) return false;
  
  const usersInSameCity = users.filter(u => u.address.city === user.address.city);
  const oldestUser = usersInSameCity.reduce((oldest, current) => {
    const oldestDate = new Date(oldest.birthDate);
    const currentDate = new Date(current.birthDate);
    return oldestDate < currentDate ? oldest : current;
  }, usersInSameCity[0]);
  
  return oldestUser.id === user.id;
};
```

