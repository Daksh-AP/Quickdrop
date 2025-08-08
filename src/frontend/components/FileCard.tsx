import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles({
  root: {
    borderRadius: '16px',
    margin: '16px',
    background: 'linear-gradient(135deg, #6e7ff3 30%, #a8c8ff 90%)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  description: {
    fontSize: '1rem',
    color: '#555',
  },
});

const FileCard = ({ fileName, fileSize, fileDate }) => {
  const classes = useStyles();

  return (
    <Card className={classes.root}>
      <CardContent>
        <Typography className={classes.title} gutterBottom>
          {fileName}
        </Typography>
        <Typography className={classes.description}>
          Size: {fileSize} | Date: {fileDate}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default FileCard;