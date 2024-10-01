'use client';

import React from 'react';
import { BrowserRouter } from 'react-router-dom';

const BrowserRouterProvider = ({ children }: { children: React.ReactNode }) => {
  return <BrowserRouter>{children}</BrowserRouter>;
};

export default BrowserRouterProvider;
