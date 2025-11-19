import React, { useState } from 'react'
import './TagManager.css'

function TagManager({ tags, onAddTag, onDeleteTag, selectedTagId, onSelectTag }) {
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState('#3b82f6')
  const [isAdding, setIsAdding] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!newTagName.trim()) return

    onAddTag({
      name: newTagName,
      color: newTagColor
    })
    setNewTagName('')
    setNewTagColor('#3b82f6')
    setIsAdding(false)
  }

  return (
    <div className="tag-manager">
      <div className="tag-list">
        <button
          className={`tag-button ${selectedTagId === null ? 'active' : ''}`}
          onClick={() => onSelectTag(null)}
        >
          All Items
        </button>
        {tags.map(tag => (
          <div key={tag.id} className="tag-item">
            <button
              className={`tag-button ${selectedTagId === tag.id ? 'active' : ''}`}
              style={{
                borderLeft: `4px solid ${tag.color || '#3b82f6'}`,
              }}
              onClick={() => onSelectTag(tag.id)}
            >
              {tag.name}
            </button>
            <button
              className="tag-delete"
              onClick={() => onDeleteTag(tag.id)}
              title="Delete tag"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {isAdding ? (
        <form onSubmit={handleSubmit} className="tag-form">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="Shop name..."
            autoFocus
          />
          <input
            type="color"
            value={newTagColor}
            onChange={(e) => setNewTagColor(e.target.value)}
            title="Choose color"
          />
          <button type="submit">Add</button>
          <button type="button" onClick={() => setIsAdding(false)}>
            Cancel
          </button>
        </form>
      ) : (
        <button className="add-tag-button" onClick={() => setIsAdding(true)}>
          + Add Shop
        </button>
      )}
    </div>
  )
}

export default TagManager
