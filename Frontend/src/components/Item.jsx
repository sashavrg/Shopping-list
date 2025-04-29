const Item = ({ item, toggleChecked }) => {
  const checkedMark = item.checked
    ? 'got it' : 'missing'

  return (
    <li className='item'>
      {item.content}
      <button onClick={toggleChecked}>
        {checkedMark}
      </button>
    </li>
  )
}

export default Item