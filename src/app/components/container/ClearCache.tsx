import React, { MouseEvent, useState } from 'react';
import { Box, Button, ButtonDanger, Dialog, Text } from '@primer/components';
import { TrashIcon, ZapIcon } from '@primer/octicons-react';
import { clearCache } from '../download-form/service';

export function ClearCache(): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const returnFocusRef = React.useRef(null);

  const onClickClearCache = async (evt: MouseEvent<HTMLButtonElement>) => {
    evt.preventDefault();
    await clearCache();
    window.location.reload();
    setIsOpen(false);
  };

  return (
    <>
      <ButtonDanger ref={returnFocusRef} onClick={() => setIsOpen(true)}>
        <TrashIcon /> Clear Cache
      </ButtonDanger>
      <Dialog
        isOpen={isOpen}
        returnFocusRef={returnFocusRef}
        onDismiss={() => setIsOpen(false)}
        aria-labelledby="label"
      >
        <Dialog.Header>
          <ZapIcon /> Attention
        </Dialog.Header>
        <Box p={3}>
          <Text id="label" fontFamily="sans-serif">
            Are you sure you&apos;d like to delete cached images?
          </Text>
          <Box display="flex" mt={3} justifyContent="flex-end">
            <Button onClick={() => setIsOpen(false)} sx={{ mr: 1 }}>
              Cancel
            </Button>
            <ButtonDanger onClick={onClickClearCache}>Delete</ButtonDanger>
          </Box>
        </Box>
      </Dialog>
    </>
  );
}
