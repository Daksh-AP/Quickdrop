import React from 'react';
import { Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { styled } from '@mui/system';

const StyledFab = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(2),
  right: theme.spacing(2),
  background: 'linear-gradient(45deg, #FF4081 30%, #FF80AB 90%)',
  '&:hover': {
    background: 'linear-gradient(45deg, #FF80AB 30%, #FF4081 90%)',
  },
  transition: 'background 0.3s ease',
}));

const FloatingActionButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <StyledFab color="primary" aria-label="add" onClick={onClick}>
      <AddIcon />
    </StyledFab>
  );
};

export default FloatingActionButton;