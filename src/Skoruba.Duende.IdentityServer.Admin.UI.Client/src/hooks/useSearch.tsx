import {
  useState,
  Dispatch,
  SetStateAction,
  ChangeEvent,
  KeyboardEvent,
} from "react";

interface UseSearchOptions {
  onSearch?: (searchTerm: string) => void;
  onSearchComplete?: () => void;
}

interface UseSearchResult {
  inputValue: string;
  searchTerm: string;
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleSearch: () => void;
  handleInputKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  setInputValue: Dispatch<SetStateAction<string>>;
  setSearchTerm: Dispatch<SetStateAction<string>>;
}

const useSearch = ({
  onSearch,
  onSearchComplete,
}: UseSearchOptions = {}): UseSearchResult => {
  const [inputValue, setInputValue] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSearch = () => {
    setSearchTerm(inputValue);
    if (onSearch) onSearch(inputValue);
    if (onSearchComplete) onSearchComplete();
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  return {
    inputValue,
    searchTerm,
    handleInputChange,
    handleSearch,
    handleInputKeyDown,
    setInputValue,
    setSearchTerm,
  };
};

export default useSearch;
