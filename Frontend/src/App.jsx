import React, { useState, useEffect } from 'react'
import Item from './components/Item'
import Notification from './components/Notification'
import SearchFilter from './components/SearchFilter'
import itemService from './services/items'
import './App.css'



function App() {
  const [items, setItems] = useState([])
  const [newItem, setNewItem] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [showAll, setShowAll] = useState(true)
  const [errorMessage, setErrorMessage] = useState(null)
  const [currentList, setCurrentList] = useState('shopping')
  const [isTitleFading, setIsTitleFading] = useState(false)


  useEffect(() => {
    itemService
    .getAll(currentList)
    .then(initialItems => {
      setItems(initialItems.sort((a, b) => a.content.localeCompare(b.content)))
    })
  }, [currentList])

  
  const toggleChecked = id => {
    const item = items.find(n => n.id === id)
    const changedItem = { ...item, checked: !item.checked }

    itemService
    .update(id, changedItem)
    .then(returnedItem => {
      setItems(items.map(item => item.id === id ? returnedItem : item)
        .sort((a, b) => a.content.localeCompare(b.content)))
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
    if (!newItem.trim()) return
    const itemObject = {
      content: newItem,
      checked: false
    }

    itemService
    .create(itemObject, currentList)
    .then(returnedItem => {
      setItems([...items, returnedItem].sort((a, b) => a.content.localeCompare(b.content)))
      setNewItem('')
    })
  }

  const updateItem = (updatedItem) => {
    itemService
      .update(updatedItem.id, updatedItem)
      .then(returnedItem => {
        setItems(items.map(item => 
          item.id === returnedItem.id ? returnedItem : item
        ).sort((a, b) => a.content.localeCompare(b.content)))
      })
      .catch(error => {
        setErrorMessage(`Failed to update '${updatedItem.content}'`)
        setTimeout(() => setErrorMessage(null), 5000)
      });
  };

  const deleteItem = (id) => {
    itemService
      .remove(id)
      .then(() => {
        setItems(items.filter(item => item.id !== id))
      })
      .catch(error => {
        setErrorMessage(`Failed to delete item`)
        setTimeout(() => setErrorMessage(null), 5000)
      })
  }

  const handleItemChange = event => {
    setNewItem(event.target.value)
  }

  const handleShowButton = event => {
    setShowAll(!showAll)
  }

  const handleSearchChange = event => {
    setSearchInput(event.target.value)
  }

  const handleTitleClick = () => {
    if (isTitleFading) return
    setIsTitleFading(true)
    const fadeDurationMs = 200
    setTimeout(() => {
      setCurrentList(currentList === 'shopping' ? 'home-needs' : 'shopping')
      setTimeout(() => {
        setIsTitleFading(false)
      }, 50)
    }, fadeDurationMs)
  }

  const getListTitle = () => {
    return currentList === 'shopping' ? 'Shopping List' : 'Home Needs'
  }

  const itemsToShow = items
    .filter(item => showAll || !item.checked)
    .filter(item =>
      item.content.toLowerCase().includes(searchInput.toLowerCase())
)


    return (
      <div>
         <h1
           className={`title-toggle${isTitleFading ? ' title-fade' : ''}`}
           onClick={handleTitleClick}
         >
           {getListTitle()}
         </h1>
        <Notification message={errorMessage} />
        <SearchFilter
          searchInput={searchInput}
          handleSearchChange={handleSearchChange}
        />
        <div>
          <button onClick={handleShowButton}>
            show {showAll ? `missing` : ` all`}
          </button>
        </div>
        <ul className='glassy'>
          {itemsToShow.map(item =>
          <Item
          key={item.id}
          item={item}
          toggleChecked={() => toggleChecked(item.id)}
          onUpdate={updateItem}
          onDelete={deleteItem}
        />
          )}
        </ul>
        <form onSubmit={addItem} className='input-form'>
          <input
          value={newItem}
          onChange={handleItemChange}
          />
        </form>
        <div>
          <button onClick={addItem} type="submit">save</button>
        </div>
      </div>
    )
  }
  
  export default App
