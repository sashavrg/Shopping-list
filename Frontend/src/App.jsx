import React, { useState, useEffect } from 'react'
import Item from './components/Item'
import Notification from './components/Notification'
import SearchFilter from './components/SearchFilter'
import TagManager from './components/TagManager'
import itemService from './services/items'
import tagService from './services/tags'
import './App.css'



function App() {
  const [items, setItems] = useState([])
  const [tags, setTags] = useState([])
  const [newItem, setNewItem] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [showAll, setShowAll] = useState(true)
  const [selectedTagId, setSelectedTagId] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)


  useEffect(() => {
    // Load tags first
    tagService
      .getAll()
      .then(initialTags => {
        setTags(initialTags.sort((a, b) => a.name.localeCompare(b.name)))
      })
      .catch(error => {
        console.error('Failed to load tags:', error)
      })

    // Load items
    loadItems()
  }, [])

  const loadItems = (tagId = null) => {
    const url = tagId ? `/api/items?tag_id=${tagId}` : '/api/items'
    itemService
      .getAll(url)
      .then(initialItems => {
        setItems(initialItems.sort((a, b) => a.content.localeCompare(b.content)))
      })
      .catch(error => {
        console.error('Failed to load items:', error)
      })
  }

  useEffect(() => {
    loadItems(selectedTagId)
  }, [selectedTagId])


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
      checked: false,
      tag_ids: selectedTagId ? [selectedTagId] : []
    }

    itemService
    .create(itemObject)
    .then(returnedItem => {
      setItems([...items, returnedItem].sort((a, b) => a.content.localeCompare(b.content)))
      setNewItem('')
    })
    .catch(error => {
      setErrorMessage(`Failed to add item`)
      setTimeout(() => setErrorMessage(null), 5000)
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

  const addTag = (tagData) => {
    tagService
      .create(tagData)
      .then(newTag => {
        setTags([...tags, newTag].sort((a, b) => a.name.localeCompare(b.name)))
      })
      .catch(error => {
        setErrorMessage(`Failed to add shop`)
        setTimeout(() => setErrorMessage(null), 5000)
      })
  }

  const deleteTag = (id) => {
    if (!window.confirm('Delete this shop? Items with this tag will not be deleted.')) {
      return
    }

    tagService
      .remove(id)
      .then(() => {
        setTags(tags.filter(tag => tag.id !== id))
        if (selectedTagId === id) {
          setSelectedTagId(null)
        }
        // Reload items to refresh tag associations
        loadItems(selectedTagId === id ? null : selectedTagId)
      })
      .catch(error => {
        setErrorMessage(`Failed to delete shop`)
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

  const itemsToShow = items
    .filter(item => showAll || !item.checked)
    .filter(item =>
      item.content.toLowerCase().includes(searchInput.toLowerCase())
)


    return (
      <div>
        <h1>Shopping List</h1>
        <Notification message={errorMessage} />

        <TagManager
          tags={tags}
          onAddTag={addTag}
          onDeleteTag={deleteTag}
          selectedTagId={selectedTagId}
          onSelectTag={setSelectedTagId}
        />

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
          allTags={tags}
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
          placeholder="Add new item..."
          />
        </form>
        <div>
          <button onClick={addItem} type="submit">save</button>
        </div>
      </div>
    )
  }

  export default App
