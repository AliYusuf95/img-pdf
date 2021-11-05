import { BaseStyles, ThemeProvider } from '@primer/components';
import React from 'react';
import { Header, Container, Footer } from './components';

function App(): JSX.Element {
  return (
    <ThemeProvider colorMode="auto" dayScheme="light" nightScheme="dark_dimmed">
      <BaseStyles>
        <div className="application-main">
          <Header />
          <Container />
          <Footer />
        </div>
      </BaseStyles>
    </ThemeProvider>
  );
}

export default App;
