import React, { useState, useRef, useEffect } from "react";

interface Customer {
  first_name: string;
  last_name: string;
}

interface CustomerSelectProps {
  customers: Customer[];
  onSelect?: (customer: Customer) => void;
  placeholder?: string;
}

export const CustomerSelect: React.FC<CustomerSelectProps> = ({
  customers,
  onSelect,
  placeholder = "Start typing a customer's name..."
}) => {
  const [inputValue, setInputValue] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update the filtered options based on input value.
  useEffect(() => {
    if (inputValue === "") {
      setFilteredCustomers(customers);
    } else {
      setFilteredCustomers(
        customers.filter((customer) =>
          `${customer.first_name} ${customer.last_name}`
            .toLowerCase()
            .includes(inputValue.toLowerCase())
        )
      );
    }
  }, [inputValue, customers]);

  // Close dropdown on click outside.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    setShowDropdown(true);
  };

  const handleSelect = (customer: Customer) => {
    const fullName = `${customer.first_name} ${customer.last_name}`;
    setInputValue(fullName);
    setShowDropdown(false);
    if (onSelect) {
      onSelect(customer);
    }
  };

  return (
    <div ref={containerRef} className="relative z-[100]">
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setShowDropdown(true)}
        placeholder={placeholder}
        className="relative z-[100] w-full bg-slate-900/50 border border-slate-700 text-white placeholder:text-slate-400 p-3 rounded focus:ring focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
      />
      {showDropdown && filteredCustomers.length > 0 && (
        <ul className="absolute z-[100] mt-1 w-full max-h-60 overflow-y-auto bg-slate-800 border border-slate-700 rounded-md shadow-lg">
          {filteredCustomers.map((customer, index) => (
            <li
              key={`${customer.first_name}-${customer.last_name}-${index}`}
              className="cursor-pointer px-4 py-2 hover:bg-indigo-600 text-white transition-colors duration-150"
              onClick={() => handleSelect(customer)}
            >
              {customer.first_name} {customer.last_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}; 