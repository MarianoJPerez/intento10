import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css';
import App from './App'
import NotFound from './components/Notfound';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <div >
      <App />
      
    </div>
  </StrictMode>

)