import React from 'react';

export default function Loader(): JSX.Element {
  return (
    <>
      <span>Loading</span>
      <span className="AnimatedEllipsis" />
    </>
  );
}
