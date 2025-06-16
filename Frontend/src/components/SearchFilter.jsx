const InputField = ({ searchInput, handleSearchChange}) => {
  return (
  <form className="input-form">
        <div>
        <input
          value={searchInput}
          onChange={handleSearchChange}
          />
        </div>
      </form>
  )
}

export default InputField