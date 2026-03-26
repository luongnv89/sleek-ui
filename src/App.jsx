import { HashRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<div className="p-8">Sleek UI initialized!</div>} />
      </Routes>
    </HashRouter>
  )
}

export default App
