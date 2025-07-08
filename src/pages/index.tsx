import * as React from 'react';
import '../app/page.css';
import Router from '../app/routes/Router';
import { ToastContainer } from 'react-toastify';
import GoogleMapsWrapper from '../app/utils/GoogleMapsAPI';

export default function Home() {
  return (
    <GoogleMapsWrapper>
      <div className="App" style={{ backgroundColor: "#F5F5DC" }}>
        <ToastContainer />
        <Router />
      </div>
    </GoogleMapsWrapper>
  );
}