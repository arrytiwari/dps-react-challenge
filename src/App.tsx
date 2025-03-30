import React, { useEffect, useState } from 'react';
import './App.css';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  birthDate: string;
  address: {
    city: string;
  };
}

// Custom useDebounce hook
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

const App: React.FC = () => {
	// State for storing users data
	const [users, setUsers] = useState<User[]>([]);
	const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  
	// State for filter values
	const [nameFilter, setNameFilter] = useState('');
	const [cityFilter, setCityFilter] = useState('');
	const [highlightOldest, setHighlightOldest] = useState(false);
  
	// State for cities dropdown options
	const [cities, setCities] = useState<string[]>([]);

	// Use the debounce hook for name filter
	const debouncedNameFilter = useDebounce(nameFilter, 1000);

	// Fetch users data on component mount
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

	// filters whenever debounced name filter or city filter changes
	useEffect(() => {
		let result = [...users];
    
		//  name filter
		if (debouncedNameFilter.trim() !== '') {
			const lowerCaseFilter = debouncedNameFilter.toLowerCase();
			result = result.filter(
				user => 
					user.firstName.toLowerCase().includes(lowerCaseFilter) || 
          user.lastName.toLowerCase().includes(lowerCaseFilter)
			);
		}
    
		//  city filter
		if (cityFilter) {
			result = result.filter(user => user.address.city === cityFilter);
		}
    
		setFilteredUsers(result);
	}, [debouncedNameFilter, cityFilter, users]);

	// Function to determine if a user is the oldest in their city
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

	// Format birthDate to DD.MM.YYYY format
	const formatBirthDate = (dateString: string): string => {
		const date = new Date(dateString);
		const day = date.getDate().toString().padStart(2, '0');
		const month = (date.getMonth() + 1).toString().padStart(2, '0');
		const year = date.getFullYear();
		return `${day}.${month}.${year}`;
	};

	return (
		<div className="crm-container">
			<div className="filter-container">
				<div className="filter-row">
					<div className="filter-group">
						<label>Name</label>
						<input
							type="text"
							value={nameFilter}
							onChange={(e) => setNameFilter(e.target.value)}
							placeholder="Search by name"
							className="name-input"
						/>
					</div>
          
					<div className="filter-group">
						<label>City</label>
						<select
							value={cityFilter}
							onChange={(e) => setCityFilter(e.target.value)}
							className="city-dropdown"
						>
							<option value="">Select city</option>
							{cities.map(city => (
								<option key={city} value={city}>
									{city}
								</option>
							))}
						</select>
					</div>
          
					<div className="filter-group highlight-checkbox">
						<label>
							<input
								type="checkbox"
								checked={highlightOldest}
								onChange={() => setHighlightOldest(!highlightOldest)}
							/>
              Highlight oldest per city
						</label>
					</div>
				</div>
			</div>
      
			<div className="users-table-container">
				<table className="users-table">
					<thead>
						<tr>
							<th>Name</th>
							<th>City</th>
							<th>Birthday</th>
						</tr>
					</thead>
					<tbody>
						{filteredUsers.map(user => (
							<tr 
								key={user.id}
								className={isOldestInCity(user) ? 'highlighted' : ''}
							>
								<td>{`${user.firstName} ${user.lastName}`}</td>
								<td>{user.address.city}</td>
								<td>{formatBirthDate(user.birthDate)}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default App;