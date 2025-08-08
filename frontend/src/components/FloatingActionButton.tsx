import React from 'react';
import { Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { styled } from '@mui/material/styles';

const StyledFab = styled(Fab)({
  position: 'fixed',
  bottom: '16px',
  right: '16px',
  background: 'linear-gradient(45deg, #0077BE 30%, #00C4CC 90%)',
  '&:hover': {
    background: 'linear-gradient(45deg, #00C4CC 30%, #0077BE 90%)',
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