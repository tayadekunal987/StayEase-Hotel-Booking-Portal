import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { CompareProvider } from './context/CompareContext.jsx';
import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx';
import HomePage from './pages/HomePage.jsx';
import HotelListPage from './pages/HotelListPage.jsx';
import HotelDetailPage from './pages/HotelDetailPage.jsx';
import BookingFormPage from './pages/BookingFormPage.jsx';
import BookingConfirmPage from './pages/BookingConfirmPage.jsx';
import ManageBookingPage from './pages/ManageBookingPage.jsx';
import ComparePage from './pages/ComparePage.jsx';
import CompareFloatingBar from './components/common/CompareFloatingBar.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <CompareProvider>
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { fontSize: '0.875rem' },
          }}
        />

        <div className="min-h-screen flex flex-col bg-slate-50">
          <Navbar />

          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/hotels" element={<HotelListPage />} />
              <Route path="/hotels/:id" element={<HotelDetailPage />} />
              <Route path="/hotels/:id/book/:roomId" element={<BookingFormPage />} />
              <Route path="/booking/confirm" element={<BookingConfirmPage />} />
              <Route path="/booking/manage" element={<ManageBookingPage />} />
              <Route path="/compare" element={<ComparePage />} />
            </Routes>
          </main>

          <CompareFloatingBar />
          <Footer />
        </div>
      </CompareProvider>
    </BrowserRouter>
  );
}

