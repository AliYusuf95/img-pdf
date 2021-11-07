import React from 'react';
import { Box } from '@primer/components';
import DownloadForm from '../download-form/DownloadForm';
import { ClearCache } from './ClearCache';

function Container(): JSX.Element {
  return (
    <div className="position-relative container-lg p-responsive pt-6">
      <Box>
        <DownloadForm />
      </Box>
      <Box mt={5}>
        <ClearCache />
      </Box>
    </div>
  );
}

export default Container;
