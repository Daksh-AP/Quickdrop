import React from 'react';
import { Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { styled } from '@mui/material/styles';

const StyledFab = styled(Fab)({
  position: 'fixed',
  bottom: '16px',
  right: '16px',
  background: 'linear-gradient(45deg, #FF4081 30%, #FF80AB 90%)',
  '&:hover': {
    background: 'linear-gradient(45deg, #FF80AB 30%, #FF4081 90%)',
  },
  transition: 'background 0.3s ease',
});

interface FloatingActionButtonProps {
  onClick: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onClick }) => {
  return (
    <StyledFab color="primary" aria-label="add" onClick={onClick}>
      <AddIcon />
    </StyledFab>
  );
};

export default FloatingActionButton;