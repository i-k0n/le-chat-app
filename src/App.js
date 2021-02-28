import './App.css';

import firebase from "firebase/app"
import 'firebase/firestore'
import 'firebase/auth'

import { useAuthState } from 'react-firebase-hooks/auth'
import { useCollectionData } from 'react-firebase-hooks/firestore'
import { useState } from 'react';

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

const auth = firebase.auth()
const firestore = firebase.firestore()

function App() {
  const [user] = useAuthState(auth)

  return (
    <div className="App">
      <header>
        <SignOut />
      </header>

      <section>
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
    <button onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function Chatroom() {
  const messagesRef = firestore.collection('messages')
  const query = messagesRef.orderBy('createdAt').limit(25)

  const [messages] = useCollectionData(query, { idField: 'id' })

  const [formValue, setFormValue] = useState('')

  const sendMessage = async(e) => {
    e.preventDefault()

    const { uid, photoURL } = auth.currentUser

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('')
  }

  return (
    <>
      <div>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
      </div>

      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} />
        <button type="submit">SEND</button>
      </form>
    </>
  )
}

function ChatMessage(props) {
  const { text, uid, photoURL, createdAt } = props.message

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
      <img src={photoURL} alt="User Avatar" />
      <p>{text}</p>
      <p>{postTime}</p>
    </div>
  )
}

export default App;
