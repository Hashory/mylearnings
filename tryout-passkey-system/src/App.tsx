import './App.css'

function App() {

  return (
    <>
      <h1>Passkey System</h1>
      <button>Login with Passkey</button>
      <code>
        <pre>
          ## Content(you can show this only if you are logged in):
          {/* Content is only visible to logged-in users is here */}

          <br />

          ## Students Passkeys(Teacher View)
          {/* Students Passkey that able to see by teacher is here */}
        </pre>
      </code>
    
      <hr />
      <button>Send Email and Register with Passkey for Teacher</button>
      <button>Send Email and Register with Passkey for Student</button>
    </>
  )
}

export default App
