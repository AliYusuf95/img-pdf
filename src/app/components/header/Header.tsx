import React from 'react';

function Header(): JSX.Element {
  return (
    <div className="color-bg-subtle border-bottom">
      <div className="container-lg p-responsive text-center py-6">
        <h1 className="h1">Download Book</h1>
        <p className="f4 color-fg-muted col-md-6 mx-auto">
          Version v{process.env.REACT_APP_VERSION}
        </p>
      </div>
    </div>
  );
}

export default Header;
