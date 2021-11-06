import React, { useState } from 'react';
import type { MouseEvent } from 'react';
import { DesktopDownloadIcon, SearchIcon } from '@primer/octicons-react';
import {
  Box,
  ProgressBar,
  Spinner,
  ButtonPrimary,
  Flash,
  Button,
} from '@primer/components';
import { useQuery } from 'react-query';
import {
  BookConfig,
  createPDFFromImages,
  downloadFileFromBlob,
  getBookImages,
  getBookInfo,
  getImageURL,
} from './service';
import './DownloadForm.scss';

function DownloadForm(): JSX.Element {
  const [bookUrl, setBookUrl] = useState('');
  const [error, setError] = useState(undefined);
  const [progressState, setProgressState] = useState('init');
  const [progress, setProgress] = useState(0);
  const [bookInfo, setBookInfo] = useState(undefined as BookConfig | undefined);
  const bookInfoQuery = useQuery<BookConfig, Error>(
    ['book', 'info', bookUrl],
    async () => getBookInfo(bookUrl),
    {
      enabled: false,
      refetchOnWindowFocus: false,
      refetchInterval: false,
      onSuccess: async (bookConfig) => {
        setBookInfo(bookConfig);
      },
    },
  );
  const onClickBookInfo = async (evt: MouseEvent<HTMLButtonElement>) => {
    evt.preventDefault();
    setProgress(0);
    setError(undefined);
    await bookInfoQuery.refetch();
  };

  const onClickDownload = async (evt: MouseEvent<HTMLButtonElement>) => {
    evt.preventDefault();
    if (!bookInfo) {
      return;
    }
    setError(undefined);
    setProgress(0);
    setProgressState('loading');
    try {
      const images = await getBookImages(bookInfo, (step) => {
        setProgress(step * 0.8);
      });
      const pdf = await createPDFFromImages(images, (step) => {
        const current = step * 0.2;
        setProgress((prevState) => prevState + current);
      });
      const blob = new Blob([pdf], {
        type: 'application/pdf',
      });
      downloadFileFromBlob(blob, bookInfo.title);
      setProgressState('finish');
    } catch (e) {
      setError(e);
    }
  };

  const onClickResetForm = (evt: MouseEvent<HTMLButtonElement>) => {
    evt.preventDefault();
    setBookUrl('');
    setProgressState('init');
    setProgress(0);
    setBookInfo(undefined);
    setError(undefined);
  };
  return (
    <article className="Box-row">
      <label htmlFor="repository_description">Book link</label>
      <div className="input-group">
        <input
          className="form-control"
          type="url"
          placeholder="https://www.myeschoolhome.com/mEBook.html?name=xxxxxx"
          value={bookUrl}
          onChange={(e) => setBookUrl(e.target.value)}
          aria-label="link"
        />
        <span className="input-group-button">
          <button
            className="btn btn-primary"
            type="button"
            aria-label="Copy to clipboard"
            disabled={bookInfoQuery.isLoading}
            onClick={onClickBookInfo}
          >
            {!bookInfoQuery.isLoading ? (
              <>
                <SearchIcon /> <span className="text-light"> Check</span>
              </>
            ) : (
              <>
                <Spinner size="small" sx={{ verticalAlign: 'text-bottom' }} />{' '}
                <span className="text-light">
                  Checking
                  <span className="AnimatedEllipsis" />
                </span>
              </>
            )}
          </button>
        </span>
      </div>
      {(bookInfoQuery.isError || error) && (
        <Flash my={3} variant="danger">
          {error || bookInfoQuery.error?.message}
        </Flash>
      )}
      {bookInfo && (
        <Box
          borderWidth="1px"
          borderStyle="solid"
          borderColor="border.default"
          borderRadius={2}
          bg="canvas.subtle"
          mt={3}
          p={3}
        >
          <Box display="grid" gridTemplateColumns="1fr 1fr">
            <Box
              fontWeight="bold"
              borderColor="border.default"
              borderRightWidth={1}
              borderRightStyle="solid"
              borderBottomWidth={1}
              borderBottomStyle="solid"
              p={2}
            >
              Title
            </Box>
            <Box
              borderColor="border.default"
              borderBottomWidth={1}
              borderBottomStyle="solid"
              p={2}
            >
              {bookInfo?.title}
            </Box>
            <Box
              fontWeight="bold"
              borderColor="border.default"
              borderRightWidth={1}
              borderRightStyle="solid"
              borderBottomWidth={1}
              borderBottomStyle="solid"
              p={2}
            >
              Cover page
            </Box>
            <Box
              borderColor="border.default"
              borderBottomWidth={1}
              borderBottomStyle="solid"
              p={2}
            >
              <img
                alt="cover page"
                width="200"
                src={getImageURL(bookInfo)(bookInfo.startPage)}
              />
            </Box>
            <Box
              fontWeight="bold"
              borderColor="border.default"
              borderRightWidth={1}
              borderRightStyle="solid"
              p={2}
            >
              Pages
            </Box>
            <Box p={2}>{bookInfo?.totalPageCount}</Box>
          </Box>
          <Box pt={3} textAlign="center">
            <ButtonPrimary onClick={onClickDownload}>
              {progressState !== 'loading' ? (
                <>
                  <DesktopDownloadIcon /> Download
                </>
              ) : (
                <>
                  <Spinner size="small" sx={{ verticalAlign: 'text-bottom' }} />{' '}
                  <span className="text-light">
                    Generating pdf file
                    <span className="AnimatedEllipsis" />
                  </span>
                </>
              )}
            </ButtonPrimary>
            <Button onClick={onClickResetForm} ml={3}>
              Reset
            </Button>
          </Box>
          {progressState !== 'init' && (
            <Box pt={3}>
              <ProgressBar
                className="progress anim-grow-x"
                progress={progress}
              />
            </Box>
          )}
        </Box>
      )}
    </article>
  );
}

export default DownloadForm;
