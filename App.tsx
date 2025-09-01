import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppContainer } from './src/components/AppContainer';

export default function App() {
  return (
    <>
      <StatusBar style="auto" />
      <AppContainer />
    </>
  );
}
