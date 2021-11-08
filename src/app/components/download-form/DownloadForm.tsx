import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import type { MouseEvent, ChangeEvent } from 'react';
import {
  DesktopDownloadIcon,
  SearchIcon,
  TriangleLeftIcon,
  TriangleRightIcon,
} from '@primer/octicons-react';
import {
  Box,
  ProgressBar,
  Spinner,
  ButtonPrimary,
  Flash,
  Button,
  TextInput,
  Heading,
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
  const [error, setError] = useState(undefined as string | undefined);
  const [progressState, setProgressState] = useState('init');
  const [progress, setProgress] = useState(0);
  const [bookInfo, setBookInfo] = useState(undefined as BookConfig | undefined);
  const [firstPageVale, setFirstPageVale] = useState(1);
  const [lastPageVale, setLastPageVale] = useState(1);
  const firstPageFormGroup = React.createRef<HTMLInputElement>();
  const lastPageFormGroup = React.createRef<HTMLInputElement>();
  const bookInfoQuery = useQuery<BookConfig, Error>(
    ['book', 'info', bookUrl],
    () => getBookInfo(bookUrl),
    {
      enabled: false,
      refetchOnWindowFocus: false,
      refetchInterval: false,
      retry: 1,
      retryDelay: 0,
      onSuccess: (bookConfig) => {
        setBookInfo(bookConfig);
        setFirstPageVale(bookConfig?.startPage || 1);
        setLastPageVale(bookConfig?.totalPageCount || 1);
        if (!bookConfig.accessibleBook) {
          setError('Invalid book url');
        }
      },
    },
  );
  const onClickBookInfo = async (evt: MouseEvent<HTMLButtonElement>) => {
    evt.preventDefault();
    setProgress(0);
    setError(undefined);
    setBookInfo(undefined);
    setProgressState('init');
    setFirstPageVale(1);
    setLastPageVale(1);
    await bookInfoQuery.refetch();
  };

  const onPageRanchChanged = (setState: Dispatch<SetStateAction<number>>) => {
    return (evt: ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(evt.target.value, 10);
      setState(Number.isNaN(value) ? -1 : value);
    };
  };

  // useEffect(() => {
  //   if (!bookInfo) {
  //     return;
  //   }
  //   console.log(bookInfo.accessibleBook);
  //   if (bookInfo.accessibleBook) {
  //     setFirstPageVale(bookInfo.startPage);
  //     setLastPageVale(bookInfo.totalPageCount);
  //   } else {
  //     setError('Invalid book url');
  //   }
  // }, [bookInfo]);

  useEffect(() => {
    if (!bookInfo || !bookInfo.accessibleBook) {
      return;
    }
    let hasError = false;
    if (firstPageVale <= 0 || firstPageVale > bookInfo.totalPageCount) {
      firstPageFormGroup.current?.classList.add('errored');
      hasError = true;
    } else {
      firstPageFormGroup.current?.classList.remove('errored');
    }
    if (
      lastPageVale < firstPageVale ||
      lastPageVale > bookInfo.totalPageCount
    ) {
      lastPageFormGroup.current?.classList.add('errored');
      hasError = true;
    } else {
      lastPageFormGroup.current?.classList.remove('errored');
    }
    if (hasError) {
      setError('Wrong pages rage inputs');
    } else {
      setError(undefined);
    }
  }, [
    bookInfo,
    firstPageFormGroup,
    firstPageVale,
    lastPageFormGroup,
    lastPageVale,
  ]);

  const onClickDownload = async (evt: MouseEvent<HTMLButtonElement>) => {
    evt.preventDefault();
    if (!bookInfo || !bookInfo.accessibleBook) {
      return;
    }
    if (firstPageVale <= 0 || firstPageVale > bookInfo.totalPageCount) {
      return;
    }
    if (
      lastPageVale < firstPageVale ||
      lastPageVale > bookInfo.totalPageCount
    ) {
      return;
    }
    setError(undefined);
    setProgress(0);
    setProgressState('loading');
    try {
      const images = await getBookImages(
        bookInfo,
        { firstPage: firstPageVale, lastPage: lastPageVale },
        (step) => {
          setProgress(step * 0.8);
        },
      );
      const pdf = await createPDFFromImages(images, (step) => {
        const current = step * 0.2;
        setProgress((prevState) => prevState + current);
      });
      const blob = new Blob([pdf], {
        type: 'application/pdf',
      });
      downloadFileFromBlob(blob, bookInfo.title);
      setProgressState('finish');
    } catch (e: unknown) {
      if (typeof e === 'string') {
        setError(e);
      } else if (e instanceof Error) {
        setError(e.message);
      } else {
        setError(e as string);
      }
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
      {bookInfo && bookInfo.accessibleBook && (
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
                src={getImageURL(bookInfo)(1)}
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
          <Box
            borderColor="border.default"
            borderTopWidth={1}
            borderTopStyle="solid"
            p={2}
          >
            <Heading fontSize={2} mb={2}>
              Range
            </Heading>
            <div className="form-group" ref={firstPageFormGroup}>
              <div className="form-group-header">
                <label htmlFor="start-page">Start page</label>
              </div>
              <div className="form-group-body">
                <TextInput
                  className="form-control"
                  type="number"
                  id="start-page"
                  icon={TriangleLeftIcon}
                  placeholder={bookInfo.totalPageCount}
                  aria-label="First page"
                  aria-describedby="start-page-input-validation"
                  defaultValue={firstPageVale}
                  onChange={onPageRanchChanged(setFirstPageVale)}
                  min={1}
                  max={bookInfo.totalPageCount}
                />
              </div>
              <p className="note error" id="start-page-input-validation">
                Start page must be between 1 and {bookInfo.totalPageCount}
              </p>
            </div>
            <div className="form-group" ref={lastPageFormGroup}>
              <div className="form-group-header">
                <label htmlFor="last-page">Last page</label>
              </div>
              <div className="form-group-body">
                <TextInput
                  className="form-control"
                  type="number"
                  id="last-page"
                  icon={TriangleRightIcon}
                  placeholder="1"
                  aria-label="First page"
                  aria-describedby="last-page-input-validation"
                  defaultValue={lastPageVale}
                  onChange={onPageRanchChanged(setLastPageVale)}
                />
              </div>
              <p className="note error" id="last-page-input-validation">
                Last page must be between {firstPageVale} and{' '}
                {bookInfo.totalPageCount}
              </p>
            </div>
          </Box>
          <Box pt={3} textAlign="center">
            <ButtonPrimary disabled={!!error} onClick={onClickDownload}>
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
