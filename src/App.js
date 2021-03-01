import './App.css';

import firebase from "firebase/app"
import 'firebase/firestore'
import 'firebase/auth'

import { useAuthState } from 'react-firebase-hooks/auth'
import { useCollectionData } from 'react-firebase-hooks/firestore'
import { useState } from 'react';

import catLogo from './assets/cat.png'
import signOutIcon from './assets/sign-out-thin.svg'


if (!firebase.apps.length) {
  firebase.initializeApp({
    // firebase config
    apiKey: "AIzaSyCHLQnAGCpCbCzvKJxN3WbvpLh4YcOkJDE",
    authDomain: "le-chat-fbd4c.firebaseapp.com",
    projectId: "le-chat-fbd4c",
    storageBucket: "le-chat-fbd4c.appspot.com",
    messagingSenderId: "159128856128",
    appId: "1:159128856128:web:5a885c27da81c2bdb3a1a5",
    measurementId: "G-NV8H0CGYDG"
  })
}else {
  firebase.app(); // if already initialized, use that one
}


const auth = firebase.auth()
const firestore = firebase.firestore()

function App() {
  const [user] = useAuthState(auth)
  // console.log(user)

  return (
    <div className="App">
      <header className="header">
        <div className="logo">
          <img className="logo-image" src={catLogo} alt="logo" />
          <h3 className="logo-text">Le Chat</h3>
        </div>
        <SignOut />
      </header>

      <section className="chat-window">
        { user ? <Chatroom /> : <SignIn /> }
      </section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider()
    auth.signInWithPopup(provider)
  }

  return (
    <button onClick={signInWithGoogle}>Sign in with Google</button>
  )
}

function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}><img src={signOutIcon} alt="Sign Out" /></button>
  )
}

function Chatroom() {
  const messagesRef = firestore.collection('messages')
  const query = messagesRef.orderBy('createdAt').limit(25)

  const [messages] = useCollectionData(query, { idField: 'id' })

  const [formValue, setFormValue] = useState('')

  const sendMessage = async(e) => {
    e.preventDefault()

    const { uid, photoURL, displayName } = auth.currentUser

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
      displayName
    })

    setFormValue('')
  }

  return (
    <>
      <div>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
      </div>

      <form className="message-send-form" onSubmit={sendMessage}>
        <input className="message-send-input" value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Say something nice..." />
        <button className="message-send-button" type="submit">Send</button>
      </form>
    </>
  )
}

function ChatMessage(props) {
  const { text, uid, photoURL, createdAt, displayName } = props.message

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received'
  
  const timestamp = new Date(createdAt.seconds * 1000)
  function renderDate(date) {
    const today = new Date()
    const yesterday = new Date(); 
    yesterday.setDate(today.getDate() - 1)
    if(date.toLocaleDateString() === today.toLocaleDateString()){
      return 'Today'
    }else if (date.toLocaleDateString() === yesterday.toLocaleDateString()) {
      return 'Yesterday'
    }
    return date.toLocaleDateString('en-US', {
      day : 'numeric',
      month : 'long'
    })
  }

  const postTime = `${renderDate(timestamp)} at ${timestamp.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' })}`
  // console.log(createdAt)
  // const timestamp = new Date(createdAt)
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

export default App;
