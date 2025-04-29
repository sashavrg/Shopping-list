import React, { useState } from 'react'
import './Item.css'

const Item = ({ item, toggleChecked, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(item.content)

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
        <span 
          className={`item-text ${item.checked ? 'checked' : ''}`}
          onClick={handleClick}
        >
          {item.content}
        </span>
      )}
    </li>
  );
};

export default Item;