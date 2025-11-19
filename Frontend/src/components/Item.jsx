import React, { useState } from 'react'
import './Item.css'

const Item = ({ item, toggleChecked, onUpdate, onDelete, allTags, onToggleTagSelect }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(item.content)
  const [showTagSelect, setShowTagSelect] = useState(false)

  const handleClick = () => setIsEditing(true)

  const handleBlur = () => {
    setIsEditing(false);
    const trimmedContent = editedContent.trim();

    if (trimmedContent === '') {
      onDelete(item.id);
    } else if (trimmedContent !== item.content) {
      onUpdate({ ...item, content: trimmedContent })
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleBlur()
  }

  const handleTagToggle = (tagId) => {
    const currentTagIds = item.tags?.map(t => t.id) || []
    const newTagIds = currentTagIds.includes(tagId)
      ? currentTagIds.filter(id => id !== tagId)
      : [...currentTagIds, tagId]

    onUpdate({ ...item, tag_ids: newTagIds })
  }

  return (
    <li className="item-container">
      <input
        type="checkbox"
        className="checkbox"
        checked={item.checked}
        onChange={toggleChecked}
      />

      {isEditing ? (
        <input
          type="text"
          className="edit-input"
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      ) : (
        <div className="item-content">
          <span
            className={`item-text ${item.checked ? 'checked' : ''}`}
            onClick={handleClick}
          >
            {item.content}
          </span>
          <div className="item-tags">
            {item.tags && item.tags.length > 0 && (
              <div className="tag-badges">
                {item.tags.map(tag => (
                  <span
                    key={tag.id}
                    className="tag-badge"
                    style={{ borderLeft: `3px solid ${tag.color || '#3b82f6'}` }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
            <button
              className="tag-select-button"
              onClick={() => setShowTagSelect(!showTagSelect)}
              title="Manage tags"
            >
              🏷️
            </button>
          </div>
          {showTagSelect && (
            <div className="tag-selector">
              {allTags.map(tag => (
                <label key={tag.id} className="tag-checkbox-label">
                  <input
                    type="checkbox"
                    checked={item.tags?.some(t => t.id === tag.id) || false}
                    onChange={() => handleTagToggle(tag.id)}
                  />
                  <span style={{ borderLeft: `3px solid ${tag.color || '#3b82f6'}`, paddingLeft: '0.5rem' }}>
                    {tag.name}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}
    </li>
  );
};

export default Item;