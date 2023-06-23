import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { makeStyles } from '@material-ui/core/styles';
import {
  TextField, Button, CircularProgress, Typography, Box, Grid, Card, CardContent,
  Snackbar,
} from '@material-ui/core';
import Alert from '@mui/lab/Alert';
import SendIcon from '@material-ui/icons/Send';
import AttachFileIcon from '@material-ui/icons/AttachFile';

const useStyles = makeStyles((theme) => ({
  uploadContainer: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(2),
    borderRadius: '15px',
    backgroundColor: '#ffffff',
    boxShadow: '0 0 20px 0 rgba(0,0,0,0.12)',
  },
  uploadForm: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: theme.spacing(2),
  },
  uploadButton: {
    color: '#ffffff',
    backgroundColor: '#3f51b5',
    '&:hover': {
      backgroundColor: '#5c73f2',
    },
  },
  uploadProgress: {
    marginTop: theme.spacing(2),
  },
  chatContainer: {
    height: '48vh', // 50% of viewport height
    overflowY: 'scroll',
    backgroundColor: '#f0f0f0',
    borderRadius: 15,
    padding: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  chatMessage: {
    marginBottom: theme.spacing(1),
  },
  chatInputForm: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: '15px',
    padding: '0.5rem',
    boxShadow: '0 0 10px 0 rgba(0,0,0,0.12)',
    marginTop: theme.spacing(2),
  },
  chatInput: {
    flex: 1,
    marginRight: theme.spacing(2),
  },
  chatSubmit: {
    color: '#ffffff',
    backgroundColor: '#3f51b5',
    '&:hover': {
      backgroundColor: '#5c73f2',
    },
  },
  title: {
    color: '#3f51b5',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    marginBottom: theme.spacing(2),
    letterSpacing: '0.1em',
  },
}));

function UploadPage() {
  const classes = useStyles();
  const [file, setFile] = useState(null);
  const [filename, setFilename] = useState('');
  const [fileSizeKb, setFileSizeKb] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [chatHistoryForServer, setChatHistoryForServer] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const chatBoxRef = useRef(null);
  const [uploadStatus, setUploadStatus] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const lastMessageRef = useRef(null);
  const [errorr, setError] = useState(null);
  const [fileUploading, setFileUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setFilename(selectedFile.name);
    const fileSizeInKb = selectedFile.size / 1024; // Get the file size in kilobytes
    setFileSizeKb(fileSizeInKb);
  };

  const handleFileUpload = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setUploadStatus(false);
    setFileUploading(true);

    let interval;
    if (file) { // Only setup the progress interval when there's a file
      const estimatedTime = (fileSizeKb / 1024) * 90; // 1 MB is approx. 90 seconds
      // Set an interval to update the progress bar
      interval = setInterval(() => {
        setProgress((oldProgress) => {
          if (oldProgress >= 100) {
            clearInterval(interval);
            return 100;
          }
          const newProgress = oldProgress + 100 / estimatedTime;
          return Math.min(newProgress, 100);
        });
      }, 1000);

      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/upload-file`, formData);
        setFilename(response.data.filename);
        setProgress(0);
        setIsLoading(false);
        clearInterval(interval);
        setUploadStatus(true);
        setChatHistory([]);
        setChatHistoryForServer([]);
        setSnackbarOpen(true);
        setUploadedFile(file);
      } catch (error) {
        setError('Oops! Something went wrong, please try again.');
        console.error(error);
        setIsLoading(false);
        clearInterval(interval);
      }
    }
    setFileUploading(false);
  };
  const scrollToBottom = () => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const userMessage = { role: 'user', content: message };
    setChatHistory((oldChatHistory) => [...oldChatHistory, userMessage]);
    setIsSending(true);
    const newChatHistory = [...chatHistoryForServer, userMessage];
    setChatHistoryForServer(newChatHistory);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/process-pdf`,
        {
          messages: newChatHistory,
          filename,
        },
      );
      const assistantMessage = { role: 'assistant', content: response.data.answer };
      setChatHistory((oldChatHistory) => [...oldChatHistory, assistantMessage]);
      setChatHistoryForServer((oldChatHistory) => [...oldChatHistory, assistantMessage]);
      setMessage('');
    } catch (error) {
      setError('Oops! Something went wrong, please try again.');
    }

    setIsSending(false);
  };
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setSnackbarOpen(false);
  };

  return (
    <Grid container justifyContent="center">
      <Grid item xs={12} sm={8} md={6} lg={6} className={classes.uploadContainer}>
        <Typography variant="h4" align="center" className={classes.title}>AI Attorney</Typography>

        <form onSubmit={handleFileUpload} className={classes.uploadForm}>
          <Button
            variant="contained"
            component="label"
            className={classes.uploadButton}
            startIcon={<AttachFileIcon />}
            disabled={fileUploading}
          >
            Choose a PDF file
            <input type="file" hidden onChange={handleFileChange} />
          </Button>
          {filename && (
          <Typography variant="subtitle1" align="center" style={{ color: '#3f51b5' }}>
            Selected file:
            {' '}
            <strong>{filename}</strong>
          </Typography>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            className={classes.uploadButton}
            startIcon={<SendIcon />}
            disabled={file === uploadedFile || !file || fileUploading}
          >
            Upload
          </Button>
        </form>

        {isLoading && (
          <Box className={classes.uploadProgress}>
            <Typography variant="subtitle1" align="center" style={{ color: '#3f51b5' }}>
              <strong>Uploading...</strong>
              {' '}
              This may take several minutes depending on the
              document size.
            </Typography>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <CircularProgress variant="determinate" value={progress} />
            </div>
          </Box>
        )}

        {filename && uploadStatus && !isLoading && (
        <>
          <Card className={classes.chatContainer} elevation={4}>
            {errorr && <p className="error-message">{errorr}</p>}
            <CardContent ref={chatBoxRef}>
              {chatHistory.map((chat, index) => (
                <Typography
                // eslint-disable-next-line react/no-array-index-key
                  key={index}
                  className={classes.chatMessage}
                  ref={index === chatHistory.length - 1 ? lastMessageRef : null}
                >
                  <b>{chat.role === 'user' ? 'You: ' : 'Assistant: '}</b>
                  {chat.content}
                </Typography>
              ))}
              {isSending && <CircularProgress />}
            </CardContent>
          </Card>
          <form className={classes.chatInputForm} onSubmit={handleFormSubmit}>
            <TextField
              className={classes.chatInput}
              variant="outlined"
              placeholder="Type a message..."
              value={message}
              onChange={handleMessageChange}
              required
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              className={classes.chatSubmit}
              startIcon={<SendIcon />}
              disabled={isSending}
            >
              Send
            </Button>
          </form>
        </>
        )}
        <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
          <Alert onClose={handleSnackbarClose} severity="success">
            File uploaded successfully!
          </Alert>
        </Snackbar>

      </Grid>
    </Grid>
  );
}

export default UploadPage;
