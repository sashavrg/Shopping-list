import React, { useState, useEffect } from 'react'
import Item from './components/Item'
import Notification from './components/Notification'
import itemService from './services/items'
import './App.css'



function App() {
  const [items, setItems] = useState([])
  const [newItem, setNewItem] = useState('')
  const [showAll, setShowAll] = useState(true)
  const [errorMessage, setErrorMessage] = useState(null)

  useEffect(() => {
    itemService
    .getAll()
    .then(initialItems => {
      setItems(initialItems)
    })
  }, [])

  const toggleChecked = id => {
    const item = items.find(n => n.id === id)
    const changedItem = { ...item, checked: !item.checked }

    itemService
    .update(id, changedItem)
    .then(returnedItem => {
      setItems(items.map(item => item.id === id ? returnedItem : item))
    })
    .catch(error => {
      setErrorMessage(
        `Item '${item.content}' was already removed from the server`
      )
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    })
  }

  const addItem = (event) => {
    event.preventDefault()
    const itemObject = {
      content: newItem,
      checked: false
    }

    itemService
    .create(itemObject)
    .then(returnedItem => {
      setItems(items.concat(returnedItem))
      setNewItem('')
    })
  }

  const handleItemChange = event => {
    setNewItem(event.target.value)
  }

  const handleShowButton = event => {
    setShowAll(!showAll)
  }

  const itemsToShow = showAll
    ? items
    : items.filter(item => !item.checked)


    return (
      <div>
        <h1>Shopping List</h1>
        <Notification message={errorMessage} />
        <div>
          <button onClick={handleShowButton}>
            show {showAll ? `missing` : ` all`}
          </button>
        </div>
        <ul>
          {itemsToShow.map(item =>
          <Item
          key={item.id}
          item={item}
          toggleChecked={() => toggleChecked(item.id)}
          />
          )}
        </ul>
        <form onSubmit={addItem}>
          <input
          value={newItem}
          onChange={handleItemChange}
          />
          <button type="submit">save</button>
        </form>
      </div>
    )
  }
  
  export default App