import React from 'react';
import ReactDOM from 'react-dom';
import Dashboard from './Dashboard';

const customBackgroundImage = "https://example.com/your-image.jpg"; // Cambia esto por tu imagen

ReactDOM.render(
  <Dashboard heroBackgroundImage={customBackgroundImage} />,
  document.getElementById('root')
);