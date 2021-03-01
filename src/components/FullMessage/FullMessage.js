import React from 'react'

function FullMessage({ messageClass, photoURL, displayName, postTime, text }) {
  return (
    <div className={`message ${messageClass}`}>
      <img className="avatar" src={photoURL} alt="User Avatar" />
      <div className="message-content">
        <p className="message-user">{displayName.split(" ")[0]} <span className="message-timestamp">{postTime}</span></p>
        <p className="message-text">{text}</p>
      </div>
    </div>
  )
}

export default FullMessage
