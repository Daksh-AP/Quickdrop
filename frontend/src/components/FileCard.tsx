import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)({
  borderRadius: '16px',
  margin: '16px',
  background: 'linear-gradient(135deg, #6e7ff3 30%, #a8c8ff 90%)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  minWidth: '250px',
  maxWidth: '300px',
});

const TitleTypography = styled(Typography)({
  fontSize: '1.5rem',
  fontWeight: 'bold',
  color: '#fff',
});

const DescriptionTypography = styled(Typography)({
  fontSize: '1rem',
  color: '#f0f0f0',
});

interface FileCardProps {
  fileName: string;
  fileSize: string;
  fileDate?: string;
}

const FileCard: React.FC<FileCardProps> = ({ fileName, fileSize, fileDate }) => {
  return (
    <StyledCard>
      <CardContent>
        <TitleTypography gutterBottom>
          {fileName}
        </TitleTypography>
        <DescriptionTypography>
          Size: {fileSize}
          {fileDate && ` | Date: ${fileDate}`}
        </DescriptionTypography>
      </CardContent>
    </StyledCard>
  );
};

export default FileCard;