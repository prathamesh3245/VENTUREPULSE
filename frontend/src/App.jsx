import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import frameImg from './assets/Frame 1.png'
import waywire from './assets/waywire.png'
import { CardComponent } from './Components/card'
import { AnalysisComponent } from './Components/analysis'
import { DashboardComponent } from './Components/Dashboard'
import { Login } from './Components/Auth/Login'
import { Register } from './Components/Auth/Register'
import { UserDashboard } from './Components/UserDashboard'
import { ProtectedRoute } from './Components/ProtectedRoute'

function HomePage() {
  return (
    <div style={{backgroundColor: 'rgb(254, 251, 245)'}}>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Elms+Sans:ital,wght@0,100..900;1,100..900&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
      </style>
      <div>
        <img src={frameImg} alt=""  style={{height: 100 , paddingLeft: 70}} />
      </div>

      <div style={{display: 'flex', gap: 190}}>
          <div style={{display: 'flex', alignItems: 'center', marginBottom: 160}}>
          <img src={waywire} alt="" style={{height: 150, marginTop: 50, marginLeft: 100}}/>
          <div>
            <h1 style={{marginLeft: 20}}>WayWire</h1>
            <h2 style={{marginLeft: 20}}>Video Content</h2>
            <div style={{display: 'flex', alignItems: 'center', marginLeft: 20,gap: 20}}>
              <div style={{height: 27, width: 100, backgroundColor: 'rgba(0, 0, 255, 0.4)'}}> <p style={{ color: 'black', textAlign: 'center', fontSize: 10, paddingBottom: 10}}>PRIVATE</p> </div>
              <div style={{height: 27, width: 100, backgroundColor: 'rgba(0, 0, 255, 0.4)'}}> <p style={{ color: 'black', textAlign: 'center', fontSize: 10}}>MARKETPLACE</p> </div>
              <div style={{height: 27, width: 100, backgroundColor: 'rgba(0, 0, 255, 0.4)'}}> <p style={{ color: 'black', textAlign: 'center', fontSize: 10}}>E-COMMERCE</p> </div>
              <div style={{height: 27, width: 100, backgroundColor: 'rgba(0, 0, 255, 0.4)'}}> <p style={{color: 'black', textAlign: 'center', fontSize: 10}}>NEW YORK</p> </div>
            </div>
          </div>
        </div>

        <CardComponent style={{}}/>


      </div>

      <div style={{ height: 3,width: 900, backgroundColor: 'black'}}></div>

      <div style={{height: 350, width: 750, marginLeft: 100, marginTop: 50}}>
          <p style={{fontSize: 16, fontFamily: 'Elms Sans'}}>
            WayWire, a social artery for video news, inspiration and leading voices has closed a seed capital round led by First Round Capital and Eric Schmidt's Innovation Endeavors, along with Troy Carter the Founder and CEO of Atom Factory, Oprah Winfrey the CEO of Oprah Winfrey Network, John Ham the Co-founder and Chairman of Ustream, Keith Lee theCo-founder of Booyah, and a group of angel investors. #waywire is focused on providing a network that will serve to fundamentally alter the tone and content of public dialogue around some of society's most pressing issues. The network will provide original, syndicated and community created video content, allowing today's digital generation to develop informed opinions on topics and then engage in positive debates and discussions.
          </p>
      </div>

      <AnalysisComponent/>
      <DashboardComponent/>


      </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
