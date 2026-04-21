/**
 * Card display area — shows loading state, generated image, or placeholder.
 */

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type { GenerateResponse } from '../shared/types';
import { FRACTAL_METHOD_LABELS } from '../shared/types';

/** Spec §3.3: minimum non-background coverage threshold. */
const COVERAGE_THRESHOLD = 0.8;

interface CardDisplayProps {
  isLoading: boolean;
  result: GenerateResponse | null;
}

/** Display area for the generated fractal card image. */
export function CardDisplay({ isLoading, result }: CardDisplayProps) {
  if (isLoading) {
    return (
      <Box
        role="status"
        aria-label="Generating card"
        sx={{
          width: '100%',
          maxWidth: 400,
          minHeight: 300,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          border: '2px dashed',
          borderColor: 'secondary.light',
          borderRadius: 4,
          bgcolor: 'rgba(103,80,164,0.04)',
        }}
      >
        <CircularProgress color="primary" />
        <Typography color="text.secondary" variant="body2">
          Generating your fractal card…
        </Typography>
      </Box>
    );
  }

  if (!result) {
    return (
      <Box
        aria-label="Card display area"
        sx={{
          width: '100%',
          maxWidth: 400,
          minHeight: 300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px dashed',
          borderColor: 'secondary.light',
          borderRadius: 4,
          bgcolor: 'rgba(103,80,164,0.04)',
        }}
      >
        <Typography color="text.secondary" variant="body2">
          Your fractal card will appear here.
        </Typography>
      </Box>
    );
  }

  const methodLabel = FRACTAL_METHOD_LABELS[result.method];

  return (
    <Card
      elevation={3}
      sx={{ width: '100%', maxWidth: 400, borderRadius: 4, overflow: 'hidden' }}
    >
      <CardMedia
        component="img"
        src={result.image}
        alt={`Generated ${methodLabel} fractal playing card back`}
        width={375}
        height={525}
        sx={{ display: 'block', width: '100%', height: 'auto' }}
      />
      <CardContent
        aria-label="Generation details"
        sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', py: 1.5, '&:last-child': { pb: 1.5 } }}
      >
        <Chip
          label={methodLabel}
          color="primary"
          size="small"
          sx={{ fontWeight: 600, flex: 1 }}
        />
        <Typography variant="caption" color="text.secondary">
          {result.metadata.durationMs}ms
        </Typography>
        <Tooltip
          title={`Spec minimum: ${(COVERAGE_THRESHOLD * 100).toFixed(0)}% — ${result.metadata.coverage >= COVERAGE_THRESHOLD ? 'threshold met' : 'below threshold'}`}
        >
          <Chip
            label={`Coverage: ${(result.metadata.coverage * 100).toFixed(1)}%`}
            color={result.metadata.coverage >= COVERAGE_THRESHOLD ? 'success' : 'error'}
            size="small"
            variant="outlined"
            aria-label={`Coverage ${(result.metadata.coverage * 100).toFixed(1)} percent, ${result.metadata.coverage >= COVERAGE_THRESHOLD ? 'meets' : 'below'} the 80 percent threshold`}
          />
        </Tooltip>
        {result.metadata.warnings.length > 0 && (
          <Typography
            variant="caption"
            color="warning.dark"
            role="note"
            sx={{ width: '100%' }}
          >
            ⚠ {result.metadata.warnings[0]}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
