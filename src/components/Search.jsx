import { MagnifyingGlassIcon } from "@radix-ui/react-icons";

function Search() {
  function handleSubmit(e) {
    e.preventDefault();
  }
  return (
    <form
      onSubmit={handleSubmit}
      className="p-1 m-4 border border-gray-600 rounded-full"
    >
      <label htmlFor="search-text" className="flex items-center gap-3">
        <MagnifyingGlassIcon />
        <input
          type="text"
          name=""
          id="search-text"
          autoComplete="false"
          placeholder="Find user"
          className="bg-inherit placeholder:text-sm focus:outline-none group:bg-white"
        />
      </label>
    </form>
  );
}

export default Search;
